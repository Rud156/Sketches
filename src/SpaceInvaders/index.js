/// <reference path="./bullet.js" />
/// <reference path="./explosion.js" />
/// <reference path="./pickups.js" />
/// <reference path="./space-ship.js" />
/// <reference path="./enemy.js" />

const pickupColors = [0, 120, 175];

let spaceShip;
let spaceShipDestroyed = false;
let pickups = [];
let enemies = [];
let explosions = [];

let currentLevelCount = 1;
const maxLevelCount = 9;
let timeoutCalled = false;
let button;
let buttonDisplayed = false;

let gameStarted = false;

let explosionSound;
let backgroundSound;
let powerUpSound;

function preload() {
    explosionSound = new Howl({
        src: ['https://freesound.org/data/previews/386/386862_6891102-lq.mp3'],
        autoplay: false,
        loop: false,
        preload: true
    });

    backgroundSound = new Howl({
        src: ['https://freesound.org/data/previews/321/321002_5123851-lq.mp3'],
        autoplay: true,
        loop: true,
        preload: true,
        volume: 0.05
    });

    powerUpSound = new Howl({
        src: ['https://freesound.org/data/previews/344/344307_6199418-lq.mp3'],
        autoplay: false,
        loop: false,
        preload: true
    });
}


function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    button = createButton('Replay!');
    button.position(width / 2 - 62, height / 2 + 30);
    button.elt.className = 'button pulse';
    button.elt.style.display = 'none';
    button.mousePressed(resetGame);

    spaceShip = new SpaceShip();

    textAlign(CENTER);
    rectMode(CENTER);
    angleMode(DEGREES);
}

function draw() {
    background(0);

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
            explosionSound.play();
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
            explosionSound.play();
            enemies.splice(i, 1);
            i -= 1;
        }

        textSize(27);
        noStroke();
        fill(255, 0, 0);
        text('You Are Dead', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Replay';
            buttonDisplayed = true;
        }

    } else {
        spaceShip.show();
        spaceShip.update();

        if (keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW)) { /* Do nothing */ } else {
            if (keyIsDown(LEFT_ARROW)) {
                spaceShip.moveShip('LEFT');
            } else if (keyIsDown(RIGHT_ARROW)) {
                spaceShip.moveShip('RIGHT');
            }
        }

        if (keyIsDown(32)) {
            spaceShip.shootBullets();
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

    for (let i = 0; i < pickups.length; i++) {
        pickups[i].show();
        pickups[i].update();

        if (pickups[i].isOutOfScreen()) {
            pickups.splice(i, 1);
            i -= 1;
        }
    }

    for (let i = 0; i < spaceShip.bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            // FixMe: Check bullet undefined
            if (spaceShip.bullets[i])
                if (enemies[j].pointIsInside([spaceShip.bullets[i].position.x, spaceShip.bullets[i].position.y])) {
                    let enemyDead = enemies[j].takeDamageAndCheckDeath();
                    if (enemyDead) {
                        explosions.push(
                            new Explosion(
                                enemies[j].position.x,
                                enemies[j].position.y,
                                (enemies[j].baseWidth * 7) / 45
                            )
                        );
                        explosionSound.play();
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

                        let randomValue = random();
                        if (randomValue < 0.5) {
                            pickups.push(
                                new Pickup(
                                    enemies[j].position.x,
                                    enemies[j].position.y,
                                    pickupColors[floor(random() * pickupColors.length)]
                                )
                            );

                        }

                        enemies.splice(j, 1);
                        j -= 1;
                    }
                    spaceShip.bullets.splice(i, 1);
                    i = i === 0 ? 0 : i - 1;
                }
        }
    }

    for (let i = 0; i < pickups.length; i++) {
        if (spaceShip.pointIsInside([pickups[i].position.x, pickups[i].position.y])) {
            let colorValue = pickups[i].colorValue;
            spaceShip.setBulletType(colorValue);
            powerUpSound.play();

            pickups.splice(i, 1);
            i -= 1;
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        for (let j = 0; j < enemies[i].bullets.length; j++) {
            // FixMe: Check bullet undefined
            if (enemies[i].bullets[j])
                if (spaceShip.pointIsInside([enemies[i].bullets[j].position.x, enemies[i].bullets[j].position.y])) {
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

    if (enemies.length === 0 && !spaceShipDestroyed && gameStarted) {
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
            if (randomValue < 0.1) {
                explosions.push(
                    new Explosion(
                        random(0, width),
                        random(0, height),
                        random(0, 10)
                    )
                );
                explosionSound.play();
            }

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                button.elt.innerText = 'Replay';
                buttonDisplayed = true;
            }
        }
    }
    if (!gameStarted) {
        textStyle(BOLD);
        textSize(30);
        noStroke();
        fill(color(`hsl(${int(random(359))}, 100%, 50%)`));
        text('SPACE INVADERS', width / 2 + 10, height / 4);
        fill(255);
        text('ARROW KEYS to move and SPACE to fire', width / 2, height / 3);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Play Game';
            buttonDisplayed = true;
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
        case 8:
            for (i = 0; i < 20; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        random(20, 170)
                    )
                );
            }
            break;
        case 9:
            for (i = 0; i < 20; i++) {
                enemies.push(
                    new Enemy(
                        random(0, width), -30,
                        random(70, 120)
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
    enemies = [];
    explosions = [];
    spaceShip.reset();

    currentLevelCount = 1;
    timeoutCalled = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';

    gameStarted = true;
}