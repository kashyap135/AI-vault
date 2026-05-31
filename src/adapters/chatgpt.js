class ChatGPTAdapter {
    platformName = "ChatGPT";

    getChatElements() {
        return document.querySelectorAll('a[href*="/c/"]');
    }

    getChatId(element) {
        return element.getAttribute('href'); 
    }

    // NEW: Find the exact wrapper to hide so we don't leave blank gaps in the list
    getChatWrapper(element) {
        return element.closest('li') || element.parentElement;
    }

    getMainChatWindow() {
        return document.querySelector('main');
    }
    
    getSidebarTarget() { 
        // BULLETPROOFING: A descending list of stable containers in ChatGPT's UI
        return document.querySelector('nav[aria-label="Chat history"]') 
            || document.querySelector('.flex-col.flex-1.transition-opacity')
            || document.querySelector('div > nav'); 
    }

    injectLockUI(element, isLocked, isHidden, toggleLockCallback, toggleHideCallback) {
        if (element.querySelector('.ai-vault-btn-container')) return;
        
        element.classList.add('ai-vault-relative-parent');
        element.style.setProperty('--ai-vault-bg', window.getComputedStyle(element).backgroundColor || '#202123');
        
        const container = document.createElement('div');
        container.className = 'ai-vault-btn-container';
        
        const lockBtn = document.createElement('div'); 
        lockBtn.className = 'ai-vault-btn';
        lockBtn.innerText = isLocked ? '🔒' : '🔓';
        lockBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleLockCallback(lockBtn); });
        
        const hideBtn = document.createElement('div'); 
        hideBtn.className = 'ai-vault-btn';
        hideBtn.innerText = isHidden ? '🙈' : '👁️';
        hideBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleHideCallback(hideBtn); });
        
        container.appendChild(lockBtn); 
        container.appendChild(hideBtn); 
        element.appendChild(container);
    }
}