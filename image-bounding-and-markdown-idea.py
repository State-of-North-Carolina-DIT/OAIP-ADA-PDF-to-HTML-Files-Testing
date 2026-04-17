import sys
import os
import re
import io
import argparse
import base64
import time
import backoff
import markdown
import fitz  # PyMuPDF
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, label
from google import genai
from google.genai import types
from google.api_core.exceptions import (
    DeadlineExceeded, ServiceUnavailable, ResourceExhausted, InternalServerError
)

EXTRACTION_MODEL = os.environ.get("EXTRACTION_MODEL", "gemini-3.1-pro-preview")

RETRYABLE_EXCEPTIONS = (
    DeadlineExceeded, ServiceUnavailable, ResourceExhausted,
    InternalServerError, TimeoutError, ConnectionError
)


class EmptyResponseError(Exception):
    """Raised when Gemini returns no text content."""
    pass


def _on_backoff(details):
    print(f"  Retrying Gemini call (attempt {details['tries']}, "
          f"waiting {details['wait']:.1f}s)...")


@backoff.on_exception(
    backoff.constant,
    (*RETRYABLE_EXCEPTIONS, EmptyResponseError),
    interval=5, max_tries=5, max_time=300, on_backoff=_on_backoff)
def _call_gemini(client, **kwargs):
    response = client.models.generate_content(**kwargs)
    if response.text is None:
        finish = (
            response.candidates[0].finish_reason
            if response.candidates else "no candidates"
        )
        raise EmptyResponseError(
            f"Gemini returned no text (finish_reason: {finish})")
    return response


def _extract_images_from_scan(doc, xref, page_rect):
    """Extract sub-image regions (logos, seals, signatures) from a full-page scan.

    Uses connected-component analysis to distinguish dense image-like regions
    from text blocks.  Returns a list of (png_bytes, width_pt, height_pt) tuples
    for each detected image region, or an empty list if none are found.
    """
    base_img = doc.extract_image(xref)
    img = Image.open(io.BytesIO(base_img["image"]))
    gray = np.array(img.convert("L"))

    # Binary threshold — anything darker than 200 is "content"
    binary = gray < 200

    # Dilate to merge individual characters into blocks while keeping
    # separate image regions distinct.
    struct = np.ones((10, 10), dtype=bool)
    dilated = binary_dilation(binary, structure=struct, iterations=3)
    labeled_arr, num_features = label(dilated)

    img_h, img_w = gray.shape
    total_pixels = img_h * img_w
    page_w_pt = page_rect.width
    page_h_pt = page_rect.height

    regions = []
    for i in range(1, num_features + 1):
        component = labeled_arr == i
        rows = np.where(np.any(component, axis=1))[0]
        cols = np.where(np.any(component, axis=0))[0]
        if len(rows) < 2 or len(cols) < 2:
            continue
        y0, y1 = int(rows[0]), int(rows[-1])
        x0, x1 = int(cols[0]), int(cols[-1])
        h = y1 - y0
        w = x1 - x0
        area = h * w
        pct = area / total_pixels

        if pct < 0.003:  # skip tiny regions (< 0.3% of page)
            continue

        # Density of original binary inside the bounding box
        bbox_binary = binary[y0:y1 + 1, x0:x1 + 1]
        density = bbox_binary.sum() / max(area, 1)
        aspect = w / max(h, 1)

        # Image-like: high density, roughly square-ish
        # Text-like: low density, very wide aspect ratio
        if density > 0.25 and aspect < 3.0:
            # Convert pixel coords to points
            w_pt = w / img_w * page_w_pt
            h_pt = h / img_h * page_h_pt
            cropped = img.crop((x0, y0, x1, y1))
            buf = io.BytesIO()
            cropped.save(buf, format="PNG")
            regions.append((buf.getvalue(), w_pt, h_pt))

    return regions


