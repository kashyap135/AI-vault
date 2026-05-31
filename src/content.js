let adapter;
const hostname = window.location.hostname;

if (hostname.includes("chatgpt.com")) adapter = new ChatGPTAdapter();
else if (hostname.includes("gemini.google.com")) adapter = new GeminiAdapter();
else if (hostname.includes("claude.ai")) adapter = new ClaudeAdapter();

let lockedChatsList = [];
let hiddenChatsList = [];
let isVaultFolderOpen = false;
let isSessionUnlocked = false;

// --- SECURITY HELPERS ---
async function hashSecure(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
const obscureUrl = (url) => btoa(encodeURIComponent(url));

if (adapter) {
    chrome.storage.local.get(["lockedChats", "hiddenChats"], (result) => {
        if (result.lockedChats) lockedChatsList = result.lockedChats;
        if (result.hiddenChats) hiddenChatsList = result.hiddenChats;
        runVault();
    });
}

function runVault() {
    if (!adapter) return;
    injectVaultFolderUI();

    const chats = adapter.getChatElements();
    chats.forEach(chatNode => {
        const rawChatId = adapter.getChatId(chatNode);
        if (!rawChatId) return;

        const chatId = obscureUrl(rawChatId); 
        const wrapper = typeof adapter.getChatWrapper === 'function' ? adapter.getChatWrapper(chatNode) : chatNode;
        const isLocked = lockedChatsList.includes(chatId);
        const isHidden = hiddenChatsList.includes(chatId);

        wrapper.classList.remove('ai-vault-hidden-chat', 'ai-vault-revealed-stealth');

        if (isHidden) {
            if (isVaultFolderOpen) wrapper.classList.add('ai-vault-revealed-stealth');
            else { wrapper.classList.add('ai-vault-hidden-chat'); return; }
        }

        adapter.injectLockUI(chatNode, isLocked, isHidden, 
            // LOCK BUTTON CLICK LOGIC
            (lockBtn) => {
                if (lockedChatsList.includes(chatId)) {
                    // It's locked. Prompt for PIN before unlocking!
                    createInPageAuthOverlay("Action", () => {
                        lockedChatsList = lockedChatsList.filter(id => id !== chatId);
                        lockBtn.innerText = '🔓';
                        chrome.storage.local.set({ lockedChats: lockedChatsList });
                        enforcePrivacy();
                    });
                } else {
                    // It's unlocked. Lock it instantly (no PIN required to secure something)
                    lockedChatsList.push(chatId);
                    lockBtn.innerText = '🔒';
                    chrome.storage.local.set({ lockedChats: lockedChatsList });
                    enforcePrivacy();
                }
            },
            // HIDE BUTTON CLICK LOGIC
            (hideBtn) => {
                if (hiddenChatsList.includes(chatId)) {
                    // It's hidden. Prompt for PIN before unhiding!
                    createInPageAuthOverlay("Action", () => {
                        hiddenChatsList = hiddenChatsList.filter(id => id !== chatId);
                        hideBtn.innerText = '👁️';
                        chrome.storage.local.set({ hiddenChats: hiddenChatsList });
                        runVault(); 
                    });
                } else {
                    // It's visible. Hide it instantly.
                    hiddenChatsList.push(chatId);
                    hideBtn.innerText = '🙈';
                    chrome.storage.local.set({ hiddenChats: hiddenChatsList });
                    runVault(); 
                }
            }
        );
    });
    enforcePrivacy();
}

function injectVaultFolderUI() {
    if (document.getElementById('ai-vault-folder-btn')) return;
    const sidebar = adapter.getSidebarTarget();
    if (!sidebar) return;

    const folderItem = document.createElement('div');
    folderItem.id = 'ai-vault-folder-btn';
    folderItem.className = 'ai-vault-folder-item';
    folderItem.innerText = isVaultFolderOpen ? '📂 Close Hidden Vault' : '📁 Hidden Vault';

    folderItem.addEventListener('click', () => {
        if (isVaultFolderOpen) { isVaultFolderOpen = false; runVault(); } 
        else { createInPageAuthOverlay("Folder"); } // No callback needed, handled internally
    });
    sidebar.prepend(folderItem);
}

function enforcePrivacy() {
    const currentPath = obscureUrl(window.location.pathname);
    const mainWindow = adapter.getMainChatWindow();
    if (!mainWindow) return;

    if (lockedChatsList.includes(currentPath) && !isSessionUnlocked) {
        mainWindow.classList.add('ai-main-chat-locked');
        if (!document.getElementById('ai-vault-overlay')) createInPageAuthOverlay("Chat");
    } else {
        mainWindow.classList.remove('ai-main-chat-locked');
        const overlay = document.getElementById('ai-vault-overlay');
        
        // THE FIX: Only auto-delete the overlay if it is specifically the "Chat" blocker.
        // This protects your "Action" (Unlock/Unhide) and "Folder" overlays from disappearing!
        if (overlay && overlay.getAttribute('data-target-type') === 'Chat') {
            overlay.remove();
        }
        
        if (!lockedChatsList.includes(currentPath)) isSessionUnlocked = false;
    }
}

// UPGRADED: Now accepts a callback function to run on success!
function createInPageAuthOverlay(targetType, onSuccessCallback = null) {
    if (document.getElementById('ai-vault-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'ai-vault-overlay';
    overlay.className = 'ai-lock-overlay';
    overlay.setAttribute('data-target-type', targetType);
    
    overlay.innerHTML = `
        <div class="ai-lock-box">
            <h3>🔒 Verify PIN to Unlock ${targetType}</h3>
            <input type="password" id="vault-page-pin" maxlength="4" placeholder="****" autofocus>
            <div style="display: flex; gap: 10px;">
                <button id="vault-page-btn">Submit</button>
                <button id="vault-cancel-btn" style="background: #444;">Cancel</button>
            </div>
            <div id="vault-page-error" class="ai-lock-error"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const pinInput = document.getElementById('vault-page-pin');
    const unlockBtn = document.getElementById('vault-page-btn');
    const errorDiv = document.getElementById('vault-page-error');
    const cancelBtn = document.getElementById('vault-cancel-btn');

    pinInput.focus();
    if (cancelBtn) cancelBtn.addEventListener('click', () => overlay.remove());

    async function handleUnlockAttempt() {
        const platformKey = `${adapter.platformName.toLowerCase()}Pin`;
        
        chrome.storage.local.get(["vaultPin", platformKey], async (result) => {
            const correctHash = result[platformKey] || result.vaultPin;
            const inputHash = await hashSecure(pinInput.value); 

            if (!correctHash) {
                errorDiv.innerText = "Please configure a Master PIN first.";
            } else if (inputHash === correctHash) {
                overlay.remove();
                
                // If a callback was provided (like flipping a lock toggle), run it!
                if (onSuccessCallback) {
                    onSuccessCallback();
                } 
                // Otherwise, handle the default screen/folder unlocks
                else {
                    if (targetType === "Folder") { isVaultFolderOpen = true; runVault(); } 
                    else { isSessionUnlocked = true; enforcePrivacy(); }
                }
            } else {
                errorDiv.innerText = "Incorrect PIN.";
                pinInput.value = ""; pinInput.focus();
            }
        });
    }

    unlockBtn.addEventListener('click', handleUnlockAttempt);
    pinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleUnlockAttempt(); });
}

// --- KEYBOARD SHORTCUTS ---
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'h') {
        const vaultBtn = document.getElementById('ai-vault-folder-btn');
        if (vaultBtn) vaultBtn.click();
    }
    if (e.altKey && e.key.toLowerCase() === 'l') {
        isSessionUnlocked = false;
        enforcePrivacy();
    }
});

let debounceTimeout;
const observer = new MutationObserver(() => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(runVault, 50);
});

if (adapter) observer.observe(document.body, { childList: true, subtree: true });