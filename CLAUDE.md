# OAIP ADA PDF-to-HTML Conversion Testing

## What This Repo Is

A testing and comparison dataset for evaluating PDF-to-HTML conversion quality across multiple AI providers. Each document folder contains the original PDF, two HTML conversions (old pipeline vs new pipeline), and audit reports from Claude, GPT, and Gemini scoring the new conversion's ADA/WCAG compliance.

The `docs/` folder hosts a browser-based comparison tool on GitHub Pages that reads everything directly from this repo via the GitHub API.

## Repo Structure

```
.gitattributes                    # LFS rules (see below)
docs/                             # GitHub Pages comparison tool (NOT LFS-tracked)
  index.html                      # App shell — topbar, sidebar, 3-column layout
  app.js                          # All logic — GitHub API, PDF.js rendering, audit display
  styles.css                      # DIT "First in Flight" dark theme
  ncdit-white-logo.png            # NC DIT branding
2026-04-13-deq/                   # DEQ agency batch (100 documents)
  <document-folder>/
    source.pdf                    # Original PDF
    old-converted.html            # Previous pipeline conversion
    converted.html                # New pipeline conversion
    old-audit.json                # Legacy audit (quality scores, fidelity, axe scan)
    audit-report-claude.json      # Claude audit of new conversion
    audit-report-gpt.json         # GPT audit of new conversion
    audit-report-gemini.json      # Gemini audit of new conversion
2026-04-13-dhhs-and-dor/          # Placeholder for DHHS/DOR batch (empty)
```

## Git LFS

`*.pdf` and `*.html` are tracked by LFS. The `docs/` directory is **excluded** from LFS so GitHub Pages can serve those files directly. This is controlled by `.gitattributes`:

```
*.pdf filter=lfs diff=lfs merge=lfs -text
*.html filter=lfs diff=lfs merge=lfs -text
docs/** filter= diff= merge= text
```

If you add new files to `docs/`, they will NOT go through LFS. If you add HTML or PDF files outside `docs/`, they WILL go through LFS. Do not change this — breaking the LFS exclusion for `docs/` will cause GitHub Pages to serve LFS pointer text instead of actual content.

## The Comparison Tool (`docs/`)

A single-page app served via GitHub Pages. No build step, no dependencies to install, no backend.

### How it works

1. **On load** (`loadRepo` in `app.js`): Fetches the full Git tree via `GET /repos/.../git/trees/main?recursive=1` in a single API call. Discovers all top-level directories matching `YYYY-MM-DD-*` and populates the batch dropdown. Loads the first batch automatically.

2. **On batch select**: Filters the cached tree for the selected batch directory, builds the sidebar of document folders. No additional API call needed.

3. **On folder select** (`loadSubdirFiles`): Fetches all files for that folder in parallel — both HTML conversions, the PDF URL, and all audit JSONs. LFS files are handled transparently: `fetchTextFile` tries `raw.githubusercontent.com` first, and if it gets an LFS pointer (starts with `version https://git-lfs.github.com`), falls back to `media.githubusercontent.com/media/`.

4. **Layout**: Three resizable and collapsible columns — Old HTML | New HTML | PDF. Each column has a chevron toggle to collapse/expand it. The Old HTML column auto-collapses when the selected document has no `old-converted.html`. Each HTML column has a `</>` toggle for raw HTML view (with base64 data URI truncation). Below each HTML column is a draggable audit panel. The new HTML audit panel has Claude/GPT/Gemini provider tabs. The sidebar is also collapsible.

5. **PDF rendering**: Uses pdf.js (CDN, v3.11.174). Renders all pages into canvases with fit-to-width, zoom in/out, and page navigation.

### Key config in `app.js`

```js
const REPO_OWNER = 'State-of-North-Carolina-DIT';
const REPO_NAME  = 'OAIP-ADA-PDF-to-HTML-Files-Testing';
const REPO_BRANCH = 'main';
```

Batch directories are discovered automatically from the repo tree — any top-level directory matching `YYYY-MM-DD-*` appears in the dropdown. No config change needed when adding new batches.

### Styling

Uses the DIT "First in Flight" dark theme. Colors and typography are defined as CSS custom properties in `styles.css`. Primary: `#092940`, Secondary: `#3892E1`, Accent: `#CF1F42`. Font: Source Sans Pro (loaded from Google Fonts CDN).

## Adding New Document Batches

1. Create a directory at the repo root following the naming convention: `YYYY-MM-DD-agency/`
2. Inside, create one subfolder per document containing: `source.pdf`, `converted.html`, and optionally `old-converted.html` and any audit JSON files (`audit-report-claude.json`, `audit-report-gpt.json`, `audit-report-gemini.json`, `old-audit.json`)
3. Commit and push — LFS will handle the large HTML/PDF files automatically. The new batch will appear in the dropdown automatically.

## GitHub Pages

Deployed from the `docs/` folder on the `main` branch. No build action needed — pushing to `main` triggers a rebuild automatically.
