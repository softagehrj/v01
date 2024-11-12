document.addEventListener('click', async (event) => {

      if (event.target.tagName === 'A' && event.target.href.endsWith('.pdf')) {
        event.preventDefault();
        const url = event.target.href;
        console.log('url--->',url);
        chrome.runtime.sendMessage({ action: "sendUrl", url: url }, (response) => {
            console.log("Response from background:", response);
        });
      
      }
    });