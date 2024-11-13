chrome.downloads.onCreated.addListener((downloadItem) => {
  const downloadId = downloadItem.id;
  console.log('url',downloadId.url);
  console.log('finalurl',downloadId.finalUrl);


  chrome.downloads.search({ id: downloadId }, (items) => {
    if (items.length > 0) {
      const item = items[0];
      console.log(item);
      // Assuming Content-Disposition headers are accessible in item.byExtensionId or equivalent
      let disposition = item.byExtensionId ? item.byExtensionId["Content-Disposition"] : null;
      let message = "";

      if (disposition) {
        if (disposition.toLowerCase().includes("inline")) {
          message = "Content-Disposition: inline";
        } else if (disposition.toLowerCase().includes("attachment")) {
          message = "Content-Disposition: attachment";
        } else {
          message = "Content-Disposition header is present but unknown.";
        }
      } else {
        message = "Content-Disposition header is missing.";
      }
console.log(message);
    }
  });
});
