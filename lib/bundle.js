'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Particle = function () {
    function Particle(x, y, colorNumber, maxStrokeWeight) {
        _classCallCheck(this, Particle);

        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(0, 20));
        this.acceleration = createVector(0, 0);

        this.alpha = 1;
        this.colorNumber = colorNumber;
        this.maxStrokeWeight = maxStrokeWeight;
    }

    _createClass(Particle, [{
        key: 'applyForce',
        value: function applyForce(force) {
            this.acceleration.add(force);
        }
    }, {
        key: 'show',
        value: function show() {
            var colorValue = color('hsla(' + this.colorNumber + ', 100%, 50%, ' + this.alpha + ')');
            var mappedStrokeWeight = map(this.alpha, 0, 1, 0, this.maxStrokeWeight);

            strokeWeight(mappedStrokeWeight);
            stroke(colorValue);
            point(this.position.x, this.position.y);

            this.alpha -= 0.05;
        }
    }, {
        key: 'update',
        value: function update() {
            this.velocity.mult(0.5);

            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }
    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this.alpha > 0;
        }
    }]);

    return Particle;
}();

var Explosion = function () {
    function Explosion(spawnX, spawnY) {
        var maxStrokeWeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;

        _classCallCheck(this, Explosion);

        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        var randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.explode();
    }

    _createClass(Explosion, [{
        key: 'explode',
        value: function explode() {
            for (var i = 0; i < 100; i++) {
                var particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight);
                this.particles.push(particle);
            }
        }
    }, {
        key: 'show',
        value: function show() {
            this.particles.forEach(function (particle) {
                particle.show();
            });
        }
    }, {
        key: 'update',
        value: function update() {
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].applyForce(this.gravity);
                this.particles[i].update();

                if (!this.particles[i].isVisible()) {
                    this.particles.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }, {
        key: 'isComplete',
        value: function isComplete() {
            return this.particles.length === 0;
        }
    }]);

    return Explosion;
}();

var BasicFire = function () {
    function BasicFire(x, y, radius, angle, world, catAndMask) {
        _classCallCheck(this, BasicFire);

        this.radius = radius;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
            label: 'basicFire',
            friction: 0,
            frictionAir: 0,
            restitution: 0,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);

        this.movementSpeed = this.radius * 3;
        this.angle = angle;
        this.world = world;

        this.body.damaged = false;
        this.body.damageAmount = this.radius / 2;

        this.setVelocity();
    }

    _createClass(BasicFire, [{
        key: 'show',
        value: function show() {
            if (!this.body.damaged) {

                fill(255);
                noStroke();

                var pos = this.body.position;

                push();
                translate(pos.x, pos.y);
                ellipse(0, 0, this.radius * 2);
                pop();
            }
        }
    }, {
        key: 'setVelocity',
        value: function setVelocity() {
            Matter.Body.setVelocity(this.body, {
                x: this.movementSpeed * cos(this.angle),
                y: this.movementSpeed * sin(this.angle)
            });
        }
    }, {
        key: 'removeFromWorld',
        value: function removeFromWorld() {
            Matter.World.remove(this.world, this.body);
        }
    }, {
        key: 'isVelocityZero',
        value: function isVelocityZero() {
            var velocity = this.body.velocity;
            return sqrt(sq(velocity.x) + sq(velocity.y)) <= 0.07;
        }
    }, {
        key: 'isOutOfScreen',
        value: function isOutOfScreen() {
            var pos = this.body.position;
            return pos.x > width || pos.x < 0 || pos.y > height || pos.y < 0;
        }
    }]);

    return BasicFire;
}();

var Boundary = function () {
    function Boundary(x, y, boundaryWidth, boundaryHeight) {
        _classCallCheck(this, Boundary);

        this.body = Matter.Bodies.rectangle(x, y, boundaryWidth, boundaryHeight, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: 'boundaryControlLines',
            collisionFilter: {
                category: groundCategory,
                mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
            }
        });

        this.width = boundaryWidth;
        this.height = boundaryHeight;
    }

    _createClass(Boundary, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;

            fill(255, 0, 0);
            noStroke();

            rect(pos.x, pos.y, this.width, this.height);
        }
    }]);

    return Boundary;
}();

