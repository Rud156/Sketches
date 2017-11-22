/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />
/// <reference path="./boundary.js" />
/// <reference path="./object-collect.js" />

class GameManager {
    constructor() {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.world.gravity.scale = 0;

        this.players = [];
        this.grounds = [];
        this.boundaries = [];
        this.platforms = [];
        this.explosions = [];

        this.collectibleFlags = [];

        this.minForceMagnitude = 0.05;

        this.gameEnded = false;
        this.playerWon = [];

        this.createGrounds();
        this.createBoundaries();
        this.createPlatforms();
        this.createPlayers();
        this.attachEventListeners();
    }

    createGrounds() {
        for (let i = 12.5; i < width - 100; i += 275) {
            let randomValue = random(height / 6.34, height / 3.17);
            this.grounds.push(new Ground(i + 125, height - randomValue / 2, 250, randomValue, this.world));
        }
    }

    createBoundaries() {
        this.boundaries.push(new Boundary(5, height / 2, 10, height, this.world));
        this.boundaries.push(new Boundary(width - 5, height / 2, 10, height, this.world));
        this.boundaries.push(new Boundary(width / 2, 5, width, 10, this.world));
        this.boundaries.push(new Boundary(width / 2, height - 5, width, 10, this.world));
    }

    createPlatforms() {
        this.platforms.push(new Boundary(150, height / 6.34, 300, 20, this.world, 'staticGround', 0));
        this.platforms.push(new Boundary(width - 150, height / 6.43, 300, 20, this.world, 'staticGround', 1));

        this.platforms.push(new Boundary(100, height / 2.17, 200, 20, this.world, 'staticGround'));
        this.platforms.push(new Boundary(width - 100, height / 2.17, 200, 20, this.world, 'staticGround'));

        this.platforms.push(new Boundary(width / 2, height / 3.17, 300, 20, this.world, 'staticGround'));
    }

    createPlayers() {
        this.players.push(new Player(
            this.grounds[0].body.position.x + this.grounds[0].width / 2 - 40,
            height / 1.811, this.world, 0));
        this.players[0].setControlKeys(playerKeys[0]);

        let length = this.grounds.length;
        this.players.push(new Player(
            this.grounds[length - 1].body.position.x - this.grounds[length - 1].width / 2 + 40,
            height / 1.811, this.world, 1, 179));
        this.players[1].setControlKeys(playerKeys[1]);
    }

    createFlags() {
        this.collectibleFlags.push(new ObjectCollect(50, 50, 20, 20, this.world, 0));
        this.collectibleFlags.push(new ObjectCollect(width - 50, 50, 20, 20, this.world, 1));
    }

