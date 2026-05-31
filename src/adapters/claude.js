class ClaudeAdapter {
    platformName = "Claude";
    getChatElements() { return document.querySelectorAll('a[href*="/chat/"]'); }
    getChatId(element) { return element.getAttribute('href'); }
    getChatWrapper(element) {
        return element.closest('gem-nav-list-item') || element.parentElement;
    }
    getMainChatWindow() { return document.querySelector('main') || document.querySelector('.flex-1.flex.flex-col'); }
    
    getSidebarTarget() { 
        return document.querySelector('.fixed.inset-y-0 nav') || document.querySelector('nav'); 
    }

    injectLockUI(element, isLocked, isHidden, toggleLockCallback, toggleHideCallback) {
        if (element.querySelector('.ai-vault-btn-container')) return;
        element.classList.add('ai-vault-relative-parent');
        element.style.setProperty('--ai-vault-bg', window.getComputedStyle(element).backgroundColor || '#191919');
        const container = document.createElement('div');
        container.className = 'ai-vault-btn-container';
        const lockBtn = document.createElement('div'); lockBtn.className = 'ai-vault-btn';
        lockBtn.innerText = isLocked ? '🔒' : '🔓';
        lockBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleLockCallback(lockBtn); });
        const hideBtn = document.createElement('div'); hideBtn.className = 'ai-vault-btn';
        hideBtn.innerText = isHidden ? '🙈' : '👁️';
        hideBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleHideCallback(hideBtn); });
        container.appendChild(lockBtn); container.appendChild(hideBtn); element.appendChild(container);
    }
}