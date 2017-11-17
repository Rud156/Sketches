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

    Matter.Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(element => {
            let labelA = element.bodyA.label;
            let labelB = element.bodyB.label;

            if (labelA === 'basicFire' && labelB === 'staticGround') {

            } else if (labelB === 'basicFire' && labelA === 'staticGround') {

            }
        });
    });


    for (let i = 25; i < width; i += 200) {
        let randomValue = random(10, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 100, randomValue, world));
    }

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