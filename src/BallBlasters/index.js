/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />

let engine;
let world;

let grounds = [];
let players = [];

const keyStates = {
    32: false, // SPACE
    37: false, // LEFT
    38: false, // UP
    39: false, // RIGHT
    40: false, // DOWN
    87: false, // W
    65: false, // A
    83: false, // S
    68: false, // D
    13: false
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    engine = Matter.Engine.create();
    world = engine.world;

    grounds.push(new Ground(width / 2, height - 10, width, 20, world));
    grounds.push(new Ground(10, height - 170, 20, 300, world));
    grounds.push(new Ground(width - 10, height - 170, 20, 300, world));


    for (let i = 0; i < 1; i++) {
        players.push(new Player(width / 2, height / 2, 20, world));
    }

    rectMode(CENTER);
}

function draw() {
    background(0);
    Matter.Engine.update(engine);

    grounds.forEach(element => {
        element.show();
    });
    players.forEach(element => {
        element.show();
        element.update(keyStates, grounds[0]);
    });
}

function keyPressed() {
    if (keyCode in keyStates)
        keyStates[keyCode] = true;
}

function keyReleased() {
    if (keyCode in keyStates)
        keyStates[keyCode] = false;
}