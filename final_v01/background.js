let activeTabUrl = '';

function updateActiveTabUrl(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        if (tab && tab.url) {
            activeTabUrl = tab.url;
            console.log('Active tab URL updated:', activeTabUrl);
        }
    });
}

// Listener for when the active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateActiveTabUrl(activeInfo.tabId);
});

// Listener for when a tab is updated (e.g., URL changes within the same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url) {
        activeTabUrl = changeInfo.url;
        console.log('Active tab URL updated (on update):', activeTabUrl);
    }
});

// Initial check to get the URL of the active tab when the extension starts
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
        activeTabUrl = tabs[0].url;
        console.log('Initial active tab URL:', activeTabUrl);
    }
});
