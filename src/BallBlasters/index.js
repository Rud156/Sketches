/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />

const playerKeys = [
    [65, 68, 87, 83, 67, 86],
    [37, 39, 38, 40, 13, 32]
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
    86: false, // V
    67: false // C
};

const groundCategory = 0x0001;
const playerCategory = 0x0002;
const basicFireCategory = 0x0004;
const bulletCollisionLayer = 0x0008;
const flagCategory = 0x0016;
const displayTime = 120;


let gameManager;
let endTime;
let seconds = 6;
let displayTextFor = displayTime;
let displayStartFor = displayTime;

let timeoutCalled = false;
let button;
let buttonDisplayed = false;

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    gameManager = new GameManager();
    window.setTimeout(() => {
        gameManager.createFlags();
    }, 5000);

    let currentDateTime = new Date();
    endTime = new Date(currentDateTime.getTime() + 6000).getTime();

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0);

    gameManager.draw();

    if (seconds > 0) {
        let currentTime = new Date().getTime();
        let diff = endTime - currentTime;
        seconds = Math.floor((diff % (1000 * 60)) / 1000);

        fill(255);
        textSize(30);
        text(`Crystals appear in: ${seconds}`, width / 2, 50);
    } else {
        if (displayTextFor > 0) {
            displayTextFor -= 1 * 60 / formattedFrameRate();
            fill(255);
            textSize(30);
            text(`Capture the opponent's base`, width / 2, 50);
        }
    }

    if (gameManager.gameEnded) {
        if (gameManager.playerWon.length === 1) {
            if (gameManager.playerWon[0] === 0) {
                fill(255);
                textSize(100);
                text(`Player 1 Won`, width / 2, height / 2);
            } else if (gameManager.playerWon[0] === 1) {
                fill(255);
                textSize(100);
                text(`Player 2 Won`, width / 2, height / 2);
            }
        } else if (gameManager.playerWon.length === 2) {
            fill(255);
            textSize(100);
            text(`Draw`, width / 2, height / 2);
        }
    }

    if (displayStartFor > 0) {
        displayStartFor -= 1 * 60 / formattedFrameRate();
        fill(255);
        textSize(100);
        text(`FIGHT`, width / 2, height / 2);
    }
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

function formattedFrameRate() {
    return frameRate() <= 0 ? 60 : frameRate();
}