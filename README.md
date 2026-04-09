# 📝 ClearWrite

A lightning-fast Chrome extension that instantly upgrades your writing. Select any text, pick a style, and let the **Llama 3** model (via Groq) handle the rest.

---

## 🚀 Key Features

* **⚡ Real-Time Speed:** Optimized for instant text generation—no waiting for "thinking" icons.
* **🧠 6 Transformation Modes:** Beyond just grammar, it can change your entire tone or simplify your thoughts.
* **🖱️ On-Demand Processing:** Only runs when you click the "✦ Correct" button, keeping your browsing clean and saving API usage.
* **🔄 Auto-Replace:** Seamlessly updates your text directly in the text field you're using.

---

## 🛠️ Installation

1.  **Download:** Unzip the extension files into a folder.
2.  **Open Extensions:** Navigate to `chrome://extensions/` in Chrome.
3.  **Developer Mode:** Switch on **Developer mode** in the top-right corner.
4.  **Load:** Click **Load unpacked** and select your folder.
5.  **API Key:** Click the extension icon in your bar, paste your **Groq API Key**, and save.

---

## 📖 How to Use

1.  **Highlight** text in any input field (Gmail, Twitter, Discord, etc.).
2.  **Click the ✦ button** that floats above your selection.
3.  **Choose your mode** from the menu:

| Option | Effect |
| :--- | :--- |
| **✦ Fix Grammar** | Fixes typos, grammar, and punctuation. |
| **🤝 Make Polite** | Softens the tone for a friendlier message. |
| **💡 Make Clear** | Removes jargon and simplifies sentences. |
| **👔 Make Formal** | Polishes text for professional emails. |
| **😊 Make Casual** | Relaxes the tone for chats or social media. |
| **✂️ Shorten** | Gets straight to the point. |

4.  **Done!** The selection is replaced instantly with the new version.

---

## ⚙️ Technical Details

* **Backend:** [Groq Cloud API](https://groq.com/groqcloud)
* **Intelligence:** `llama-3.3-70b` (or your chosen model)
* **Environment:** Chrome Extension Manifest V3
* **Performance:** Focused on low-latency response and minimal background resource usage.

---

## 🔒 Privacy

This extension only sends text to the Groq API when you **explicitly click** a transformation button. It does not track your typing or store your data.

---

**Developed with ⚡ by Vijay A**