const port = chrome.runtime.connect({ name: "popup-to-background-port" });

// Send a message to the background script
port.postMessage({ action: "popupToBackground", data: "Hello from popup!" });

// Listen for messages from the background script
port.onMessage.addListener((message) => {
    console.log("Message from background script:", message)
    document . getElementById('click').addEventListener('click',()=>{
      

    });


});