
const pdfjsLib = window['pdfjs-dist/build/pdf'];
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js';



document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [suggestedFilename, typedArray] = await suggestFilenameFromContent(tab.url);

  document.getElementById("click").addEventListener("click", async () => {
      try {
          const options = {
              suggestedName: suggestedFilename,
              types: [
                  {
                      description: 'PDF Files',
                      accept: { 'application/pdf': ['.pdf'] },
                  },
              ],
          };

          // Show the save file picker directly on user gesture
          const handle = await window.showSaveFilePicker(options);

          // Save the file asynchronously
          const writableStream = await handle.createWritable();
          await writableStream.write(typedArray);
          await writableStream.close();

          console.log('File saved successfully.');
      } catch (error) {
          console.error('Error during save operation:', error);
      }
  });
});

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

      // Extract text content from the first page
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();

      textContent.items.forEach(item => {
          content += item.str + ' ';
      });

      // Use Chrome's AI API to suggest a filename
      const { available } = await ai.languageModel.capabilities();
      if (available !== "no") {
          const session = await ai.languageModel.create({
              temperature: 0.8,
              topK: 4,
              systemPrompt: `JUST give me a single suitable title (not more than 10 words) after analyzing the content. Hint: you might find a suitable title in the starting few lines itself.`,
          });

          const result = await session.prompt(content);
          const suggestedFilename = result.replace(/\s+/g, '_');
          console.log('ANSWER---------->', suggestedFilename);

          return [suggestedFilename, typedArray];
      } else {
          throw new Error('AI model is not available');
      }
  } catch (error) {
      console.error('Failed to suggest filename from content:', error);
      throw error;
  }
}
