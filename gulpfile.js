'use strict';

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var change = require('gulp-change');
var babel = require('gulp-babel');
var gulpif = require('gulp-if');
var gulpFilter = require('gulp-filter');
var shell = require('gulp-shell');
var wait = require('gulp-wait');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var rename = require('gulp-rename');
var util = require('gulp-util');
var minify = require('gulp-minifier');
var gzip = require('gulp-gzip');
var merge = require('merge-stream');
var runSequence = require('run-sequence');

var modules = (function (files) {
  var tmp = {};
  files.forEach(function (file) {
    var s = file.split('.')
    tmp[s[0]] = tmp[s[0]] || {};
    var content = fs.readFileSync(path.resolve('modules', file)).toString();
    content = content.replace(/\s*\/\/.*/, '');
    content = content.replace(/\s*\/\*.*\*\//, '');
    content = content.replace(/.*use strict.*/, '');
    content = content.trim();
    tmp[s[0]][s[1].replace('.js', '')] = content;
  });
  return tmp;
})(fs.readdirSync('modules'));

/* clean */
gulp.task('clean', function () {
  return gulp.src([
    'builds/unpacked/android/*',
    'builds/unpacked/opera/*',
    'builds/unpacked/chrome/*',
    'builds/unpacked/androud/*',
    'builds/unpacked/www/*',
    'builds/unpacked/firefox/*',
  ], {read: false})
    .pipe(clean());
});
/* www build */
gulp.task('www-build', function () {
  gulp.src([
    'src/data/panel/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('index.html') !== -1;
  }, change(function (content) {
    return content.replace('href="../icons/16.png"', 'href="http://cdn.add0n.com/icons/sudoku16.png"');
  })))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1 && f.relative.indexOf('data/') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*module\\:' + name), modules[name].www || modules[name].default);
    }
    return content;
  })))
  .pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true
  }))
  .pipe(gulp.dest('builds/unpacked/www'))
  .pipe(gzip({gzipOptions: {level: 9}}))
  .pipe(gulp.dest('builds/unpacked/www'))
});
/* chrome build */
gulp.task('chrome-build', function () {
  var a = gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*require\\([\\\'\\\"]' + name + '[\\\'\\\"]\\).*'), modules[name].chrome || modules[name].default);
    }
    return content;
  })))
  .pipe(gulp.dest('builds/unpacked/chrome/data'));

  var b = gulp.src([
    'src/lib/chrome.js'
  ])
  .pipe(gulp.dest('builds/unpacked/chrome/lib'));

  var c = gulp.src([
    'src/manifest-app.json'
  ])
  .pipe(rename(function (path) {
    path.basename = 'manifest';
    return path;
  }))
  .pipe(gulp.dest('builds/unpacked/chrome'));

  return merge(a, b, c);
});
gulp.task('chrome-pack', function () {
  gulp.src([
    'builds/unpacked/chrome/**/*'
  ])
  .pipe(zip('chrome.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('chrome-install', function () {
  gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --load-and-launch-app=`pwd` &'
  ], {
    cwd: './builds/unpacked/chrome'
  }));
});
/* opera build */
gulp.task('opera-build', function () {
  var a = gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*require\\([\\\'\\\"]' + name + '[\\\'\\\"]\\).*'), modules[name].opera || modules[name].chrome || modules[name].default);
    }
    return content;
  })))
  .pipe(gulp.dest('builds/unpacked/opera/data'));

  var b = gulp.src([
    'src/lib/opera.js'
  ])
  .pipe(gulp.dest('builds/unpacked/opera/lib'));

  var c = gulp.src([
    'src/manifest-extension.json'
  ])
  .pipe(rename(function (path) {
    path.basename = 'manifest';
    return path;
  }))
  .pipe(gulp.dest('builds/unpacked/opera'));

  return merge(a, b, c);
});
gulp.task('opera-pack', function () {
  gulp.src([
    'builds/unpacked/opera/**/*'
  ])
  .pipe(zip('opera.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('opera-install', function () {
  gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --load-and-launch-app=`pwd` &'
  ], {
    cwd: './builds/unpacked/opera'
  }));
});
/* android build */
gulp.task('android-build', function () {
  var a = gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*require\\([\\\'\\\"]' + name + '[\\\'\\\"]\\).*'), modules[name].android || modules[name].default);
    }
    return content;
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.js') !== -1 && f.path.indexOf('.json') === -1 && f.relative.indexOf('EventEmitter.js') === -1;
  }, babel({
    presets: ['es2015']
  })))
  .pipe(gulp.dest('builds/unpacked/android/data'));

  var b = gulp.src([
    'src/lib/android.js'
  ])
  .pipe(gulp.dest('builds/unpacked/android/lib'));

  var c = gulp.src([
    'src/manifest-android.json'
  ])
  .pipe(rename(function (path) {
    path.basename = 'manifest';
    return path;
  }))
  .pipe(gulp.dest('builds/unpacked/android'));

  return merge(a, b, c);
});
/* firefox build */
gulp.task('firefox-build', function () {
  var a = gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      console.error('.*require\\(' + name + '\\).*');
      content = content.replace(new RegExp('.*require\\([\\\'\\\"]' + name + '[\\\'\\\"]\\).*'), modules[name].firefox || modules[name].default);
    }
    return content;
  })))
  .pipe(gulp.dest('builds/unpacked/firefox/data'))

  var b = gulp.src([
    'src/lib/firefox.js'
  ])
  .pipe(gulp.dest('builds/unpacked/firefox/lib'))

  var c = gulp.src([
    'src/package.json',
    'src/chrome.manifest'
  ])
  .pipe(gulp.dest('builds/unpacked/firefox'))

  return merge(a, b, c);
});
/* firefox pack */
gulp.task('firefox-pack', function () {
  gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    'jpm xpi',
    'mv *.xpi ../../packed/firefox.xpi',
    'jpm post --post-url http://localhost:8888/'
  ], {
    cwd: './builds/unpacked/firefox'
  }))
  .pipe(shell([
    'zip firefox.xpi install.rdf icon.png icon64.png',
  ], {
    cwd: './builds/packed'
  }));
});

/* */
gulp.task('www', function (callback) {
  runSequence('clean', 'www-build', callback);
});
gulp.task('chrome', function (callback) {
  runSequence('clean', 'chrome-build', 'chrome-pack', 'chrome-install', callback);
});
gulp.task('opera', function (callback) {
  runSequence('clean', 'opera-build', 'opera-pack', 'opera-install', callback);
});
gulp.task('firefox', function (callback) {
  runSequence('clean', 'firefox-build', 'firefox-pack', callback);
});
gulp.task('android', function (callback) {
  runSequence('clean', 'android-build', callback);
});
