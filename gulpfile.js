const gulp = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gutil = require('gulp-util');
const lazypipe = require('lazypipe');

let processJS = lazypipe()
    .pipe(plumber, {
        errorHandler: (error) => {
            notify.onError({
                title: 'Gulp error in ' + error.plugin,
                message: error.message
            })(error);
            gutil.beep();
            console.log(gutil.colors.red(error.message));
            console.log(error.codeFrame);
        }
    })
    .pipe(babel, {
        presets: ['env'],
        highlightCode: true
    })
    .pipe(sourceMaps.init)
    .pipe(concat, 'bundle.js')
    .pipe(sourceMaps.write)
    .pipe(gulp.dest, 'lib')
    .pipe(browserSync.reload, {
        stream: true
    });

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

gulp.task('general', () => {
    gulp.watch(['index.html']).on('change', browserSync.reload);
    gulp.watch(['css/*.css']).on('change', browserSync.reload);
});

gulp.task('starfield', ['serve', 'general', 'starFieldHelper'], () => {
    gulp.watch(['src/Starfield/*.js'], ['starFieldHelper']);
});
gulp.task('starFieldHelper', () => {
    return gulp.src([
            'src/Starfield/utility.js',
            'src/Starfield/star.js',
            'src/Starfield/music-handler.js',
            'src/Starfield/index.js'
        ])
        .pipe(processJS());
});

gulp.task('spaceInvaders', ['serve', 'general', 'spaceInvadersHelper'], () => {
    gulp.watch(['src/SpaceInvaders/*.js'], ['spaceInvadersHelper']);
});
gulp.task('spaceInvadersHelper', () => {
    return gulp.src([
            'src/SpaceInvaders/bullet.js',
            'src/SpaceInvaders/space-ship.js',
            'src/SpaceInvaders/enemy.js',
            'src/SpaceInvaders/index.js'
        ])
        .pipe(processJS());
});