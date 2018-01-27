import GameManager from './GameManager';
import { BASE_URL } from './config';

let keys = {
    87: false, // W
    83: false, // S
    38: false, // Up,
    40: false, // Down
    32: false // Space
};

let gameManager;
let socket = io(BASE_URL);

function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent('canvas-holder');

    rectMode(CENTER);
    ellipseMode(CENTER);

    gameManager = new GameManager(socket);
}

function draw() {
    background(0);

    gameManager.draw(keys);
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
