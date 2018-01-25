const rollup = require('rollup');
const babelRollup = require('rollup-plugin-babel');
const commonJS = require('rollup-plugin-commonjs');
const notifier = require('node-notifier');
const chalk = require('chalk');
const beeper = require('beeper');

let rollupProcessJs = (inputFile, filePath) => {
    return rollup.rollup({
        input: `${filePath}${inputFile}`,
        treeshake: false,
        plugins: [
            commonJS(),
            babelRollup({
                exclude: 'node_modules/**',
                babelrc: false,
                presets: [
                    [
                        'env',
                        {
                            modules: false
                        }
                    ]
                ],
                plugins: ['external-helpers']
            })
        ]
    });
};

let rollupWriteBundle = async bundle => {
    await bundle.write({
        file: './lib/bundle.js',
        format: 'umd',
        name: 'library',
        sourcemap: true
    });
};

let handleError = error => {
    notifier.notify({
        title: `Gulp error in line ${error.loc.line}, positon ${error.pos}`,
        message: `${error}`
    });
    beeper();
    console.log(chalk.default.cyan(error));
    console.log(chalk.default.red(error.code));
};

gulp.task('powerPong', ['serve', 'general', 'powerPongHelper'], () => {
    let target = gulp.src('./index.html');
    let sources = gulp.src([
        './js/p5.min.js',
        './js/p5.dom.min.js',
        './js/p5.sound.min.js',
        './js/matter.js'
    ]);
    target.pipe(inject(sources)).pipe(gulp.dest('lib'));

    gulp.watch(['src/PowerPong/*.js'], ['powerPongHelper']);
});
gulp.task('powerPongHelper', async () => {
    try {
        const bundle = await rollupProcessJs('index.js', './src/PowerPong/');
        await rollupWriteBundle(bundle);
    } catch (error) {
        handleError(error);
    }
});
