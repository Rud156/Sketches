'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectCollect = function () {
    function ObjectCollect(x, y, width, height, world, index) {
        _classCallCheck(this, ObjectCollect);

        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            label: 'collectibleFlag',
            friction: 0,
            frictionAir: 0,
            isSensor: true,
            collisionFilter: {
                category: flagCategory,
                mask: playerCategory
            }
        });
        Matter.World.add(world, this.body);
        Matter.Body.setAngularVelocity(this.body, 0.1);

        this.world = world;

        this.width = width;
        this.height = height;
        this.radius = 0.5 * sqrt(sq(width) + sq(height)) + 5;

        this.body.opponentCollided = false;
        this.body.playerCollided = false;
        this.body.index = index;

        this.alpha = 255;
        this.alphaReduceAmount = 20;

        this.playerOneColor = color(208, 0, 255);
        this.playerTwoColor = color(255, 165, 0);

        this.maxHealth = 300;
        this.health = this.maxHealth;
        this.changeRate = 1;
    }

    _createClass(ObjectCollect, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;
            var angle = this.body.angle;

            var currentColor = null;
            if (this.body.index === 0) currentColor = lerpColor(this.playerTwoColor, this.playerOneColor, this.health / this.maxHealth);else currentColor = lerpColor(this.playerOneColor, this.playerTwoColor, this.health / this.maxHealth);
            fill(currentColor);
            noStroke();

            rect(pos.x, pos.y - this.height - 10, this.width * 2 * this.health / this.maxHealth, 3);
            push();
            translate(pos.x, pos.y);
            rotate(angle);
            rect(0, 0, this.width, this.height);

            stroke(255, this.alpha);
            strokeWeight(3);
            noFill();
            ellipse(0, 0, this.radius * 2);
            pop();
        }
    }, {
        key: 'update',
        value: function update() {
            this.alpha -= this.alphaReduceAmount * 60 / frameRate();
            if (this.alpha < 0) this.alpha = 255;

            if (this.body.playerCollided && this.health < this.maxHealth) {
                this.health += this.changeRate * 60 / frameRate();
            }
            if (this.body.opponentCollided && this.health > 0) {
                this.health -= this.changeRate * 60 / frameRate();
            }
        }
    }, {
        key: 'removeFromWorld',
        value: function removeFromWorld() {
            Matter.World.remove(this.world, this.body);
        }
    }]);

    return ObjectCollect;
}();

