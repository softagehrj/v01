// async function saveFileWithSaveAs(arrayBuffer, suggestedFilename) {
//     try {
//         // Create a new file handle
//         const options = {
//             types: [
//                 {
//                     description: 'PDF Files',
//                     accept: { 'application/pdf': ['.pdf'] },
//                 },
//             ],
//         };
  
//         // Show the Save As dialog to the user
//         const handle = await window.showSaveFilePicker({
//             suggestedName: suggestedFilename,
//             ...options,
//         });
  
//         // Create a writable stream
//         const writableStream = await handle.createWritable();
  
//         // Write the arrayBuffer to the file
//         await writableStream.write(arrayBuffer);
  
//         // Close the writable stream
//         await writableStream.close();
  
//         console.log('File saved successfully');
//     } catch (err) {
//         console.error('Error saving file:', err);
//     }
//   }
  

//   async function suggestfilename(url){
//     const response= await fetch(url);
//     return await response.arrayBuffer();
//   }
//   //url can be anything here

//   const arrayBuffer = new Uint8Array(suggestfilename(url));
//   saveFileWithSaveAs(arrayBuffer, 'example.pdf');
  



// Main function to handle the "Save As" functionality
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

        // Write the array buffer content to the file
        await writableStream.write(arrayBuffer);

        // Close the writable stream to finalize the file
        await writableStream.close();

        console.log('File saved successfully.');
    } catch (err) {
        console.error('Error saving file:', err);
    }
}

// Example usage of the saveFileWithSaveAs function
document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveFileButton');
    saveButton.addEventListener('click', async () => {
        
        const arrayBuffer = new Uint8Array([37, 80, 68, 70, 45]).buffer; // Example binary data
        const suggestedFilename = 'example.pdf';

        // Call the saveFileWithSaveAs function
        await saveFileWithSaveAs(arrayBuffer, suggestedFilename);
    });
});