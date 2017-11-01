/// <reference path="./bullet.js" />
/// <reference path="./explosion.js" />
/// <reference path="./space-ship.js" />
/// <reference path="./enemy.js" />

let spaceShip;
let bullets = [];
let enemies = [];
const minFrameWaitCount = 7;
let waitFrameCount = minFrameWaitCount;


function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    spaceShip = new SpaceShip(255);
    for (let i = 0; i < 1; i++) {
        enemies.push(
            new Enemy(
                random(0, width),
                random(0, width),
                random(0, height / 2),
                45
            )
        );
    }
}

function draw() {
    background(0);
    rectMode(CENTER);
    if (!keyIsDown(32))
        waitFrameCount = minFrameWaitCount;

    spaceShip.show();
    if (keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW)) { /* Do nothing */ } else {
        if (keyIsDown(LEFT_ARROW)) {
            spaceShip.moveShip('LEFT');
        } else if (keyIsDown(RIGHT_ARROW)) {
            spaceShip.moveShip('RIGHT');
        }
    }

    if (keyIsDown(32)) {
        if (waitFrameCount === minFrameWaitCount)
            bullets.push(new Bullet(
                spaceShip.prevX,
                height - 2 * spaceShip.baseHeight - 15,
                spaceShip.baseWidth / 10,
                true
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

    enemies.forEach(element => {
        element.show();
        element.checkArrival();
        element.update();
        element.checkPlayerDistance(spaceShip.position);
    });

    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j].pointIsInside([bullets[i].x, bullets[i].y])) {
                let enemyDead = enemies[j].takeDamageAndCheckDeath();
                if (enemyDead) {
                    enemies.splice(j, 1);
                    j -= 1;
                }
                bullets.splice(i, 1);
                i = i === 0 ? 0 : i - 1;
            }
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        for (let j = 0; j < enemies[i].bullets.length; j++) {
            if (spaceShip.pointIsInside([enemies[i].bullets[j].x, enemies[i].bullets[j].y])) {
                enemies[i].bullets.splice(j, 1);
                spaceShip.decreaseHealth();

                j -= 1;
            }
        }
    }
}