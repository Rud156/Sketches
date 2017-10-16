'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var audio = document.getElementById('audio');

var audioContext = new AudioContext();
var analyzer = audioContext.createAnalyser();
analyzer.fftSize = 1024;
analyzer.connect(audioContext.destination);
var bufferLength = analyzer.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);

var sensitivity = 1.3;
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
    for (var i = 0; i < 100; i++) {
        starBurst.push(new Star(false, false, random(-10, 10), random(-10, 10), random(width / 2), 20));
    }
};

var getSumSquaredValue = function getSumSquaredValue(dataArray) {
    var sum = 0;
    for (var i = 0; i < dataArray.length; i++) {
        sum += Math.pow(dataArray[i], 2);
    }return sum;
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
    analyzer.getByteFrequencyData(dataArray);
    var currentValue = getSumSquaredValue(dataArray);
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

    if (source !== null) visualize();
}