// ================================================================
// GitHub Repo Config
// ================================================================
const REPO_OWNER = 'State-of-North-Carolina-DIT';
const REPO_NAME = 'OAIP-ADA-PDF-to-HTML-Files-Testing';
const REPO_BRANCH = 'main';
const BASE_PATH = '2026-04-13';

const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';
const GITHUB_MEDIA = 'https://media.githubusercontent.com/media';
const LFS_SIGNATURE = 'version https://git-lfs.github.com';

// ================================================================
// State
// ================================================================
const S = {
  subdirs: [],
  selected: null,
  activeProvider: 'claude',
  cache: {},
  pdf: null,
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ================================================================
// DOM builder helpers (avoid raw innerHTML for user-data sections)
// ================================================================
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, val] of Object.entries(attrs)) {
      if (k === 'className') node.className = val;
      else if (k === 'textContent') node.textContent = val;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), val);
      else node.setAttribute(k, val);
    }
  }
  if (children) {
    if (typeof children === 'string') node.textContent = children;
    else if (Array.isArray(children)) children.forEach(c => { if (c) node.appendChild(c); });
    else node.appendChild(children);
  }
  return node;
}

// ================================================================
// GitHub API Helpers
// ================================================================
function rawUrl(filePath) {
  return `${GITHUB_RAW}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;
}

function mediaUrl(filePath) {
  return `${GITHUB_MEDIA}/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${filePath}`;
}

async function fetchContents(path) {
  const encoded = path.split('/').map(s => encodeURIComponent(s)).join('/');
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encoded}?ref=${REPO_BRANCH}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`GitHub API ${resp.status}: ${resp.statusText}`);
  return resp.json();
}

// Fetch text file, handling LFS pointer transparently
async function fetchTextFile(filePath) {
  const encoded = filePath.split('/').map(s => encodeURIComponent(s)).join('/');
  const resp = await fetch(rawUrl(encoded));
  if (!resp.ok) return null;
  const text = await resp.text();
  if (text.startsWith(LFS_SIGNATURE)) {
    const mediaResp = await fetch(mediaUrl(encoded));
    if (!mediaResp.ok) return null;
    return mediaResp.text();
  }
  return text;
}

// Resolve PDF URL (check if LFS, return direct URL for pdf.js)
async function resolvePdfUrl(filePath) {
  const encoded = filePath.split('/').map(s => encodeURIComponent(s)).join('/');
  const raw = rawUrl(encoded);
  try {
    const resp = await fetch(raw);
    if (!resp.ok) return raw;
    const reader = resp.body.getReader();
    const { value } = await reader.read();
    reader.cancel();
    const snippet = new TextDecoder().decode(value.slice(0, 50));
    if (snippet.startsWith(LFS_SIGNATURE)) {
      return mediaUrl(encoded);
    }
  } catch {}
  return raw;
}

// ================================================================
// Load from GitHub (uses Git Trees API — single call for full tree)
// ================================================================
async function loadRepo() {
  $('#repoInfo').textContent = `${REPO_OWNER}/${REPO_NAME} / ${BASE_PATH}`;

  try {
    // Get full tree in one API call (avoids per-directory listing)
    const treeUrl = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_BRANCH}?recursive=1`;
    const resp = await fetch(treeUrl);
    if (!resp.ok) throw new Error(`GitHub API ${resp.status}: ${resp.statusText}`);
    const treeData = await resp.json();

    // Build file index: { subdirName: Set of filenames }
    const prefix = BASE_PATH + '/';
    const fileIndex = {};
    const subdirNames = new Set();

    for (const item of treeData.tree) {
      if (!item.path.startsWith(prefix)) continue;
      const rel = item.path.slice(prefix.length); // e.g. "folderName/converted.html"
      const parts = rel.split('/');
      if (parts.length === 1 && item.type === 'tree') {
        subdirNames.add(parts[0]);
      } else if (parts.length === 2 && item.type === 'blob') {
        const [dir, file] = parts;
        if (!fileIndex[dir]) fileIndex[dir] = new Set();
        fileIndex[dir].add(file);
      }
    }

    S.fileIndex = fileIndex;
    S.subdirs = [...subdirNames]
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ name, path: `${BASE_PATH}/${name}` }));

    S.cache = {};
    S.selected = null;

    $('#welcome').classList.add('hidden');
    $('#workspace').classList.add('active');
    renderSidebar();
    if (S.subdirs.length > 0) selectSubdir(S.subdirs[0].name);
  } catch (e) {
    const welcome = $('#welcome');
    welcome.replaceChildren();
    welcome.appendChild(el('div', { className: 'error-banner', style: 'max-width:500px' }, 'Failed to load repo: ' + e.message));
  }
}

