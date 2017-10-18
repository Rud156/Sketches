let gulp = require('gulp');
let babel = require('gulp-babel');
let browserSync = require('browser-sync').create();
let sourceMaps = require('gulp-sourcemaps');
let concat = require('gulp-concat');
let plumber = require('gulp-plumber');
let notify = require('gulp-notify');
let gutil = require('gulp-util');

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './',
            index: 'index.html'
        },
        open: false,
        logLevel: 'debug',
        online: false
    });
});


gulp.task('starfield', ['serve', 'starFieldHelper'], () => {
    gulp.watch(['index.html']).on('change', browserSync.reload);
    gulp.watch(['css/*.css']).on('change', browserSync.reload);
    gulp.watch(['src/Starfield/*.js'], ['starFieldHelper']);
});
gulp.task('starFieldHelper', () => {
    return gulp.src([
            'src/Starfield/star.js',
            'src/Starfield/music-handler.js',
            'src/Starfield/index.js'
        ])
        .pipe(plumber({
            errorHandler: (error) => {
                notify.onError({
                    title: 'Gulp error in ' + error.plugin,
                    message: error.toString()
                })(error);
                gutil.beep();
            }
        }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourceMaps.init())
        .pipe(concat('bundle.js'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('lib'))
        .pipe(browserSync.reload({
            stream: true
        }));
});