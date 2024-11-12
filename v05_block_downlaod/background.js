chrome.webRequest.onHeadersReceived.addListener(
      function(details) {
        if (details.type === 'main_frame' && details.url.includes('download')) {
          return {cancel: true};
        }
      },
      {urls: ["<all_urls>"]},
      ["blocking"]
    );
    