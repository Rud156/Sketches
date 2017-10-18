/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />
/// <reference path="./utility.js" />

let stars = [];
let starBurst = [];
let musicHandler = new MusicHandler();
let utility = new Utility();
let audio = document.getElementById('audio');

const sampleSize = 1024;
let audioContext = new AudioContext();
let analyzer = audioContext.createAnalyser();
analyzer.fftSize = sampleSize;
let bufferLength = analyzer.frequencyBinCount;
let dataArray = new Float32Array(bufferLength);
let source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

let sensitivity = (-0.0025714 * 0) + 1.5142857; // TODO: Make some formula for the beats
let historyBuffer = [];

let inputFile = document.getElementById('media-input');
let mediaInputButton = document.getElementById('media-input-button');
let mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', () => {
    inputFile.click();
});
inputFile.addEventListener('change', (event) => {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

let createStarBurst = () => {
    let angleChange = 3.6;
    for (let i = 0; i < 100; i++) {
        starBurst.push(new Star(
            false,
            false,
            10 * cos(angleChange),
            10 * sin(angleChange),
            random(width / 2),
            20
        ));
        angleChange += 3.6;
    }
};


let buildAudioGraph = () => {
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

let visualize = () => {
    analyzer.getFloatTimeDomainData(dataArray);
    let instantSpec = utility.calcSumSquareStereo(dataArray);
    let averageSpec = (sampleSize / historyBuffer.length) * utility.calcSumSquareStereo(historyBuffer);
    let variance = utility.calcVariance(historyBuffer, averageSpec);

    sensitivity = (-0.0025714 * variance) + 1.5142857;
    historyBuffer = utility.shiftBuffer(historyBuffer, instantSpec);

    if (instantSpec > sensitivity * averageSpec)
        createStarBurst();
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (let i = 0; i < 500; i++)
        stars.push(new Star(true, true));

    for (let i = 0; i < 43; i++)
        historyBuffer.push(0);
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(element => {
        element.update();
        element.show();
    });

    starBurst.forEach(element => {
        element.show();
        element.update();
    });

    for (let i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }

    visualize();
}