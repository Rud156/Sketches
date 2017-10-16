let gulp = require('gulp');
let babel = require('gulp-babel');
let browserSync = require('browser-sync').create();

gulp.task('default', ['serve', 'scripts'], () => {
    gulp.watch(['src/**/*.js'], ['scripts']);
    gulp.watch(['index.html']).on('change', browserSync.reload);
    gulp.watch(['css/*.css']).on('change', browserSync.reload);
});

gulp.task('scripts', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('lib'))
        .pipe(browserSync.reload({
            stream: true
        }));
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