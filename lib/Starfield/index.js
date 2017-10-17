'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var audio = document.getElementById('audio');

var audioContext = new AudioContext();
// let leftAnalyzer = audioContext.createAnalyser();
// let rightAnalyzer = audioContext.createAnalyser();
var analyzer = audioContext.createAnalyser();
analyzer.smoothingTimeConstant = 0.3;
analyzer.fftSize = 1024;
// let leftBufferLength = leftAnalyzer.frequencyBinCount;
// let rightBufferLength = rightAnalyzer.frequencyBinCount;
var bufferLength = analyzer.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

var sensitivity = 1.1;
var previousValue = 0;

var inputFile = document.getElementById('media-input');
var mediaInputButton = document.getElementById('media-input-button');
var mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', function () {
    inputFile.click();
});
inputFile.addEventListener('change', function (event) {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

var createStarBurst = function createStarBurst() {
    var angleChange = 3.6;
    for (var i = 0; i < 100; i++) {
        starBurst.push(new Star(false, false, 10 * cos(angleChange), 10 * sin(angleChange), random(width / 2), 20));
        angleChange += 3.6;
    }
};
var calcSumSquaredValue = function calcSumSquaredValue(valueArray) {
    var sum = 0;
    for (var i = 0; i < valueArray.length; i++) {
        sum += pow(valueArray[i], 2);
    }return sum / valueArray.length;
};
var buildAudioGraph = function buildAudioGraph() {
    console.log(musicHandler.getFile().type);
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

var visualize = function visualize() {
    analyzer.getByteFrequencyData(dataArray);
    var currentValue = calcSumSquaredValue(dataArray);

    if (currentValue > sensitivity * previousValue) createStarBurst();
    previousValue = currentValue;
};

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (var i = 0; i < 500; i++) {
        stars.push(new Star(true, true));
    }
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(function (element) {
        element.update();
        element.show();
        // if (mouseX >= 0 && mouseX <= width)
        //     element.setSpeed();
    });

    starBurst.forEach(function (element) {
        element.show();
        element.update();
    });

    for (var i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }

    visualize();
}

// function mousePressed() {
//     createStarBurst();
// }