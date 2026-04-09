# 📝 ClearWrite

A lightning-fast browser extension that polishes your writing in seconds. Select any text, choose your style, and let Groq's high-performance LLM inference handle the rest.

---

## 🚀 Features

* **Instant Correction:** Uses Groq’s LPU™ Inference Engine for near-instantaneous results.
* **Dynamic Formatting:** Choose between different tones or styles before applying changes.
* **Seamless Integration:** Directly replaces selected text with the polished version.
* **Privacy-Focused:** Only processes the text you explicitly select.

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/groq-grammar-extension.git
cd groq-grammar-extension
```

### 2. Configure your API Key
1. Get your API key from the [Groq Console](https://console.groq.com/).
2. Open your configuration file and add your key:
   ```javascript
   const GROQ_API_KEY = 'your_key_here';
   ```

### 3. Load into Browser
1. Open Chrome/Edge and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked** and select the extension folder.

---

## 📖 How to Use

1.  **Highlight** any text you’ve written in your browser.
2.  **Select the proper option** for formatting (e.g., Professional, Casual, or Concise) from the extension menu.
3.  **Review** the corrected text as it is automatically inserted back into your text field.

---

## ⚙️ Tech Stack

* **LLM Inference:** [Groq Cloud](https://groq.com/)
* **Model:** `llama-3.1-8b-instant` (Optimized for speed)
* **Frontend:** HTML5, CSS3, JavaScript (Manifest V3)

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and create. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ⚡ by Vijay A**