def extract_assets_and_build_manifest(pdf_path=None, pdf_bytes=None):
    """
    Extracts images and links from PDF and builds manifests for Gemini.
    Handles layered/overlapping images by compositing them.
    """
    images_dict = {}
    image_manifest = []
    link_manifest = []

    if pdf_bytes is not None:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    else:
        doc = fitz.open(pdf_path)

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_num = page_num + 1  # Convert to 1-based indexing
        image_list = page.get_images(full=True)
        if not image_list:
            # Still need to extract links even if no images
            links = page.get_links()
            seen_uris = set()
            for link in links:
                if link.get("kind") != 2:
                    continue
                uri = link.get("uri", "").strip()
                if not uri or uri in seen_uris:
                    continue
                seen_uris.add(uri)
                link_manifest.append(
                    f"  - Page {page_num}: URL '{uri}'")
            continue

        # Detect scanned pages: a single image covering most of the page.
        # Two branches:
        #   A) OCR text scan (text > 200 chars) — skip image entirely, the
        #      model works from the PDF text layer.
        #   B) Pure image scan (text < 50 chars) — no usable text layer.
        #      Extract any embedded sub-images (logos, seals) and add them
        #      to the manifest so they appear in the HTML, but skip the
        #      full-page scan image itself.  Gemini reads the page visually
        #      from the PDF bytes.
        if len(image_list) == 1:
            xref = image_list[0][0]
            rects = page.get_image_rects(xref)
            if rects:
                r = rects[0]
                page_area = page.rect.width * page.rect.height
                img_area = r.width * r.height
                text_len = len(page.get_text("text").strip())
                if page_area > 0 and img_area / page_area > 0.85:
                    if text_len > 200 or text_len < 50:
                        # For pure image scans, extract sub-images (logos etc.)
                        if text_len < 50:
                            sub_images = _extract_images_from_scan(
                                doc, xref, page.rect)
                            for idx, (png_bytes, w_pt, h_pt) in enumerate(
                                    sub_images):
                                b64 = base64.b64encode(png_bytes).decode()
                                images_dict[(page_num, idx)] = (
                                    "image/png", b64, w_pt, h_pt)
                                image_manifest.append(
                                    f"  - Page {page_num}, Index {idx}: "
                                    f"{w_pt:.0f}×{h_pt:.0f} pt")
                        # Extract links (both branches)
                        links = page.get_links()
                        seen_uris = set()
                        for link in links:
                            if link.get("kind") != 2:
                                continue
                            uri = link.get("uri", "").strip()
                            if not uri or uri in seen_uris:
                                continue
                            seen_uris.add(uri)
                            link_manifest.append(
                                f"  - Page {page_num}: URL '{uri}'")
                        continue

        # Gather image rectangles and xrefs
        img_data = []
        for img in image_list:
            xref = img[0]
            rects = page.get_image_rects(xref)
            if rects:
                img_data.append({"xref": xref, "rect": rects[0]})

        # Group overlapping or nearby images into clusters
        clusters = []
        for data in img_data:
            assigned = False
            d_rect = data["rect"]
            match_rect = fitz.Rect(
                d_rect.x0 - 5, d_rect.y0 - 5,
                d_rect.x1 + 5, d_rect.y1 + 5)

            for cluster in clusters:
                nearby = False
                for other in cluster:
                    o_rect = other["rect"]
                    if not (match_rect & o_rect).is_empty:
                        nearby = True
                        break
                if nearby:
                    cluster.append(data)
                    assigned = True
                    break
            if not assigned:
                clusters.append([data])

        # Detect vector-heavy pages with sparse raster images
        vector_merge = False
        if img_data:
            page_area = page.rect.width * page.rect.height
            img_area = sum(d["rect"].width * d["rect"].height for d in img_data)
            drawing_count = len(page.get_drawings())
            if drawing_count > 100 and img_area / page_area < 0.3:
                clusters = [img_data]
                vector_merge = True

        # Process clusters
        for c_idx, cluster in enumerate(clusters):
            union_rect = cluster[0]["rect"]
            for item in cluster[1:]:
                union_rect |= item["rect"]

            if union_rect.width < 5 or union_rect.height < 5:
                continue

            if len(cluster) > 1:
                clip_rect = page.rect if vector_merge else union_rect
                mat = fitz.Matrix(3, 3)
                pix = page.get_pixmap(matrix=mat, clip=clip_rect)
                image_bytes = pix.tobytes("png")
                mime_type = "image/png"
                desc_suffix = " (Composite/Layered)"
            else:
                xref = cluster[0]["xref"]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                mime_type = f"image/{base_image['ext']}"
                if base_image['ext'] == "jpg":
                    mime_type = "image/jpeg"
                desc_suffix = ""

            b64_data = base64.b64encode(image_bytes).decode("utf-8")
            size_rect = (clip_rect if (vector_merge and len(cluster) > 1)
                         else union_rect)
            width_pts, height_pts = size_rect.width, size_rect.height

            images_dict[(page_num, c_idx)] = (
                mime_type, b64_data, width_pts, height_pts)
            image_manifest.append(
                f"  - Page {page_num}, Index {c_idx}: "
                f"{width_pts:.1f}pt x {height_pts:.1f}pt at "
                f"(x={size_rect.x0:.1f}, y={size_rect.y0:.1f}){desc_suffix}")

        # Extract links — only provide the URL; the model can see
        # the PDF and will match the correct anchor text visually.
        links = page.get_links()
        seen_uris = set()
        for link in links:
            if link.get("kind") != 2:
                continue
            uri = link.get("uri", "").strip()
            if not uri or uri in seen_uris:
                continue
            seen_uris.add(uri)
            link_manifest.append(
                f"  - Page {page_num}: URL '{uri}'")

    doc.close()
    return images_dict, "\n".join(image_manifest), "\n".join(link_manifest)


