// content.js — AI rewrite menu with reading scan + typewriter animation

let menuEl      = null;
let scanEl      = null;
let currentTarget = null;
let savedRange  = null;
let selectionRect = null; // bounding rect of the selection (page coords)

const ACTIONS = [
  { id: "grammar", icon: "✦",  label: "Fix Grammar" },
  { id: "polite",  icon: "🤝", label: "Make Polite" },
  { id: "clear",   icon: "💡", label: "Make Clear"  },
  { id: "formal",  icon: "👔", label: "Make Formal" },
  { id: "casual",  icon: "😊", label: "Make Casual" },
  { id: "shorter", icon: "✂️", label: "Shorten"     },
];

// ── Scan overlay ────────────────────────────────────────────────────────────

function createScan() {
  const el = document.createElement("div");
  el.id = "gf-scan";
  el.classList.add("gf-scan-hidden");
  const bar = document.createElement("div");
  bar.className = "gf-scan-bar";
  el.appendChild(bar);
  document.body.appendChild(el);
  return el;
}

function getScan() {
  if (!scanEl || !document.body.contains(scanEl)) scanEl = createScan();
  return scanEl;
}

function showScan(rect) {
  const el = getScan();
  el.style.left   = `${rect.left + window.scrollX}px`;
  el.style.top    = `${rect.top  + window.scrollY}px`;
  el.style.width  = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
  el.classList.remove("gf-scan-hidden");
  // Force reflow so animation restarts cleanly
  void el.offsetWidth;
  el.querySelector(".gf-scan-bar").style.animation = "none";
  void el.offsetWidth;
  el.querySelector(".gf-scan-bar").style.animation = "";
}

function hideScan() {
  getScan().classList.add("gf-scan-hidden");
}

// ── Menu DOM ────────────────────────────────────────────────────────────────

function createMenu() {
  const wrap = document.createElement("div");
  wrap.id = "gf-menu";
  wrap.classList.add("gf-hidden");

  const lbl = document.createElement("div");
  lbl.className = "gf-menu-label";
  lbl.textContent = "Rewrite with AI ✦";
  wrap.appendChild(lbl);

  const grid = document.createElement("div");
  grid.className = "gf-grid";
  ACTIONS.forEach(action => {
    const btn = document.createElement("button");
    btn.className = "gf-chip";
    btn.dataset.id = action.id;
    btn.innerHTML = `<span class="gf-chip-icon">${action.icon}</span><span class="gf-chip-label">${action.label}</span>`;
    btn.addEventListener("mousedown", e => { e.preventDefault(); e.stopPropagation(); runAction(action); });
    grid.appendChild(btn);
  });
  wrap.appendChild(grid);

  const status = document.createElement("div");
  status.className = "gf-status";
  status.id = "gf-status";
  wrap.appendChild(status);

  document.body.appendChild(wrap);
  return wrap;
}

function getMenu() {
  if (!menuEl || !document.body.contains(menuEl)) menuEl = createMenu();
  return menuEl;
}

function showMenu(x, y) {
  const m = getMenu();
  m.style.left = `${x}px`;
  m.style.top  = `${y}px`;
  m.classList.remove("gf-hidden");
  resetStatus();
  enableChips();
}

function hideMenu() { getMenu().classList.add("gf-hidden"); }

function resetStatus() {
  const s = document.getElementById("gf-status");
  if (s) { s.textContent = ""; s.className = "gf-status"; }
}

function setStatus(text, type = "") {
  const s = document.getElementById("gf-status");
  if (s) { s.textContent = text; s.className = `gf-status ${type}`; }
}

function disableChips() { document.querySelectorAll(".gf-chip").forEach(b => b.disabled = true); }
function enableChips()  { document.querySelectorAll(".gf-chip").forEach(b => b.disabled = false); }

// ── Selection detection ─────────────────────────────────────────────────────

document.addEventListener("mouseup", e => {
  if (e.target.closest("#gf-menu")) return;

  setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length < 2) {
      if (!e.target.closest("#gf-menu")) hideMenu();
      return;
    }

    const editable = getEditableParent(sel.anchorNode);
    if (!editable) { hideMenu(); return; }

    currentTarget = editable;
    savedRange    = sel.getRangeAt(0).cloneRange();

    const rect    = sel.getRangeAt(0).getBoundingClientRect();
    selectionRect = rect; // save for scan overlay

    const menuWidth = 264;
    let mx = rect.left + window.scrollX + rect.width / 2 - menuWidth / 2;
    mx = Math.max(8 + window.scrollX, Math.min(mx, window.innerWidth + window.scrollX - menuWidth - 8));
    const my = rect.top + window.scrollY - 8;

    showMenu(mx, my);
  }, 10);
});

document.addEventListener("mousedown", e => {
  if (e.target.closest("#gf-menu")) return;
  hideMenu();
});

// ── Core action ─────────────────────────────────────────────────────────────

async function runAction(action) {
  const sel = window.getSelection();
  const selectedText = (sel && !sel.isCollapsed)
    ? sel.toString()
    : (savedRange ? savedRange.toString() : "");

  if (!selectedText.trim()) { hideMenu(); return; }

  disableChips();
  setStatus(`${action.icon} Reading…`, "loading");

  // 1 ── Show scan animation over the selected text
  if (selectionRect) showScan(selectionRect);

  // 2 ── Fire the API call while scan is running
  const responsePromise = new Promise(resolve =>
    chrome.runtime.sendMessage({ action: "rewriteText", mode: action.id, text: selectedText }, resolve)
  );

  // Let the scan run for at least 900 ms so it feels intentional
  const [response] = await Promise.all([
    responsePromise,
    delay(900)
  ]);

  hideScan();

  if (response.error) {
    if (response.error === "NO_API_KEY") {
      setStatus("⚙ No API key — click the extension icon to add one.", "error");
    } else {
      setStatus("⚠ " + response.error, "error");
    }
    enableChips();
    return;
  }

  // 3 ── Typewriter replacement
  setStatus("✍ Writing…", "loading");
  await typewriterReplace(savedRange, response.result, currentTarget);

  setStatus("✓ Done!", "success");
  setTimeout(hideMenu, 1200);
}

// ── Typewriter replacement ──────────────────────────────────────────────────

const CHAR_DELAY = 18; // ms per character — tweak for speed

async function typewriterReplace(range, newText, target) {
  if (!range) return;

  if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
    // ── Textarea / input ──
    const start = target.selectionStart;
    const end   = target.selectionEnd;
    const before = target.value.slice(0, start);
    const after  = target.value.slice(end);

    // Clear the selection immediately
    target.value = before + after;
    target.selectionStart = start;
    target.selectionEnd   = start;

    // Type character by character
    for (let i = 0; i < newText.length; i++) {
      await delay(CHAR_DELAY);
      const pos = start + i;
      target.value = target.value.slice(0, pos) + newText[i] + target.value.slice(pos);
      target.selectionStart = pos + 1;
      target.selectionEnd   = pos + 1;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    target.dispatchEvent(new Event("change", { bubbles: true }));

  } else {
    // ── ContentEditable ──
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    range.deleteContents();

    // Insert an empty text node as our cursor anchor
    const textNode = document.createTextNode("");
    range.insertNode(textNode);

    // Type into it
    for (let i = 0; i < newText.length; i++) {
      await delay(CHAR_DELAY);
      textNode.textContent += newText[i];
      // Keep cursor at the end
      const r = document.createRange();
      r.setStartAfter(textNode);
      r.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    if (target) target.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function getEditableParent(node) {
  let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== document.body) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable) return el;
    el = el.parentElement;
  }
  return null;
}
