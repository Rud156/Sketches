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
    function Boundary(x, y, boundaryWidth, boundaryHeight, world) {
        var label = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'boundaryControlLines';

        _classCallCheck(this, Boundary);

        this.body = Matter.Bodies.rectangle(x, y, boundaryWidth, boundaryHeight, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: label,
            collisionFilter: {
                category: groundCategory,
                mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
            }
        });
        Matter.World.add(world, this.body);

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
        this.platforms = [];
        this.explosions = [];

        this.minForceMagnitude = 0.05;

        this.createGrounds();
        this.createBoundaries();
        this.createPlatforms();
        this.createPlayers();
        this.attachEventListeners();
    }

    _createClass(GameManager, [{
        key: 'createGrounds',
        value: function createGrounds() {
            for (var i = 25; i < width - 100; i += 275) {
                var randomValue = random(50, 200);
                this.grounds.push(new Ground(i + 100, height - randomValue / 2, 200, randomValue, this.world));
            }
        }
    }, {
        key: 'createBoundaries',
        value: function createBoundaries() {
            this.boundaries.push(new Boundary(5, height / 2, 10, height, this.world));
            this.boundaries.push(new Boundary(width - 5, height / 2, 10, height, this.world));
            this.boundaries.push(new Boundary(width / 2, 5, width, 10, this.world));
            this.boundaries.push(new Boundary(width / 2, height - 5, width, 10, this.world));
        }
    }, {
        key: 'createPlatforms',
        value: function createPlatforms() {
            this.platforms.push(new Boundary(150, height / 6.34, 300, 20, this.world, 'staticGround'));
            this.platforms.push(new Boundary(width - 150, height / 6.43, 300, 20, this.world, 'staticGround'));

            this.platforms.push(new Boundary(100, height / 2.17, 200, 20, this.world, 'staticGround'));
            this.platforms.push(new Boundary(width - 100, height / 2.17, 200, 20, this.world, 'staticGround'));

            this.platforms.push(new Boundary(width / 2, 200, 300, 20, this.world, 'staticGround'));
        }
    }, {
        key: 'createPlayers',
        value: function createPlayers() {
            this.players.push(new Player(this.grounds[0].body.position.x, 50, this.world, 0));
            this.players[0].setControlKeys(playerKeys[0]);

            this.players.push(new Player(this.grounds[this.grounds.length - 1].body.position.x, 50, this.world, 1, 179));
            this.players[1].setControlKeys(playerKeys[1]);
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
                    if (!basicFire.damaged) this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
                    basicFire.damaged = true;
                    basicFire.collisionFilter = {
                        category: bulletCollisionLayer,
                        mask: groundCategory
                    };
                    this.explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
                } else if (labelB === 'basicFire' && labelA.match(/^(staticGround|boundaryControlLines)$/)) {
                    var _basicFire = event.pairs[i].bodyB;
                    if (!_basicFire.damaged) this.explosions.push(new Explosion(_basicFire.position.x, _basicFire.position.y));
                    _basicFire.damaged = true;
                    _basicFire.collisionFilter = {
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
            this.platforms.forEach(function (element) {
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

var playerKeys = [[65, 68, 87, 83, 90, 88], [37, 39, 38, 40, 13, 32]];

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwicHVzaCIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJmcmljdGlvbkFpciIsInJlc3RpdHV0aW9uIiwiY29sbGlzaW9uRmlsdGVyIiwiY2F0ZWdvcnkiLCJtYXNrIiwiV29ybGQiLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJjb3MiLCJzaW4iLCJyZW1vdmUiLCJzcXJ0Iiwic3EiLCJ3aWR0aCIsImhlaWdodCIsIkJvdW5kYXJ5IiwiYm91bmRhcnlXaWR0aCIsImJvdW5kYXJ5SGVpZ2h0IiwicmVjdGFuZ2xlIiwiaXNTdGF0aWMiLCJncm91bmRDYXRlZ29yeSIsInBsYXllckNhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsInJlY3QiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsIm1vZGlmaWVkWSIsIm1vZGlmaWVkSGVpZ2h0IiwibW9kaWZpZWRXaWR0aCIsImZha2VCb3R0b21QYXJ0IiwiYm9keVZlcnRpY2VzIiwidmVydGljZXMiLCJmYWtlQm90dG9tVmVydGljZXMiLCJiZWdpblNoYXBlIiwidmVydGV4IiwiZW5kU2hhcGUiLCJQbGF5ZXIiLCJwbGF5ZXJJbmRleCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsIm1heEhlYWx0aCIsImRhbWFnZUxldmVsIiwiaGVhbHRoIiwiZnVsbEhlYWx0aENvbG9yIiwiaGFsZkhlYWx0aENvbG9yIiwiemVyb0hlYWx0aENvbG9yIiwia2V5cyIsImluZGV4IiwiY3VycmVudENvbG9yIiwibWFwcGVkSGVhbHRoIiwibGVycENvbG9yIiwicm90YXRlIiwibGluZSIsImFjdGl2ZUtleXMiLCJzZXRBbmd1bGFyVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsIm1pbkZvcmNlTWFnbml0dWRlIiwiY3JlYXRlR3JvdW5kcyIsImNyZWF0ZUJvdW5kYXJpZXMiLCJjcmVhdGVQbGF0Zm9ybXMiLCJjcmVhdGVQbGF5ZXJzIiwiYXR0YWNoRXZlbnRMaXN0ZW5lcnMiLCJyYW5kb21WYWx1ZSIsInNldENvbnRyb2xLZXlzIiwicGxheWVyS2V5cyIsIkV2ZW50cyIsIm9uIiwiZXZlbnQiLCJvblRyaWdnZXJFbnRlciIsIm9uVHJpZ2dlckV4aXQiLCJ1cGRhdGVFbmdpbmUiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCIsImJhc2ljRmlyZSIsInBsYXllciIsImRhbWFnZVBsYXllckJhc2ljIiwiYmFzaWNGaXJlQSIsImJhc2ljRmlyZUIiLCJleHBsb3Npb25Db2xsaWRlIiwicG9zWCIsInBvc1kiLCJidWxsZXRQb3MiLCJwbGF5ZXJQb3MiLCJkaXJlY3Rpb25WZWN0b3IiLCJzdWIiLCJzZXRNYWciLCJib2RpZXMiLCJDb21wb3NpdGUiLCJhbGxCb2RpZXMiLCJpc1NsZWVwaW5nIiwibWFzcyIsImVsZW1lbnQiLCJpc0NvbXBsZXRlIiwiZ2FtZU1hbmFnZXIiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0ZXh0U2l6ZSIsInRleHQiLCJyb3VuZCIsImZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxRO0FBQ0Ysc0JBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsV0FBbEIsRUFBK0JDLGVBQS9CLEVBQWdEO0FBQUE7O0FBQzVDLGFBQUtDLFFBQUwsR0FBZ0JDLGFB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QjtBQUNiLFFBQUlDLFNBQVNDLGFBQWFDLE9BQU9DLFVBQVAsR0FBb0IsRUFBakMsRUFBcUNELE9BQU9FLFdBQVAsR0FBcUIsRUFBMUQsQ0FBYjtBQUNBSixXQUFPSyxNQUFQLENBQWMsZUFBZDs7QUFFQVAsa0JBQWMsSUFBSW5ELFdBQUosRUFBZDs7QUFFQTJELGFBQVNDLE1BQVQ7QUFDSDs7QUFFRCxTQUFTQyxJQUFULEdBQWdCO0FBQ1pDLGVBQVcsQ0FBWDs7QUFFQVgsZ0JBQVlVLElBQVo7O0FBRUE3SSxTQUFLLEdBQUw7QUFDQStJLGFBQVMsRUFBVDtBQUNBQyxjQUFRQyxNQUFNQyxXQUFOLENBQVIsRUFBOEJ0SSxRQUFRLEVBQXRDLEVBQTBDLEVBQTFDO0FBQ0g7O0FBRUQsU0FBU3VJLFVBQVQsR0FBc0I7QUFDbEIsUUFBSUMsV0FBV2xGLFNBQWYsRUFDSUEsVUFBVWtGLE9BQVYsSUFBcUIsSUFBckI7O0FBRUosV0FBTyxLQUFQO0FBQ0g7O0FBRUQsU0FBU0MsV0FBVCxHQUF1QjtBQUNuQixRQUFJRCxXQUFXbEYsU0FBZixFQUNJQSxVQUFVa0YsT0FBVixJQUFxQixLQUFyQjs7QUFFSixXQUFPLEtBQVA7QUFDSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCAyMCkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMTtcclxuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGb3JjZShmb3JjZSkge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcclxuICAgICAgICBsZXQgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xyXG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWaXNpYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxyXG5cclxuY2xhc3MgRXhwbG9zaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQgPSA1KSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XHJcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcblxyXG4gICAgICAgIGxldCByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvZGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ29tcGxldGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgICAgIHBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJvdW5kYXJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB3b3JsZCwgbGFiZWwgPSAnYm91bmRhcnlDb250cm9sTGluZXMnKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gYm91bmRhcnlXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgfSkge1xyXG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCBtb2RpZmllZFksIGdyb3VuZFdpZHRoLCAyMCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcclxuICAgICAgICBsZXQgbW9kaWZpZWRXaWR0aCA9IDUwO1xyXG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCBmYWtlQm90dG9tVmVydGljZXMgPSB0aGlzLmZha2VCb3R0b21QYXJ0LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzBdLCBcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMl0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1sxXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1swXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXHJcbiAgICAgICAgXTtcclxuXHJcblxyXG4gICAgICAgIGJlZ2luU2hhcGUoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XHJcbiAgICAgICAgZW5kU2hhcGUoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPlxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdvcmxkLCBwbGF5ZXJJbmRleCwgYW5nbGUgPSAwLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBwbGF5ZXJDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgIH0pIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCAyMCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xyXG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IHBsYXllckluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodCgxKTtcclxuICAgICAgICBzdHJva2UoMCk7XHJcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xyXG5cclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiAxMDAgKyB3aWR0aCB8fCBwb3MueCA8IC0xMDAgfHwgcG9zLnkgPiBoZWlnaHQgKyAxMDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1szXV0pIHx8XHJcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBsZXQgYWJzWFZlbG9jaXR5ID0gYWJzKHhWZWxvY2l0eSk7XHJcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMF1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogLTAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmlzVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cclxuXHJcbmNsYXNzIEdhbWVNYW5hZ2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgICAgICB0aGlzLndvcmxkID0gdGhpcy5lbmdpbmUud29ybGQ7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUud29ybGQuZ3Jhdml0eS5zY2FsZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUdyb3VuZHMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUJvdW5kYXJpZXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVHcm91bmRzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAyNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oNTAsIDIwMCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDEwMCwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyMDAsIHJhbmRvbVZhbHVlLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDE1MCwgaGVpZ2h0IC8gNi4zNCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIDIwMCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQbGF5ZXJzKCkge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIodGhpcy5ncm91bmRzWzBdLmJvZHkucG9zaXRpb24ueCwgNTAsIHRoaXMud29ybGQsIDApKTtcclxuICAgICAgICB0aGlzLnBsYXllcnNbMF0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1swXSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIodGhpcy5ncm91bmRzW3RoaXMuZ3JvdW5kcy5sZW5ndGggLSAxXS5ib2R5LnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIDUwLCB0aGlzLndvcmxkLCAxLCAxNzkpKTtcclxuICAgICAgICB0aGlzLnBsYXllcnNbMV0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1sxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25FbmQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFeGl0KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRW5naW5lKGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihldmVudCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRXhpdChldmVudCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpIHtcclxuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcclxuICAgICAgICBsZXQgcG9zWSA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnkgKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLnkpIC8gMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XHJcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgcGxheWVyLmhlYWx0aCAtPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50ICogMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xyXG4gICAgWzY1LCA2OCwgODcsIDgzLCA5MCwgODhdLFxyXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxMywgMzJdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICA5MDogZmFsc2UsIC8vIFpcclxuICAgIDg4OiBmYWxzZSAvLyBYXHJcbn07XHJcblxyXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcclxuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XHJcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xyXG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcclxuXHJcbmxldCBnYW1lTWFuYWdlcjtcclxuXHJcbmZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XHJcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoKTtcclxuXHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuXHJcbiAgICBnYW1lTWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgZmlsbCgyNTUpO1xyXG4gICAgdGV4dFNpemUoMzApO1xyXG4gICAgdGV4dChgJHtyb3VuZChmcmFtZVJhdGUoKSl9YCwgd2lkdGggLSA3NSwgNTApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufSJdfQ==
