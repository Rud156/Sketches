const gulp = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gutil = require('gulp-util');
const lazypipe = require('lazypipe');
const inject = require('gulp-inject');

let processJS = lazypipe()
    .pipe(plumber, {
        errorHandler: (error) => {
            notify.onError({
                title: 'Gulp error in ' + error.plugin,
                message: error.message
            })(error);
            gutil.beep();
            gutil.log(gutil.colors.cyan(error.message));
            gutil.log(error.codeFrame);
        }
    })
    .pipe(sourceMaps.init)
    .pipe(concat, 'bundle.js')
    .pipe(babel, {
        presets: ['env', 'stage-2'],
        highlightCode: true,
        comments: false
    })
    .pipe(sourceMaps.write)
    .pipe(gulp.dest, 'lib')
    .pipe(browserSync.reload, {
        stream: true
    });

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './',
            index: './lib/index.html'
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
    let target = gulp.src('./index.html');
    let sources = gulp.src(['./js/p5.min.js']);
    target.pipe(inject(sources))
        .pipe(gulp.dest('lib'));

    gulp.watch(['src/Starfield/*.js'], ['starFieldHelper']);
});
gulp.task('starFieldHelper', () => {
    return gulp.src([
            'src/Starfield/star.js',
            'src/Starfield/index.js'
        ])
        .pipe(processJS());
});

gulp.task('spaceInvaders', ['serve', 'general', 'spaceInvadersHelper'], () => {
    let target = gulp.src('./index.html');
    let sources = gulp.src(['./js/p5.min.js', './js/p5.dom.min.js', './js/howler.min.js']);
    target.pipe(inject(sources))
        .pipe(gulp.dest('lib'));

    gulp.watch(['src/SpaceInvaders/*.js'], ['spaceInvadersHelper']);
});
gulp.task('spaceInvadersHelper', () => {
    return gulp.src([
            'src/SpaceInvaders/particle.js',
            'src/SpaceInvaders/bullet.js',
            'src/SpaceInvaders/explosion.js',
            'src/SpaceInvaders/pickups.js',
            'src/SpaceInvaders/space-ship.js',
            'src/SpaceInvaders/enemy.js',
            'src/SpaceInvaders/index.js'
        ])
        .pipe(processJS());
});

gulp.task('pong', ['serve', 'general', 'pongHelper'], () => {
    let target = gulp.src('./index.html');
    let sources = gulp.src(['./js/babylon.min.js']);
    target.pipe(inject(sources))
        .pipe(gulp.dest('lib'));

    gulp.watch(['src/Pong/*.js'], ['pongHelper']);
});
gulp.task('pongHelper', () => {
    return gulp.src([
            'src/Pong/game-manager.js',
            'src/Pong/ball.js',
            'src/Pong/paddle.js',
            'src/Pong/index.js'
        ])
        .pipe(processJS());
});

gulp.task('ballBlasters', ['serve', 'general', 'ballHelper'], () => {
    let target = gulp.src('./index.html');
    let sources = gulp.src(['./js/p5.min.js', './js/p5.dom.min.js', './js/p5.sound.min.js', './js/matter.js']);
    target.pipe(inject(sources))
        .pipe(gulp.dest('lib'));

    gulp.watch(['src/BallBlasters/*.js'], ['ballHelper']);
});
gulp.task('ballHelper', () => {
    return gulp.src([
            'src/BallBlasters/object-collect.js',
            'src/BallBlasters/particle.js',
            'src/BallBlasters/explosion.js',
            'src/BallBlasters/basic-fire.js',
            'src/BallBlasters/platform.js',
            'src/BallBlasters/ground.js',
            'src/BallBlasters/player.js',
            'src/BallBlasters/game-manager.js',
            'src/BallBlasters/index.js'
        ])
        .pipe(processJS());
});