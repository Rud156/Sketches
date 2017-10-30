/// <reference path="./space-ship.js" />
/// <reference path="./bullet.js" />
/// <reference path="./enemy.js" />

let spaceShip;
let bullets = [];
let enemies = [];
const minFrameWaitCount = 5;
let waitFrameCount = minFrameWaitCount;

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    spaceShip = new SpaceShip(255);
}

function draw() {
    background(0);
    if (!keyIsDown(32))
        waitFrameCount = minFrameWaitCount;

    spaceShip.show();
    if (keyIsDown(LEFT_ARROW)) {
        spaceShip.moveShip('LEFT');
    }
    if (keyIsDown(RIGHT_ARROW)) {
        spaceShip.moveShip('RIGHT');
    }

    if (keyIsDown(32)) {
        if (waitFrameCount === minFrameWaitCount)
            bullets.push(new Bullet(
                spaceShip.prevX,
                height - 2 * spaceShip.baseHeight - 15
            ));
        waitFrameCount -= (1 * (60 / frameRate()));
    }
    if (waitFrameCount < 0)
        waitFrameCount = minFrameWaitCount;

    bullets.forEach(bullet => {
        bullet.show();
        bullet.update();
    });
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].y < -bullets[i].baseHeight) {
            bullets.splice(i, 1);
            i -= 1;
        }
    }
}