var Ground = function () {
    function Ground(x, y, groundWidth, groundHeight, world) {
        var catAndMask = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
            category: groundCategory,
            mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
        };

        _classCallCheck(this, Ground);

        var modifiedY = y - groundHeight / 2 + 10;

        this.body = Matter.Bodies.rectangle(x, modifiedY, groundWidth, 20, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: 'staticGround',
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });

        var modifiedHeight = groundHeight - 20;
        var modifiedWidth = 50;
        this.fakeBottomPart = Matter.Bodies.rectangle(x, y + 10, modifiedWidth, modifiedHeight, {
            isStatic: true,
            friction: 0,
            restitution: 1,
            label: 'boundaryControlLines',
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.fakeBottomPart);
        Matter.World.add(world, this.body);

        this.width = groundWidth;
        this.height = 20;
        this.modifiedHeight = modifiedHeight;
        this.modifiedWidth = modifiedWidth;
    }

    _createClass(Ground, [{
        key: 'show',
        value: function show() {
            fill(255, 0, 0);
            noStroke();

            var bodyVertices = this.body.vertices;
            var fakeBottomVertices = this.fakeBottomPart.vertices;
            var vertices = [bodyVertices[0], bodyVertices[1], bodyVertices[2], fakeBottomVertices[1], fakeBottomVertices[2], fakeBottomVertices[3], fakeBottomVertices[0], bodyVertices[3]];

            beginShape();
            for (var i = 0; i < vertices.length; i++) {
                vertex(vertices[i].x, vertices[i].y);
            }endShape();
        }
    }]);

    return Ground;
}();

