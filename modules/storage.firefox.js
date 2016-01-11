/* global background, app */
'use strict';

var storage = (function (tmp) { //jshint ignore:line

  window.addEventListener('message', function (e) {
    if (e.data && e.data.cmd === 'init-storage') {
      tmp = e.data.prefs;
      app.emit('load');
    }
  }, false);

  return {
    read: function (id) {
      return tmp[id];
    },
    write: function (id, data) {
      tmp[id] = data;
      background.emit('storage', {id, data});
    }
  };
})({});
