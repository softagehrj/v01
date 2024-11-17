chrome.downloads.download({
      url: `https://arxiv.org/pdf/2411.09686` + '?programmatic=true',
      filename: 'X',
  }, (downloadId) => {
      console.log('Programmatic download started with ID:', downloadId);
  });

