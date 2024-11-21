let screenwidth=null;
let screenheight=null;

chrome.system.display.getInfo((displays) => {
  const primaryDisplay = displays[0];
  screenwidth = primaryDisplay.workArea.width;
  screenheight = primaryDisplay.workArea.height;
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  console.log('download-------->',downloadItem.filename);
  if (downloadItem.mime && downloadItem.mime.includes('pdf') && !downloadItem.url.startsWith('blob') ) {
    chrome.downloads.cancel(downloadItem.id, () => {
      console.log(`Blocked download of file: ${downloadItem.filename}`);
    });

    const canceledDownloadData = {
      url: downloadItem.url,
      filename: downloadItem.filename,
      mime: downloadItem.mime,
    };
    // console.log(canceledDownloadData);

    chrome.windows.create(
      {
          url: chrome.runtime.getURL('popup.html'),
          type: 'popup',
          width: 300,
          height: 200,
          top:Math.round((screenheight-200)/2),
          left:Math.round((screenwidth-300)/2) 
      },
      () => {
          
        setTimeout(() => {
          const port = chrome.runtime.connect({ name: 'popup-connection' });
          port.postMessage({ canceledDownload: canceledDownloadData });

          port.onDisconnect.addListener(() => {
            console.log('Disconnected from popup');
          });
        }, 1000);

      });
  

  } else {
    // Allow the download
    console.log('default');
    // suggest();
  }
});