var Particle = function () {
    function Particle(x, y, colorNumber, maxStrokeWeight) {
        var velocity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 20;

        _classCallCheck(this, Particle);

        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(0, velocity));
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
        var velocity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 20;
        var numberOfParticles = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 100;

        _classCallCheck(this, Explosion);

        explosionAudio.play();

        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        var randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.velocity = velocity;
        this.numberOfParticles = numberOfParticles;

        this.explode();
    }

    _createClass(Explosion, [{
        key: 'explode',
        value: function explode() {
            for (var i = 0; i < this.numberOfParticles; i++) {
                var particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight, this.velocity);
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

        fireAudio.play();

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

        this.body.health = map(this.radius, 5, 12, 34, 100);

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

var Platform = function () {
    function Platform(x, y, boundaryWidth, boundaryHeight, world) {
        var label = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'boundaryControlLines';
        var index = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : -1;

        _classCallCheck(this, Platform);

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
        this.body.index = index;
    }

    _createClass(Platform, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;

            if (this.body.index === 0) fill(208, 0, 255);else if (this.body.index === 1) fill(255, 165, 0);else fill(255, 0, 0);
            noStroke();

            rect(pos.x, pos.y, this.width, this.height);
        }
    }]);

    return Platform;
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
            fill(0, 100, 255);
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
            mask: groundCategory | playerCategory | basicFireCategory | flagCategory
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
        this.angularVelocity = 0.1;

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
        this.body.index = playerIndex;

        this.disableControls = false;
        this.angle = angle;
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
            rect(pos.x, pos.y - this.radius - 10, this.body.health * 100 / 100, 2);

            if (this.body.index === 0) fill(208, 0, 255);else fill(255, 165, 0);

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

            if (this.angle >= 2 * PI) this.angle = 0;
            var angle = this.angle;

            if (activeKeys[this.keys[2]]) {
                if (angle > PI) this.angle -= this.angularVelocity;else if (angle < PI) this.angle += this.angularVelocity;
            }
            if (activeKeys[this.keys[3]]) {
                if (angle > 0) {
                    var diff_1 = abs(2 * PI - angle);
                    var diff_2 = abs(0 - angle);
                    if (diff_1 < diff_2) {
                        this.angle += this.angularVelocity;
                    } else {
                        this.angle -= this.angularVelocity;
                    }
                } else if (angle < 0) this.angle += this.angularVelocity;
            }
            if (activeKeys[this.keys[4]]) {
                if (angle > 3 * PI / 2) this.angle -= this.angularVelocity;else if (angle < 3 * PI / 2) this.angle += this.angularVelocity;
            }
            if (activeKeys[this.keys[5]]) {
                if (angle > PI / 2) this.angle -= this.angularVelocity;else if (angle < PI / 2) this.angle += this.angularVelocity;
            }

            Matter.Body.setAngle(this.body, this.angle);
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
            }
        }
    }, {
        key: 'moveVertical',
        value: function moveVertical(activeKeys) {
            var xVelocity = this.body.velocity.x;

            if (activeKeys[this.keys[7]]) {
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

            activeKeys[this.keys[7]] = false;
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

            if (activeKeys[this.keys[6]]) {
                this.chargeStarted = true;
                this.currentChargeValue += this.chargeIncrementValue;

                this.currentChargeValue = this.currentChargeValue > this.maxChargeValue ? this.maxChargeValue : this.currentChargeValue;

                this.drawChargedShot(x, y, this.currentChargeValue);
            } else if (!activeKeys[this.keys[6]] && this.chargeStarted) {
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
            if (!this.disableControls) {
                this.rotateBlaster(activeKeys);
                this.moveHorizontal(activeKeys);
                this.moveVertical(activeKeys);

                this.chargeAndShoot(activeKeys);

                Matter.Body.setAngularVelocity(this.body, 0);
            }

            for (var i = 0; i < this.bullets.length; i++) {
                this.bullets[i].show();

                if (this.bullets[i].isVelocityZero() || this.bullets[i].isOutOfScreen()) {
                    this.bullets[i].removeFromWorld();
                    this.bullets.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }, {
        key: 'removeFromWorld',
        value: function removeFromWorld() {
            Matter.World.remove(this.world, this.body);
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

    _createClass(GameManager, [{
        key: 'createGrounds',
        value: function createGrounds() {}
    }, {
        key: 'createBoundaries',
        value: function createBoundaries() {
            this.boundaries.push(new Platform(5, height / 2, 10, height, this.world));
            this.boundaries.push(new Platform(width - 5, height / 2, 10, height, this.world));
            this.boundaries.push(new Platform(width / 2, 5, width, 10, this.world));
            this.boundaries.push(new Platform(width / 2, height - 5, width, 10, this.world, 'staticGround'));
        }
    }, {
        key: 'createPlatforms',
        value: function createPlatforms() {
            this.platforms.push(new Platform(150, height / 6.34, 300, 20, this.world, 'staticGround', 0));
            this.platforms.push(new Platform(width - 150, height / 6.43, 300, 20, this.world, 'staticGround', 1));

            this.platforms.push(new Platform(100, height / 2.17, 200, 20, this.world, 'staticGround'));
            this.platforms.push(new Platform(width - 100, height / 2.17, 200, 20, this.world, 'staticGround'));

            this.platforms.push(new Platform(width / 2, height / 3.17, 300, 20, this.world, 'staticGround'));
        }
    }, {
        key: 'createPlayers',
        value: function createPlayers() {
            this.players.push(new Player(40, height / 1.811, this.world, 1));
            this.players[0].setControlKeys(playerKeys[0]);

            var length = this.grounds.length;
            this.players.push(new Player(width - 40, height / 1.811, this.world, 0, PI));
            this.players[1].setControlKeys(playerKeys[1]);
        }
    }, {
        key: 'createFlags',
        value: function createFlags() {
            this.collectibleFlags.push(new ObjectCollect(50, 50, 20, 20, this.world, 1));
            this.collectibleFlags.push(new ObjectCollect(width - 50, 50, 20, 20, this.world, 0));
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
                    basicFire.friction = 1;
                    basicFire.frictionAir = 1;
                } else if (labelB === 'basicFire' && labelA.match(/^(staticGround|boundaryControlLines)$/)) {
                    var _basicFire = event.pairs[i].bodyB;
                    if (!_basicFire.damaged) this.explosions.push(new Explosion(_basicFire.position.x, _basicFire.position.y));
                    _basicFire.damaged = true;
                    _basicFire.collisionFilter = {
                        category: bulletCollisionLayer,
                        mask: groundCategory
                    };
                    _basicFire.friction = 1;
                    _basicFire.frictionAir = 1;
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
    }, {
        key: 'onTriggerExit',
        value: function onTriggerExit(event) {
            for (var i = 0; i < event.pairs.length; i++) {
                var labelA = event.pairs[i].bodyA.label;
                var labelB = event.pairs[i].bodyB.label;

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
    }, {
        key: 'explosionCollide',
        value: function explosionCollide(basicFireA, basicFireB) {
            var posX = (basicFireA.position.x + basicFireB.position.x) / 2;
            var posY = (basicFireA.position.y + basicFireB.position.y) / 2;

            var damageA = basicFireA.damageAmount;
            var damageB = basicFireB.damageAmount;
            var mappedDamageA = map(damageA, 2.5, 6, 34, 100);
            var mappedDamageB = map(damageB, 2.5, 6, 34, 100);

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
    }, {
        key: 'damagePlayerBasic',
        value: function damagePlayerBasic(player, basicFire) {
            player.damageLevel += basicFire.damageAmount;
            var mappedDamage = map(basicFire.damageAmount, 2.5, 6, 5, 34);
            player.health -= mappedDamage;

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

                if (body.isStatic || body.isSleeping || body.label === 'basicFire' || body.label === 'collectibleFlag') continue;

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

            for (var i = 0; i < this.collectibleFlags.length; i++) {
                this.collectibleFlags[i].update();
                this.collectibleFlags[i].show();

                if (this.collectibleFlags[i].health <= 0) {
                    var pos = this.collectibleFlags[i].body.position;
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

                    for (var j = 0; j < this.players.length; j++) {
                        this.players[j].disableControls = true;
                    }
                }
            }

            for (var _i = 0; _i < this.players.length; _i++) {
                this.players[_i].show();
                this.players[_i].update(keyStates);

                if (this.players[_i].body.health <= 0) {
                    var _pos = this.players[_i].body.position;
                    this.explosions.push(new Explosion(_pos.x, _pos.y, 10, 90, 200));

                    this.gameEnded = true;
                    this.playerWon.push(this.players[_i].body.index);

                    for (var _j = 0; _j < this.players.length; _j++) {
                        this.players[_j].disableControls = true;
                    }

                    this.players[_i].removeFromWorld();
                    this.players.splice(_i, 1);
                }
            }

            for (var _i2 = 0; _i2 < this.explosions.length; _i2++) {
                this.explosions[_i2].show();
                this.explosions[_i2].update();

                if (this.explosions[_i2].isComplete()) {
                    this.explosions.splice(_i2, 1);
                    _i2 -= 1;
                }
            }
        }
    }]);

    return GameManager;
}();

var playerKeys = [[65, 68, 71, 74, 89, 72, 32, 87], [37, 39, 100, 102, 104, 101, 96, 38]];

var keyStates = {
    102: false,
    100: false,
    104: false,
    101: false,
    37: false,
    38: false,
    39: false,
    96: false,
    87: false,
    65: false,
    32: false,
    68: false,
    71: false,
    74: false,
    89: false,
    72: false };

var groundCategory = 0x0001;
var playerCategory = 0x0002;
var basicFireCategory = 0x0004;
var bulletCollisionLayer = 0x0008;
var flagCategory = 0x0016;
var displayTime = 120;

var gameManager = null;
var endTime = void 0;
var seconds = 6;
var displayTextFor = displayTime;
var displayStartFor = displayTime;

var sceneCount = 0;
var explosions = [];

var button = void 0;
var buttonDisplayed = false;

var backgroundAudio = void 0;
var fireAudio = void 0;
var explosionAudio = void 0;

var divElement = void 0;

function preload() {
    divElement = document.createElement('div');
    divElement.style.fontSize = '100px';
    divElement.id = 'loadingDiv';
    divElement.className = 'justify-horizontal';
    document.body.appendChild(divElement);

    backgroundAudio = loadSound('/assets/audio/Background.mp3', successLoad, failLoad, whileLoading);
    fireAudio = loadSound('/assets/audio/Shoot.mp3', successLoad, failLoad);
    explosionAudio = loadSound('/assets/audio/Explosion.mp3', successLoad, failLoad);
}

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    button = createButton('Play');
    button.position(width / 2 - 62, height / 1.6);
    button.elt.className = 'button pulse';
    button.elt.style.display = 'none';
    button.mousePressed(resetGame);

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0);
    if (sceneCount === 0) {
        textStyle(BOLD);
        textSize(50);
        noStroke();
        fill(color('hsl(' + int(random(359)) + ', 100%, 50%)'));
        text('BALL BLASTERS', width / 2 + 10, 50);
        fill(255);
        textSize(20);
        text('LEFT/RIGHT to move, UP to jump, NUMPAD 0 to shoot and NUMPAD 8456 to rotate for Player 1', width / 2, height / 4);
        text('A/D to move, W to jump, SPACE to shoot and YGHJ to rotate for Player 2', width / 2, height / 2.75);
        textSize(30);
        fill(color('hsl(' + int(random(359)) + ', 100%, 50%)'));
        text('Destroy your opponent or capture their crystal to win', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Play Game';
            buttonDisplayed = true;
        }
    } else if (sceneCount === 1) {
        gameManager.draw();

        if (seconds > 0) {
            var currentTime = new Date().getTime();
            var diff = endTime - currentTime;
            seconds = Math.floor(diff % (1000 * 60) / 1000);

            fill(255);
            textSize(30);
            text('Crystals appear in: ' + seconds, width / 2, 50);
        } else {
            if (displayTextFor > 0) {
                displayTextFor -= 1 * 60 / formattedFrameRate();
                fill(255);
                textSize(30);
                text('Capture the opponent\'s base', width / 2, 50);
            }
        }

        if (displayStartFor > 0) {
            displayStartFor -= 1 * 60 / formattedFrameRate();
            fill(255);
            textSize(100);
            text('FIGHT', width / 2, height / 2);
        }

        if (gameManager.gameEnded) {
            if (gameManager.playerWon.length === 1) {
                if (gameManager.playerWon[0] === 0) {
                    fill(255);
                    textSize(100);
                    text('Player 1 Won', width / 2, height / 2 - 100);
                } else if (gameManager.playerWon[0] === 1) {
                    fill(255);
                    textSize(100);
                    text('Player 2 Won', width / 2, height / 2 - 100);
                }
            } else if (gameManager.playerWon.length === 2) {
                fill(255);
                textSize(100);
                text('Draw', width / 2, height / 2 - 100);
            }

            var randomValue = random();
            if (randomValue < 0.07) {
                explosions.push(new Explosion(random(0, width), random(0, height), random(0, 10), 90, 200));
                explosionAudio.play();
            }

            for (var i = 0; i < explosions.length; i++) {
                explosions[i].show();
                explosions[i].update();

                if (explosions[i].isComplete()) {
                    explosions.splice(i, 1);
                    i -= 1;
                }
            }

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                button.elt.innerText = 'Replay';
                buttonDisplayed = true;
            }
        }
    } else {}
}

function resetGame() {
    sceneCount = 1;
    seconds = 6;
    displayTextFor = displayTime;
    displayStartFor = displayTime;
    buttonDisplayed = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';

    explosions = [];

    gameManager = new GameManager();
    window.setTimeout(function () {
        gameManager.createFlags();
    }, 5000);

    var currentDateTime = new Date();
    endTime = new Date(currentDateTime.getTime() + 6000).getTime();
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;

    return false;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;

    return false;
}

function formattedFrameRate() {
    return frameRate() <= 0 ? 60 : frameRate();
}

function failLoad() {
    divElement.innerText = 'Unable to load the sound. Please try refreshing the page';
}

function successLoad() {
    console.log('All Sounds Loaded Properly');
    divElement.style.display = 'none';
}

function whileLoading(value) {
    divElement.innerText = 'Loaded ' + int(value * 100) + ' %';
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwicGxhdGZvcm0uanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImV4cGxvc2lvbkF1ZGlvIiwicGxheSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiZmlyZUF1ZGlvIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiUGxhdGZvcm0iLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJQSSIsImRpZmZfMSIsImFicyIsImRpZmZfMiIsInNldEFuZ2xlIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5Iiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJnYW1lRW5kZWQiLCJwbGF5ZXJXb24iLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsInNldENvbnRyb2xLZXlzIiwicGxheWVyS2V5cyIsIkV2ZW50cyIsIm9uIiwiZXZlbnQiLCJvblRyaWdnZXJFbnRlciIsIm9uVHJpZ2dlckV4aXQiLCJ1cGRhdGVFbmdpbmUiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCIsImJhc2ljRmlyZSIsInBsYXllciIsImRhbWFnZVBsYXllckJhc2ljIiwiYmFzaWNGaXJlQSIsImJhc2ljRmlyZUIiLCJleHBsb3Npb25Db2xsaWRlIiwicG9zWCIsInBvc1kiLCJkYW1hZ2VBIiwiZGFtYWdlQiIsIm1hcHBlZERhbWFnZUEiLCJtYXBwZWREYW1hZ2VCIiwibWFwcGVkRGFtYWdlIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiYm9kaWVzIiwiQ29tcG9zaXRlIiwiYWxsQm9kaWVzIiwiaXNTbGVlcGluZyIsIm1hc3MiLCJlbGVtZW50IiwiaiIsImtleVN0YXRlcyIsImlzQ29tcGxldGUiLCJkaXNwbGF5VGltZSIsImdhbWVNYW5hZ2VyIiwiZW5kVGltZSIsInNlY29uZHMiLCJkaXNwbGF5VGV4dEZvciIsImRpc3BsYXlTdGFydEZvciIsInNjZW5lQ291bnQiLCJidXR0b24iLCJidXR0b25EaXNwbGF5ZWQiLCJiYWNrZ3JvdW5kQXVkaW8iLCJkaXZFbGVtZW50IiwicHJlbG9hZCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlIiwiZm9udFNpemUiLCJpZCIsImNsYXNzTmFtZSIsImFwcGVuZENoaWxkIiwibG9hZFNvdW5kIiwic3VjY2Vzc0xvYWQiLCJmYWlsTG9hZCIsIndoaWxlTG9hZGluZyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiY3JlYXRlQnV0dG9uIiwiZWx0IiwiZGlzcGxheSIsIm1vdXNlUHJlc3NlZCIsInJlc2V0R2FtZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0ZXh0U3R5bGUiLCJCT0xEIiwidGV4dFNpemUiLCJ0ZXh0IiwiaW5uZXJUZXh0IiwiY3VycmVudFRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJmb3JtYXR0ZWRGcmFtZVJhdGUiLCJyYW5kb21WYWx1ZSIsInNldFRpbWVvdXQiLCJjcmVhdGVGbGFncyIsImN1cnJlbnREYXRlVGltZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiXSwibWFwcGlu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QUVBLFNBQUFTLFVBQUEsR0FBQTtBQUNBLFFBQUFDLFdBQUEzRCxTQUFBLEVBQ0FBLFVBQUEyRCxPQUFBLElBQUEsSUFBQTs7QUFFQSxXQUFBLEtBQUE7QUFDQTs7QUFFQSxTQUFBQyxXQUFBLEdBQUE7QUFDQSxRQUFBRCxXQUFBM0QsU0FBQSxFQUNBQSxVQUFBMkQsT0FBQSxJQUFBLEtBQUE7O0FBRUEsV0FBQSxLQUFBO0FBQ0E7O0FBRUEsU0FBQU4sa0JBQUEsR0FBQTtBQUNBLFdBQUE1TixlQUFBLENBQUEsR0FBQSxFQUFBLEdBQUFBLFdBQUE7QUFDQTs7QUFFQSxTQUFBOEwsUUFBQSxHQUFBO0FBQ0FYLGVBQUFrQyxTQUFBLEdBQUEsMERBQUE7QUFDQTs7QUFFQSxTQUFBeEIsV0FBQSxHQUFBO0FBQ0F1QyxZQUFBQyxHQUFBLENBQUEsNEJBQUE7QUFDQWxELGVBQUFJLEtBQUEsQ0FBQWtCLE9BQUEsR0FBQSxNQUFBO0FBQ0E7O0FBRUEsU0FBQVYsWUFBQSxDQUFBdUMsS0FBQSxFQUFBO0FBQ0FuRCxlQUFBa0MsU0FBQSxlQUFBM0wsSUFBQTRNLFFBQUEsR0FBQSxDQUFBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBPYmplY3RDb2xsZWN0IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIHdvcmxkLCBpbmRleCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdjb2xsZWN0aWJsZUZsYWcnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIGlzU2Vuc29yOiB0cnVlLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBmbGFnQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBwbGF5ZXJDYXRlZ29yeVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwLjEpO1xyXG5cclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSkgKyA1O1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xyXG4gICAgICAgIHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgPSAyMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVDb2xvciA9IGNvbG9yKDIwOCwgMCwgMjU1KTtcclxuICAgICAgICB0aGlzLnBsYXllclR3b0NvbG9yID0gY29sb3IoMjU1LCAxNjUsIDApO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDMwMDtcclxuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlUmF0ZSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMucGxheWVyVHdvQ29sb3IsIHRoaXMucGxheWVyT25lQ29sb3IsIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMucGxheWVyT25lQ29sb3IsIHRoaXMucGxheWVyVHdvQ29sb3IsIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgpO1xyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMuaGVpZ2h0IC0gMTAsIHRoaXMud2lkdGggKiAyICogdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCwgMyk7XHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHN0cm9rZSgyNTUsIHRoaXMuYWxwaGEpO1xyXG4gICAgICAgIHN0cm9rZVdlaWdodCgzKTtcclxuICAgICAgICBub0ZpbGwoKTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gdGhpcy5hbHBoYVJlZHVjZUFtb3VudCAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuYWxwaGEgPCAwKVxyXG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2R5LnBsYXllckNvbGxpZGVkICYmIHRoaXMuaGVhbHRoIDwgdGhpcy5tYXhIZWFsdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5oZWFsdGggKz0gdGhpcy5jaGFuZ2VSYXRlICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkICYmIHRoaXMuaGVhbHRoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgY29sb3JOdW1iZXIsIG1heFN0cm9rZVdlaWdodCwgdmVsb2NpdHkgPSAyMCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdChyYW5kb20oMCwgdmVsb2NpdHkpKTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XHJcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoZm9yY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBjb2xvcihgaHNsYSgke3RoaXMuY29sb3JOdW1iZXJ9LCAxMDAlLCA1MCUsICR7dGhpcy5hbHBoYX0pYCk7XHJcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcclxuICAgICAgICBwb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmlzaWJsZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBFeHBsb3Npb24ge1xyXG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUsIHZlbG9jaXR5ID0gMjAsIG51bWJlck9mUGFydGljbGVzID0gMTAwKSB7XHJcbiAgICAgICAgZXhwbG9zaW9uQXVkaW8ucGxheSgpO1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXMgPSBudW1iZXJPZlBhcnRpY2xlcztcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCwgdGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0NvbXBsZXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIGZpcmVBdWRpby5wbGF5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAzO1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IG1hcCh0aGlzLnJhZGl1cywgNSwgMTIsIDM0LCAxMDApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm9keS5kYW1hZ2VkKSB7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgICAgICBwb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHQgfHwgcG9zLnkgPCAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgUGxhdGZvcm0ge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHdvcmxkLCBsYWJlbCA9ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsIGluZGV4ID0gLTEpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBib3VuZGFyeVdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRhcnlIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDEpXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgIH0pIHtcclxuICAgICAgICBsZXQgbW9kaWZpZWRZID0geSAtIGdyb3VuZEhlaWdodCAvIDIgKyAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcclxuICAgICAgICB0aGlzLmZha2VCb3R0b21QYXJ0ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSArIDEwLCBtb2RpZmllZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxyXG4gICAgICAgICAgICBsYWJlbDogJ2JvdW5kYXJ5Q29udHJvbExpbmVzJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZEhlaWdodCA9IG1vZGlmaWVkSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDAsIDEwMCwgMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCBmYWtlQm90dG9tVmVydGljZXMgPSB0aGlzLmZha2VCb3R0b21QYXJ0LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzBdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMV0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1syXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMl0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbM11cclxuICAgICAgICBdO1xyXG5cclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcclxuICAgICAgICBlbmRTaGFwZSgpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPlxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdvcmxkLCBwbGF5ZXJJbmRleCwgYW5nbGUgPSAwLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBwbGF5ZXJDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBmbGFnQ2F0ZWdvcnlcclxuICAgIH0pIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCAyMCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjE7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xyXG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gcGxheWVySW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzYWJsZUNvbnRyb2xzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsICh0aGlzLmJvZHkuaGVhbHRoICogMTAwKSAvIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICAvLyAwIC0+IFJpZ2h0XHJcbiAgICAgICAgLy8gUEkgLT4gTGVmdFxyXG4gICAgICAgIC8vIFBJIC8gMiAtPiBEb3duXHJcbiAgICAgICAgLy8gMyAqIFBJIC8gMiAtPiBVcFxyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmdsZSA+PSAyICogUEkpXHJcbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSAwO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYW5nbGU7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlID4gUEkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC09IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgICAgICBlbHNlIGlmIChhbmdsZSA8IFBJKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmdsZSArPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xyXG4gICAgICAgICAgICBpZiAoYW5nbGUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZl8xID0gYWJzKDIgKiBQSSAtIGFuZ2xlKTtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmXzIgPSBhYnMoMCAtIGFuZ2xlKTtcclxuICAgICAgICAgICAgICAgIGlmIChkaWZmXzEgPCBkaWZmXzIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC09IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlIDwgMClcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlID4gMyAqIFBJIC8gMilcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgLT0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGFuZ2xlIDwgMyAqIFBJIC8gMilcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0pIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlID4gUEkgLyAyKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmdsZSAtPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICAgICAgZWxzZSBpZiAoYW5nbGUgPCBQSSAvIDIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5nbGUodGhpcy5ib2R5LCB0aGlzLmFuZ2xlKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1sxXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IDAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s3XV0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbdGhpcy5rZXlzWzddXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzZdXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s2XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVDb250cm9scykge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uaXNWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxhdGZvcm0uanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9vYmplY3QtY29sbGVjdC5qc1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLndvcmxkLmdyYXZpdHkuc2NhbGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmdyb3VuZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5taW5Gb3JjZU1hZ25pdHVkZSA9IDAuMDU7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJXb24gPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVHcm91bmRzKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVCb3VuZGFyaWVzKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXllcnMoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlR3JvdW5kcygpIHtcclxuICAgICAgICAvLyBUb2RvOiBJbXBsZW1lbnQgdGhpcyBmdW5jdGlvblxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IFBsYXRmb3JtKDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgUGxhdGZvcm0od2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IFBsYXRmb3JtKHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IFBsYXRmb3JtKHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXRmb3JtcygpIHtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0od2lkdGggLSAxNTAsIGhlaWdodCAvIDYuNDMsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAxKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybSh3aWR0aCAtIDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0od2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihcclxuICAgICAgICAgICAgNDAsXHJcbiAgICAgICAgICAgIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAxKSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5ncm91bmRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxyXG4gICAgICAgICAgICB3aWR0aCAtIDQwLFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCwgUEkpKTtcclxuICAgICAgICB0aGlzLnBsYXllcnNbMV0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1sxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlRmxhZ3MoKSB7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3QoNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCh3aWR0aCAtIDUwLCA1MCwgMjAsIDIwLCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25FbmQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFeGl0KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRW5naW5lKGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihldmVudCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQS5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFiYXNpY0ZpcmUuZGFtYWdlZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEucGxheWVyQ29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxBID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRXhpdChldmVudCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEIgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxBID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpIHtcclxuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcclxuICAgICAgICBsZXQgcG9zWSA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnkgKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLnkpIC8gMjtcclxuXHJcbiAgICAgICAgbGV0IGRhbWFnZUEgPSBiYXNpY0ZpcmVBLmRhbWFnZUFtb3VudDtcclxuICAgICAgICBsZXQgZGFtYWdlQiA9IGJhc2ljRmlyZUIuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2VBID0gbWFwKGRhbWFnZUEsIDIuNSwgNiwgMzQsIDEwMCk7XHJcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZUIgPSBtYXAoZGFtYWdlQiwgMi41LCA2LCAzNCwgMTAwKTtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlQS5oZWFsdGggLT0gbWFwcGVkRGFtYWdlQjtcclxuICAgICAgICBiYXNpY0ZpcmVCLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2VBO1xyXG5cclxuICAgICAgICBpZiAoYmFzaWNGaXJlQS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJhc2ljRmlyZUIuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQi5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQi5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvc1gsIHBvc1kpKTtcclxuICAgIH1cclxuXHJcbiAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSkge1xyXG4gICAgICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2UgPSBtYXAoYmFzaWNGaXJlLmRhbWFnZUFtb3VudCwgMi41LCA2LCA1LCAzNCk7XHJcbiAgICAgICAgcGxheWVyLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2U7XHJcblxyXG4gICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGJ1bGxldFBvcyA9IGNyZWF0ZVZlY3RvcihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIGxldCBwbGF5ZXJQb3MgPSBjcmVhdGVWZWN0b3IocGxheWVyLnBvc2l0aW9uLngsIHBsYXllci5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgbGV0IGRpcmVjdGlvblZlY3RvciA9IHA1LlZlY3Rvci5zdWIocGxheWVyUG9zLCBidWxsZXRQb3MpO1xyXG4gICAgICAgIGRpcmVjdGlvblZlY3Rvci5zZXRNYWcodGhpcy5taW5Gb3JjZU1hZ25pdHVkZSAqIHBsYXllci5kYW1hZ2VMZXZlbCAqIDAuMDUpO1xyXG5cclxuICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHBsYXllciwgcGxheWVyLnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgIHg6IGRpcmVjdGlvblZlY3Rvci54LFxyXG4gICAgICAgICAgICB5OiBkaXJlY3Rpb25WZWN0b3IueVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUVuZ2luZSgpIHtcclxuICAgICAgICBsZXQgYm9kaWVzID0gTWF0dGVyLkNvbXBvc2l0ZS5hbGxCb2RpZXModGhpcy5lbmdpbmUud29ybGQpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYm9keSA9IGJvZGllc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljIHx8IGJvZHkuaXNTbGVlcGluZyB8fCBib2R5LmxhYmVsID09PSAnYmFzaWNGaXJlJyB8fFxyXG4gICAgICAgICAgICAgICAgYm9keS5sYWJlbCA9PT0gJ2NvbGxlY3RpYmxlRmxhZycpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGJvZHkuZm9yY2UueSArPSBib2R5Lm1hc3MgKiAwLjAwMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZSh0aGlzLmVuZ2luZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5pbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uLnB1c2goMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucGxheWVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tqXS5kaXNhYmxlQ29udHJvbHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmJvZHkuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uLnB1c2godGhpcy5wbGF5ZXJzW2ldLmJvZHkuaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuXHJcbmNvbnN0IHBsYXllcktleXMgPSBbXHJcbiAgICAvLyBMZWZ0LCBSaWdodCwgTW92ZSBTaG9vdGVyIExlZnQsIE1vdmUgU2hvb3RlciBSaWdodCwgTW92ZSBTaG9vdGVyIFVwLCBNb3ZlIFNob290ZXIgRG93biwgU2hvb3QsIEp1bXBcclxuICAgIFs2NSwgNjgsIDcxLCA3NCwgODksIDcyLCAzMiwgODddLFxyXG4gICAgWzM3LCAzOSwgMTAwLCAxMDIsIDEwNCwgMTAxLCA5NiwgMzhdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMDI6IGZhbHNlLCAvLyBOVU1QQUQgNiAtIE1vdmUgU2hvb3RlciBMZWZ0XHJcbiAgICAxMDA6IGZhbHNlLCAvLyBOVU1QQUQgNCAtIE1vdmUgU2hvb3RlciBSaWdodFxyXG4gICAgMTA0OiBmYWxzZSwgLy8gTlVNUEFEIDggLSBNb3ZlIFNob290ZXIgVXBcclxuICAgIDEwMTogZmFsc2UsIC8vTlVNUEFEIDIgLSBNb3ZlIFNob290ZXIgRG93blxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUIC0gTW92ZSBMZWZ0XHJcbiAgICAzODogZmFsc2UsIC8vIFVQIC0gSnVtcFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVCAtIE1vdmUgUmlnaHRcclxuICAgIDk2OiBmYWxzZSwgLy8gTlVNUEFEIDAgLSBDaGFyZ2UgQW5kIFNob290XHJcbiAgICA4NzogZmFsc2UsIC8vIFcgLSBKdW1wXHJcbiAgICA2NTogZmFsc2UsIC8vIEEgLSBNb3ZlIExlZnRcclxuICAgIDMyOiBmYWxzZSwgLy8gUyAtIENoYXJnZSBBbmQgU2hvb3RcclxuICAgIDY4OiBmYWxzZSwgLy8gRCAtIE1vdmUgUmlnaHRcclxuICAgIDcxOiBmYWxzZSwgLy8gRyAtIE1vdmUgU2hvb3RlciBMZWZ0XHJcbiAgICA3NDogZmFsc2UsIC8vIEogLSBNb3ZlIFNob290ZXIgUmlnaHRcclxuICAgIDg5OiBmYWxzZSwgLy8gWSAtIE1vdmUgU2hvb3RlciBVcFxyXG4gICAgNzI6IGZhbHNlIC8vIEggLSBNb3ZlIFNob290ZXIgRG93blxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcbmNvbnN0IGZsYWdDYXRlZ29yeSA9IDB4MDAxNjtcclxuY29uc3QgZGlzcGxheVRpbWUgPSAxMjA7XHJcblxyXG5sZXQgZ2FtZU1hbmFnZXIgPSBudWxsO1xyXG5sZXQgZW5kVGltZTtcclxubGV0IHNlY29uZHMgPSA2O1xyXG5sZXQgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcclxubGV0IGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xyXG5cclxubGV0IHNjZW5lQ291bnQgPSAwO1xyXG5sZXQgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxubGV0IGJ1dHRvbjtcclxubGV0IGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xyXG5cclxubGV0IGJhY2tncm91bmRBdWRpbztcclxubGV0IGZpcmVBdWRpbztcclxubGV0IGV4cGxvc2lvbkF1ZGlvO1xyXG5cclxubGV0IGRpdkVsZW1lbnQ7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9ICcxMDBweCc7XHJcbiAgICBkaXZFbGVtZW50LmlkID0gJ2xvYWRpbmdEaXYnO1xyXG4gICAgZGl2RWxlbWVudC5jbGFzc05hbWUgPSAnanVzdGlmeS1ob3Jpem9udGFsJztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2RWxlbWVudCk7XHJcblxyXG4gICAgLy8gYmFja2dyb3VuZEF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8xNTUvMTU1MTM5XzIwOTg4ODQtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkLCB3aGlsZUxvYWRpbmcpO1xyXG4gICAgLy8gZmlyZUF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8yNzAvMjcwMzM1XzUxMjM4NTEtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuICAgIC8vIGV4cGxvc2lvbkF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8zODYvMzg2ODYyXzY4OTExMDItbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuXHJcbiAgICBiYWNrZ3JvdW5kQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vQmFja2dyb3VuZC5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQsIHdoaWxlTG9hZGluZyk7XHJcbiAgICBmaXJlQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vU2hvb3QubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuICAgIGV4cGxvc2lvbkF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL0V4cGxvc2lvbi5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUGxheScpO1xyXG4gICAgYnV0dG9uLnBvc2l0aW9uKHdpZHRoIC8gMiAtIDYyLCBoZWlnaHQgLyAxLjYpO1xyXG4gICAgYnV0dG9uLmVsdC5jbGFzc05hbWUgPSAnYnV0dG9uIHB1bHNlJztcclxuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGJ1dHRvbi5tb3VzZVByZXNzZWQocmVzZXRHYW1lKTtcclxuXHJcbiAgICAvLyBiYWNrZ3JvdW5kQXVkaW8uc2V0Vm9sdW1lKDAuMSk7XHJcbiAgICAvLyBiYWNrZ3JvdW5kQXVkaW8ucGxheSgpO1xyXG4gICAgLy8gYmFja2dyb3VuZEF1ZGlvLmxvb3AoKTtcclxuXHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBpZiAoc2NlbmVDb3VudCA9PT0gMCkge1xyXG4gICAgICAgIHRleHRTdHlsZShCT0xEKTtcclxuICAgICAgICB0ZXh0U2l6ZSg1MCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBmaWxsKGNvbG9yKGBoc2woJHtpbnQocmFuZG9tKDM1OSkpfSwgMTAwJSwgNTAlKWApKTtcclxuICAgICAgICB0ZXh0KCdCQUxMIEJMQVNURVJTJywgd2lkdGggLyAyICsgMTAsIDUwKTtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgdGV4dFNpemUoMjApO1xyXG4gICAgICAgIHRleHQoJ0xFRlQvUklHSFQgdG8gbW92ZSwgVVAgdG8ganVtcCwgTlVNUEFEIDAgdG8gc2hvb3QgYW5kIE5VTVBBRCA4NDU2IHRvIHJvdGF0ZSBmb3IgUGxheWVyIDEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDQpO1xyXG4gICAgICAgIHRleHQoJ0EvRCB0byBtb3ZlLCBXIHRvIGp1bXAsIFNQQUNFIHRvIHNob290IGFuZCBZR0hKIHRvIHJvdGF0ZSBmb3IgUGxheWVyIDInLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIuNzUpO1xyXG4gICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICBmaWxsKGNvbG9yKGBoc2woJHtpbnQocmFuZG9tKDM1OSkpfSwgMTAwJSwgNTAlKWApKTtcclxuICAgICAgICB0ZXh0KCdEZXN0cm95IHlvdXIgb3Bwb25lbnQgb3IgY2FwdHVyZSB0aGVpciBjcnlzdGFsIHRvIHdpbicsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUGxheSBHYW1lJztcclxuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHNjZW5lQ291bnQgPT09IDEpIHtcclxuICAgICAgICBnYW1lTWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIGlmIChzZWNvbmRzID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgbGV0IGRpZmYgPSBlbmRUaW1lIC0gY3VycmVudFRpbWU7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKChkaWZmICUgKDEwMDAgKiA2MCkpIC8gMTAwMCk7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICAgICAgdGV4dChgQ3J5c3RhbHMgYXBwZWFyIGluOiAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0KGBDYXB0dXJlIHRoZSBvcHBvbmVudCdzIGJhc2VgLCB3aWR0aCAvIDIsIDUwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRpc3BsYXlTdGFydEZvciA+IDApIHtcclxuICAgICAgICAgICAgZGlzcGxheVN0YXJ0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgIHRleHQoYEZJR0hUYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnYW1lTWFuYWdlci5nYW1lRW5kZWQpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbi5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMSBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbi5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0KGBEcmF3YCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyIC0gMTAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuMDcpIHtcclxuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXhwbG9zaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgaGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIDEwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgOTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwMFxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25BdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChleHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XHJcbiAgICBzY2VuZUNvdW50ID0gMTtcclxuICAgIHNlY29uZHMgPSA2O1xyXG4gICAgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcclxuICAgIGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcblxyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybWF0dGVkRnJhbWVSYXRlKCkge1xyXG4gICAgcmV0dXJuIGZyYW1lUmF0ZSgpIDw9IDAgPyA2MCA6IGZyYW1lUmF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmYWlsTG9hZCgpIHtcclxuICAgIGRpdkVsZW1lbnQuaW5uZXJUZXh0ID0gJ1VuYWJsZSB0byBsb2FkIHRoZSBzb3VuZC4gUGxlYXNlIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlJztcclxufVxyXG5cclxuZnVuY3Rpb24gc3VjY2Vzc0xvYWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQWxsIFNvdW5kcyBMb2FkZWQgUHJvcGVybHknKTtcclxuICAgIGRpdkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gd2hpbGVMb2FkaW5nKHZhbHVlKSB7XHJcbiAgICBkaXZFbGVtZW50LmlubmVyVGV4dCA9IGBMb2FkZWQgJHtpbnQodmFsdWUgKiAxMDApfSAlYDtcclxufSJdfQ==
