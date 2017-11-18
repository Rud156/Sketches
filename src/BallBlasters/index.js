/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />

let engine;
let world;

let grounds = [];
let players = [];
let explosions = [];
let minForceMagnitude = 20;

const playerKeys = [
    [37, 39, 38, 40, 13, 32],
    [65, 68, 87, 83, 49, 50]
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
    49: false, // 1
    50: false // 2
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

    // for (let i = 0; i < width; i += width) {
    //     let randomValue = random(100, 300);
    //     grounds.push(new Ground(width / 2, height - randomValue / 2, width, randomValue, world));
    // }

    for (let i = 25; i < width; i += 250) {
        let randomValue = random(100, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 200, randomValue, world));
    }

    for (let i = 0; i < 2; i++) {
        if (!grounds[i])
            break;

        players.push(new Player(grounds[i].body.position.x, 0, world));
        players[i].setControlKeys(playerKeys[i]);
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

    for (let i = 0; i < explosions.length; i++) {
        explosions[i].show();
        explosions[i].update();

        if (explosions[i].isComplete()) {
            explosions.splice(i, 1);
            i -= 1;
        }
    }

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

function damagePlayerBasic(player, basicFire) {
    player.damageLevel += basicFire.damageAmount;

    basicFire.damagedPlayer = true;
    basicFire.collisionFilter = {
        category: bulletCollisionLayer,
        mask: groundCategory
    };

    let bulletPos = createVector(basicFire.position.x, basicFire.position.y);
    let playerPos = createVector(player.position.x, player.position.y);

    let directionVector = p5.Vector.sub(playerPos, bulletPos);
    directionVector.setMag(minForceMagnitude * player.damageLevel);

    Matter.Body.applyForce(player, player.position, {
        x: directionVector.x,
        y: directionVector.y
    });

    explosions.push(new Explosion(basicFire.position.x, basicFire.position.y, 10));
}

function collisionEvent(event) {
    for (let i = 0; i < event.pairs.length; i++) {
        let labelA = event.pairs[i].bodyA.label;
        let labelB = event.pairs[i].bodyB.label;

        if (labelA === 'basicFire' && (labelB.match(/^(staticGround|fakeBottomPart)$/))) {
            event.pairs[i].bodyA.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        } else if (labelB === 'basicFire' && (labelA.match(/^(staticGround|fakeBottomPart)$/))) {
            event.pairs[i].bodyB.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        }

        if (labelA === 'player' && labelB === 'staticGround') {
            event.pairs[i].bodyA.grounded = true;
            event.pairs[i].bodyA.currentJumpNumber = 0;
        } else if (labelB === 'player' && labelA === 'staticGround') {
            event.pairs[i].bodyB.grounded = true;
            event.pairs[i].bodyB.currentJumpNumber = 0;
        }

        if (labelA === 'player' && labelB === 'basicFire') {
            let basicFire = event.pairs[i].bodyB;
            let player = event.pairs[i].bodyA;
            damagePlayerBasic(player, basicFire);
        } else if (labelB === 'player' && labelA === 'basicFire') {
            let basicFire = event.pairs[i].bodyA;
            let player = event.pairs[i].bodyB;
            damagePlayerBasic(player, basicFire);
        }
    }
}