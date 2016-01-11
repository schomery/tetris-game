'use strict';

// launcher
chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('data/panel/index.html', {
    id: 'main'
  });
});
// storage
function commands (request) {
  if (request.id === 'open-faq') {
    window.open('http://add0n.com/tetris.html?type=app', '_system');
  }
  if (request.id === 'open-bug') {
    window.open('https://github.com/schomery/tetris-game/issues', '_system');
  }
  if (request.id === 'storage') {
    let tmp = {};
    tmp[request.data.id] = request.data.data;
    chrome.storage.local.set(tmp);
  }
}
