'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var audio = document.getElementById('audio');

var audioContext = new AudioContext();
var leftAnalyzer = audioContext.createAnalyser();
var rightAnalyzer = audioContext.createAnalyser();

var leftBufferLength = leftAnalyzer.frequencyBinCount;
var rightBufferLength = rightAnalyzer.frequencyBinCount;
var leftDataArray = new Uint8Array(leftBufferLength);
var rightDataArray = new Uint8Array(rightBufferLength);

var source = audioContext.createMediaElementSource(audio);
var splitter = audioContext.createChannelSplitter(2);

source.connect(splitter);
splitter.connect(leftAnalyzer, 0);
splitter.connect(rightAnalyzer, 1);

leftAnalyzer.fftSize = 1024;
rightAnalyzer.fftSize = 1024;
leftAnalyzer.connect(audioContext.destination);
rightAnalyzer.connect(audioContext.destination);
// leftAnalyzer.smoothingTimeConstant = 0.3;
// rightAnalyzer.smoothingTimeConstant = 0.3;
// source.connect(audioContext.destination);


var sensitivity = -0.0025714 * 1 + 1.5142857;
var previousValue = 0;
var historyBuffer = [];

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

var calcVariance = function calcVariance(valueArray, olderValue) {
    var sum = 0;
    for (var i = 0; i < valueArray.length; i++) {
        sum += pow(valueArray[i] - olderValue, 2);
    }return sum / valueArray.length;
};

var calcSumSquaredValue = function calcSumSquaredValue(valueArray) {
    var sum = 0;
    for (var i = 0; i < valueArray.length; i++) {
        sum += pow(valueArray[i], 2);
    }return sum / valueArray.length;
};

var sumStereo = function sumStereo(channelLeft, channelRight) {
    var sum = 0;
    for (var i = 0; i < channelLeft.length; i++) {
        sum += pow(channelLeft[i], 2) + pow(channelRight[i], 2);
    }return sum;
};

var sumLocalEnergy = function sumLocalEnergy(valueArray) {
    var sum = 0;
    for (var i = 0; i < valueArray.length; i++) {
        sum += pow(valueArray[i], 2);
    }return sum / valueArray.length;
};

var buildAudioGraph = function buildAudioGraph() {
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

var visualize = function visualize() {
    /*
        analyzer.getByteFrequencyData(dataArray);
        let current = getSumSquaredValue(dataArray);
        sensitivity = 1.3;
    */
    leftAnalyzer.getByteTimeDomainData(leftDataArray);
    rightAnalyzer.getByteTimeDomainData(rightDataArray);

    var energy = sumStereo(leftDataArray, rightDataArray);
    var localEnergy = sumLocalEnergy(historyBuffer);
    var variance = calcVariance(historyBuffer, localEnergy);

    sensitivity = -0.0025714 * variance + 1.5142857;
    historyBuffer.pop();
    historyBuffer.unshift(energy);

    if (energy > sensitivity * localEnergy) createStarBurst();
};

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (var i = 0; i < 500; i++) {
        stars.push(new Star(true, true));
    }for (var _i = 0; _i < 43; _i++) {
        historyBuffer.push(0);
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