var Player = function () {
    function Player(x, y, world, playerIndex) {
        var angle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var catAndMask = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
            category: playerCategory,
            mask: groundCategory | playerCategory | basicFireCategory
        };

        _classCallCheck(this, Player);

        this.body = Matter.Bodies.circle(x, y, 20, {
            label: 'player',
            friction: 0.1,
            restitution: 0.3,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            },
            angle: angle
        });
        Matter.World.add(world, this.body);
        this.world = world;

        this.radius = 20;
        this.movementSpeed = 10;
        this.angularVelocity = 0.2;

        this.jumpHeight = 10;
        this.jumpBreathingSpace = 3;

        this.body.grounded = true;
        this.maxJumpNumber = 3;
        this.body.currentJumpNumber = 0;

        this.bullets = [];
        this.initialChargeValue = 5;
        this.maxChargeValue = 12;
        this.currentChargeValue = this.initialChargeValue;
        this.chargeIncrementValue = 0.1;
        this.chargeStarted = false;

        this.maxHealth = 100;
        this.body.damageLevel = 1;
        this.body.health = this.maxHealth;
        this.fullHealthColor = color('hsl(120, 100%, 50%)');
        this.halfHealthColor = color('hsl(60, 100%, 50%)');
        this.zeroHealthColor = color('hsl(0, 100%, 50%)');

        this.keys = [];
        this.index = playerIndex;
    }

    _createClass(Player, [{
        key: 'setControlKeys',
        value: function setControlKeys(keys) {
            this.keys = keys;
        }
    }, {
        key: 'show',
        value: function show() {
            noStroke();
            var pos = this.body.position;
            var angle = this.body.angle;

            var currentColor = null;
            var mappedHealth = map(this.body.health, 0, this.maxHealth, 0, 100);
            if (mappedHealth < 50) {
                currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, mappedHealth / 50);
            } else {
                currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (mappedHealth - 50) / 50);
            }
            fill(currentColor);
            rect(pos.x, pos.y - this.radius - 10, 100, 2);

            fill(0, 255, 0);

            push();
            translate(pos.x, pos.y);
            rotate(angle);

            ellipse(0, 0, this.radius * 2);

            fill(255);
            ellipse(0, 0, this.radius);
            rect(0 + this.radius / 2, 0, this.radius * 1.5, this.radius / 2);

            strokeWeight(1);
            stroke(0);
            line(0, 0, this.radius * 1.25, 0);

            pop();
        }
    }, {
        key: 'isOutOfScreen',
        value: function isOutOfScreen() {
            var pos = this.body.position;
            return pos.x > 100 + width || pos.x < -100 || pos.y > height + 100;
        }
    }, {
        key: 'rotateBlaster',
        value: function rotateBlaster(activeKeys) {
            if (activeKeys[this.keys[2]]) {
                Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
            } else if (activeKeys[this.keys[3]]) {
                Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
            }

            if (!keyStates[this.keys[2]] && !keyStates[this.keys[3]] || keyStates[this.keys[2]] && keyStates[this.keys[3]]) {
                Matter.Body.setAngularVelocity(this.body, 0);
            }
        }
    }, {
        key: 'moveHorizontal',
        value: function moveHorizontal(activeKeys) {
            var yVelocity = this.body.velocity.y;
            var xVelocity = this.body.velocity.x;

            var absXVelocity = abs(xVelocity);
            var sign = xVelocity < 0 ? -1 : 1;

            if (activeKeys[this.keys[0]]) {
                if (absXVelocity > this.movementSpeed) {
                    Matter.Body.setVelocity(this.body, {
                        x: this.movementSpeed * sign,
                        y: yVelocity
                    });
                }

                Matter.Body.applyForce(this.body, this.body.position, {
                    x: -0.005,
                    y: 0
                });

                Matter.Body.setAngularVelocity(this.body, 0);
            } else if (activeKeys[this.keys[1]]) {
                if (absXVelocity > this.movementSpeed) {
                    Matter.Body.setVelocity(this.body, {
                        x: this.movementSpeed * sign,
                        y: yVelocity
                    });
                }
                Matter.Body.applyForce(this.body, this.body.position, {
                    x: 0.005,
                    y: 0
                });

                Matter.Body.setAngularVelocity(this.body, 0);
            }
        }
    }, {
        key: 'moveVertical',
        value: function moveVertical(activeKeys) {
            var xVelocity = this.body.velocity.x;

            if (activeKeys[this.keys[5]]) {
                if (!this.body.grounded && this.body.currentJumpNumber < this.maxJumpNumber) {
                    Matter.Body.setVelocity(this.body, {
                        x: xVelocity,
                        y: -this.jumpHeight
                    });
                    this.body.currentJumpNumber++;
                } else if (this.body.grounded) {
                    Matter.Body.setVelocity(this.body, {
                        x: xVelocity,
                        y: -this.jumpHeight
                    });
                    this.body.currentJumpNumber++;
                    this.body.grounded = false;
                }
            }

            activeKeys[this.keys[5]] = false;
        }
    }, {
        key: 'drawChargedShot',
        value: function drawChargedShot(x, y, radius) {
            fill(255);
            noStroke();

            ellipse(x, y, radius * 2);
        }
    }, {
        key: 'chargeAndShoot',
        value: function chargeAndShoot(activeKeys) {
            var pos = this.body.position;
            var angle = this.body.angle;

            var x = this.radius * cos(angle) * 1.5 + pos.x;
            var y = this.radius * sin(angle) * 1.5 + pos.y;

            if (activeKeys[this.keys[4]]) {
                this.chargeStarted = true;
                this.currentChargeValue += this.chargeIncrementValue;

                this.currentChargeValue = this.currentChargeValue > this.maxChargeValue ? this.maxChargeValue : this.currentChargeValue;

                this.drawChargedShot(x, y, this.currentChargeValue);
            } else if (!activeKeys[this.keys[4]] && this.chargeStarted) {
                this.bullets.push(new BasicFire(x, y, this.currentChargeValue, angle, this.world, {
                    category: basicFireCategory,
                    mask: groundCategory | playerCategory | basicFireCategory
                }));

                this.chargeStarted = false;
                this.currentChargeValue = this.initialChargeValue;
            }
        }
    }, {
        key: 'update',
        value: function update(activeKeys) {
            this.rotateBlaster(activeKeys);
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys);

            this.chargeAndShoot(activeKeys);

            for (var i = 0; i < this.bullets.length; i++) {
                this.bullets[i].show();

                if (this.bullets[i].isVelocityZero() || this.bullets[i].isOutOfScreen()) {
                    this.bullets[i].removeFromWorld();
                    this.bullets.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }]);

    return Player;
}();

