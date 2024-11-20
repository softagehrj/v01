const port = chrome.runtime.connect({ name: "popup-to-background-port" });

// Send a message to the background script
port.postMessage({ action: "popupToBackground", data: "Hello from popup!" });


async function saveFileWithSaveAs(arrayBuffer, suggestedFilename) {
      try {
          // Create a new file handle
          const options = {
              types: [
                  {
                      description: 'PDF Files',
                      accept: { 'application/pdf': ['.pdf'] },
                  },
              ],
          };
  
          // Show the Save As dialog to the user
          const handle = await window.showSaveFilePicker({
              suggestedName: suggestedFilename,
              ...options,
          });
  
          // Create a writable stream
          const writableStream = await handle.createWritable();
  
          // Write the arrayBuffer to the file
          await writableStream.write(arrayBuffer);
  
          // Close the writable stream
          await writableStream.close();
  
          console.log('File saved successfully');
      } catch (err) {
          console.error('Error saving file:', err);
      }
  }

// Listen for messages from the background script
port.onMessage.addListener((message) => {
    console.log("Message from background script to popup:", message)
    document . getElementById('click').addEventListener('click',()=>{
      saveFileWithSaveAs(message.ta,message.sfn);

    });


});