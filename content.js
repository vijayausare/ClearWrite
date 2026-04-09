// content.js - Shows an AI rewrite menu when text is selected in editable fields

let menuEl = null;
let currentTarget = null;
let savedRange = null;

const ACTIONS = [
  { id: "grammar",  icon: "✦",  label: "Fix Grammar"  },
  { id: "polite",   icon: "🤝", label: "Make Polite"  },
  { id: "clear",    icon: "💡", label: "Make Clear"   },
  { id: "formal",   icon: "👔", label: "Make Formal"  },
  { id: "casual",   icon: "😊", label: "Make Casual"  },
  { id: "shorter",  icon: "✂️", label: "Shorten"      },
];

// ── Build menu DOM ──────────────────────────────────────────────────────────

function createMenu() {
  const wrap = document.createElement("div");
  wrap.id = "gf-menu";
  wrap.classList.add("gf-hidden");

  const label = document.createElement("div");
  label.className = "gf-menu-label";
  label.textContent = "Rewrite with AI ✦";
  wrap.appendChild(label);

  const grid = document.createElement("div");
  grid.className = "gf-grid";

  ACTIONS.forEach(action => {
    const btn = document.createElement("button");
    btn.className = "gf-chip";
    btn.dataset.id = action.id;
    btn.innerHTML = `<span class="gf-chip-icon">${action.icon}</span><span class="gf-chip-label">${action.label}</span>`;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      runAction(action);
    });
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
  if (!menuEl || !document.body.contains(menuEl)) {
    menuEl = createMenu();
  }
  return menuEl;
}

function showMenu(x, y) {
  const menu = getMenu();
  menu.style.left = `${x}px`;
  menu.style.top  = `${y}px`;
  menu.classList.remove("gf-hidden");
  resetStatus();
  enableChips();
}

function hideMenu() {
  getMenu().classList.add("gf-hidden");
}

function resetStatus() {
  const s = document.getElementById("gf-status");
  if (s) { s.textContent = ""; s.className = "gf-status"; }
}

function setStatus(text, type = "") {
  const s = document.getElementById("gf-status");
  if (s) { s.textContent = text; s.className = `gf-status ${type}`; }
}

function disableChips() {
  document.querySelectorAll(".gf-chip").forEach(b => { b.disabled = true; });
}

function enableChips() {
  document.querySelectorAll(".gf-chip").forEach(b => { b.disabled = false; });
}

// ── Selection detection ─────────────────────────────────────────────────────

document.addEventListener("mouseup", (e) => {
  if (e.target.closest("#gf-menu")) return;

  setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length < 2) {
      if (!e.target.closest("#gf-menu")) hideMenu();
      return;
    }

    const anchor = sel.anchorNode;
    const editable = getEditableParent(anchor);
    if (!editable) { hideMenu(); return; }

    currentTarget = editable;
    savedRange = sel.getRangeAt(0).cloneRange();

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const menuWidth = 264;
    let mx = rect.left + scrollX + (rect.width / 2) - (menuWidth / 2);
    mx = Math.max(8 + scrollX, Math.min(mx, window.innerWidth + scrollX - menuWidth - 8));
    const my = rect.top + scrollY - 8;

    showMenu(mx, my);
  }, 10);
});

document.addEventListener("mousedown", (e) => {
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
  setStatus(`${action.icon} ${action.label}…`, "loading");

  const response = await new Promise(resolve =>
    chrome.runtime.sendMessage(
      { action: "rewriteText", mode: action.id, text: selectedText },
      resolve
    )
  );

  if (response.error) {
    if (response.error === "NO_API_KEY") {
      setStatus("⚙ No API key — click the extension icon to add one.", "error");
    } else {
      setStatus("⚠ " + response.error, "error");
    }
    enableChips();
    return;
  }

  replaceSelection(savedRange, response.result, currentTarget);
  setStatus("✓ Done!", "success");
  setTimeout(hideMenu, 1200);
}

// ── Text replacement ─────────────────────────────────────────────────────────

function getEditableParent(node) {
  let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== document.body) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable) return el;
    el = el.parentElement;
  }
  return null;
}

function replaceSelection(range, newText, target) {
  if (!range) return;

  if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
    const start = target.selectionStart;
    const end   = target.selectionEnd;
    target.value = target.value.slice(0, start) + newText + target.value.slice(end);
    target.selectionStart = start + newText.length;
    target.selectionEnd   = start + newText.length;
    target.dispatchEvent(new Event("input",  { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    range.deleteContents();
    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    if (target) target.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
}
