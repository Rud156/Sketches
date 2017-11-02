/// <reference path="./bullet.js" />
/// <reference path="./explosion.js" />
/// <reference path="./space-ship.js" />
/// <reference path="./enemy.js" />

let spaceShip;
let spaceShipDestroyed = false;
let bullets = [];
let enemies = [];
let explosions = [];
const minFrameWaitCount = 7;
let waitFrameCount = minFrameWaitCount;

let currentLevelCount = 1;
let maxLevelCount = 7;
let timeoutCalled = false;
let button;
let buttonDisplayed = false;


function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    button = createButton('Replay!');
    button.position(width / 2 - 62, height / 2 + 30);
    button.elt.className = 'pulse';
    button.elt.style.display = 'none';
    button.mousePressed(resetGame);

    spaceShip = new SpaceShip(255);

    textAlign(CENTER);
    rectMode(CENTER);
}

function draw() {
    background(0);
    if (!keyIsDown(32))
        waitFrameCount = minFrameWaitCount;

    if (keyIsDown(71) && keyIsDown(79) && keyIsDown(68))
        spaceShip.activateGodMode();

    if (spaceShip.isDestroyed()) {
        if (!spaceShipDestroyed) {
            explosions.push(
                new Explosion(
                    spaceShip.position.x,
                    spaceShip.position.y,
                    spaceShip.baseWidth
                )
            );
            spaceShipDestroyed = true;
        }

        for (let i = 0; i < enemies.length; i++) {
            explosions.push(
                new Explosion(
                    enemies[i].position.x,
                    enemies[i].position.y,
                    (enemies[i].baseWidth * 7) / 45
                )
            );
            enemies.splice(i, 1);
            i -= 1;
        }

        textSize(27);
        noStroke();
        fill(255, 0, 0);
        text('You Are Dead', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            buttonDisplayed = true;
        }

    } else {
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

    for (let i = 0; i < explosions.length; i++) {
        explosions[i].show();
        explosions[i].update();

        if (explosions[i].explosionComplete()) {
            explosions.splice(i, 1);
            i -= 1;
        }
    }

    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j].pointIsInside([bullets[i].x, bullets[i].y])) {
                let enemyDead = enemies[j].takeDamageAndCheckDeath();
                if (enemyDead) {
                    explosions.push(
                        new Explosion(
                            enemies[j].position.x,
                            enemies[j].position.y,
                            (enemies[j].baseWidth * 7) / 45
                        )
                    );
                    if (enemies[j].baseWidth > 100) {
                        enemies.push(
                            new Enemy(
                                enemies[j].position.x,
                                enemies[j].position.y,
                                enemies[j].baseWidth / 2
                            )
                        );
                        enemies.push(
                            new Enemy(
                                enemies[j].position.x,
                                enemies[j].position.y,
                                enemies[j].baseWidth / 2
                            )
                        );

                    }


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
            // FixMe: Check bullet undefined
            if (enemies[i].bullets[j])
                if (spaceShip.pointIsInside([enemies[i].bullets[j].x, enemies[i].bullets[j].y])) {
                    spaceShip.decreaseHealth(2 * enemies[i].bullets[j].baseWidth / 10);
                    enemies[i].bullets.splice(j, 1);

                    j -= 1;
                }
        }
    }

    if (spaceShip.GodMode) {
        textSize(27);
        noStroke();
        fill(255);
        text('God Mode', width - 80, height - 30);
    }

    if (enemies.length === 0 && !spaceShipDestroyed) {
        textSize(27);
        noStroke();
        fill(255);
        if (currentLevelCount <= maxLevelCount) {
            text(`Loading Level ${currentLevelCount}`, width / 2, height / 2);
            if (!timeoutCalled) {
                window.setTimeout(incrementLevel, 3000);
                timeoutCalled = true;
            }
        } else {
            textSize(27);
            noStroke();
            fill(0, 255, 0);
            text('Congratulations you won the game!!!', width / 2, height / 2);
            let randomValue = random();
            if (randomValue < 0.1)
                explosions.push(
                    new Explosion(
                        random(0, width),
                        random(0, height),
                        random(0, 10)
                    )
                );

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                buttonDisplayed = true;
            }
        }
    }
}

function incrementLevel() {
    let i;
    switch (currentLevelCount) {
        case 1:
            enemies.push(
                new Enemy(
                    random(0, width), -30,
                    random(45, 70)
                )
            );
            break;
        case 2:
            for (i = 0; i < 2; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        random(45, 70)
                    )
                );
            }
            break;
        case 3:
            for (i = 0; i < 15; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        random(45, 70)
                    )
                );
            }
            break;
        case 4:
            enemies.push(
                new Enemy(
                    random(0, width), -30,
                    random(150, 170)
                )
            );
            break;
        case 5:
            for (i = 0; i < 2; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        random(150, 170)
                    )
                );
            }
            break;

        case 6:
            for (i = 0; i < 20; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        20
                    )
                );
            }
            break;
        case 7:
            for (i = 0; i < 50; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        20
                    )
                );
            }
            break;
    }

    if (currentLevelCount <= maxLevelCount) {
        timeoutCalled = false;
        currentLevelCount++;
    }
}

function resetGame() {
    spaceShipDestroyed = false;
    bullets = [];
    enemies = [];
    explosions = [];
    waitFrameCount = minFrameWaitCount;

    currentLevelCount = 1;
    maxLevelCount = 7;
    timeoutCalled = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';
}