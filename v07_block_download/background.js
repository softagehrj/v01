
chrome.downloads.download({
      url: `https://www.uscis.gov/sites/default/files/document/lesson-plans/Government_and_You_handouts.pdf`,
      filename: 'x',
    });

chrome.downloads.onCreated.addListener((downloadItem) => {
  console.log('id',downloadItem.id);
  console.log('extension id', downloadItem.byExtensionId);
});