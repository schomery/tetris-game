'use strict';
// launcher
chrome.app.runtime.onLaunched.addListener(function () {
  chrome.storage.local.get(null, function (prefs) {
    chrome.app.window.create('data/panel/index.html', {
      bounds: {
        width: parseInt(prefs.width) || 500,
        height: parseInt(prefs.height) || 700
      },
      resizable: false
    });
  });
});

// message passing
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (sender.url.indexOf('background') === -1) {
    if (request.id === 'open-faq') {
      chrome.browser.openTab({url: 'http://add0n.com/tetris.html?type=app'});
    }
    if (request.id === 'open-bug') {
      chrome.browser.openTab({url: 'https://github.com/schomery/tetris-game/issues'});
    }
    if (request.id === 'storage') {
      let tmp = {};
      tmp[request.data.id] = request.data.data;
      chrome.storage.local.set(tmp);
    }
  }
});
// welcome
chrome.storage.local.get('version', function (prefs) {
  let version = chrome.runtime.getManifest().version;
  if (prefs.version !== version) {
    chrome.browser.openTab({
      url: 'http://add0n.com/tetris.html?type=' + (prefs.version ? 'update' : 'install') + '&version=' + version
    });
    chrome.storage.local.set({version}, function () {});
  }
});
