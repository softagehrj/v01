
// chrome.downloads.download({
//       url: `https://www.uscis.gov/sites/default/files/document/lesson-plans/Government_and_You_handouts.pdf`,
//       filename: 'x',
//     });


// chrome.downloads.onCreated.addListener((downloadItem) => {
// console.log(downloadItem);
// });

// Pause the download after a delay
// Pause 1 millisecound after the download starts


chrome.downloads.onDeterminingFilename.addListener( async(downloadItem, suggest) => {
  // Check the MIME type
  if (downloadItem.mime && downloadItem.mime.includes('pdf')) {
    // Cancel the download if it's a PDF
    chrome.downloads.cancel(downloadItem.id, () => {
      console.log(`Blocked download of file: ${downloadItem.filename}`);
    });
   
    suggest({
      filename: 'x' // Optionally modify the filename here
    });

  } else {
   
    console.log('default');

  }
});

    