'use strict';
var background = (function () { //jshint ignore:line
  return {
    emit: function (id, data) {
      chrome.runtime.sendMessage({id, data});
    }
  };
})();
