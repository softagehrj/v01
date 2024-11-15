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


document.addEventListener('DOMContentLoaded', () => {

  chrome.runtime.onConnect.addListener((port) => {
    console.log('yeahhh');
    if (port.name === 'popup-connection') {
        // Listen for messages from the background
        port.onMessage.addListener((message) => {
            if (message.canceledDownload) {
                console.log('Received canceled download data:', message.canceledDownload);
                const filename=suggestFilenameFromContent(message.cancelDownload.url);
                
                chrome.downloads.download({
                  url: 'https://example.com/file-to-download.txt?programmatic=true',
                  filename: 'allowed_programmatic_file.txt',
              }, (downloadId) => {
                  console.log('Programmatic download started with ID:', downloadId);
              });
              
                // Perform any required actions with the received data
            }
        });
    }
});



});

  
