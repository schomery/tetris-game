/* globals $ */
'use strict';

var background = require('background');
var app = require('app');
var storage = require('storage');

var gStatus = 'stopped';

app.on('load', function () {
  $('.game').css('width', window.innerWidth);
  $('.game').css('height', window.innerHeight * 0.85);
  $('.game').blockrain({
    autoplay: false, // Let a bot play the game
    autoplayRestart: true, // Restart the game automatically once a bot loses
    showFieldOnStart: false, // Show a bunch of random blocks on the start screen (it looks nice)
    theme: {
      background: '#000000', // The main background color.
      backgroundGrid: '#101010', // You can draw a small background grid as well.
      primary: null, // Color of the falling blocks. This overrides the standard block color.
      secondary: null, // Color of the placed blocks. This overrides the standard block color.
      stroke: null, // Border color for the blocks.
      innerStroke: null, // A small border inside the blocks to give some texture.

      complexBlocks: {
        line:     ['assets/blocks/custom/line.png', 'assets/blocks/custom/line.png'],
        square:   'assets/blocks/custom/square.png',
        arrow:    'assets/blocks/custom/arrow.png',
        rightHook:'assets/blocks/custom/rightHook.png',
        leftHook: 'assets/blocks/custom/leftHook.png',
        rightZag: 'assets/blocks/custom/rightZag.png',
        leftZag:  'assets/blocks/custom/leftZag.png'
      }
    },
    blockWidth: Math.max(8, parseInt(window.innerWidth / 30)), // How many blocks wide the field is (The standard is 10 blocks)
    autoBlockWidth: false, // The blockWidth is dinamically calculated based on the autoBlockSize. Disabled blockWidth. Useful for responsive backgrounds
    autoBlockSize: 14, // The max size of a block for autowidth mode
    difficulty: 'normal', // Difficulty (normal|nice|evil).
    speed: 10, // The speed of the game. The higher, the faster the pieces go.

    // Copy
    playText: 'Let\'s play some Tetris',
    playButtonText: 'Play',
    gameOverText: 'Game Over',
    restartButtonText: 'Play Again',
    scoreText: 'Score',

    // Basic Callbacks
    onStart: function () {
      gStatus = 'started';
    },
    onRestart: function () {
      gStatus = 'started';
    },
    onGameOver: function (score) {
      gStatus = 'stopped';
    },

    // When a line is made. Returns the number of lines, score assigned and total score
    onLine: function(lines, scoreIncrement, score) {}
  });
  $('#width').val(window.innerWidth);
  $('#height').val(window.innerHeight);
});
app.on('unload', function () {
  console.error('unload');
})

$('.button')
.on('touchstart mousedown', function () {
  this.dataset.tapped = true;
})
.on('touchend mouseup', function () {
  this.dataset.tapped = false;
});

$('#to-left')
.on('touchstart mousedown', function (e) {
  e.preventDefault();
  $(document).trigger($.Event('keydown', {keyCode: 37}));
  this.dataset.tapped = true;
})
.on('touchend mouseup', function () {
  $(document).trigger($.Event('keyup', {keyCode: 37}));
  this.dataset.tapped = false;
});
$('#to-right')
.on('touchstart mousedown', function (e) {
  e.preventDefault();
  $(document).trigger($.Event('keydown', {keyCode: 39}));
})
.on('touchend mouseup', function () {
  $(document).trigger($.Event('keyup', {keyCode: 39}));
});
$('#to-down')
.on('touchstart mousedown', function (e) {
  e.preventDefault();
  if (gStatus === 'started') {
    $(document).trigger($.Event('keydown', {keyCode: 40}));
  }
})
.on('touchend mouseup', function () {
  $(document).trigger($.Event('keyup', {keyCode: 40}));
});
$('#rotate-left')
.on('click', function () {
  $(document).trigger($.Event('keydown', {keyCode: 38}));
});

/* settings */
var settings = (function (panel, div, button) {
  var s = 'hidden';
  panel.on('click', function (e) {
    if (div.has(e.target).length) {
      return;
    }
    panel.hide();
    s = 'hidden';
    if (gStatus === 'started') {
      $('.game').blockrain('resume');
    }
  });
  button.on('click', function () {
    panel.show();
    panel.css('display', 'flex');
    if (gStatus === 'started') {
      $('.game').blockrain('pause');
    }
    s = 'visible';
  });
  return {
    get status () {
      return s;
    }
  };
})($('#panel'), $('#panel>div'), $('#settings'));

$('#open-bug').on('click', function () {
  background.emit('open-bug');
});
$('#open-faq').on('click', function () {
  background.emit('open-faq');
});
$('#width').on('change', function (e) {
  storage.write('width', e.target.value);
});
$('#height').on('change', function (e) {
  storage.write('height', e.target.value);
});

window.addEventListener('blur', function () {
  if (gStatus === 'started') {
    $('.game').blockrain('pause');
  }
}, false);
window.addEventListener('focus', function () {
  if (settings.status === 'hidden' && gStatus === 'started') {
    $('.game').blockrain('resume');
  }
});