EXTRACTION_SYSTEM_INSTRUCTION = (
    "You are a data extraction specialist. You convert PDFs to clean, "
    "well-structured Markdown. You NEVER truncate data. You follow "
    "placeholder instructions perfectly, replacing template variables "
    "with actual manifest values. You OMIT all recurring page headers "
    "and footers — they are noise, not content."
)


def build_extraction_prompt(link_manifest, image_manifest):
    return f"""
### TASK
Convert the attached PDF into clean, well-structured Markdown.
Your absolute priority is 100% DATA COMPLETENESS. Do not omit a single word or table row.

### MARKDOWN REQUIREMENTS
1. STRUCTURE: Use standard Markdown:
   - `#` through `######` for headings matching the document hierarchy.
   - Standard paragraphs separated by blank lines.
   - `-` for unordered lists, `1.` for ordered lists (see rule 4 for details).
   - `**bold**`, `*italic*`, `***bold italic***` for inline emphasis.
   - Standard Markdown tables with `|` delimiters and `---` header separators.
   - `>` for blockquotes.

2. HEADINGS: Infer heading levels from visual formatting cues in the PDF (larger font size, bold weight, spacing above/below, distinct font). Text that is visually styled as a heading or section title MUST be rendered as a Markdown heading (`#`, `##`, etc.) — NEVER as a bold paragraph (`**...**`).
   - The document MUST begin with exactly ONE `#` (h1) — the document title. If the PDF has no obvious title, infer one from the document's subject matter.
   - All other headings use `##` through `#####` only. Never use `#` again after the title.
   - Heading levels MUST follow a valid hierarchy — never skip levels. After `#`, the next heading must be `##`. After `##`, the next can be `##` or `###`, but NOT `####`. A heading can only be one level deeper than its parent. Going back up (e.g. `###` → `##`) is fine.

3. NEWLINES AND PARAGRAPHS: Preserve the document's paragraph structure exactly. Each paragraph in the PDF must be its own paragraph in Markdown (separated by a blank line). When the PDF has a line break within a block of text (e.g. an address block or a list of items separated by line breaks), preserve those line breaks using two trailing spaces followed by a newline, or by inserting a blank line. Do NOT collapse multiple lines into a single run-on paragraph.

4. LISTS — this is critical for accessibility:
   - UNORDERED: Convert all bullet points (•, ●, ○, ▪, ▸, ‣, or any symbol) into Markdown list items using `-`. Never output raw bullet symbols.
   - ORDERED: Render ordered lists using the ORIGINAL marker style from the PDF:
     - Numbered lists (1, 2, 3…): use `1.` markers (standard Markdown ordered list).
     - Lowercase letter lists (a, b, c…): use the actual letter markers `a.`, `b.`, `c.` etc.
     - Uppercase letter lists (A, B, C…): use the actual letter markers `A.`, `B.`, `C.` etc.
     - Lowercase Roman numeral lists (i, ii, iii…): use `i.`, `ii.`, `iii.` etc.
     - Uppercase Roman numeral lists (I, II, III…): use `I.`, `II.`, `III.` etc.
     This preserves the list type information for the post-processor.
   - NESTED LISTS: Indent nested items by exactly four spaces per level. A sub-list under a parent item must be indented four spaces under that parent:
     ```
     - Parent item
         - Child item (4 spaces before the -)
             - Grandchild (8 spaces before the -)
     1. Numbered parent
         1. Numbered child (4 spaces before the 1.)
     ```
   - LIST CONTINUATIONS: When a list item has multiple lines of content (a title line, then a description underneath), ALL continuation lines MUST be indented to align with the first word of the list item text. This keeps them inside the same `<li>`. Example:
     ```
     - Construction Moratoriums and Coordination
       No in-stream work shall be conducted during the moratorium
       period from March 1 through June 30.
     ```
     The continuation lines are indented 2 spaces past the `-`. For ordered lists:
     ```
     1. Construction Moratoriums and Coordination
        No in-stream work shall be conducted during the moratorium
        period from March 1 through June 30.
     ```
     The continuation is indented 3 spaces (to align with text after `1. `).
   - NEVER render list content as `<br>`-separated lines inside a `<p>`. If content is a list, it MUST use Markdown list syntax.

5. ZERO TRUNCATION: Reproduce EVERY table row and EVERY paragraph. Never summarize.

6. HEADERS AND FOOTERS: OMIT all recurring page headers and page footers entirely. These include but are not limited to:
   - Company/organization logos or names repeated at the top of each page
   - Page numbers (e.g. "Page 1", "Page i", "1 of 10")
   - Document titles repeated in a header/footer band
   - Dates, revision numbers, or other metadata in header/footer regions
   - Any content that appears in the same position at the top or bottom of multiple pages and is not part of the document body
   Do NOT include any of this in your output. Focus only on the actual document body content.

7. HYPERLINKS: The manifest below lists URLs that exist as hyperlinks in the source PDF, by page. Create Markdown links `[text](url)` ONLY for URLs listed in this manifest. Do NOT invent, guess, or recall URLs from memory. Use YOUR VISUAL UNDERSTANDING of the PDF to determine which text each URL should be applied to — look at the actual clickable text on that page. If a URL is a mailto link, the anchor text is typically the email address shown in the document. If text looks like it should be a link but its URL is not in the manifest, leave it as plain text.
--- LINK MANIFEST ---
{link_manifest}
--- END LINK MANIFEST ---
If the manifest is empty, do not create any Markdown links at all.

8. TABLES:
   - Data completeness is more important than visual fidelity. Every cell value in the PDF must appear in the Markdown table.
   - Do NOT try to represent merged cells. Instead, repeat values in every cell they apply to.
   - When a table spans multiple PDF pages, emit it as ONE continuous table. Do not split it at page boundaries.
   - Always include a header row with column names.
   - For multi-level headers, flatten them into a single header row by concatenating parent and child labels (e.g., "Q1 Revenue" and "Q1 Costs").
   - Process tables systematically, one row at a time. For each row, read every cell value from left to right. Do not skip cells — if a cell is empty in the PDF, leave the cell empty in the table.
   - Every row must have the same number of columns as the header row.

9. IMAGES: Insert placeholders exactly where visual elements appear in the document flow.
CRITICAL: Replace the 'P' and 'I' in `[[IMAGE_P_I|alt text]]` with ACTUAL Page and Index numbers from the manifest below.
After the pipe, write concise alt text suitable for screen readers.
For purely decorative images, leave alt text empty: `[[IMAGE_1_0|]]`.
EXAMPLE: If an image is Page 1, Index 0 showing a state seal, write `[[IMAGE_1_0|North Carolina state seal]]`.

--- IMAGE MANIFEST ---
{image_manifest}

10. INLINE FORMATTING: Preserve the visual emphasis from the PDF exactly.
   - Text that appears **bold** in the PDF MUST use `**bold**` in Markdown.
   - Text that appears *italic* in the PDF MUST use `*italic*` in Markdown.
   - Text that is both bold and italic MUST use `***bold italic***`.
   - Do NOT apply inline formatting to headings — headings already convey emphasis via their level.
   - Do NOT promote inline-formatted text to headings. If text is bold within a paragraph or list item, keep it as `**bold**` inline — only promote to a heading if it is visually a standalone section title with its own line and spacing.

### EXECUTION
Return ONLY the Markdown content. Do not wrap it in code fences. Do not include any preamble or explanation.
"""