    attachEventListeners() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            this.onTriggerEnter(event);
        });
        Matter.Events.on(this.engine, 'collisionEnd', (event) => {
            this.onTriggerExit(event);
        });
        Matter.Events.on(this.engine, 'beforeUpdate', (event) => {
            this.updateEngine(event);
        });
    }

    onTriggerEnter(event) {
        for (let i = 0; i < event.pairs.length; i++) {
            let labelA = event.pairs[i].bodyA.label;
            let labelB = event.pairs[i].bodyB.label;

            if (labelA === 'basicFire' && (labelB.match(/^(staticGround|boundaryControlLines)$/))) {
                let basicFire = event.pairs[i].bodyA;
                if (!basicFire.damaged)
                    this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
                basicFire.damaged = true;
                basicFire.collisionFilter = {
                    category: bulletCollisionLayer,
                    mask: groundCategory
                };
                basicFire.friction = 1;
                basicFire.frictionAir = 1;
            } else if (labelB === 'basicFire' && (labelA.match(/^(staticGround|boundaryControlLines)$/))) {
                let basicFire = event.pairs[i].bodyB;
                if (!basicFire.damaged)
                    this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
                basicFire.damaged = true;
                basicFire.collisionFilter = {
                    category: bulletCollisionLayer,
                    mask: groundCategory
                };
                basicFire.friction = 1;
                basicFire.frictionAir = 1;
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
                this.damagePlayerBasic(player, basicFire);
            } else if (labelB === 'player' && labelA === 'basicFire') {
                let basicFire = event.pairs[i].bodyA;
                let player = event.pairs[i].bodyB;
                this.damagePlayerBasic(player, basicFire);
            }

            if (labelA === 'basicFire' && labelB === 'basicFire') {
                let basicFireA = event.pairs[i].bodyA;
                let basicFireB = event.pairs[i].bodyB;

                this.explosionCollide(basicFireA, basicFireB);
            }

            if (labelA === 'collectibleFlag' && labelB === 'player') {
                if (event.pairs[i].bodyA.index !== event.pairs[i].bodyB.index) {
                    event.pairs[i].bodyA.opponentCollided = true;
                } else {
                    event.pairs[i].bodyA.playerCollided = true;
                }
            } else if (labelB === 'collectibleFlag' && labelA === 'player') {
                if (event.pairs[i].bodyA.index !== event.pairs[i].bodyB.index) {
                    event.pairs[i].bodyB.opponentCollided = true;
                } else {
                    event.pairs[i].bodyB.playerCollided = true;
                }
            }
        }
    }

    onTriggerExit(event) {
        for (let i = 0; i < event.pairs.length; i++) {
            let labelA = event.pairs[i].bodyA.label;
            let labelB = event.pairs[i].bodyB.label;

            if (labelA === 'collectibleFlag' && labelB === 'player') {
                if (event.pairs[i].bodyA.index !== event.pairs[i].bodyB.index) {
                    event.pairs[i].bodyA.opponentCollided = false;
                } else {
                    event.pairs[i].bodyA.playerCollided = false;
                }
            } else if (labelB === 'collectibleFlag' && labelA === 'player') {
                if (event.pairs[i].bodyA.index !== event.pairs[i].bodyB.index) {
                    event.pairs[i].bodyB.opponentCollided = false;
                } else {
                    event.pairs[i].bodyB.playerCollided = false;
                }
            }
        }
    }

    explosionCollide(basicFireA, basicFireB) {
        let posX = (basicFireA.position.x + basicFireB.position.x) / 2;
        let posY = (basicFireA.position.y + basicFireB.position.y) / 2;

        let damageA = basicFireA.damageAmount;
        let damageB = basicFireB.damageAmount;
        let mappedDamageA = map(damageA, 2.5, 6, 34, 100);
        let mappedDamageB = map(damageB, 2.5, 6, 34, 100);

        basicFireA.health -= mappedDamageB;
        basicFireB.health -= mappedDamageA;

        if (basicFireA.health <= 0) {
            basicFireA.damaged = true;
            basicFireA.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
            basicFireA.friction = 1;
            basicFireA.frictionAir = 1;
        }
        if (basicFireB.health <= 0) {
            basicFireB.damaged = true;
            basicFireB.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
            basicFireB.friction = 1;
            basicFireB.frictionAir = 1;
        }

        this.explosions.push(new Explosion(posX, posY));
    }

    damagePlayerBasic(player, basicFire) {
        player.damageLevel += basicFire.damageAmount;
        let mappedDamage = map(basicFire.damageAmount, 2.5, 6, 5, 34);
        player.health -= mappedDamage;

        basicFire.damaged = true;
        basicFire.collisionFilter = {
            category: bulletCollisionLayer,
            mask: groundCategory
        };

        let bulletPos = createVector(basicFire.position.x, basicFire.position.y);
        let playerPos = createVector(player.position.x, player.position.y);

        let directionVector = p5.Vector.sub(playerPos, bulletPos);
        directionVector.setMag(this.minForceMagnitude * player.damageLevel * 0.05);

        Matter.Body.applyForce(player, player.position, {
            x: directionVector.x,
            y: directionVector.y
        });

        this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
    }

    updateEngine() {
        let bodies = Matter.Composite.allBodies(this.engine.world);

        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];

            if (body.isStatic || body.isSleeping || body.label === 'basicFire' ||
                body.label === 'collectibleFlag')
                continue;

            body.force.y += body.mass * 0.001;
        }
    }

    draw() {
        Matter.Engine.update(this.engine);

        this.grounds.forEach(element => {
            element.show();
        });
        this.boundaries.forEach(element => {
            element.show();
        });
        this.platforms.forEach(element => {
            element.show();
        })

        for (let i = 0; i < this.collectibleFlags.length; i++) {
            this.collectibleFlags[i].update();
            this.collectibleFlags[i].show();

            if (this.collectibleFlags[i].health <= 0) {
                let pos = this.collectibleFlags[i].body.position;
                this.gameEnded = true;

                if (this.collectibleFlags[i].body.index === 0) {
                    this.playerWon.push(0);
                    this.explosions.push(new Explosion(pos.x, pos.y, 10, 90, 200));
                } else {
                    this.playerWon.push(1);
                    this.explosions.push(new Explosion(pos.x, pos.y, 10, 90, 200));
                }

                this.collectibleFlags[i].removeFromWorld();
                this.collectibleFlags.splice(i, 1);
                i -= 1;

                for (let j = 0; j < this.players.length; j++) {
                    this.players[j].disableControls = true;
                }
            }
        }

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].show();
            this.players[i].update(keyStates);

            if (this.players[i].body.health <= 0) {
                let pos = this.players[i].body.position;
                this.explosions.push(new Explosion(pos.x, pos.y, 10, 90, 200));

                this.gameEnded = true;
                this.playerWon.push(this.players[i].body.index);

                for (let j = 0; j < this.players.length; j++) {
                    this.players[j].disableControls = true;
                }

                this.players[i].removeFromWorld();
                this.players.splice(i, 1);
            }
        }

        for (let i = 0; i < this.explosions.length; i++) {
            this.explosions[i].show();
            this.explosions[i].update();

            if (this.explosions[i].isComplete()) {
                this.explosions.splice(i, 1);
                i -= 1;
            }
        }
    }
}