var GameManager = function () {
    function GameManager() {
        _classCallCheck(this, GameManager);

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

    _createClass(GameManager, [{
        key: 'createGrounds',
        value: function createGrounds() {
            for (var i = 25; i < width; i += 250) {
                var randomValue = random(50, 200);
                this.grounds.push(new Ground(i + 50, height - randomValue / 2, 200, randomValue, this.world));
            }
        }
    }, {
        key: 'createBoundaries',
        value: function createBoundaries() {
            this.boundaries.push(new Boundary(5, height / 2, 10, height));
            this.boundaries.push(new Boundary(width - 5, height / 2, 10, height));
            this.boundaries.push(new Boundary(width / 2, 5, width, 10));
            this.boundaries.push(new Boundary(width / 2, height - 5, width, 10));
        }
    }, {
        key: 'createPlayers',
        value: function createPlayers() {
            for (var i = 0; i < 2; i++) {
                if (i != 0) {
                    this.players.push(new Player(this.grounds[this.grounds.length - i].body.position.x, 0, this.world, i, 179));
                } else {
                    this.players.push(new Player(this.grounds[i].body.position.x, 0, this.world, i));
                }

                this.players[i].setControlKeys(playerKeys[i]);
            }
        }
    }, {
        key: 'attachEventListeners',
        value: function attachEventListeners() {
            var _this = this;

            Matter.Events.on(this.engine, 'collisionStart', function (event) {
                _this.onTriggerEnter(event);
            });
            Matter.Events.on(this.engine, 'collisionEnd', function (event) {
                _this.onTriggerExit(event);
            });
            Matter.Events.on(this.engine, 'beforeUpdate', function (event) {
                _this.updateEngine(event);
            });
        }
    }, {
        key: 'onTriggerEnter',
        value: function onTriggerEnter(event) {
            for (var i = 0; i < event.pairs.length; i++) {
                var labelA = event.pairs[i].bodyA.label;
                var labelB = event.pairs[i].bodyB.label;

                if (labelA === 'basicFire' && labelB.match(/^(staticGround|boundaryControlLines)$/)) {
                    var basicFire = event.pairs[i].bodyA;
                    basicFire.damaged = true;
                    basicFire.collisionFilter = {
                        category: bulletCollisionLayer,
                        mask: groundCategory
                    };
                    this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
                } else if (labelB === 'basicFire' && labelA.match(/^(staticGround|boundaryControlLines)$/)) {
                    var _basicFire = event.pairs[i].bodyB;
                    _basicFire.damaged = true;
                    _basicFire.collisionFilter = {
                        category: bulletCollisionLayer,
                        mask: groundCategory
                    };
                    this.explosions.push(new Explosion(_basicFire.position.x, _basicFire.position.y));
                }

                if (labelA === 'player' && labelB === 'staticGround') {
                    event.pairs[i].bodyA.grounded = true;
                    event.pairs[i].bodyA.currentJumpNumber = 0;
                } else if (labelB === 'player' && labelA === 'staticGround') {
                    event.pairs[i].bodyB.grounded = true;
                    event.pairs[i].bodyB.currentJumpNumber = 0;
                }

                if (labelA === 'player' && labelB === 'basicFire') {
                    var _basicFire2 = event.pairs[i].bodyB;
                    var player = event.pairs[i].bodyA;
                    this.damagePlayerBasic(player, _basicFire2);
                } else if (labelB === 'player' && labelA === 'basicFire') {
                    var _basicFire3 = event.pairs[i].bodyA;
                    var _player = event.pairs[i].bodyB;
                    this.damagePlayerBasic(_player, _basicFire3);
                }

                if (labelA === 'basicFire' && labelB === 'basicFire') {
                    var basicFireA = event.pairs[i].bodyA;
                    var basicFireB = event.pairs[i].bodyB;

                    this.explosionCollide(basicFireA, basicFireB);
                }
            }
        }
    }, {
        key: 'onTriggerExit',
        value: function onTriggerExit(event) {}
    }, {
        key: 'explosionCollide',
        value: function explosionCollide(basicFireA, basicFireB) {
            var posX = (basicFireA.position.x + basicFireB.position.x) / 2;
            var posY = (basicFireA.position.y + basicFireB.position.y) / 2;

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
    }, {
        key: 'damagePlayerBasic',
        value: function damagePlayerBasic(player, basicFire) {
            player.damageLevel += basicFire.damageAmount;
            player.health -= basicFire.damageAmount * 2;

            basicFire.damaged = true;
            basicFire.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };

            var bulletPos = createVector(basicFire.position.x, basicFire.position.y);
            var playerPos = createVector(player.position.x, player.position.y);

            var directionVector = p5.Vector.sub(playerPos, bulletPos);
            directionVector.setMag(this.minForceMagnitude * player.damageLevel * 0.05);

            Matter.Body.applyForce(player, player.position, {
                x: directionVector.x,
                y: directionVector.y
            });

            this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
        }
    }, {
        key: 'updateEngine',
        value: function updateEngine() {
            var bodies = Matter.Composite.allBodies(this.engine.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];

                if (body.isStatic || body.isSleeping || body.label === 'basicFire') continue;

                body.force.y += body.mass * 0.001;
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            Matter.Engine.update(this.engine);

            this.grounds.forEach(function (element) {
                element.show();
            });
            this.boundaries.forEach(function (element) {
                element.show();
            });

            for (var i = 0; i < this.players.length; i++) {
                this.players[i].show();
                this.players[i].update(keyStates);

                if (this.players[i].body.health <= 0) {
                    var pos = this.players[i].body.position;
                    explosions.push(new Explosion(pos.x, pos.y, 10));

                    this.players.splice(i, 1);
                    i -= 1;
                }

                if (this.players[i].isOutOfScreen()) {
                    this.players.splice(i, 1);
                    i -= 1;
                }
            }

            for (var _i = 0; _i < this.explosions.length; _i++) {
                this.explosions[_i].show();
                this.explosions[_i].update();

                if (this.explosions[_i].isComplete()) {
                    this.explosions.splice(_i, 1);
                    _i -= 1;
                }
            }
        }
    }]);

    return GameManager;
}();

var playerKeys = [[37, 39, 38, 40, 13, 32], [65, 68, 87, 83, 90, 88]];

var keyStates = {
    13: false,
    32: false,
    37: false,
    38: false,
    39: false,
    40: false,
    87: false,
    65: false,
    83: false,
    68: false,
    90: false,
    88: false };

var groundCategory = 0x0001;
var playerCategory = 0x0002;
var basicFireCategory = 0x0004;
var bulletCollisionLayer = 0x0008;

var gameManager = void 0;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    gameManager = new GameManager();

    rectMode(CENTER);
}

