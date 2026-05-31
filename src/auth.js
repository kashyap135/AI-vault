const Auth = {
    async getSavedPin() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["vaultPin"], (result) => resolve(result.vaultPin));
        });
    },
    async savePin(pin) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ vaultPin: pin }, resolve);
        });
    }
};