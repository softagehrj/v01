let activeDownloads = new Set();
//this is a fucking loop

chrome.downloads.onCreated.addListener((downloadItem) => {
  console.log(downloadItem.byExtensionId);
  console.log(downloadItem.id);  
          // Start a new download with the custom filename
      chrome.downloads.download({
        url: downloadItem.url,
        filename: 'x',
      });

});