function draw() {
    background(0);

    gameManager.draw();

    fill(255);
    textSize(30);
    text('' + round(frameRate()), width - 75, 50);
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;

    return false;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;

    return false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwicHVzaCIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJmcmljdGlvbkFpciIsInJlc3RpdHV0aW9uIiwiY29sbGlzaW9uRmlsdGVyIiwiY2F0ZWdvcnkiLCJtYXNrIiwiV29ybGQiLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJjb3MiLCJzaW4iLCJyZW1vdmUiLCJzcXJ0Iiwic3EiLCJ3aWR0aCIsImhlaWdodCIsIkJvdW5kYXJ5IiwiYm91bmRhcnlXaWR0aCIsImJvdW5kYXJ5SGVpZ2h0IiwicmVjdGFuZ2xlIiwiaXNTdGF0aWMiLCJncm91bmRDYXRlZ29yeSIsInBsYXllckNhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsInJlY3QiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsIm1vZGlmaWVkWSIsIm1vZGlmaWVkSGVpZ2h0IiwibW9kaWZpZWRXaWR0aCIsImZha2VCb3R0b21QYXJ0IiwiYm9keVZlcnRpY2VzIiwidmVydGljZXMiLCJmYWtlQm90dG9tVmVydGljZXMiLCJiZWdpblNoYXBlIiwidmVydGV4IiwiZW5kU2hhcGUiLCJQbGF5ZXIiLCJwbGF5ZXJJbmRleCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsIm1heEhlYWx0aCIsImRhbWFnZUxldmVsIiwiaGVhbHRoIiwiZnVsbEhlYWx0aENvbG9yIiwiaGFsZkhlYWx0aENvbG9yIiwiemVyb0hlYWx0aENvbG9yIiwia2V5cyIsImluZGV4IiwiY3VycmVudENvbG9yIiwibWFwcGVkSGVhbHRoIiwibGVycENvbG9yIiwicm90YXRlIiwibGluZSIsImFjdGl2ZUtleXMiLCJzZXRBbmd1bGFyVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwiZXhwbG9zaW9ucyIsIm1pbkZvcmNlTWFnbml0dWRlIiwiY3JlYXRlR3JvdW5kcyIsImNyZWF0ZUJvdW5kYXJpZXMiLCJjcmVhdGVQbGF5ZXJzIiwiYXR0YWNoRXZlbnRMaXN0ZW5lcnMiLCJyYW5kb21WYWx1ZSIsInNldENvbnRyb2xLZXlzIiwicGxheWVyS2V5cyIsIkV2ZW50cyIsIm9uIiwiZXZlbnQiLCJvblRyaWdnZXJFbnRlciIsIm9uVHJpZ2dlckV4aXQiLCJ1cGRhdGVFbmdpbmUiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCIsImJhc2ljRmlyZSIsInBsYXllciIsImRhbWFnZVBsYXllckJhc2ljIiwiYmFzaWNGaXJlQSIsImJhc2ljRmlyZUIiLCJleHBsb3Npb25Db2xsaWRlIiwicG9zWCIsInBvc1kiLCJidWxsZXRQb3MiLCJwbGF5ZXJQb3MiLCJkaXJlY3Rpb25WZWN0b3IiLCJzdWIiLCJzZXRNYWciLCJib2RpZXMiLCJDb21wb3NpdGUiLCJhbGxCb2RpZXMiLCJpc1NsZWVwaW5nIiwibWFzcyIsImVsZW1lbnQiLCJpc0NvbXBsZXRlIiwiZ2FtZU1hbmFnZXIiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0ZXh0U2l6ZSIsInRleHQiLCJyb3VuZCIsImZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxRO0FBQ0Ysc0JBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsV0FBbEIsRUFBK0JDLGVBQS9CLEVBQWdEO0FBQUE7O0FBQzVDLGFBQUtDLFFBQUwsR0FBZ0JDLGFBQWFMLENBQWIsRUFBZ0JDLENBQWhCLENBQWhCO0FB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UUMsTUFBTUMsV0FBTixDQUFSLEVBQThCcEksUUFBUSxFQUF0QyxFQUEwQyxFQUExQztBQUNIOztBQUVELFNBQVNxSSxVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVdoRixTQUFmLEVBQ0lBLFVBQVVnRixPQUFWLElBQXFCLElBQXJCOztBQUVKLFdBQU8sS0FBUDtBQUNIOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBV2hGLFNBQWYsRUFDSUEsVUFBVWdGLE9BQVYsSUFBcUIsS0FBckI7O0FBRUosV0FBTyxLQUFQO0FBQ0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgY29sb3JOdW1iZXIsIG1heFN0cm9rZVdlaWdodCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdChyYW5kb20oMCwgMjApKTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XHJcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoZm9yY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBjb2xvcihgaHNsYSgke3RoaXMuY29sb3JOdW1iZXJ9LCAxMDAlLCA1MCUsICR7dGhpcy5hbHBoYX0pYCk7XHJcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcclxuICAgICAgICBwb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmlzaWJsZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cclxuXHJcbmNsYXNzIEV4cGxvc2lvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xyXG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBsb2RlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0NvbXBsZXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFzaWNGaXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgYW5nbGUsIHdvcmxkLCBjYXRBbmRNYXNrKSB7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlQW1vdW50ID0gdGhpcy5yYWRpdXMgLyAyO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm9keS5kYW1hZ2VkKSB7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgICAgICBwb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHQgfHwgcG9zLnkgPCAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCb3VuZGFyeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJvdW5kYXJ5V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgIH0pIHtcclxuICAgICAgICBsZXQgbW9kaWZpZWRZID0geSAtIGdyb3VuZEhlaWdodCAvIDIgKyAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcclxuICAgICAgICB0aGlzLmZha2VCb3R0b21QYXJ0ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSArIDEwLCBtb2RpZmllZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxyXG4gICAgICAgICAgICBsYWJlbDogJ2JvdW5kYXJ5Q29udHJvbExpbmVzJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZEhlaWdodCA9IG1vZGlmaWVkSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgdmVydGljZXMgPSBbXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSwgXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1sxXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMV0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMl0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbM10sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMF0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1szXVxyXG4gICAgICAgIF07XHJcblxyXG5cclxuICAgICAgICBiZWdpblNoYXBlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xyXG4gICAgICAgIGVuZFNoYXBlKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBwbGF5ZXJJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb250cm9sS2V5cyhrZXlzKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIGxldCBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5ib2R5LmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XHJcbiAgICAgICAgaWYgKG1hcHBlZEhlYWx0aCA8IDUwKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAobWFwcGVkSGVhbHRoIC0gNTApIC8gNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLnJhZGl1cyAtIDEwLCAxMDAsIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ib3VuZGFyeS5qc1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLndvcmxkLmdyYXZpdHkuc2NhbGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmdyb3VuZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5taW5Gb3JjZU1hZ25pdHVkZSA9IDAuMDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVHcm91bmRzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAyNTsgaSA8IHdpZHRoOyBpICs9IDI1MCkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oNTAsIDIwMCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDUwLCBoZWlnaHQgLSByYW5kb21WYWx1ZSAvIDIsIDIwMCwgcmFuZG9tVmFsdWUsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQm91bmRhcmllcygpIHtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkoNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCA1LCB3aWR0aCwgMTApKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLSA1LCB3aWR0aCwgMTApKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQbGF5ZXJzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIodGhpcy5ncm91bmRzW3RoaXMuZ3JvdW5kcy5sZW5ndGggLSBpXS5ib2R5LnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgMCwgdGhpcy53b3JsZCwgaSwgMTc5KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKHRoaXMuZ3JvdW5kc1tpXS5ib2R5LnBvc2l0aW9uLngsIDAsIHRoaXMud29ybGQsIGkpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRXhpdChldmVudCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpIHtcclxuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcclxuICAgICAgICBsZXQgcG9zWSA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnkgKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLnkpIC8gMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XHJcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgcGxheWVyLmhlYWx0aCAtPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50ICogMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmJvZHkuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTApKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG5cclxuY29uc3QgcGxheWVyS2V5cyA9IFtcclxuICAgIFszNywgMzksIDM4LCA0MCwgMTMsIDMyXSxcclxuICAgIFs2NSwgNjgsIDg3LCA4MywgOTAsIDg4XVxyXG5dO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMTM6IGZhbHNlLCAvLyBFTlRFUlxyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG4gICAgOTA6IGZhbHNlLCAvLyBaXHJcbiAgICA4ODogZmFsc2UgLy8gWFxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcblxyXG5sZXQgZ2FtZU1hbmFnZXI7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgIGZpbGwoMjU1KTtcclxuICAgIHRleHRTaXplKDMwKTtcclxuICAgIHRleHQoYCR7cm91bmQoZnJhbWVSYXRlKCkpfWAsIHdpZHRoIC0gNzUsIDUwKVxyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0iXX0=
