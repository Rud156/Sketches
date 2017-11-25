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

var Boundary = function () {
    function Boundary(x, y, boundaryWidth, boundaryHeight, world) {
        var label = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'boundaryControlLines';
        var index = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : -1;

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
        this.body.index = index;
    }

    _createClass(Boundary, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;

            if (this.body.index === 0) fill(208, 0, 255);else if (this.body.index === 1) fill(255, 165, 0);else fill(255, 0, 0);
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
        value: function createGrounds() {
            for (var i = 12.5; i < width - 100; i += 275) {
                var randomValue = random(height / 6.34, height / 3.17);
                this.grounds.push(new Ground(i + 125, height - randomValue / 2, 250, randomValue, this.world));
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
            this.platforms.push(new Boundary(150, height / 6.34, 300, 20, this.world, 'staticGround', 0));
            this.platforms.push(new Boundary(width - 150, height / 6.43, 300, 20, this.world, 'staticGround', 1));

            this.platforms.push(new Boundary(100, height / 2.17, 200, 20, this.world, 'staticGround'));
            this.platforms.push(new Boundary(width - 100, height / 2.17, 200, 20, this.world, 'staticGround'));

            this.platforms.push(new Boundary(width / 2, height / 3.17, 300, 20, this.world, 'staticGround'));
        }
    }, {
        key: 'createPlayers',
        value: function createPlayers() {
            this.players.push(new Player(this.grounds[0].body.position.x + this.grounds[0].width / 2 - 40, height / 1.811, this.world, 1));
            this.players[0].setControlKeys(playerKeys[0]);

            var length = this.grounds.length;
            this.players.push(new Player(this.grounds[length - 1].body.position.x - this.grounds[length - 1].width / 2 + 40, height / 1.811, this.world, 0, PI));
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

var playerKeys = [[65, 68, 71, 74, 89, 72, 32, 87], [37, 39, 100, 102, 104, 101, 17, 38]];

var keyStates = {
    102: false,
    100: false,
    104: false,
    101: false,
    37: false,
    38: false,
    39: false,
    17: false,
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

    backgroundAudio.setVolume(0.1);
    backgroundAudio.play();
    backgroundAudio.loop();

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
        text('LEFT/RIGHT to move, UP to jump, CTRL to shoot and NUMPAD 8456 to rotate for Player 1', width / 2, height / 4);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImV4cGxvc2lvbkF1ZGlvIiwicGxheSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiZmlyZUF1ZGlvIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJQSSIsImRpZmZfMSIsImFicyIsImRpZmZfMiIsInNldEFuZ2xlIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5Iiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJnYW1lRW5kZWQiLCJwbGF5ZXJXb24iLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJwbGF5ZXJLZXlzIiwiRXZlbnRzIiwib24iLCJldmVudCIsIm9uVHJpZ2dlckVudGVyIiwib25UcmlnZ2VyRXhpdCIsInVwZGF0ZUVuZ2luZSIsInBhaXJzIiwibGFiZWxBIiwiYm9keUEiLCJsYWJlbEIiLCJib2R5QiIsIm1hdGNoIiwiYmFzaWNGaXJlIiwicGxheWVyIiwiZGFtYWdlUGxheWVyQmFzaWMiLCJiYXNpY0ZpcmVBIiwiYmFzaWNGaXJlQiIsImV4cGxvc2lvbkNvbGxpZGUiLCJwb3NYIiwicG9zWSIsImRhbWFnZUEiLCJkYW1hZ2VCIiwibWFwcGVkRGFtYWdlQSIsIm1hcHBlZERhbWFnZUIiLCJtYXBwZWREYW1hZ2UiLCJidWxsZXRQb3MiLCJwbGF5ZXJQb3MiLCJkaXJlY3Rpb25WZWN0b3IiLCJzdWIiLCJzZXRNYWciLCJib2RpZXMiLCJDb21wb3NpdGUiLCJhbGxCb2RpZXMiLCJpc1NsZWVwaW5nIiwibWFzcyIsImVsZW1lbnQiLCJqIiwia2V5U3RhdGVzIiwiaXNDb21wbGV0ZSIsImRpc3BsYXlUaW1lIiwiZ2FtZU1hbmFnZXIiLCJlbmRUaW1lIiwic2Vjb25kcyIsImRpc3BsYXlUZXh0Rm9yIiwiZGlzcGxheVN0YXJ0Rm9yIiwic2NlbmVDb3VudCIsImJ1dHRvbiIsImJ1dHRvbkRpc3BsYXllZCIsImJhY2tncm91bmRBdWRpbyIsImRpdkVsZW1lbnQiLCJwcmVsb2FkIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJmb250U2l6ZSIsImlkIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJsb2FkU291bmQiLCJzdWNjZXNzTG9hZCIsImZhaWxMb2FkIiwid2hpbGVMb2FkaW5nIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJjcmVhdGVCdXR0b24iLCJlbHQiLCJkaXNwbGF5IiwibW91c2VQcmVzc2VkIiwicmVzZXRHYW1lIiwic2V0Vm9sdW1lIiwibG9vcCIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0ZXh0U3R5bGUiLCJCT0xEIiwidGV4dFNpemUiLCJ0ZXh0IiwiaW5uZXJUZXh0IiwiY3VycmVudFRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJmb3JtYXR0ZWRGcmFtZVJhdGUiLCJzZXRUaW1lb3V0IiwiY3JlYXRlRmxhZ3MiLCJjdXJyZW50RGF0ZVRpbWUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIiwiY29uc29sZSIsImxv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QTFCLFdBQUEsR0FBQTtBQUNBd0MsWUFBQUMsR0FBQSxDQUFBLDRCQUFBO0FBQ0FuRCxlQUFBSSxLQUFBLENBQUFrQixPQUFBLEdBQUEsTUFBQTtBQUNBOztBQUVBLFNBQUFWLFlBQUEsQ0FBQXdDLEtBQUEsRUFBQTtBQUNBcEQsZUFBQW9DLFNBQUEsZUFBQTlMLElBQUE4TSxRQUFBLEdBQUEsQ0FBQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgT2JqZWN0Q29sbGVjdCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0LCB3b3JsZCwgaW5kZXgpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnY29sbGVjdGlibGVGbGFnJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxyXG4gICAgICAgICAgICBpc1NlbnNvcjogdHJ1ZSxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZmxhZ0NhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogcGxheWVyQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMC4xKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAwLjUgKiBzcXJ0KHNxKHdpZHRoKSArIHNxKGhlaWdodCkpICsgNTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IDI1NTtcclxuICAgICAgICB0aGlzLmFscGhhUmVkdWNlQW1vdW50ID0gMjA7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVyT25lQ29sb3IgPSBjb2xvcigyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29Db2xvciA9IGNvbG9yKDI1NSwgMTY1LCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAzMDA7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmNoYW5nZVJhdGUgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLmhlaWdodCAtIDEwLCB0aGlzLndpZHRoICogMiAqIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgsIDMpO1xyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2UoMjU1LCB0aGlzLmFscGhhKTtcclxuICAgICAgICBzdHJva2VXZWlnaHQoMyk7XHJcbiAgICAgICAgbm9GaWxsKCk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmFscGhhIC09IHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmFscGhhIDwgMClcclxuICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDI1NTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA8IHRoaXMubWF4SGVhbHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoICs9IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkub3Bwb25lbnRDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gdGhpcy5jaGFuZ2VSYXRlICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufSIsImNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQsIHZlbG9jaXR5ID0gMjApIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIHZlbG9jaXR5KSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xyXG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gY29sb3IoYGhzbGEoJHt0aGlzLmNvbG9yTnVtYmVyfSwgMTAwJSwgNTAlLCAke3RoaXMuYWxwaGF9KWApO1xyXG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XHJcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1Zpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxyXG5cclxuY2xhc3MgRXhwbG9zaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQgPSA1LCB2ZWxvY2l0eSA9IDIwLCBudW1iZXJPZlBhcnRpY2xlcyA9IDEwMCkge1xyXG4gICAgICAgIGV4cGxvc2lvbkF1ZGlvLnBsYXkoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XHJcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcblxyXG4gICAgICAgIGxldCByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgICB0aGlzLm51bWJlck9mUGFydGljbGVzID0gbnVtYmVyT2ZQYXJ0aWNsZXM7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvZGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mUGFydGljbGVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQsIHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNDb21wbGV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICBmaXJlQXVkaW8ucGxheSgpO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSBtYXAodGhpcy5yYWRpdXMsIDUsIDEyLCAzNCwgMTAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJvZHkuZGFtYWdlZCkge1xyXG5cclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHB1c2goKTtcclxuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICAgICAgcG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0IHx8IHBvcy55IDwgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJvdW5kYXJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB3b3JsZCwgbGFiZWwgPSAnYm91bmRhcnlDb250cm9sTGluZXMnLCBpbmRleCA9IC0xKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gYm91bmRhcnlXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAxKVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMTY1LCAwKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICB9KSB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBtb2RpZmllZEhlaWdodCA9IGdyb3VuZEhlaWdodCAtIDIwO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XHJcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcclxuICAgICAgICAgICAgbGFiZWw6ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuZmFrZUJvdHRvbVBhcnQpO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkV2lkdGggPSBtb2RpZmllZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAxMDAsIDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgdmVydGljZXMgPSBbXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMl0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1sxXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbM10sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1swXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXHJcbiAgICAgICAgXTtcclxuXHJcblxyXG4gICAgICAgIGJlZ2luU2hhcGUoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XHJcbiAgICAgICAgZW5kU2hhcGUoKTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgZmxhZ0NhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4xO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IHBsYXllckluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmRpc2FibGVDb250cm9scyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb250cm9sS2V5cyhrZXlzKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIGxldCBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5ib2R5LmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XHJcbiAgICAgICAgaWYgKG1hcHBlZEhlYWx0aCA8IDUwKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAobWFwcGVkSGVhbHRoIC0gNTApIC8gNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLnJhZGl1cyAtIDEwLCAodGhpcy5ib2R5LmhlYWx0aCAqIDEwMCkgLyAxMDAsIDIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IDEwMCArIHdpZHRoIHx8IHBvcy54IDwgLTEwMCB8fCBwb3MueSA+IGhlaWdodCArIDEwMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgLy8gMCAtPiBSaWdodFxyXG4gICAgICAgIC8vIFBJIC0+IExlZnRcclxuICAgICAgICAvLyBQSSAvIDIgLT4gRG93blxyXG4gICAgICAgIC8vIDMgKiBQSSAvIDIgLT4gVXBcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYW5nbGUgPj0gMiAqIFBJKVxyXG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gMDtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmFuZ2xlO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA+IFBJKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmdsZSAtPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICAgICAgZWxzZSBpZiAoYW5nbGUgPCBQSSlcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFuZ2xlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmZfMSA9IGFicygyICogUEkgLSBhbmdsZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZl8yID0gYWJzKDAgLSBhbmdsZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlmZl8xIDwgZGlmZl8yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmdsZSArPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmdsZSAtPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmdsZSA8IDApXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA+IDMgKiBQSSAvIDIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC09IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgICAgICBlbHNlIGlmIChhbmdsZSA8IDMgKiBQSSAvIDIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmdsZSA+IFBJIC8gMilcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgLT0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGFuZ2xlIDwgUEkgLyAyKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmdsZSArPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ2xlKHRoaXMuYm9keSwgdGhpcy5hbmdsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcclxuICAgICAgICBsZXQgc2lnbiA9IHhWZWxvY2l0eSA8IDAgPyAtMSA6IDE7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbN11dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s3XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s2XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNl1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmlzVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vb2JqZWN0LWNvbGxlY3QuanNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZDtcclxuICAgICAgICB0aGlzLmVuZ2luZS53b3JsZC5ncmF2aXR5LnNjYWxlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5ncm91bmRzID0gW107XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucGxheWVyV29uID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxhdGZvcm1zKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUdyb3VuZHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEyLjU7IGkgPCB3aWR0aCAtIDEwMDsgaSArPSAyNzUpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKGhlaWdodCAvIDYuMzQsIGhlaWdodCAvIDMuMTcpO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyAxMjUsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjUwLCByYW5kb21WYWx1ZSwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVCb3VuZGFyaWVzKCkge1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSg1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAtIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXRmb3JtcygpIHtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxNTAsIGhlaWdodCAvIDYuNDMsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAxKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRzWzBdLmJvZHkucG9zaXRpb24ueCArIHRoaXMuZ3JvdW5kc1swXS53aWR0aCAvIDIgLSA0MCxcclxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEpKTtcclxuICAgICAgICB0aGlzLnBsYXllcnNbMF0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1swXSk7XHJcblxyXG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmdyb3VuZHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kc1tsZW5ndGggLSAxXS5ib2R5LnBvc2l0aW9uLnggLSB0aGlzLmdyb3VuZHNbbGVuZ3RoIC0gMV0ud2lkdGggLyAyICsgNDAsXHJcbiAgICAgICAgICAgIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAwLCBQSSkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVGbGFncygpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCg1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMSkpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDApKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xyXG4gICAgICAgIGxldCBwb3NYID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueCArIGJhc2ljRmlyZUIucG9zaXRpb24ueCkgLyAyO1xyXG4gICAgICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xyXG5cclxuICAgICAgICBsZXQgZGFtYWdlQSA9IGJhc2ljRmlyZUEuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIGxldCBkYW1hZ2VCID0gYmFzaWNGaXJlQi5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZUEgPSBtYXAoZGFtYWdlQSwgMi41LCA2LCAzNCwgMTAwKTtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlQiA9IG1hcChkYW1hZ2VCLCAyLjUsIDYsIDM0LCAxMDApO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmVBLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2VCO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuaGVhbHRoIC09IG1hcHBlZERhbWFnZUE7XHJcblxyXG4gICAgICAgIGlmIChiYXNpY0ZpcmVBLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFzaWNGaXJlQi5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XHJcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZSA9IG1hcChiYXNpY0ZpcmUuZGFtYWdlQW1vdW50LCAyLjUsIDYsIDUsIDM0KTtcclxuICAgICAgICBwbGF5ZXIuaGVhbHRoIC09IG1hcHBlZERhbWFnZTtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnIHx8XHJcbiAgICAgICAgICAgICAgICBib2R5LmxhYmVsID09PSAnY29sbGVjdGlibGVGbGFnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIDAuMDAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlibGVGbGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCh0aGlzLnBsYXllcnNbaV0uYm9keS5pbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbal0uZGlzYWJsZUNvbnRyb2xzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG5cclxuY29uc3QgcGxheWVyS2V5cyA9IFtcclxuICAgIC8vIExlZnQsIFJpZ2h0LCBNb3ZlIFNob290ZXIgTGVmdCwgTW92ZSBTaG9vdGVyIFJpZ2h0LCBNb3ZlIFNob290ZXIgVXAsIE1vdmUgU2hvb3RlciBEb3duLCBTaG9vdCwgSnVtcFxyXG4gICAgWzY1LCA2OCwgNzEsIDc0LCA4OSwgNzIsIDMyLCA4N10sXHJcbiAgICBbMzcsIDM5LCAxMDAsIDEwMiwgMTA0LCAxMDEsIDE3LCAzOF1cclxuXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDEwMjogZmFsc2UsIC8vIE5VTVBBRCA2IC0gTW92ZSBTaG9vdGVyIExlZnRcclxuICAgIDEwMDogZmFsc2UsIC8vIE5VTVBBRCA0IC0gTW92ZSBTaG9vdGVyIFJpZ2h0XHJcbiAgICAxMDQ6IGZhbHNlLCAvLyBOVU1QQUQgOCAtIE1vdmUgU2hvb3RlciBVcFxyXG4gICAgMTAxOiBmYWxzZSwgLy9OVU1QQUQgMiAtIE1vdmUgU2hvb3RlciBEb3duXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlQgLSBNb3ZlIExlZnRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVAgLSBKdW1wXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUIC0gTW92ZSBSaWdodFxyXG4gICAgMTc6IGZhbHNlLCAvLyBET1dOIC0gQ2hhcmdlIEFuZCBTaG9vdFxyXG4gICAgODc6IGZhbHNlLCAvLyBXIC0gSnVtcFxyXG4gICAgNjU6IGZhbHNlLCAvLyBBIC0gTW92ZSBMZWZ0XHJcbiAgICAzMjogZmFsc2UsIC8vIFMgLSBDaGFyZ2UgQW5kIFNob290XHJcbiAgICA2ODogZmFsc2UsIC8vIEQgLSBNb3ZlIFJpZ2h0XHJcbiAgICA3MTogZmFsc2UsIC8vIEcgLSBNb3ZlIFNob290ZXIgTGVmdFxyXG4gICAgNzQ6IGZhbHNlLCAvLyBKIC0gTW92ZSBTaG9vdGVyIFJpZ2h0XHJcbiAgICA4OTogZmFsc2UsIC8vIFkgLSBNb3ZlIFNob290ZXIgVXBcclxuICAgIDcyOiBmYWxzZSAvLyBIIC0gTW92ZSBTaG9vdGVyIERvd25cclxufTtcclxuXHJcbmNvbnN0IGdyb3VuZENhdGVnb3J5ID0gMHgwMDAxO1xyXG5jb25zdCBwbGF5ZXJDYXRlZ29yeSA9IDB4MDAwMjtcclxuY29uc3QgYmFzaWNGaXJlQ2F0ZWdvcnkgPSAweDAwMDQ7XHJcbmNvbnN0IGJ1bGxldENvbGxpc2lvbkxheWVyID0gMHgwMDA4O1xyXG5jb25zdCBmbGFnQ2F0ZWdvcnkgPSAweDAwMTY7XHJcbmNvbnN0IGRpc3BsYXlUaW1lID0gMTIwO1xyXG5cclxubGV0IGdhbWVNYW5hZ2VyID0gbnVsbDtcclxubGV0IGVuZFRpbWU7XHJcbmxldCBzZWNvbmRzID0gNjtcclxubGV0IGRpc3BsYXlUZXh0Rm9yID0gZGlzcGxheVRpbWU7XHJcbmxldCBkaXNwbGF5U3RhcnRGb3IgPSBkaXNwbGF5VGltZTtcclxuXHJcbmxldCBzY2VuZUNvdW50ID0gMDtcclxubGV0IGV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbmxldCBidXR0b247XHJcbmxldCBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcclxuXHJcbmxldCBiYWNrZ3JvdW5kQXVkaW87XHJcbmxldCBmaXJlQXVkaW87XHJcbmxldCBleHBsb3Npb25BdWRpbztcclxuXHJcbmxldCBkaXZFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGRpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdkVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSAnMTAwcHgnO1xyXG4gICAgZGl2RWxlbWVudC5pZCA9ICdsb2FkaW5nRGl2JztcclxuICAgIGRpdkVsZW1lbnQuY2xhc3NOYW1lID0gJ2p1c3RpZnktaG9yaXpvbnRhbCc7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdkVsZW1lbnQpO1xyXG5cclxuICAgIC8vIGJhY2tncm91bmRBdWRpbyA9IGxvYWRTb3VuZCgnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMTU1LzE1NTEzOV8yMDk4ODg0LWxxLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCwgd2hpbGVMb2FkaW5nKTtcclxuICAgIC8vIGZpcmVBdWRpbyA9IGxvYWRTb3VuZCgnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMjcwLzI3MDMzNV81MTIzODUxLWxxLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XHJcbiAgICAvLyBleHBsb3Npb25BdWRpbyA9IGxvYWRTb3VuZCgnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzg2LzM4Njg2Ml82ODkxMTAyLWxxLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XHJcblxyXG4gICAgYmFja2dyb3VuZEF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL0JhY2tncm91bmQubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkLCB3aGlsZUxvYWRpbmcpO1xyXG4gICAgZmlyZUF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL1Nob290Lm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XHJcbiAgICBleHBsb3Npb25BdWRpbyA9IGxvYWRTb3VuZCgnL2Fzc2V0cy9hdWRpby9FeHBsb3Npb24ubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcclxuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcclxuXHJcbiAgICBidXR0b24gPSBjcmVhdGVCdXR0b24oJ1BsYXknKTtcclxuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMS42KTtcclxuICAgIGJ1dHRvbi5lbHQuY2xhc3NOYW1lID0gJ2J1dHRvbiBwdWxzZSc7XHJcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBidXR0b24ubW91c2VQcmVzc2VkKHJlc2V0R2FtZSk7XHJcblxyXG4gICAgYmFja2dyb3VuZEF1ZGlvLnNldFZvbHVtZSgwLjEpO1xyXG4gICAgYmFja2dyb3VuZEF1ZGlvLnBsYXkoKTtcclxuICAgIGJhY2tncm91bmRBdWRpby5sb29wKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgaWYgKHNjZW5lQ291bnQgPT09IDApIHtcclxuICAgICAgICB0ZXh0U3R5bGUoQk9MRCk7XHJcbiAgICAgICAgdGV4dFNpemUoNTApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZmlsbChjb2xvcihgaHNsKCR7aW50KHJhbmRvbSgzNTkpKX0sIDEwMCUsIDUwJSlgKSk7XHJcbiAgICAgICAgdGV4dCgnQkFMTCBCTEFTVEVSUycsIHdpZHRoIC8gMiArIDEwLCA1MCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHRTaXplKDIwKTtcclxuICAgICAgICB0ZXh0KCdMRUZUL1JJR0hUIHRvIG1vdmUsIFVQIHRvIGp1bXAsIENUUkwgdG8gc2hvb3QgYW5kIE5VTVBBRCA4NDU2IHRvIHJvdGF0ZSBmb3IgUGxheWVyIDEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDQpO1xyXG4gICAgICAgIHRleHQoJ0EvRCB0byBtb3ZlLCBXIHRvIGp1bXAsIFNQQUNFIHRvIHNob290IGFuZCBZR0hKIHRvIHJvdGF0ZSBmb3IgUGxheWVyIDInLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIuNzUpO1xyXG4gICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICBmaWxsKGNvbG9yKGBoc2woJHtpbnQocmFuZG9tKDM1OSkpfSwgMTAwJSwgNTAlKWApKTtcclxuICAgICAgICB0ZXh0KCdEZXN0cm95IHlvdXIgb3Bwb25lbnQgb3IgY2FwdHVyZSB0aGVpciBjcnlzdGFsIHRvIHdpbicsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUGxheSBHYW1lJztcclxuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHNjZW5lQ291bnQgPT09IDEpIHtcclxuICAgICAgICBnYW1lTWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIGlmIChzZWNvbmRzID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgbGV0IGRpZmYgPSBlbmRUaW1lIC0gY3VycmVudFRpbWU7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKChkaWZmICUgKDEwMDAgKiA2MCkpIC8gMTAwMCk7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICAgICAgdGV4dChgQ3J5c3RhbHMgYXBwZWFyIGluOiAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0KGBDYXB0dXJlIHRoZSBvcHBvbmVudCdzIGJhc2VgLCB3aWR0aCAvIDIsIDUwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRpc3BsYXlTdGFydEZvciA+IDApIHtcclxuICAgICAgICAgICAgZGlzcGxheVN0YXJ0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgIHRleHQoYEZJR0hUYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnYW1lTWFuYWdlci5nYW1lRW5kZWQpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbi5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMSBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbi5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0KGBEcmF3YCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyIC0gMTAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuMDcpIHtcclxuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXhwbG9zaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgaGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIDEwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgOTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwMFxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25BdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChleHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XHJcbiAgICBzY2VuZUNvdW50ID0gMTtcclxuICAgIHNlY29uZHMgPSA2O1xyXG4gICAgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcclxuICAgIGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcblxyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybWF0dGVkRnJhbWVSYXRlKCkge1xyXG4gICAgcmV0dXJuIGZyYW1lUmF0ZSgpIDw9IDAgPyA2MCA6IGZyYW1lUmF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmYWlsTG9hZCgpIHtcclxuICAgIGRpdkVsZW1lbnQuaW5uZXJUZXh0ID0gJ1VuYWJsZSB0byBsb2FkIHRoZSBzb3VuZC4gUGxlYXNlIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlJztcclxufVxyXG5cclxuZnVuY3Rpb24gc3VjY2Vzc0xvYWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQWxsIFNvdW5kcyBMb2FkZWQgUHJvcGVybHknKTtcclxuICAgIGRpdkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gd2hpbGVMb2FkaW5nKHZhbHVlKSB7XHJcbiAgICBkaXZFbGVtZW50LmlubmVyVGV4dCA9IGBMb2FkZWQgJHtpbnQodmFsdWUgKiAxMDApfSAlYDtcclxufSJdfQ==
