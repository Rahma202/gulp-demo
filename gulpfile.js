const gulp = require("gulp");
const { src, dest, watch, parallel, series } = require("gulp")
var inject = require('gulp-inject');

// var rewriteImagePath = require('gulp-rewrite-image-path');
var rep = require('gulp-replace-image-src');

var globs={
  html:"project/*.html",
  css:"project/css/**/*.css",
  img:'project/pics/*',
  js:'project/js/**/*.js'
}

//minify images and copy it to dist folder
const imagemin = require('gulp-imagemin');
//don't forget to install gulp-imagemin with version 7.1.0
function imgMinify() {
    return gulp.src(globs.img)
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
}

//run image task by 'gulp' commond
//  exports.default = imgMinify
//  or
//run image task by 'gulp imgMinify' commond
exports.img = imgMinify

//creating dist folder and copy html files to it

const htmlmin = require('gulp-htmlmin');
function minifyHTML() {
  return src(globs.html)
  
  .pipe(inject(src('./dist/assets/css/style.min.css')))
  .pipe(inject(src('./dist/assets/js/all.min.js')))
  .pipe(rep({
    prependSrc : '/dist/images/',
    keepOrigin : false
  }))
  // .pipe(rewriteImagePath({path:"dist/images"}))
  // .pipe(rewriteImagePath({path:"./dist/images/gulp.jpg"}),rewriteImagePath)
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest('dist'))
}

exports.html = minifyHTML

//minify js files and copy it to dist folder
const concat = require('gulp-concat');
const terser = require('gulp-terser');

function jsMinify() {
  //search for sourcemaps
    return src(globs.js,{sourcemaps:true}) //path includeing all js files in all folders
    
        //concate all js files in all.min.js
        .pipe(concat('all.min.js'))
        //use terser to minify js files
        .pipe(terser())
        //create source map file in the same directory
        .pipe(dest('dist/assets/js',{sourcemaps:'.'}))
}
exports.js = jsMinify

//minify css files and copy it to dist folder

var cleanCss = require('gulp-clean-css');
function cssMinify() {
    return src(globs.css)

        .pipe(concat('style.min.css'))
        .pipe(cleanCss())
        .pipe(dest('dist/assets/css'))

}
exports.css = cssMinify

var browserSync = require('browser-sync');
function serve (cb){
  browserSync({
    server: {
      baseDir: 'dist/'
    }
  });
  cb()
}

function reloadTask(done) {
  browserSync.reload()
  done()
}

//watch task
function watchTask() {
    watch(globs.html,series(minifyHTML, reloadTask))
    watch(globs.js,series(jsMinify, reloadTask))
    watch(globs.css, series(cssMinify,reloadTask));
    watch(globs.img, series(imgMinify,reloadTask));
}
exports.default = series( parallel(imgMinify, jsMinify, cssMinify, minifyHTML), serve , watchTask)



// gulp.task('inject_rev', function () {
//     var target = gulp.src('/dist/index.html');
//     var sources = gulp.src(['webapp/dist/somefolder/*.js',], {read: false});

//     return target.pipe(inject(sources))
//         .pipe(gulp.dest('webapp/dist/somefolder/'));
// });


