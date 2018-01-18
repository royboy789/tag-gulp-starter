var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    rename      = require('gulp-rename'),
    jshint      = require('gulp-jshint'),
    scsslint    = require('gulp-sass-lint'),
    cache       = require('gulp-cached'),
    prefix      = require('autoprefixer'),
    notify      = require('gulp-notify'),
    postcss     = require('gulp-postcss'),
    imagemin    = require('gulp-imagemin'),
    iconfont    = require('gulp-iconfont'),
    iconfontCSS = require('gulp-iconfont-css'),
    sourcemaps  = require('gulp-sourcemaps'),
    cssnano     = require('gulp-cssnano'),
    livereload  = require('gulp-livereload'),
    compass     = require('compass-importer'),
    spritesmith = require('gulp.spritesmith');

// LiveReload requires the browser plugin to automatically watch
// for changes and update.

// Prefix with project code
var fontName = 'icons';

gulp.task('scss', ['scsslint'], function() {
  return gulp.src('scss/styles.scss')
    // .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['node_modules/susy/sass'],
      importer: compass
    }))
    .on('error', notify.onError({
      title:    "Gulp",
      subtitle: "Failure!",
      message:  "Error: <%= error.message %>"
    }))
    .pipe(cssnano({zindex: false}))
    // .pipe(sourcemaps.write())
    .pipe(postcss([ prefix({ browsers: ['last 2 versions'], cascade: false }) ]))
    .pipe(gulp.dest('css'))
    .pipe(livereload());
});

gulp.task('optimize-images', function() {
  gulp.src('./images/**/*', {base: '.'})
    .pipe(imagemin());
});

gulp.task('iconfont', function() {
  gulp.src(['./images/svg/*.svg'])
    .pipe(iconfontCSS({
      fontName: fontName,
      path: './scss/templates/icons.scss',
      targetPath: '../scss/global/_icons.scss',
      fontPath: '../fonts/',
    }))
    .pipe(iconfont({
      fontName: fontName,
      // Remove woff2 if you get an ext error on compile
      formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
      normalize: true,
      fontHeight: 1001
    }))
    .pipe(gulp.dest('./fonts/'));
});

// @TODO figure out why separate directory won't work.
gulp.task('sprite', ['optimize-images', 'scss'], function() {
  var spriteData = gulp.src('images/sprite/*.png').pipe(spritesmith({
    retinaSrcFilter: ['images/sprite/*@2x.png'],
    retinaImgName: 'sprite@2x.png',
    imgName: 'sprite.png',
    cssName: '../scss/global/_spritesheet.scss',
  }));

  return spriteData.pipe(gulp.dest('images/'));
});

gulp.task('scsslint', function () {
  return gulp.src('scss/**/*.scss')
    .pipe(scsslint({
      options: {
        configFile: 'sass-lint.yml'
      }
    }))
    .pipe(scsslint.format())
    .pipe(scsslint.failOnError())
});

gulp.task('jshint', function() { // @todo set up custom settings for this
  gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('scss/**/*.scss', ['scss']);
  gulp.watch('js/*.js', ['jshint']);
});

gulp.task('icons', ['optimize-images', 'iconfont', 'scss']);
gulp.task('default', ['scss', 'watch']);
