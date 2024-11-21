
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

      return [typedArray,suggestedFilename];

      } else {
      throw new Error('AI model is not available');
      }
} catch (error) {
      console.error('Failed to suggest filename from content:', error);
      throw error;
}
}

document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("click").addEventListener("click", () => {
          console.log("Button clicked");
          const port = chrome.runtime.connect({ name: "popup-to-background-port" });
          port.onMessage.addListener(async (message) => {
              console.log("Message from background script to popup:", message);
              try {
                  const [ta, sfn] = await suggestFilenameFromContent(message.url);
                  await saveFileWithSaveAs(ta, sfn);
              } catch (err) {
                  console.error("Error in handling message:", err);
              }
          });
      });
  });
  

