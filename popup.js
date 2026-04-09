// popup.js

const input   = document.getElementById("api-key");
const btnSave = document.getElementById("btn-save");
const status  = document.getElementById("status");
const toggleVis = document.getElementById("toggle-vis");

// Load saved key on open
chrome.storage.sync.get("groqApiKey", ({ groqApiKey }) => {
  if (groqApiKey) {
    input.value = groqApiKey;
  }
});

// Toggle visibility
toggleVis.addEventListener("click", () => {
  input.type = input.type === "password" ? "text" : "password";
  toggleVis.textContent = input.type === "password" ? "👁" : "🙈";
});

// Save key
btnSave.addEventListener("click", () => {
  const key = input.value.trim();

  if (!key) {
    showStatus("error", "Please enter your Groq API key.");
    return;
  }

  if (!key.startsWith("gsk_")) {
    showStatus("error", "Groq API keys start with gsk_ — double-check your key.");
    return;
  }

  chrome.storage.sync.set({ groqApiKey: key }, () => {
    showStatus("success", "✓ API key saved! Start selecting text to correct it.");
  });
});

function showStatus(type, message) {
  status.className = "status " + type;
  status.textContent = message;
  setTimeout(() => {
    status.className = "status";
  }, 4000);
}
