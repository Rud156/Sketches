/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />

const playerKeys = [
    [65, 68, 87, 83, 84, 89],
    [37, 39, 38, 40, 17, 32]
];

const keyStates = {
    32: false, // SPACE
    17: false, // CTRL
    37: false, // LEFT
    38: false, // UP
    39: false, // RIGHT
    40: false, // DOWN
    87: false, // W
    65: false, // A
    83: false, // S
    68: false, // D
    84: false, // T
    89: false // Y
};

const groundCategory = 0x0001;
const playerCategory = 0x0002;
const basicFireCategory = 0x0004;
const bulletCollisionLayer = 0x0008;
const flagCategory = 0x0016;
const displayTime = 120;

let gameManager = null;
let endTime;
let seconds = 6;
let displayTextFor = displayTime;
let displayStartFor = displayTime;

let sceneCount = 0;
let explosions = [];

let button;
let buttonDisplayed = false;

let backgroundAudio;
let fireAudio;
let explosionAudio;

let divElement;

function preload() {
    divElement = document.createElement('div');
    divElement.style.fontSize = '100px';
    divElement.id = 'loadingDiv';
    divElement.className = 'justify-horizontal';
    document.body.appendChild(divElement);

    // backgroundAudio = loadSound('https://freesound.org/data/previews/155/155139_2098884-lq.mp3', successLoad, failLoad, whileLoading);
    // fireAudio = loadSound('https://freesound.org/data/previews/270/270335_5123851-lq.mp3', successLoad, failLoad);
    // explosionAudio = loadSound('https://freesound.org/data/previews/386/386862_6891102-lq.mp3', successLoad, failLoad);

    backgroundAudio = loadSound('/assets/audio/Background.mp3', successLoad, failLoad, whileLoading);
    fireAudio = loadSound('/assets/audio/Shoot.mp3', successLoad, failLoad);
    explosionAudio = loadSound('/assets/audio/Explosion.mp3', successLoad, failLoad);
}

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    button = createButton('Play');
    button.position(width / 2 - 62, height / 1.6);
    button.elt.className = 'button pulse';
    button.elt.style.display = 'none';
    button.mousePressed(resetGame);

    backgroundAudio.setVolume(0.05);
    backgroundAudio.play();
    backgroundAudio.loop();

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0);
    if (sceneCount === 0) {
        textStyle(BOLD);
        textSize(50);
        noStroke();
        fill(color(`hsl(${int(random(359))}, 100%, 50%)`));
        text('BALL BLASTERS', width / 2 + 10, 50);
        fill(255);
        textSize(30);
        text('ARROW KEYS to move, SPACE to jump and CTRL to fire for Player 1', width / 2, height / 4);
        text('WASD to move, Y to jump and T to fire for Player 2', width / 2, height / 2.75);
        fill(color(`hsl(${int(random(359))}, 100%, 50%)`));
        text('Destroy your opponent or capture their crystal to win', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Play Game';
            buttonDisplayed = true;
        }
    } else if (sceneCount === 1) {
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

        if (displayStartFor > 0) {
            displayStartFor -= 1 * 60 / formattedFrameRate();
            fill(255);
            textSize(100);
            text(`FIGHT`, width / 2, height / 2);
        }

        if (gameManager.gameEnded) {
            if (gameManager.playerWon.length === 1) {
                if (gameManager.playerWon[0] === 0) {
                    fill(255);
                    textSize(100);
                    text(`Player 1 Won`, width / 2, height / 2 - 100);
                } else if (gameManager.playerWon[0] === 1) {
                    fill(255);
                    textSize(100);
                    text(`Player 2 Won`, width / 2, height / 2 - 100);
                }
            } else if (gameManager.playerWon.length === 2) {
                fill(255);
                textSize(100);
                text(`Draw`, width / 2, height / 2 - 100);
            }

            let randomValue = random();
            if (randomValue < 0.1) {
                explosions.push(
                    new Explosion(
                        random(0, width),
                        random(0, height),
                        random(0, 10),
                        90,
                        200
                    )
                );
                explosionAudio.play();
            }

            for (let i = 0; i < explosions.length; i++) {
                explosions[i].show();
                explosions[i].update();

                if (explosions[i].isComplete()) {
                    explosions.splice(i, 1);
                    i -= 1;
                }
            }

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                button.elt.innerText = 'Replay';
                buttonDisplayed = true;
            }
        }
    } else {

    }
}

function resetGame() {
    sceneCount = 1;
    seconds = 6;
    displayTextFor = displayTime;
    displayStartFor = displayTime;
    buttonDisplayed = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';

    explosions = [];

    gameManager = new GameManager();
    window.setTimeout(() => {
        gameManager.createFlags();
    }, 5000);

    let currentDateTime = new Date();
    endTime = new Date(currentDateTime.getTime() + 6000).getTime();
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

function failLoad() {
    divElement.innerText = 'Unable to load the sound. Please try refreshing the page';
}

function successLoad() {
    console.log('All Sounds Loaded Properly');
    divElement.style.display = 'none';
}

function whileLoading(value) {
    divElement.innerText = `${value * 100} %`;
}