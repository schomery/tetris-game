'use strict';
var background = (function () { //jshint ignore:line
  return {
    emit: function (id, data) {
      window.postMessage({id, data}, '*');
    }
  };
})();
