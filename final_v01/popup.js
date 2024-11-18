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
          
          return [suggestedFilename,typedArray];

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

    async function saveFileWithSaveAs(arrayBuffer, suggestedFilename) {
      try {
          // Options for the file save dialog
          const options = {
              suggestedName: suggestedFilename,
              types: [
                  {
                      description: 'PDF Files',
                      accept: { 'application/pdf': ['.pdf'] },
                  },
              ],
          };
  
          // Show the "Save As" dialog to the user
          const handle = await window.showSaveFilePicker(options);
  
          // Create a writable stream for the selected file
          const writableStream = await handle.createWritable();

          await writableStream.write(arrayBuffer);
          await writableStream.close();
  
          console.log('File saved successfully.');
      } catch (err) {
          console.error('Error saving file:', err);
      }
  }



  document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    document.getElementById("click").addEventListener("click", async () => {
        try {
            // Fetch and suggest a filename
            const [sfn, ta] = await suggestFilenameFromContent(tab.url);

            // Immediately trigger the save operation (still in user gesture context)
            await saveFileWithSaveAs(ta, sfn);
        } catch (error) {
            console.error('Error during save operation:', error);
        }
    });
});

  