async function loadSubdirFiles(name) {
  if (S.cache[name]) return S.cache[name];
  const subdir = S.subdirs.find(d => d.name === name);
  if (!subdir) return null;

  // Use pre-built file index (no extra API call needed)
  const fileNames = S.fileIndex[name] || new Set();

  const filePath = (filename) => `${subdir.path}/${filename}`;
  const parseJson = raw => { if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } };

  // Fetch all in parallel
  const [newHtml, oldHtml, oldAuditRaw, claudeRaw, gptRaw, geminiRaw] = await Promise.all([
    fileNames.has('converted.html') ? fetchTextFile(filePath('converted.html')) : null,
    fileNames.has('old-converted.html') ? fetchTextFile(filePath('old-converted.html')) : null,
    fileNames.has('old-audit.json') ? fetchTextFile(filePath('old-audit.json')) : null,
    fileNames.has('audit-report-claude.json') ? fetchTextFile(filePath('audit-report-claude.json')) : null,
    fileNames.has('audit-report-gpt.json') ? fetchTextFile(filePath('audit-report-gpt.json')) : null,
    fileNames.has('audit-report-gemini.json') ? fetchTextFile(filePath('audit-report-gemini.json')) : null,
  ]);

  // Resolve PDF URL (don't download the binary, just get the URL for pdf.js)
  let pdfUrl = null;
  if (fileNames.has('source.pdf')) {
    pdfUrl = await resolvePdfUrl(filePath('source.pdf'));
  }

  const data = {
    oldHtml,
    newHtml,
    pdfUrl,
    oldAudit: parseJson(oldAuditRaw),
    audits: {
      claude: parseJson(claudeRaw),
      gpt: parseJson(gptRaw),
      gemini: parseJson(geminiRaw),
    },
  };
  S.cache[name] = data;
  return data;
}

// ================================================================
// Sidebar
// ================================================================
function renderSidebar() {
  const list = $('#sidebarList');
  const filter = ($('#sidebarSearch').value || '').toLowerCase();
  const filtered = S.subdirs.filter(d => d.name.toLowerCase().includes(filter));
  $('#sidebarCount').textContent = filtered.length + (filter ? ' / ' + S.subdirs.length : '');

  list.replaceChildren();
  if (filtered.length === 0) {
    list.appendChild(el('div', { className: 'sb-empty' }, 'No matching folders'));
    return;
  }

  const folderSvg = '<svg class="sb-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>';

  for (const dir of filtered) {
    const item = el('div', {
      className: 'sb-item' + (dir.name === S.selected ? ' active' : ''),
      role: 'option',
      'aria-selected': dir.name === S.selected ? 'true' : 'false',
      'data-name': dir.name,
      onClick: () => selectSubdir(dir.name),
    });
    // Icon via trusted static SVG
    const iconWrap = document.createElement('span');
    iconWrap.insertAdjacentHTML('beforeend', folderSvg);
    item.appendChild(iconWrap.firstElementChild);
    // Name via textContent (safe)
    const nameSpan = el('span', { className: 'sb-item-name', title: dir.name }, dir.name);
    item.appendChild(nameSpan);
    list.appendChild(item);
  }
}

