chrome.downloads.download({
      url: `https://www.serc.iisc.ac.in/serc_web/wp-content/uploads/2020/02/Introduction-of-Deep-Learning.pdf` + '?programmatic=true',
      filename: 'Introduction-of-Deep-Learning.pdf',
  }, (downloadId) => {
      console.log('Programmatic download started with ID:', downloadId);
  });