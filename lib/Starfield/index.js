'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

var stars = [];
var starBurst = [];
var audio = document.getElementById('audio');
var inputFile = document.getElementById('media-input');
var mediaInputButton = document.getElementById('media-input-button');
var mediaHolder = document.getElementById('media-holder');
mediaInputButton.addEventListener('click', function () {
    inputFile.click();
});

var createStarBurst = function createStarBurst() {
    for (var i = 0; i < 100; i++) {
        starBurst.push(new Star(false, false, random(-10, 10), random(-10, 10), random(width / 2), 20));
    }
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
}