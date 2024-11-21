//i think service-worker is perfect for listening to active tabs and whether it is pdf or not !!!
let popupPort=null;
let active_tab_id=null;

chrome.runtime.onConnect.addListener((port) => {

    if (port.name === "popup-to-background-port"){

                        console.log("Connected to popup.js via persistent port.");
                        popupPort = port;

                        setInterval(()=>{
                            if (active_tab_id){
                                sendActiveTabUrlAndFilename(active_tab_id);
                            }
                        },100);

                        
                        port.onMessage.addListener((msg) => {
                            console.log("Message received from popup.js:", msg);
                        });

                        // Handle disconnection
                        port.onDisconnect.addListener(() => {
                            console.log("popup.js Port disconnected.");
                            popupPort = null;
                        });
    }
    });

   
// Function to fetch filename from URL or headers
async function getFilenameFromUrlOrHeader(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        
        // Check Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition && contentDisposition.includes('filename=')) {
            const matches = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
            if (matches && matches[1]) {
                return decodeURIComponent(matches[1].replace(/['"]/g, ''));
            }
        }

        // Fallback to extracting filename from URL
        return url.split('/').pop() || 'default.pdf';
    } catch (error) {
        console.error('Error fetching filename:', error);
        return 'default.pdf'; // Safe fallback
    }
}

// Function to send active tab URL and filename to the content script
async function sendActiveTabUrlAndFilename(tabId) {
    if (popupPort) {
        console.log('popupport ready mf');
        try {
            const tab = await chrome.tabs.get(tabId);
            const activeTabUrl = tab.url;

            // Check if the URL points to a PDF
            const response = await fetch(activeTabUrl, { method: 'HEAD' });
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                console.log('The active tab is not a PDF.');
                return;
            }

            // Fetch filename
            const filename = await getFilenameFromUrlOrHeader(activeTabUrl);

            // Send URL and filename to the content script
            console.log({
                action: 'sendUrlAndFilename',
                url: activeTabUrl,
                filename: filename,
            });
            //message bhejne se phle connect to krlo
            popupPort.postMessage({
                action: 'sendUrlAndFilename',
                url: activeTabUrl,
                filename: filename,
            });
        } catch (error) {
            console.error('Error sending URL and filename:', error);
        }
    }else{
        console.log('popup port not ready');
    }
}

// Listen for tab activation (change of active tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
    active_tab_id=activeInfo.tabId;
    console.log("Tab changed, sending URL and filename...");
    sendActiveTabUrlAndFilename(activeInfo.tabId);
});

// Send the active tab's URL and filename when the extension is first loaded
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
        active_tab_id=tabs[0].id;
        sendActiveTabUrlAndFilename(tabs[0].id);
    }
});
