/* globals self */
'use strict';

window.addEventListener('message', function (e) {
  self.port.emit('message', e.data);
}, false);

self.port.on('prefs', function (obj) {
  window.postMessage({
    cmd: 'init-storage',
    prefs: obj
  }, '*');
});
