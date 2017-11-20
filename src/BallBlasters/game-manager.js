/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./player.js" />
/// <reference path="./ground.js" />
/// <reference path="./explosion.js" />
/// <reference path="./boundary.js" />

class GameManager {
    constructor() {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.world.gravity.scale = 0;

        this.players = [];
        this.grounds = [];
        this.boundaries = [];
        this.explosions = [];

        this.minForceMagnitude = 0.05;

        this.createGrounds();
        this.createBoundaries();
        this.createPlayers();
        this.attachEventListeners();
    }

    createGrounds() {
        for (let i = 25; i < width; i += 250) {
            let randomValue = random(50, 200);
            this.grounds.push(new Ground(i + 50, height - randomValue / 2, 200, randomValue, this.world));
        }
    }

    createBoundaries() {
        this.boundaries.push(new Boundary(5, height / 2, 10, height));
        this.boundaries.push(new Boundary(width - 5, height / 2, 10, height));
        this.boundaries.push(new Boundary(width / 2, 5, width, 10));
        this.boundaries.push(new Boundary(width / 2, height - 5, width, 10));
    }

    createPlayers() {
        for (let i = 0; i < 2; i++) {
            if (i != 0) {
                this.players.push(new Player(this.grounds[this.grounds.length - i].body.position.x,
                    0, this.world, i, 179));
            } else {
                this.players.push(new Player(this.grounds[i].body.position.x, 0, this.world, i));
            }

            this.players[i].setControlKeys(playerKeys[i]);
        }
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
                basicFire.damaged = true;
                basicFire.collisionFilter = {
                    category: bulletCollisionLayer,
                    mask: groundCategory
                };
                this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
            } else if (labelB === 'basicFire' && (labelA.match(/^(staticGround|boundaryControlLines)$/))) {
                let basicFire = event.pairs[i].bodyB;
                basicFire.damaged = true;
                basicFire.collisionFilter = {
                    category: bulletCollisionLayer,
                    mask: groundCategory
                };
                this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
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
        }
    }

    onTriggerExit(event) {

    }

    explosionCollide(basicFireA, basicFireB) {
        let posX = (basicFireA.position.x + basicFireB.position.x) / 2;
        let posY = (basicFireA.position.y + basicFireB.position.y) / 2;

        basicFireA.damaged = true;
        basicFireB.damaged = true;
        basicFireA.collisionFilter = {
            category: bulletCollisionLayer,
            mask: groundCategory
        };
        basicFireB.collisionFilter = {
            category: bulletCollisionLayer,
            mask: groundCategory
        };

        this.explosions.push(new Explosion(posX, posY));
    }

    damagePlayerBasic(player, basicFire) {
        player.damageLevel += basicFire.damageAmount;
        player.health -= basicFire.damageAmount * 2;

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

            if (body.isStatic || body.isSleeping || body.label === 'basicFire')
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

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].show();
            this.players[i].update(keyStates);

            if (this.players[i].body.health <= 0) {
                let pos = this.players[i].body.position;
                explosions.push(new Explosion(pos.x, pos.y, 10));

                this.players.splice(i, 1);
                i -= 1;
            }

            if (this.players[i].isOutOfScreen()) {
                this.players.splice(i, 1);
                i -= 1;
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