def clean_markdown_fences(text):
    text = re.sub(r'^```(?:markdown)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # Normalize any stray bullet symbols the model emitted into proper
    # Markdown list items.  Handles •, ●, ○, ▪, ▸, ‣ at the start of a line
    # (with optional leading whitespace).
    text = re.sub(
        r'^(\s*)[•●○▪▸‣]\s*',
        r'\1- ',
        text,
        flags=re.MULTILINE,
    )

    return text


_ROMAN_VALUES = {'i': 1, 'v': 5, 'x': 10, 'l': 50,
                 'c': 100, 'd': 500, 'm': 1000}


def _roman_to_int(s):
    """Convert a Roman numeral string to an integer, or return 0 on failure."""
    s = s.lower()
    if not s or not all(ch in _ROMAN_VALUES for ch in s):
        return 0
    total = 0
    prev = 0
    for ch in reversed(s):
        val = _ROMAN_VALUES[ch]
        if val < prev:
            total -= val
        else:
            total += val
        prev = val
    return total


def _is_valid_roman(s):
    """Return True if *s* looks like a valid Roman numeral (i–mmmm)."""
    n = _roman_to_int(s)
    return 1 <= n <= 4000


# Regex for letter/Roman markers.  Captures (indent)(marker)(dot/paren)(space)(rest).
_LETTER_ROMAN_RE = re.compile(
    r'^(\s*)'                      # leading whitespace
    r'([a-zA-Z]+|[ivxlcdmIVXLCDM]+)'  # marker
    r'([.)]\s)'                    # separator: dot or paren followed by space
    r'(.*)',                        # rest of the line
)


def _classify_marker_sequence(markers):
    """Given a list of raw marker strings at the same indent level, return
    the list type ('lower_letter', 'upper_letter', 'lower_roman',
    'upper_roman') or None if the sequence is unrecognisable.

    Single-char ambiguous markers (i, v, x, c, d, m) are disambiguated by
    looking at the full run.
    """
    if not markers:
        return None

    # Check if ALL markers are single uppercase letters in sequence A,B,C…
    if all(len(m) == 1 and m.isupper() for m in markers):
        expected = [chr(ord('A') + i) for i in range(len(markers))]
        if markers == expected:
            return 'upper_letter'

    # Check if ALL markers are single lowercase letters in sequence a,b,c…
    if all(len(m) == 1 and m.islower() for m in markers):
        expected = [chr(ord('a') + i) for i in range(len(markers))]
        if markers == expected:
            return 'lower_letter'

    # Check Roman numeral sequence (lowercase)
    if all(m.islower() and _is_valid_roman(m) for m in markers):
        vals = [_roman_to_int(m) for m in markers]
        if vals == list(range(1, len(vals) + 1)):
            return 'lower_roman'

    # Check Roman numeral sequence (uppercase)
    if all(m.isupper() and _is_valid_roman(m) for m in markers):
        vals = [_roman_to_int(m) for m in markers]
        if vals == list(range(1, len(vals) + 1)):
            return 'upper_roman'

    # Fallback: single ambiguous marker — default to Roman if valid
    if len(markers) == 1:
        m = markers[0]
        if _is_valid_roman(m):
            return 'lower_roman' if m.islower() else 'upper_roman'
        if len(m) == 1 and m.isalpha():
            return 'lower_letter' if m.islower() else 'upper_letter'

    return None


_OL_TYPE_MAP = {
    'lower_letter': 'a',
    'upper_letter': 'A',
    'lower_roman': 'i',
    'upper_roman': 'I',
}


def _normalize_markdown_lists(text):
    """Fix list formatting in Gemini markdown output.

    Phase 1 – convert paren-style ordered markers to dot-style:
              numbers  1) / 1).  →  1.
              letters  a) / A)   →  a. / A.
              Roman    ii) / II) →  ii. / II.

    Phase 2 – detect runs of letter / Roman markers, insert HTML-comment
              type tags (<!--OL_TYPE_a--> etc.) before each run, then
              rewrite every marker in the run to ``1.`` so the Markdown
              parser can handle it.

    Phase 3 – indent continuation lines so they remain inside their <li>.
    """
    lines = text.split('\n')

    # Phase 1: normalise paren-style markers to dot-style.
    for i, line in enumerate(lines):
        # Numbers: 1) or 1).
        m = re.match(r'^(\s*)(\d+)\)\.?\s+(.*)', line)
        if m:
            lines[i] = f'{m.group(1)}{m.group(2)}. {m.group(3)}'
            continue
        # Letters / Roman: a) or A) or ii) or IV) etc.
        m = re.match(r'^(\s*)([a-zA-Z]+)\)\.?\s+(.*)', line)
        if m:
            lines[i] = f'{m.group(1)}{m.group(2)}. {m.group(3)}'

    # Phase 2: detect letter/Roman runs and rewrite them.
    # Collect runs: a run is a sequence of consecutive list items at the
    # same indent level whose markers are letters or Roman numerals.
    i = 0
    insertions = []  # list of (line_index, comment_string)
    while i < len(lines):
        m = _LETTER_ROMAN_RE.match(lines[i])
        if not m:
            i += 1
            continue

        indent = m.group(1)
        marker = m.group(2)

        # Don't match single-word paragraphs that happen to start with a
        # letter followed by a period (e.g. "A. Smith reported…").
        # Heuristic: if the "marker" is a common word, skip it.
        if marker.lower() in ('a', 'an', 'the', 'no', 'or', 'so', 'to',
                               'do', 'go', 'be', 'he', 'me', 'we',
                               'if', 'in', 'on', 'of', 'up', 'at',
                               'by', 'my', 'vs', 'am', 'as', 'is',
                               'it', 'us', 'ok'):
            # Only skip if there's no second item in the run
            next_line_idx = i + 1
            # Skip continuation/blank lines to find next item
            while next_line_idx < len(lines):
                s = lines[next_line_idx].lstrip()
                if not s:
                    next_line_idx += 1
                    continue
                break
            if next_line_idx < len(lines):
                nm = _LETTER_ROMAN_RE.match(lines[next_line_idx])
                if not nm or nm.group(1) != indent:
                    i += 1
                    continue
            else:
                i += 1
                continue

        # Collect the run
        run_start = i
        run_markers = [marker]
        run_indices = [i]
        j = i + 1
        while j < len(lines):
            stripped = lines[j].lstrip()
            leading = len(lines[j]) - len(stripped)
            # Blank line — might separate items in a "loose" list
            if not stripped:
                j += 1
                continue
            # Another list item at the same indent?
            nm = _LETTER_ROMAN_RE.match(lines[j])
            if nm and nm.group(1) == indent:
                run_markers.append(nm.group(2))
                run_indices.append(j)
                j += 1
                continue
            # Continuation line (indented further)?
            if leading > len(indent):
                j += 1
                continue
            break

        list_type = _classify_marker_sequence(run_markers)
        if list_type and list_type in _OL_TYPE_MAP:
            ol_type = _OL_TYPE_MAP[list_type]
            insertions.append((run_start, f'{indent}<!--OL_TYPE_{ol_type}-->'))
            for idx in run_indices:
                # Rewrite the marker to 1.
                old_m = _LETTER_ROMAN_RE.match(lines[idx])
                if old_m:
                    lines[idx] = (
                        f'{old_m.group(1)}1. {old_m.group(4)}'
                    )
            i = j
        else:
            i += 1

    # Apply insertions (in reverse so indices stay valid)
    for line_idx, comment in reversed(insertions):
        lines.insert(line_idx, comment)
        lines.insert(line_idx, '')  # blank line before comment for markdown

    # Phase 3: indent continuation lines that follow a list item directly
    # (no blank line between) so the Markdown parser keeps them in the <li>.
    result = []
    in_list = False
    list_indent = 2

    for i, line in enumerate(lines):
        stripped = line.lstrip()
        leading = len(line) - len(stripped)

        lm = re.match(r'^(\s*)([-*+]|\d+\.)\s+', line)
        if lm:
            result.append(line)
            in_list = True
            list_indent = len(lm.group(1)) + len(lm.group(2)) + 1
            continue

        if not stripped:
            result.append(line)
            in_list = False
            continue

        if in_list:
            if stripped.startswith(('#', '|', '---', '```', '>', '<!--')):
                in_list = False
                result.append(line)
            elif leading < list_indent:
                result.append(' ' * list_indent + stripped)
            else:
                result.append(line)
            continue

        result.append(line)

    return '\n'.join(result)


def inject_images_into_html(html_content, images_dict):
    """Replace [[IMAGE_P_I|alt]] placeholders with base64 <figure><img> tags."""
    def replace_image_with_alt(match):
        try:
            p = int(match.group(1))
            i = int(match.group(2))
            alt_text = match.group(3).strip()
            if (p, i) in images_dict:
                mime, b64, w, h = images_dict[(p, i)]
                if not alt_text:
                    alt_text = ""
                return (
                    f'<figure><img src="data:{mime};base64,{b64}" '
                    f'alt="{alt_text}" '
                    f'style="width: {w:.1f}pt; height: auto;"></figure>')
            return ""
        except Exception:
            return ""

    def replace_image_fallback(match):
        try:
            p = int(match.group(1))
            i = int(match.group(2))
            if (p, i) in images_dict:
                mime, b64, w, h = images_dict[(p, i)]
                return (
                    f'<figure><img src="data:{mime};base64,{b64}" '
                    f'alt="Image {p}_{i}" '
                    f'style="width: {w:.1f}pt; height: auto;"></figure>')
            return ""
        except Exception:
            return ""

    result = re.sub(
        r'\[\[IMAGE_(\d+)_(\d+)\|([^\]]*)\]\]',
        replace_image_with_alt, html_content)
    result = re.sub(
        r'\[\[IMAGE_(\d+)_(\d+)\]\]',
        replace_image_fallback, result)
    result = re.sub(r'\[\[IMAGE_[^\]]*\]\]', '', result)
    return result


def _autolink_html(html):
    """Wrap bare URLs and email addresses in the HTML with <a> tags.

    Skips anything already inside an href="..." or <a>...</a> so we
    don't double-link text that Gemini already hyperlinked.
    """
    # Split the HTML so we can skip anything inside tags and existing anchors.
    # Tokens are either HTML tags or text between tags.
    tokens = re.split(r'(<[^>]+>)', html)
    in_anchor = 0
    url_re = re.compile(
        r'(https?://[^\s<>\'")\],;]+)',
    )
    email_re = re.compile(
        r'([\w.+-]+@[\w-]+(?:\.[\w-]+)+)',
    )

    out = []
    for token in tokens:
        if token.startswith('<'):
            lower = token.lower()
            if lower.startswith('<a ') or lower.startswith('<a>'):
                in_anchor += 1
            elif lower.startswith('</a'):
                in_anchor = max(in_anchor - 1, 0)
            out.append(token)
            continue

        if in_anchor:
            out.append(token)
            continue

        # Replace bare URLs first, then emails
        token = url_re.sub(r'<a href="\1">\1</a>', token)
        token = email_re.sub(r'<a href="mailto:\1">\1</a>', token)
        out.append(token)

    return ''.join(out)


THEME_CSS = """
/* Digital Commons NC — Standalone Theme CSS */
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
:root {
  --nc-font: "Source Sans 3", "Source Sans Pro", sans-serif;
  --nc-navy: #092940; --nc-blue: #3b75a9; --nc-link: #0d6efd;
  --nc-text: #212529; --nc-bg: #fff; --nc-border: #dee2e6;
  --nc-max-width: 960px;
}
body { font-family: var(--nc-font); line-height: 1.6; color: var(--nc-text); background: var(--nc-bg); margin: 0; padding: 0; }
main { max-width: var(--nc-max-width); margin: 0 auto; padding: 1.5rem 2rem 3rem; }
h1, h2, h3, h4 { font-weight: 500; color: var(--nc-text); margin-top: 1.5em; }
h1:first-of-type { border-bottom: 3px solid var(--nc-navy); padding-bottom: 0.5rem; }
table { border-collapse: collapse; width: 100%; margin: 1.25em 0; }
th, td { border: 1px solid var(--nc-border); padding: 0.6em 0.85em; text-align: left; }
th { background: #f8f9fa; font-weight: 600; }
tr:nth-child(even) { background: #f9fafb; }
img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
.page-header { font-size: 0.85rem; color: #6c757d; border-bottom: 1px solid var(--nc-border); }
.page-footer { font-size: 0.85rem; color: #6c757d; text-align: right; border-top: 1px solid var(--nc-border); }
"""


def _apply_list_type_markers(html):
    """Replace <!--OL_TYPE_X--> comment markers with type attributes on <ol> tags.

    The _normalize_markdown_lists phase inserts comments like <!--OL_TYPE_a-->
    just before letter/Roman list runs.  After the Markdown→HTML conversion
    these comments appear right before the <ol> tag they describe.
    """
    return re.sub(
        r'<!--OL_TYPE_(\w+)-->\s*\n?(\s*)<ol>',
        r'\2<ol type="\1">',
        html,
    )


def markdown_to_html(md_content, images_dict):
    """Convert Markdown to HTML body, inject images, wrap in full document template."""
    # Convert markdown to HTML body content
    # nl2br turns single newlines inside paragraphs into <br>, preserving
    # the line-break structure of addresses, signature blocks, etc.
    # Normalize list structures before the Markdown parser sees them.
    md_content = _normalize_markdown_lists(md_content)

    body_html = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'sane_lists', 'nl2br'])

    # Apply list type attributes (a, A, i, I) from comment markers
    body_html = _apply_list_type_markers(body_html)

    # Inject base64 images into the HTML
    body_html = inject_images_into_html(body_html, images_dict)

    # Auto-link any bare URLs or email addresses that aren't already
    # wrapped in <a> tags.
    body_html = _autolink_html(body_html)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Converted Document</title>
    <style>{THEME_CSS}</style>
