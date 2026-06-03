// --- SHA-256 Cryptography Engine ---
async function hashSecure(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const scopeSelect = document.getElementById("pin-scope");
    const currentPinEntry = document.getElementById("current-pin-entry");
    const newPinEntry = document.getElementById("new-pin-entry");
    const timeoutSelect = document.getElementById("auto-lock-timeout");
    const lockModeSelect = document.getElementById("lock-mode");
    const saveBtn = document.getElementById("save-settings-btn");
    const statusEl = document.getElementById("status");

    // Load existing configurations from local device sandbox
    chrome.storage.local.get(["vaultTimeout", "lockMode"], (result) => {
        if (result.vaultTimeout !== undefined) {
            timeoutSelect.value = result.vaultTimeout;
        }
        if (result.lockMode !== undefined) {
            lockModeSelect.value = result.lockMode;
        }
    });

    // Save configurations configuration handler
    saveBtn.addEventListener("click", () => {
        const selectedScope = scopeSelect.value;
        const currentVal = currentPinEntry.value;
        const newVal = newPinEntry.value;
        const selectedTimeout = parseInt(timeoutSelect.value);
        const selectedLockMode = lockModeSelect.value;

        chrome.storage.local.get(["vaultPin", selectedScope], async (result) => {
            // Core UI configuration parameters package
            let updatePayload = { 
                vaultTimeout: selectedTimeout,
                lockMode: selectedLockMode 
            };

            // If the user wants to update/create a PIN key string
            if (newVal.length > 0) {
                // Validate New PIN format
                if (newVal.length !== 4 || isNaN(newVal)) {
                    statusEl.style.color = "#f44336";
                    statusEl.innerText = "Error: New key must be 4 digits.";
                    return;
                }

                // Determine required validation token (Custom PIN or Master Admin Key)
                const requiredHash = result[selectedScope] || result.vaultPin;

                // Anti-Tamper Privilege Verification Check
                if (requiredHash) {
                    if (currentVal.length !== 4) {
                        statusEl.style.color = "#ff9800";
                        statusEl.innerText = "Please enter your Current PIN.";
                        return;
                    }

                    const currentHash = await hashSecure(currentVal);
                    if (currentHash !== requiredHash) {
                        statusEl.style.color = "#f44336";
                        statusEl.innerText = "Access Denied: Current PIN is incorrect.";
                        currentPinEntry.value = "";
                        return;
                    }
                }
                
                // Set the secure cryptographic hash into the payload object
                updatePayload[selectedScope] = await hashSecure(newVal);
            }

            // Write all parameter updates to local storage
            chrome.storage.local.set(updatePayload, () => {
                statusEl.style.color = "#4caf50";
                statusEl.innerText = "Configurations saved successfully!";
                currentPinEntry.value = "";
                newPinEntry.value = "";
                
                // Clear state update feedback message after 2 seconds
                setTimeout(() => { statusEl.innerText = ""; }, 2000);
            });
        });
    });
});