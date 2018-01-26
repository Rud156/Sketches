import Ball from './Ball';
import Paddle from './Paddle';

let paddles = [];
let ball;
let keys = {
    87: false, // W
    83: false, // S
    38: false, // Up,
    40: false // Down
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    rectMode(CENTER);
    ellipseMode(CENTER);

    paddles.push(new Paddle(7, height / 2, 10, 100, 87, 83));
    paddles.push(new Paddle(width - 7, height / 2, 10, 100, 38, 40));
    ball = new Ball(width / 2, height / 2, 10);
}

function draw() {
    background(0);

    for (let paddle of paddles) {
        paddle.draw();
        paddle.update(keys);
    }

    ball.draw();
    ball.update();
}

function keyPressed(fxn) {
    let { keyCode } = fxn;
    if (keyCode in keys) keys[keyCode] = true;
    return false;
}

function keyReleased(fxn) {
    let { keyCode } = fxn;
    if (keyCode in keys) keys[keyCode] = false;
    return false;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.keyReleased = keyReleased;
