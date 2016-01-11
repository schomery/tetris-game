'use strict';
// toolbar
chrome.browserAction.onClicked.addListener(function () {
  chrome.storage.local.get(function (prefs) {
    let width = parseInt(prefs.width) || 500;
    let height = parseInt(prefs.height) || 700;
    chrome.windows.create({
      'url': 'data/panel/index.html',
      'type': 'popup',
      'width': width,
      'height': height,
      'left': Math.round((window.screen.width - width) / 2),
      'top': Math.round((window.screen.height - height) / 2),
      'focused': true
    }, function () {});
  });
});
// storage
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (sender.url.indexOf('background') === -1) {
    if (request.id === 'open-faq') {
      chrome.tabs.create({url: 'http://add0n.com/tetris.html?type=app'});
    }
    if (request.id === 'open-bug') {
      chrome.tabs.create({url: 'http://add0n.com/tetris.html?type=app'});
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
    chrome.tabs.create({
      url: 'http://add0n.com/sudoku.html?type=' + (prefs.version ? 'update' : 'install') + '&version=' + version
    });
    chrome.storage.local.set({version}, function () {});
  }
});
