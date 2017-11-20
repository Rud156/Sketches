/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />

const playerKeys = [
    [37, 39, 38, 40, 13, 32],
    [65, 68, 87, 83, 90, 88]
];

const keyStates = {
    13: false, // ENTER
    32: false, // SPACE
    37: false, // LEFT
    38: false, // UP
    39: false, // RIGHT
    40: false, // DOWN
    87: false, // W
    65: false, // A
    83: false, // S
    68: false, // D
    90: false, // Z
    88: false // X
};

const groundCategory = 0x0001;
const playerCategory = 0x0002;
const basicFireCategory = 0x0004;
const bulletCollisionLayer = 0x0008;

let gameManager;

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    gameManager = new GameManager();

    rectMode(CENTER);
}

function draw() {
    background(0);

    gameManager.draw();

    fill(255);
    textSize(30);
    text(`${round(frameRate())}`, width - 75, 50)
}

function keyPressed() {
    if (keyCode in keyStates)
        keyStates[keyCode] = true;

    return false;
}

function keyReleased() {
    if (keyCode in keyStates)
        keyStates[keyCode] = false;

    return false;
}