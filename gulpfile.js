let webpackConfig = require('./webpack.config.js'),
    gulp = require('gulp'),
    webpack = require("webpack"),
    browserSync = require('browser-sync').create();

let myConfig = Object.create(webpackConfig),
    reload      = browserSync.reload;

let path = {
    baseDir: './',
    js: 'src/**/*.js',
    html:'index.html'
};
gulp.task('default', ['webpack', 'serve', 'watch']);

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: path.baseDir
        }
    });
});

gulp.task('watch', function () {
    gulp.watch([
        path.js,
        path.html,
    ], ['webpack', reload], reload);
});

gulp.task("webpack", function(callback) {
    webpack(myConfig, function(err, stats) {
        callback();
    });
});
