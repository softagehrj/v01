
const pdfjsLib = window['pdfjs-dist/build/pdf'];
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js';


async function renamePdf() {
      const pdfUrl = document.getElementById("input_karo").value;; // Predefined PDF URL

      try {
        // Fetch the PDF file from the internet
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF.');
        }

        // Convert the response to an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);

        // Load the PDF document from the ArrayBuffer
        const loadingTask = pdfjsLib.getDocument(typedArray);
        const pdf = await loadingTask.promise;
        let text = '';

        // Extract text from each page of the PDF
      //   for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(1);
          const textContent = await page.getTextContent();

          textContent.items.forEach(item => {
            text += item.str + ' ';
          });
      //   }
        console.log(text);

        // Analyze text and suggest a new filename
        const suggestedFilename = await analyzeTextAndSuggestFilename(text);

        // Create a new Blob with the same content and a new name
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Trigger a download of the renamed file
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the PDF.');
      }
    }

    async function analyzeTextAndSuggestFilename(text) {
          console.log('model is called')
          
          const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

          if (available !== "no") {
            const session = await ai.languageModel.create({
              temperature:1 , topK:1 ,systemPrompt: `JUST give me a single suitable title after analyzing the content.Hint: you might find a suitable title in the starting few lines itself.the title should be such that a person could guess the title of the file if he forgets it `
                });
          const result = await session.prompt(text);
          console.log('result',result);
          return result;
  } else {
    console.log('model not available ');
  } 
    }