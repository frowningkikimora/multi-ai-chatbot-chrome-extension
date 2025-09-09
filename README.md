# Multi AI Chatbot Chrome Extension

A lightweight and modern Chrome extension that lets you chat with multiple AI providers from a single popup.  
Supports **OpenAI**, **Google Gemini**, **OpenRouter**, and **Groq** API Keys.

---

## ✨ Features
- 🔀 Switch easily between multiple AI providers.
- 🔑 Manage API keys securely through the extension’s Options page.
- 💬 Clean, minimal popup interface with auto-resizing input.
- 🚀 Supports system, user, and assistant roles with chat history.
- 🛑 Abort/stop requests with a single click or the Escape key.
- 🌐 No secrets stored in code — your API keys remain local in Chrome storage.

---

## 📦 Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle at top right).
4. Click **Load unpacked** and select this project folder.
5. The extension icon should now appear in your Chrome toolbar.

---

## ⚙️ Setup
1. Right-click the extension icon → **Options**.
2. Choose your **provider** (OpenAI, Gemini, OpenRouter, or Groq).
3. Enter your **API key** and **model name** for the selected provider.
4. Save your settings.  
   - Keys are stored in `chrome.storage.sync` by default (can sync across devices if Chrome sync is enabled).
   - No keys are hardcoded in the repo.

---

## 🖥️ Usage
1. Click the extension icon to open the chatbot popup.
2. Type your message and press **Enter** (or use the **Send** button).
3. The assistant response will appear in a clean conversation view.
4. Press **Esc** or the **Stop** button to cancel a request mid-way.

---

## 🔒 Security Notes
- API keys are **never bundled** in the source code.
- All keys are entered manually by you and stored locally in Chrome storage.
- If you demo or share your extension, use the **Clear All** button in Options to remove keys.

---

## 📜 License
This project is licensed under the GNU GPL 3.0 License.  
Feel free to fork, modify, and share.

---

## 🙌 Contributing
Pull requests and improvements are welcome!  
If you find a bug or want to suggest a feature, open an issue on GitHub.