async function selectSubdir(name) {
  if (S.selected === name) return;
  S.selected = name;

  $$('.sb-item').forEach(el => {
    const isActive = el.dataset.name === name;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  const activeEl = $('.sb-item.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });

  showContentLoading(true);
  try {
    const data = await loadSubdirFiles(name);
    if (!data) throw new Error('Could not read folder');
    renderConversionsView(data);
  } catch (e) {
    const banner = el('div', { className: 'error-banner' }, e.message);
    const body = $('#oldHtmlBody');
    body.replaceChildren(banner);
  } finally {
    showContentLoading(false);
  }
}

// ================================================================
// Provider Switching
// ================================================================
function switchProvider(provider) {
  S.activeProvider = provider;
  $$('.ptab').forEach(t => {
    const isActive = t.dataset.provider === provider;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  if (S.selected && S.cache[S.selected]) renderNewAuditPanel(S.cache[S.selected]);
}

// ================================================================
// Conversions View
// ================================================================
// Track raw HTML and toggle state per panel
const htmlPanels = {
  oldHtmlBody: { html: null, raw: false },
  newHtmlBody: { html: null, raw: false },
};

function renderConversionsView(data) {
  htmlPanels.oldHtmlBody.html = data.oldHtml;
  htmlPanels.oldHtmlBody.raw = false;
  htmlPanels.newHtmlBody.html = data.newHtml;
  htmlPanels.newHtmlBody.raw = false;
  $('#oldHtmlToggle').classList.remove('active');
  $('#newHtmlToggle').classList.remove('active');
  renderHtmlPanel('oldHtmlBody', data.oldHtml, 'Old conversion not available');
  renderHtmlPanel('newHtmlBody', data.newHtml, 'New conversion not available');
  renderPdf(data.pdfUrl);
  renderOldAuditPanel(data);
  renderNewAuditPanel(data);
}

function renderHtmlPanel(containerId, html, emptyMsg) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  if (!html) {
    container.appendChild(el('div', { className: 'no-file' }, emptyMsg));
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-same-origin allow-scripts';
  iframe.title = containerId.includes('old') ? 'Old HTML conversion' : 'New HTML conversion';
  iframe.srcdoc = html;
  container.appendChild(iframe);
}

function truncateBase64(html) {
  // Replace base64 data URIs with a short preview + char count
  return html.replace(/data:(image\/[^;]+);base64,([A-Za-z0-9+/=]{80,})/g, (match, mime, b64) => {
    const preview = b64.slice(0, 32);
    const len = b64.length;
    const kb = (len * 0.75 / 1024).toFixed(1);
    return `data:${mime};base64,${preview}...[base64 truncated — ${kb} KB]`;
  });
}

function toggleHtmlRaw(containerId, toggleBtn) {
  const panel = htmlPanels[containerId];
  if (!panel || !panel.html) return;
  const container = document.getElementById(containerId);

  // Get current scroll ratio from whichever element is showing
  let scrollRatio = 0;
  const current = container.firstElementChild;
  if (current) {
    if (current.tagName === 'IFRAME' && current.contentDocument?.documentElement) {
      const doc = current.contentDocument.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      scrollRatio = maxScroll > 0 ? doc.scrollTop / maxScroll : 0;
    } else if (current.tagName === 'PRE') {
      const maxScroll = current.scrollHeight - current.clientHeight;
      scrollRatio = maxScroll > 0 ? current.scrollTop / maxScroll : 0;
    }
  }

  panel.raw = !panel.raw;
  toggleBtn.classList.toggle('active', panel.raw);
  container.replaceChildren();

  if (panel.raw) {
    const pre = document.createElement('pre');
    pre.className = 'raw-html';
    pre.textContent = truncateBase64(panel.html);
    container.appendChild(pre);
    requestAnimationFrame(() => {
      const maxScroll = pre.scrollHeight - pre.clientHeight;
      pre.scrollTop = scrollRatio * maxScroll;
    });
  } else {
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-same-origin allow-scripts';
    iframe.title = containerId.includes('old') ? 'Old HTML conversion' : 'New HTML conversion';
    iframe.srcdoc = panel.html;
    container.appendChild(iframe);
    iframe.addEventListener('load', () => {
      const doc = iframe.contentDocument?.documentElement;
      if (doc) {
        const maxScroll = doc.scrollHeight - doc.clientHeight;
        doc.scrollTop = scrollRatio * maxScroll;
      }
    });
  }
}

// ================================================================
// PDF Rendering (pdf.js)
// ================================================================
async function renderPdf(pdfUrl) {
  const body = $('#pdfBody');
  body.replaceChildren();
  if (!pdfUrl) {
    body.appendChild(el('div', { className: 'no-file' }, 'PDF not available'));
    S.pdf = null;
    updatePdfControls();
    return;
  }

  try {
    const doc = await pdfjsLib.getDocument(pdfUrl).promise;
    S.pdf = { doc, scale: 1.5, fitWidth: true, wrappers: [] };
    await renderAllPages();
    updatePdfControls();
  } catch {
    body.replaceChildren(el('div', { className: 'no-file' }, 'Failed to load PDF'));
    S.pdf = null;
  }
}

async function renderAllPages() {
  const p = S.pdf;
  if (!p) return;
  const body = $('#pdfBody');

  if (p.fitWidth) {
    const page1 = await p.doc.getPage(1);
    const avail = body.clientWidth - 20;
    if (avail > 50) {
      const vp = page1.getViewport({ scale: 1 });
      p.scale = Math.max(0.4, avail / vp.width);
    }
  }

  const scrollRatio = body.scrollHeight > 0 ? body.scrollTop / body.scrollHeight : 0;
  body.replaceChildren();
  p.wrappers = [];

  for (let i = 1; i <= p.doc.numPages; i++) {
    const page = await p.doc.getPage(i);
    const vp = page.getViewport({ scale: p.scale });
    const wrap = document.createElement('div');
    wrap.className = 'pdf-page-wrap';
    wrap.dataset.page = i;
    wrap.style.width = vp.width + 'px';
    wrap.style.height = vp.height + 'px';
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    wrap.appendChild(canvas);
    body.appendChild(wrap);
    p.wrappers.push(wrap);
    page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
  }

  if (scrollRatio > 0) {
    requestAnimationFrame(() => { body.scrollTop = scrollRatio * body.scrollHeight; });
  }
  updatePdfControls();
}

function getCurrentPage() {
  const p = S.pdf;
  if (!p || !p.wrappers.length) return 1;
  const body = $('#pdfBody');
  const mid = body.scrollTop + body.clientHeight / 3;
  let cur = 1;
  for (const w of p.wrappers) {
    if (w.offsetTop <= mid) cur = +w.dataset.page;
    else break;
  }
  return cur;
}

function scrollToPage(n) {
  if (!S.pdf) return;
  const w = S.pdf.wrappers[n - 1];
  if (w) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updatePdfControls() {
  const p = S.pdf;
  const cur = p ? getCurrentPage() : 0;
  const total = p ? p.doc.numPages : 0;
  $('#pdfPageInfo').textContent = p ? cur + ' / ' + total : '-';
  $('#pdfZoomInfo').textContent = p ? Math.round(p.scale * 100) + '%' : '';
}

function initPdfControls() {
  $('.pdf-prev').onclick = () => { const c = getCurrentPage(); if (c > 1) scrollToPage(c - 1); };
  $('.pdf-next').onclick = () => { if (!S.pdf) return; const c = getCurrentPage(); if (c < S.pdf.doc.numPages) scrollToPage(c + 1); };
  $('.pdf-zm-in').onclick = () => { if (!S.pdf) return; S.pdf.fitWidth = false; S.pdf.scale = Math.min(4, S.pdf.scale + 0.25); renderAllPages(); };
  $('.pdf-zm-out').onclick = () => { if (!S.pdf) return; S.pdf.fitWidth = false; S.pdf.scale = Math.max(0.3, S.pdf.scale - 0.25); renderAllPages(); };
  $('.pdf-fit').onclick = () => { if (!S.pdf) return; S.pdf.fitWidth = true; renderAllPages(); };
  $('#pdfBody').addEventListener('scroll', updatePdfControls);
}

// ================================================================
// Audit Comparison View
// ================================================================

// Normalize new audit format (luke-auditor) to match old key structure
function normalizeAudit(raw) {
  if (!raw) return null;
  // Already in old format (has quality_score)
  if ('quality_score' in raw) return raw;
  // New format: { verdict, findings, critical_count, major_count, minor_count, metadata }
  const totalDefects = (raw.critical_count || 0) + (raw.major_count || 0) + (raw.minor_count || 0);
  const findings = raw.findings || [];
  return {
    quality_grade: raw.verdict,
    routing_label: raw.verdict,
    total_defects: totalDefects,
    total_critical: raw.critical_count ?? 0,
    total_major: raw.major_count ?? 0,
    total_minor: raw.minor_count ?? 0,
    concerns: findings.map(f => f.description + (f.severity ? ' [' + f.severity + ']' : '')),
    action_items: findings.filter(f => f.severity === 'critical' || f.severity === 'major').map(f => f.description),
    reasoning: raw.skip_reason || null,
    _raw: raw,
  };
}

// ================================================================
// Inline Audit Panel Renderers
// ================================================================
function renderAuditInline(container, audit, isNew) {
  container.replaceChildren();
  if (!audit) {
    container.appendChild(el('div', { className: 'audit-empty' }, 'No audit data'));
    return;
  }

  // Routing
  const routingSec = el('div', { className: 'audit-inline-section' });
  const routingHdr = document.createElement('div');
  routingHdr.className = 'audit-inline-hdr';
  routingHdr.insertAdjacentHTML('beforeend', iconChart());
  routingHdr.appendChild(document.createTextNode(' Routing'));
  routingSec.appendChild(routingHdr);
  const routingVal = audit.routing_label || audit.routing || audit.quality_grade || 'N/A';
  routingSec.appendChild(routingBadge(routingVal));
  container.appendChild(routingSec);

  // Defects
  const defSec = el('div', { className: 'audit-inline-section' });
  const defHdr = document.createElement('div');
  defHdr.className = 'audit-inline-hdr';
  defHdr.insertAdjacentHTML('beforeend', iconAlert());
  defHdr.appendChild(document.createTextNode(' Defects'));
  defSec.appendChild(defHdr);
  const defRow = el('div', { className: 'audit-defects' });
  const total = audit.total_defects ?? ((audit.total_critical || 0) + (audit.total_major || 0) + (audit.total_minor || 0));
  const crit = audit.total_critical ?? 0;
  const major = audit.total_major ?? 0;
  const minor = audit.total_minor ?? 0;
  defRow.appendChild(buildDefectBadge('Total', total, ''));
  defRow.appendChild(buildDefectBadge('Critical', crit, 'crit'));
  defRow.appendChild(buildDefectBadge('Major', major, 'major'));
  defRow.appendChild(buildDefectBadge('Minor', minor, 'minor'));
  defSec.appendChild(defRow);
  container.appendChild(defSec);

  // Findings
  const findings = audit._raw?.findings || audit.concerns || [];
  if (findings.length > 0) {
    const findSec = el('div', { className: 'audit-inline-section' });
    const findHdr = document.createElement('div');
    findHdr.className = 'audit-inline-hdr';
    findHdr.insertAdjacentHTML('beforeend', iconFlag());
    findHdr.appendChild(document.createTextNode(' Findings (' + findings.length + ')'));
    findSec.appendChild(findHdr);
    for (const f of findings) {
      const item = document.createElement('div');
      item.className = 'audit-finding';
      if (typeof f === 'string') {
        item.textContent = f;
      } else {
        const sev = el('span', { className: 'f-sev ' + (f.severity || '') }, '[' + (f.severity || '?') + ']');
        item.appendChild(sev);
        item.appendChild(document.createTextNode(' ' + (f.description || JSON.stringify(f))));
      }
      findSec.appendChild(item);
    }
    container.appendChild(findSec);
  }

  // JSON toggle
  container.appendChild(buildJsonToggle('Raw JSON', audit._raw || audit));
}

function buildDefectBadge(label, count, cls) {
  const d = el('span', { className: 'audit-defect' });
  d.appendChild(el('span', { className: 'd-count ' + cls }, String(count)));
  d.appendChild(document.createTextNode(label));
  return d;
}

function renderOldAuditPanel(data) {
  renderAuditInline($('#oldAuditPanel'), data.oldAudit, false);
}

function renderNewAuditPanel(data) {
  const newA = normalizeAudit(data.audits[S.activeProvider]);
  renderAuditInline($('#newAuditPanel'), newA, true);
}

// ── Card builder ──
function buildCard(title, iconHtml, contentNodes) {
  const card = document.createElement('div');
  card.className = 'audit-card';
  const hdr = document.createElement('div');
  hdr.className = 'audit-card-hdr';
  // Icon is trusted static SVG
  hdr.insertAdjacentHTML('beforeend', iconHtml);
  hdr.appendChild(document.createTextNode(title));
  card.appendChild(hdr);
  const body = document.createElement('div');
  body.className = 'audit-card-body';
  contentNodes.forEach(n => { if (n) body.appendChild(n); });
  card.appendChild(body);
  return card;
}

// ── Metric row builder ──
function buildMetricRow(label, oldVal, newVal, maxVal, direction) {
  const fmtVal = v => v === null || v === undefined ? '-' : (typeof v === 'number' ? (maxVal === 1 ? (v * 100).toFixed(0) + '%' : String(v)) : String(v));
  const oldStr = fmtVal(oldVal);
  const newStr = fmtVal(newVal);

  let barPctOld = 0, barPctNew = 0;
  if (maxVal && typeof oldVal === 'number') barPctOld = (oldVal / maxVal) * 100;
  if (maxVal && typeof newVal === 'number') barPctNew = (newVal / maxVal) * 100;

  let deltaStr = '', deltaClass = 'neu';
  if (typeof oldVal === 'number' && typeof newVal === 'number') {
    const raw = maxVal === 1 ? (newVal - oldVal) * 100 : newVal - oldVal;
    const sign = raw > 0 ? '+' : '';
    const suffix = maxVal === 1 ? '%' : '';
    deltaStr = raw === 0 ? '=' : sign + raw.toFixed(0) + suffix;
    if (direction === 'higher') deltaClass = raw > 0 ? 'pos' : raw < 0 ? 'neg' : 'neu';
    else if (direction === 'lower') deltaClass = raw < 0 ? 'pos' : raw > 0 ? 'neg' : 'neu';
  }

  const row = document.createElement('div');
  row.className = 'metric-row';

  // Label
  const labelEl = el('div', { className: 'metric-label' }, label);
  row.appendChild(labelEl);

  // Old value
  const oldDiv = document.createElement('div');
  oldDiv.className = 'metric-val';
  oldDiv.appendChild(el('span', { className: 'val' }, oldStr));
  if (maxVal) {
    const bar = document.createElement('div');
    bar.className = 'metric-bar';
    const fill = document.createElement('div');
    fill.className = 'metric-fill old';
    fill.style.width = Math.max(0, Math.min(100, barPctOld)) + '%';
    bar.appendChild(fill);
    oldDiv.appendChild(bar);
  }
  row.appendChild(oldDiv);

  // Arrow
  const arrow = document.createElement('div');
  arrow.className = 'metric-arrow';
  arrow.textContent = '\u2192';
  row.appendChild(arrow);

  // New value
  const newDiv = document.createElement('div');
  newDiv.className = 'metric-val';
  newDiv.appendChild(el('span', { className: 'val' }, newStr));
  if (maxVal) {
    const bar = document.createElement('div');
    bar.className = 'metric-bar';
    const fill = document.createElement('div');
    fill.className = 'metric-fill new';
    fill.style.width = Math.max(0, Math.min(100, barPctNew)) + '%';
    bar.appendChild(fill);
    newDiv.appendChild(bar);
  }
  row.appendChild(newDiv);

  // Delta
  const delta = el('div', { className: 'metric-delta ' + deltaClass }, deltaStr);
  row.appendChild(delta);

  return row;
}

// ── Text compare row builder ──
function buildTextRow(label, oldBadgeNode, newBadgeNode) {
  const row = document.createElement('div');
  row.className = 'text-row';
  row.appendChild(el('div', { className: 'tr-label' }, label));

  const oldCol = document.createElement('div');
  oldCol.className = 'tr-old';
  const oldHdr = el('div', { className: 'tr-hdr old-h' }, 'Old');
  oldCol.appendChild(oldHdr);
  oldCol.appendChild(oldBadgeNode);
  row.appendChild(oldCol);

  const newCol = document.createElement('div');
  newCol.className = 'tr-new';
  const newHdr = el('div', { className: 'tr-hdr new-h' }, 'New');
  newCol.appendChild(newHdr);
  newCol.appendChild(newBadgeNode);
  row.appendChild(newCol);

  return row;
}

function gradeBadge(grade) {
  if (!grade) return el('span', { className: 'tr-badge neu' }, 'N/A');
  const g = String(grade).toLowerCase();
  const cls = g.includes('good') || g.includes('excellent') ? 'good' : g.includes('needs') || g.includes('review') ? 'warn' : g.includes('fail') || g.includes('poor') ? 'bad' : 'neu';
  return el('span', { className: 'tr-badge ' + cls }, String(grade));
}

function routingBadge(routing) {
  if (!routing) return el('span', { className: 'tr-badge neu' }, 'N/A');
  const r = String(routing).toLowerCase();
  const cls = r.includes('auto') && r.includes('approve') ? 'good' : r.includes('manual') || r.includes('review') ? 'warn' : r.includes('reject') || r.includes('fail') ? 'bad' : 'neu';
  return el('span', { className: 'tr-badge ' + cls }, String(routing));
}

// ── List compare builder ──
function buildListCompareNode(oldItems, newItems, isText) {
  const wrap = document.createElement('div');
  wrap.className = 'list-compare';

  const buildCol = (items, hdrClass, hdrLabel) => {
    const col = document.createElement('div');
    col.className = 'list-col';
    col.appendChild(el('div', { className: 'lc-hdr ' + hdrClass }, hdrLabel));
    if (!items || items.length === 0 || (items.length === 1 && !items[0])) {
      col.appendChild(el('div', { className: 'empty-list' }, 'None'));
    } else if (isText) {
      items.forEach(item => {
        if (item) col.appendChild(el('div', { className: 'tr-text' }, String(item)));
      });
    } else {
      const ul = document.createElement('ul');
      items.forEach(item => {
        const text = typeof item === 'string' ? item : (item?.description || item?.message || item?.text || JSON.stringify(item));
        ul.appendChild(el('li', null, text));
      });
      col.appendChild(ul);
    }
    return col;
  };

  wrap.appendChild(buildCol(oldItems, 'old-h', 'Old (' + (oldItems?.filter(Boolean).length || 0) + ')'));
  wrap.appendChild(buildCol(newItems, 'new-h', 'New (' + (newItems?.filter(Boolean).length || 0) + ')'));
  return wrap;
}

// ── JSON toggle builder ──
function buildJsonToggle(label, jsonData) {
  const wrap = document.createElement('div');
  const btn = document.createElement('button');
  btn.className = 'json-toggle-btn';
  btn.insertAdjacentHTML('beforeend', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>');
  btn.appendChild(document.createTextNode(' ' + label));
  wrap.appendChild(btn);

  const block = document.createElement('div');
  block.className = 'json-block';
  const pre = document.createElement('pre');
  pre.textContent = jsonData ? JSON.stringify(jsonData, null, 2) : 'N/A';
  block.appendChild(pre);
  wrap.appendChild(block);

  btn.addEventListener('click', () => block.classList.toggle('open'));
  return wrap;
}

// ── Value accessor ──
function getVal(obj, key) {
  return obj != null && obj[key] !== undefined ? obj[key] : null;
}

// ── SVG icon strings (trusted static content) ──
function iconChart() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>'; }
function iconTarget() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'; }
function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
function iconShield() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'; }
function iconInfo() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'; }
function iconFlag() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>'; }
function iconClipboard() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>'; }

// ================================================================
// Resize Handles
// ================================================================
function initResize() {
  const sidebar = $('#sidebar');
  const sHandle = $('#sidebarHandle');
  drag(sHandle, 'col', (dx) => {
    sidebar.style.width = Math.min(400, Math.max(160, sidebar.getBoundingClientRect().width + dx)) + 'px';
  });

  $$('.col-handle').forEach(handle => {
    const leftEl = document.getElementById(handle.dataset.left);
    const rightEl = document.getElementById(handle.dataset.right);
    drag(handle, 'col', (dx) => {
      const lw = leftEl.getBoundingClientRect().width;
      const rw = rightEl.getBoundingClientRect().width;
      const newL = Math.max(100, lw + dx);
      const newR = Math.max(100, rw - dx);
      const total = newL + newR;
      const curFlex = (parseFloat(getComputedStyle(leftEl).flexGrow) || 1) + (parseFloat(getComputedStyle(rightEl).flexGrow) || 1);
      leftEl.style.flex = (newL / total) * curFlex + ' 0 0';
      rightEl.style.flex = (newR / total) * curFlex + ' 0 0';
    });
  });
}

function drag(handle, type, onDelta) {
  let lastX = 0;
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    handle.classList.add('active');
    lastX = e.clientX;
    const lock = () => $$('iframe').forEach(f => f.style.pointerEvents = 'none');
    const unlock = () => $$('iframe').forEach(f => f.style.pointerEvents = '');
    lock();
    const onMove = e => {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      onDelta(dx);
    };
    const onUp = () => {
      handle.classList.remove('active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      unlock();
      if (S.pdf?.fitWidth) setTimeout(renderAllPages, 50);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
}

// ================================================================
// Horizontal Resize (audit panels)
// ================================================================
function initAuditResize() {
  setupHResize($('#oldAuditHandle'), $('#oldHtmlBody'), $('#oldAuditPanel'));
  setupHResize($('#newAuditHandle'), $('#newHtmlBody'), $('#newAuditPanel').parentElement);
}

function setupHResize(handle, topEl, bottomEl) {
  let lastY = 0;
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    handle.classList.add('active');
    lastY = e.clientY;
    $$('iframe').forEach(f => f.style.pointerEvents = 'none');
    const onMove = e => {
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      const topH = topEl.getBoundingClientRect().height;
      const botH = bottomEl.getBoundingClientRect().height;
      const newTop = Math.max(60, topH + dy);
      const newBot = Math.max(60, botH - dy);
      topEl.style.flex = '0 0 ' + newTop + 'px';
      bottomEl.style.height = newBot + 'px';
    };
    const onUp = () => {
      handle.classList.remove('active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      $$('iframe').forEach(f => f.style.pointerEvents = '');
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  });
}

// ================================================================
// Utilities
// ================================================================
function showContentLoading(show) {
  $('#contentLoading').classList.toggle('active', show);
}

// ================================================================
// Event Listeners
// ================================================================
$('#sidebarSearch').addEventListener('input', renderSidebar);
$$('.ptab').forEach(t => t.addEventListener('click', () => switchProvider(t.dataset.provider)));
$('#oldHtmlToggle').addEventListener('click', () => toggleHtmlRaw('oldHtmlBody', $('#oldHtmlToggle')));
$('#newHtmlToggle').addEventListener('click', () => toggleHtmlRaw('newHtmlBody', $('#newHtmlToggle')));

// ================================================================
// Init
// ================================================================
initPdfControls();
initResize();
initAuditResize();
loadRepo();
