// --- FEATURE 4: SHA-256 Cryptography Engine ---
async function hashSecure(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    const scopeSelect = document.getElementById("pin-scope");
    const pinEntry = document.getElementById("pin-entry");
    const saveBtn = document.getElementById("save-settings-btn");
    const statusEl = document.getElementById("status");
    const stealthToggle = document.getElementById("stealth-toggle");

    chrome.storage.local.get(["revealHiddenState"], (result) => {
        if (result.revealHiddenState !== undefined) stealthToggle.checked = result.revealHiddenState;
    });

    saveBtn.addEventListener("click", async () => {
        const selectedScope = scopeSelect.value;
        const inputVal = pinEntry.value;

        if (inputVal.length === 4 && !isNaN(inputVal)) {
            // Hash the PIN before saving it to the database
            const hashedPin = await hashSecure(inputVal);
            
            let dataObject = {};
            dataObject[selectedScope] = hashedPin;

            chrome.storage.local.set(dataObject, () => {
                statusEl.style.color = "#4caf50";
                statusEl.innerText = "Secure Hash Stored Successfully!";
                pinEntry.value = "";
                setTimeout(() => { statusEl.innerText = ""; }, 2000);
            });
        } else {
            statusEl.style.color = "#f44336";
            statusEl.innerText = "Error: Key code must be a 4-digit number.";
        }
    });

    stealthToggle.addEventListener("change", () => {
        const isChecked = stealthToggle.checked;
        chrome.storage.local.set({ revealHiddenState: isChecked }, () => {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    try { chrome.tabs.sendMessage(tab.id, { action: "updateVisibilityStates", revealHiddenState: isChecked }); } 
                    catch(e) {}
                });
            });
        });
    });
});