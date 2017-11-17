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

const groundCategory = 0x0001;
const playerCategory = 0x0002;
const basicFireCategory = 0x0004;
const bulletCollisionLayer = 0x0008;

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    engine = Matter.Engine.create();
    world = engine.world;

    Matter.Events.on(engine, 'collisionStart', collisionEvent);

    for (let i = 25; i < width; i += 200) {
        let randomValue = random(100, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 100, randomValue, world));
    }
    // grounds.push(new Ground(width / 2, height - 10, width, 20, world));
    // grounds.push(new Ground(10, height - 170, 20, 300, world));
    // grounds.push(new Ground(width - 10, height - 170, 20, 300, world));

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
        element.update(keyStates, grounds);
    });

    fill(255);
    textSize(30);
    text(`${round(frameRate())}`, width - 75, 50)
}

function keyPressed() {
    if (keyCode in keyStates)
        keyStates[keyCode] = true;
}

function keyReleased() {
    if (keyCode in keyStates)
        keyStates[keyCode] = false;
}

function collisionEvent(event) {
    for (let i = 0; i < event.pairs.length; i++) {
        let labelA = event.pairs[i].bodyA.label;
        let labelB = event.pairs[i].bodyB.label;

        if (labelA === 'basicFire' && labelB === 'staticGround') {
            event.pairs[i].bodyA.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            }
        } else if (labelB === 'basicFire' && labelA === 'staticGround') {
            event.pairs[i].bodyB.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            }
        } else if (labelA === 'player' && labelB === 'staticGround') {
            event.pairs[i].bodyA.grounded = true;
            event.pairs[i].bodyA.currentJumpNumber = 0;
        } else if (labelB === 'player' && labelA === 'staticGround') {
            event.pairs[i].bodyB.currentJumpNumber = 0;
        }
    }
}