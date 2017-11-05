/// <reference path="./star.js" />

let stars = [];

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    for (let i = 0; i < 500; i++)
        stars.push(new Star(
            random(-width / 2, width / 2),
            random(-height / 2, height / 2),
            random(0, width / 2),
            random(2, 20)
        ));
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    for (let i = 0; i < stars.length; i++) {
        stars[i].show();
        stars[i].update();
        stars[i].reset();
        stars[i].setSpeed();
    }
}