'use strict';

var sp = require('sdk/simple-prefs');
var timers = require('sdk/timers');
var tabs = require('sdk/tabs');
var self = require('sdk/self');
var unload = require('sdk/system/unload');
var platform = require('sdk/system').platform;
var desktop = ['winnt', 'linux', 'darwin', 'openbsd'].indexOf(platform) !== -1;
var {defer} = require('sdk/core/promise');
var {Worker} = require('sdk/content/worker');
var {Cc, Ci, Cu} = require('chrome');

var {Services} = Cu.import('resource://gre/modules/Services.jsm');

var config = {
  name: 'Tetris',
  url: {
    chrome: 'chrome://itetris/content/window.xul',
    panel: self.data.url('./panel/index.html'),
    faq: 'http://add0n.com/tetris.html',
    bug: 'https://github.com/schomery/tetris-game/issues'
  }
};

var dialog = (function () {
  let windowWatcher = Cc['@mozilla.org/embedcomp/window-watcher;1']
    .getService(Ci.nsIWindowWatcher);
  let workers = new WeakMap();
  let domWindow;
  unload.when(function () {
    if (domWindow) {
      domWindow.close();
    }
  });

  function serializeFeatures(options) {
    return Object.keys(options).reduce(function (result, name) {
      let value = options[name];
      // the chrome and private features are special
      if ((name === 'private' || name === 'chrome')) {
        return result + ((value === true) ? ',' + name : '');
      }
      return result + ',' + name + '=' +
             (value === true ? 'yes' : value === false ? 'no' : value);
    }, '').substr(1);
  }

  function open (options) {
    let d = defer();
    if (domWindow) {
      domWindow.focus();
      d.reject();
    }
    else {
      let xulWindow = windowWatcher.openWindow(null,
        config.url.chrome,
        self.name,
        serializeFeatures(options.features),
         null
      );
      domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIDOMWindow);
      domWindow.addEventListener('load', function () {
        let browser = domWindow.document.querySelector('browser');
        browser.addEventListener('DOMContentLoaded', function () {
          let window = browser.contentWindow;
          let worker = new Worker({
            window,
            contentScriptFile: options.contentScriptFile
          });
          workers.set(domWindow, worker);
          d.resolve(worker);
        }, false);
        domWindow.addEventListener('unload', function () {
          let worker = workers.get(this);
          if (worker) {
            worker.destroy();
            workers.delete(this);
          }
          domWindow = null;
        }, false);
        browser.setAttribute('src', options.url);
        domWindow.focus();
      }, false);
    }
    return d.promise;
  }
  return {
    open: open
  };
})();

function getNativeWindow() {
  let window = Services.wm.getMostRecentWindow('navigator:browser');
  return window.NativeWindow;
}

function onMessage (obj) {
  if (obj.id === 'open-faq') {
    tabs.open(config.url.faq + '?type=app');
  }
  if (obj.id === 'open-bug') {
    tabs.open(config.url.bug);
  }
  if (obj.id === 'storage') {
    sp.prefs[obj.data.id] = obj.data.data;
  }
}

if (desktop) {
  require('sdk/ui/button/action').ActionButton({
    id: 'tetris',
    label: 'Tetris',
    icon: {
      '16': './icons/16.png',
      '32': './icons/32.png',
      '64': './icons/64.png'
    },
    onClick: function () {
      var screen = require('sdk/window/utils').getMostRecentBrowserWindow().screen;
      let width = sp.prefs.width || 500;
      let height = sp.prefs.height || 700;
      dialog.open({
        url: config.url.panel,
        contentScriptFile: self.data.url('./firefox/inject.js'),
        features: {
          width,
          height,
          left: Math.round((screen.width - width) / 2),
          top: Math.round((screen.height - height) / 2),
          resizable: false,
        }
      }).then(worker => {
        worker.port.on('message', onMessage);
        worker.port.emit('prefs', sp.prefs);
      }, function () {});
    }
  });
}
else {
  var pageMod = require('sdk/page-mod');
  var page = pageMod.PageMod({
    include: config.url.panel,
    contentScriptFile: './firefox/inject.js',
    onAttach: function (worker) {
      worker.port.emit('prefs', sp.prefs);
    }
  });
  page.port.on('message', onMessage);

  (function (close) {
    var id = getNativeWindow().menu.add(config.name, null, function () {
      close();
      tabs.open(config.url.panel);
    });
    unload.when(function () {
      getNativeWindow().menu.remove(id);
      close();
    });
  })(function () {
    for (let tab of tabs) {
      if (tab && (tab.url || '').indexOf(self.data.url('')) === 0) {
        tab.close();
      }
    }
  });
}

exports.main = function (options) {
  if (options.loadReason === 'install' || options.loadReason === 'startup') {
    var version = sp.prefs.version;
    if (self.version !== version) {
      timers.setTimeout(function () {
        tabs.open(
          config.url.faq + '?v=' + self.version +
          (version ? '&p=' + version + '&type=upgrade' : '&type=install')
        );
      }, 3000);
      sp.prefs.version = self.version;
    }
  }
};
