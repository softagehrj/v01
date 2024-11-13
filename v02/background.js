
importScripts('build/pdf.min.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
console.log(pdfjsLib);


chrome.downloads.onDeterminingFilename.addListener(async function(downloadItem, suggest) {
      console.log(downloadItem)
      console.log(downloadItem.url)

      
      // Function to suggest a filename based on the content of the file
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
            const suggestedFilename = result.replace(/\s+/g, '_') + '.pdf';
            console.log(suggestedFilename);
            session.destroy();
            return suggestedFilename;
          } else {
            throw new Error('AI model is not available');
          }
        } catch (error) {
          console.error('Failed to suggest filename from content:', error);
          throw error;
        }
      }
    
      try {
        // Suggest a filename based on the content of the file
        const suggestedFilename = await suggestFilenameFromContent(downloadItem.url);
        suggest({ filename: suggestedFilename, conflictAction: 'uniquify' });
      } catch (error) {
        // Fallback to URL path if content analysis fails
        const url = new URL(downloadItem.url);
        const pathname = url.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        suggest({ filename: filename, conflictAction: 'uniquify' });
      }
    
      return true; // Indicate that the suggestion will be made asynchronously
    });
    
