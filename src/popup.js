async function hashSecure(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    const scopeSelect = document.getElementById("pin-scope");
    const currentPinEntry = document.getElementById("current-pin-entry");
    const newPinEntry = document.getElementById("new-pin-entry");
    const timeoutSelect = document.getElementById("auto-lock-timeout");
    const saveBtn = document.getElementById("save-settings-btn");
    const statusEl = document.getElementById("status");

    // Load existing saved configuration on startup
    chrome.storage.local.get(["vaultTimeout"], (result) => {
        if (result.vaultTimeout !== undefined) {
            timeoutSelect.value = result.vaultTimeout;
        }
    });

    saveBtn.addEventListener("click", () => {
        const selectedScope = scopeSelect.value;
        const currentVal = currentPinEntry.value;
        const newVal = newPinEntry.value;
        const selectedTimeout = parseInt(timeoutSelect.value);

        chrome.storage.local.get(["vaultPin", selectedScope], async (result) => {
            let updatePayload = { vaultTimeout: selectedTimeout };

            // If user is trying to change a PIN
            if (newVal.length > 0) {
                if (newVal.length !== 4 || isNaN(newVal)) {
                    statusEl.style.color = "#f44336";
                    statusEl.innerText = "Error: PIN must be 4 digits.";
                    return;
                }

                const requiredHash = result[selectedScope] || result.vaultPin;
                if (requiredHash) {
                    if (currentVal.length !== 4) {
                        statusEl.style.color = "#ff9800";
                        statusEl.innerText = "Please verify Current PIN.";
                        return;
                    }
                    const currentHash = await hashSecure(currentVal);
                    if (currentHash !== requiredHash) {
                        statusEl.style.color = "#f44336";
                        statusEl.innerText = "Incorrect Current PIN.";
                        return;
                    }
                }
                updatePayload[selectedScope] = await hashSecure(newVal);
            }

            // Save settings locally
            chrome.storage.local.set(updatePayload, () => {
                statusEl.style.color = "#4caf50";
                statusEl.innerText = "Configurations saved!";
                currentPinEntry.value = "";
                newPinEntry.value = "";
                setTimeout(() => { statusEl.innerText = ""; }, 2000);
            });
        });
    });
});