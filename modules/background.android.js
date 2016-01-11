'use strict';
var background = (function () { //jshint ignore:line
  return {
    emit: function (id, data) {
      chrome.runtime.getBackgroundPage(function (b) {
        b.commands({id, data});
      });
    }
  };
})();