</head>
<body>
    <main>
        {body_html}
    </main>
</body>
</html>"""


def pdf_to_html(pdf_path, api_key=None, show_markdown=False, output_dir=None):
    """
    Convert a PDF to HTML via an intermediate Markdown representation.
    Gemini produces Markdown (models handle it better), then we
    programmatically convert that Markdown to HTML.
    Returns (success, timings_dict).
    """
    timings = {
        "asset_extraction": 0.0,
        "gemini_extraction": 0.0,
        "html_conversion": 0.0,
        "total": 0.0,
    }
    t_total_start = time.time()

    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        timings["total"] = time.time() - t_total_start
        return False, timings

    # 1. Extract assets
    print(f"Extracting images and links from {pdf_path}...")
    t0 = time.time()
    images_dict, image_manifest, link_manifest = (
        extract_assets_and_build_manifest(pdf_path))
    timings["asset_extraction"] = time.time() - t0

    # 2. Initialize Gemini client
    if api_key:
        client = genai.Client(api_key=api_key)
    else:
        client = genai.Client(
            vertexai=True,
            project=os.environ.get("GEMINI_GCP_PROJECT"),
            location=os.environ.get("GEMINI_GCP_LOCATION", "global")
        )

    # 3. Read PDF bytes
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # 4. Build extraction prompt and call Gemini
    prompt = build_extraction_prompt(link_manifest, image_manifest)

    print(f"Sending request to {EXTRACTION_MODEL} (Markdown extraction)...")
    try:
        t0 = time.time()
        response = _call_gemini(
            client,
            model=EXTRACTION_MODEL,
            contents=[
                types.Part.from_bytes(
                    data=pdf_bytes, mime_type="application/pdf"),
                prompt
            ],
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_INSTRUCTION,
                temperature=1.0,
                max_output_tokens=64000,
                media_resolution=types.MediaResolution.MEDIA_RESOLUTION_HIGH
            )
        )
        timings["gemini_extraction"] = time.time() - t0

        md_content = clean_markdown_fences(response.text)

        # Determine output directory
        out_dir = output_dir or os.path.dirname(pdf_path) or "."
        os.makedirs(out_dir, exist_ok=True)

        # 5. Optionally write intermediate markdown
        if show_markdown:
            md_path = os.path.join(out_dir, "converted.md")
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content + "\n")
            print(f"Markdown written to: {md_path}")

        # 6. Convert markdown to HTML with images injected
        print("Converting Markdown to HTML...")
        t0 = time.time()
        final_html = markdown_to_html(md_content, images_dict)
        timings["html_conversion"] = time.time() - t0

        output_path = os.path.join(out_dir, "converted.html")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_html)

        print(f"HTML written to: {output_path}")
        timings["total"] = time.time() - t_total_start
        return True, timings

    except Exception as e:
        print(f"Error calling Gemini API for {pdf_path}: {e}")
        timings["total"] = time.time() - t_total_start
        return False, timings


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert PDF to HTML via Markdown")
    parser.add_argument("input", help="Path to a PDF file")
    parser.add_argument(
        "--show-markdown", action="store_true",
        help="Also output the intermediate Markdown file")
    parser.add_argument(
        "--output-dir", default=None,
        help="Directory to write output files to (default: same as input)")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: {args.input} is not a file")
        sys.exit(1)

    success, timings = pdf_to_html(
        args.input, show_markdown=args.show_markdown,
        output_dir=args.output_dir)
    print(
        f"\nTimings: "
        f"assets={timings['asset_extraction']:.1f}s  "
        f"extraction={timings['gemini_extraction']:.1f}s  "
        f"html={timings['html_conversion']:.1f}s  "
        f"total={timings['total']:.1f}s")
    sys.exit(0 if success else 1)

