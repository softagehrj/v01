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
            temperature: .8,topK:4,
             systemPrompt: `JUST give me a single suitable title (not more than 10 words) after analyzing the content.Hint: you might find a suitable title in the starting few lines itself.`
          });
          const result = await session.prompt(content);
          const suggestedFilename = result.replace(/\s+/g, '_') ;
          console.log('ANSWER---------->',suggestedFilename);
          return suggestedFilename;

          
          document.getElementById('isme_dalo').textContent=suggestedFilename;
          document.getElementById('press_me').addEventListener('click',()=>{

            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const objectURL = URL.createObjectURL(blob);
      
            const a = document.createElement('a');
            a.href = objectURL;
            a.download = suggestedFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectURL);

          
          }); 

        } else {
          throw new Error('AI model is not available');
        }
      } catch (error) {
        console.error('Failed to suggest filename from content:', error);
        throw error;
      }
    }


document.addEventListener('DOMContentLoaded', () => {
          const tabs = document.querySelectorAll('.tab');
          console.log('tabs------>',tabs);
          const content = document.getElementById('content');
          console.log('contnet---->',content);
          const saveButton = document.getElementById('saveButton');
          console.log('savebutton----->',saveButton);


          tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        saveButton.addEventListener('click', () => {

            alert(`File saved as: ${content.textContent.split(': ')[1]}`);
        });

          chrome.runtime.onConnect.addListener((port) => {
          console.log('yeahhh');
          if (port.name === 'popup-connection') {
              // Listen for messages from the background
              port.onMessage.addListener(async (message) => {

                  if (message.canceledDownload) {
                    const element = document.querySelector('[data-content="default"]');
                    element.textContent=message.canceledDownload.filename;
  
                      suggestFilenameFromContent(message.canceledDownload.url);
        
                  }
              });
          }


});
          });
  
