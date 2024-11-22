const pdfjsLib = window['pdfjs-dist/build/pdf'];
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js';
let ta=null;

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
                temperature: 0.8,
                topK: 4,
                systemPrompt: `JUST give me a single suitable title (not more than 10 words) after analyzing the content. Hint: you might find a suitable title in the starting few lines itself.`
            });
            const result = await session.prompt(content);
            const suggestedFilename = result.replace(/\s+/g, '_');
            console.log('ANSWER---------->', suggestedFilename);

            // Update UI with suggested filename
            document.querySelector('[data-content="suggested"]').textContent = suggestedFilename;
            return typedArray;

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
    const saveButton = document.getElementById('saveButton');

    // Handle tab activation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Save file based on active tab
    saveButton.addEventListener('click', async () => {
        const activeTab = document.querySelector('.tab.active');
        const dataContent = activeTab.getAttribute('data-content');
        const defaultFilenameElement = document.querySelector('[data-content="default"]');
        const suggestedFilenameElement = document.querySelector('[data-content="suggested"]');

        try {
            if (dataContent === 'default') {
                const filename = defaultFilenameElement.textContent;
                alert(`Downloading file with default filename: ${filename}`);
                downloadFile(filename,ta);
            } else if (dataContent === 'suggested') {
                const filename = suggestedFilenameElement.textContent;
                alert(`Downloading file with suggested filename: ${filename}`);
                downloadFile(filename, ta);
            }
        } catch (error) {
            console.error('Error while saving the file:', error);
        }
    });

    chrome.runtime.onConnect.addListener((port) => {
        if (port.name === 'popup-connection') {
            port.onMessage.addListener(async (message) => {
                if (message.canceledDownload) {
                    // Update default filename
                    const defaultElement = document.querySelector('[data-content="default"]');
                    defaultElement.textContent = message.canceledDownload.filename;

                    // Generate suggested filename
                    ta=await suggestFilenameFromContent(message.canceledDownload.url);
                }
            });
        }
    });
});

// Helper function to download the file
function downloadFile(filename, arrayBuffer) {
    
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const objectURL = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectURL);
}
