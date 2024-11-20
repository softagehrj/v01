
let sfn=null;
let ta=null;

const pdfjsLib = window['pdfjs-dist/build/pdf'];
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js'
console.log('content-script chala');

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


  const port = chrome.runtime.connect({ name: "content-to-background-port" });
  port.onMessage.addListener(async (msg) => {
    if (msg.action === 'sendUrl' && msg.url) {
        console.log("Received active tab URL from background:", msg.url);
        const [sfn,ta] = await suggestFilenameFromContent(msg.url);
        console.log('suggested ---->',sfn)
        port.postMessage({
          action: "content-to-background-port",
          sfn:sfn , ta:ta
      });
    
    }
});


//i want to know the order of execution of this js file line by