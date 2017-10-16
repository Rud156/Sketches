/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

let stars = [];
let starBurst = [];
let audio = document.getElementById('audio');
let inputFile = document.getElementById('media-input');
let mediaInputButton = document.getElementById('media-input-button');
let mediaHolder = document.getElementById('media-holder');
mediaInputButton.addEventListener('click', () => {
    inputFile.click();
});

let createStarBurst = () => {
    for (let i = 0; i < 100; i++) {
        starBurst.push(new Star(
            false,
            false,
            random(-10, 10),
            random(-10, 10),
            random(width / 2),
            20
        ));
    }
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (let i = 0; i < 500; i++)
        stars.push(new Star(true, true));
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(element => {
        element.update();
        element.show();
        // if (mouseX >= 0 && mouseX <= width)
        //     element.setSpeed();
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
}