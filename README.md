# AI-vault
Secure your AI chats. A browser extension adding encrypted locks and hidden folders to ChatGPT, Claude, and Gemini.
# 🛡️ AI Vault

A privacy-first Chrome extension that provides local, encrypted locks for your ChatGPT, Gemini, and Claude conversations. 

With AI becoming our daily journal, research assistant, and coding partner, keeping those conversations private is critical. AI Vault lets you lock or completely hide specific chats, storing all security keys locally on your machine using SHA-256 cryptography.

---

## ✨ Features

* Cross-Platform Support: Works seamlessly across ChatGPT, Google Gemini, and Claude.
* In-Page PIN Pad: Unlock chats directly within the AI interface—no clunky popup menus.
* Stealth Mode: Completely hide sensitive chats from your sidebar into a WhatsApp-style Hidden Vault.
* Zero-Knowledge Architecture: 100% of your data stays in local storage. No external servers, no tracking, and no analytics.
* Cryptographic Security: Your PIN is hashed using the native Web Crypto API (SHA-256) before it ever touches your hard drive.

---

## 🚀 How to Install (Developer Mode)

Since this extension is completely open-source and respects your privacy, it is not hosted on the Chrome Web Store. You can install it locally in under a minute:

1. Download this repository as a .zip file and extract it to a folder on your computer.
2. Open Google Chrome and navigate to chrome://extensions/ in the address bar.
3. Turn on Developer mode using the toggle switch in the top right corner.
4. Click the Load unpacked button in the top left corner.
5. Select the folder containing your extracted extension files.

---

## 🔑 Initial Setup & PIN Activation

Once the extension is installed, you must activate your Master PIN before securing any conversations:

1. Click the Extension Puzzle Piece icon in your Chrome toolbar (top right).
2. Pin AI Vault to your toolbar for easy access if desired, then click its icon to open the configuration popup.
3. Enter a 4-digit numeric passcode to establish your Master PIN. 
4. Click Save. Your PIN is immediately encrypted into an unreadable SHA-256 hash string and safely stored on your device.
5. Open or refresh your ChatGPT, Gemini, or Claude tabs to initialize the security elements.

---

## 📖 User Instructions: How It Works

Once configured, the extension seamlessly embeds security controls directly onto your favorite AI dashboards.

### Securing a Chat
Hover your mouse over any conversation item in your sidebar. Two icons will appear: a lock icon and an eye icon.

### Using the Lock Feature
* To Lock: Click the open lock icon next to a chat. It will instantly switch to a closed lock icon, and that specific conversation layout is now protected.
* Accessing a Locked Chat: If you click on a locked chat from your sidebar, or if you refresh the page while viewing one, the main chat screen will blur out smoothly and present an in-page PIN pad overlay. 
* To Unlock: Type your 4-digit passcode into the overlay and press Enter or click Submit. The conversation will immediately clear up. 
* Sidebar Freedom: Unlike traditional app blockers, you are never trapped. If you do not want to unlock that specific chat, you can simply click on any other public chat in your sidebar to move away, and the PIN pad will dismiss itself.
* Re-locking: Clicking an already locked chat icon to revert it back to an unlocked state will challenge you for your PIN one more time to prevent unauthorized changes.

### Using the Hide (Stealth) Feature
* To Hide: Click the eye icon next to any chat. The conversation will instantly slide out of view and disappear from your main sidebar.
* Accessing the Vault Folder: A clean folder item labeled Hidden Vault will sit at the very top of your sidebar. 
* Opening the Vault: Click the Hidden Vault folder. You will be prompted to verify your Master PIN. Once authenticated, your hidden chats will reveal themselves inside the sidebar with a distinct safety indicator border.
* Closing the Vault: Click the folder item again to instantly collapse and hide your stealth chats from plain sight.

---

## ⌨️ Keyboard Shortcuts

* Alt + L : Instantly lock the current active chat session.
* Alt + H : Toggle the visibility of your Hidden Vault folder.
