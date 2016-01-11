/* global background, app */
'use strict';

var storage = (function (tmp) { //jshint ignore:line
  chrome.storage.local.get(null, function (objs) {
    tmp = objs;
    app.emit('load');
  });

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
