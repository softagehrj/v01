const pdfjsLib = window['pdfjs-dist/build/pdf'];
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js';


async function suggestFilenameFromContent(url) {
      try {
   
        const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF.');
      }
  
    const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
  
      const loadingTask = pdfjsLib.getDocument(typedArray);
      const pdf = await loadingTask.promise;
      let content = '';
  
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
  
        textContent.items.forEach(item => {
          content += item.str + ' ';
        });
  
        console.log(content);
        // Use Chrome's built-in AI to suggest a filename
        const { available } = await ai.languageModel.capabilities();
        if (available !== "no") {
          const session = await ai.languageModel.create({
            temperature: 1,
            topK: 1, systemPrompt: `JUST give me a single suitable title after analyzing the content.Hint: you might find a suitable title in the starting few lines itself.the title should be such that a person could guess the title of the file if he forgets it `
          });
          const result = await session.prompt(content);
          const suggestedFilename = result.replace(/\s+/g, '_') ;
          console.log('ANSWER---------->',suggestedFilename);
          return suggestedFilename;
        } else {
          throw new Error('AI model is not available');
        }
      } catch (error) {
        console.error('Failed to suggest filename from content:', error);
        throw error;
      }
    }



// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('message received',message);
      console.log('sendresponse------>',sendResponse);
//     const { url, filename, mime } = message.canceledDownload;

    // Display the blocked download details in the popup
//     console.log(`Blocked Download Received: URL: ${url}, Filename: ${filename}, MIME: ${mime}`);
//     const container = document.getElementById('blockedDownloads'); // Ensure this element exists in popup.html
//     const entry = document.createElement('div');
//     entry.textContent = `Blocked: ${filename} (${mime}) - ${url}`;
//     container.appendChild(entry);

    // Optionally, send a response back to the background script
//     sendResponse({ status: 'Message received by popup.js' });
  
});
