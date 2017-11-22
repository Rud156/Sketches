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
        this.body.index = playerIndex;

        this.disableControls = false;
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
            if (!this.disableControls) {
                this.rotateBlaster(activeKeys);
                this.moveHorizontal(activeKeys);
                this.moveVertical(activeKeys);

                this.chargeAndShoot(activeKeys);
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
        this.playerWon = -1;

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
            this.players.push(new Player(this.grounds[0].body.position.x + this.grounds[0].width / 2 - 40, height / 1.811, this.world, 0));
            this.players[0].setControlKeys(playerKeys[0]);

            var length = this.grounds.length;
            this.players.push(new Player(this.grounds[length - 1].body.position.x - this.grounds[length - 1].width / 2 + 40, height / 1.811, this.world, 1, 179));
            this.players[1].setControlKeys(playerKeys[1]);
        }
    }, {
        key: 'createFlags',
        value: function createFlags() {
            this.collectibleFlags.push(new ObjectCollect(50, 50, 20, 20, this.world, 0));
            this.collectibleFlags.push(new ObjectCollect(width - 50, 50, 20, 20, this.world, 1));
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
            basicFireA.friction = 1;
            basicFireA.frictionAir = 1;
            basicFireB.friction = 1;
            basicFireB.frictionAir = 1;

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
                        this.playerWon = 0;
                        this.explosions.push(new Explosion(pos.x, pos.y, 10, 90, 200));
                    } else {
                        this.playerWon = 1;
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

                    this.players[_i].removeFromWorld();
                    this.players.splice(_i, 1);
                    _i -= 1;
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

var playerKeys = [[65, 68, 87, 83, 67, 86], [37, 39, 38, 40, 13, 32]];

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
    86: false,
    67: false };

var groundCategory = 0x0001;
var playerCategory = 0x0002;
var basicFireCategory = 0x0004;
var bulletCollisionLayer = 0x0008;
var flagCategory = 0x0016;

var gameManager = void 0;
var endTime = void 0;
var seconds = 6;
var displayTextFor = 120;
var displayStartFor = 120;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    gameManager = new GameManager();
    window.setTimeout(function () {
        gameManager.createFlags();
    }, 5000);

    var currentDateTime = new Date();
    endTime = new Date(currentDateTime.getTime() + 6000).getTime();

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0);

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

    if (gameManager.gameEnded) {
        if (gameManager.playerWon === 0) {
            fill(255);
            textSize(100);
            text('Player 1 Won', width / 2, height / 2);
        } else if (gameManager.playerWon === 1) {
            fill(255);
            textSize(100);
            text('Player 2 Won', width / 2, height / 2);
        }
    }

    if (displayStartFor > 0) {
        displayStartFor -= 1 * 60 / formattedFrameRate();
        fill(255);
        textSize(100);
        text('FIGHT', width / 2, height / 2);
    }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImdhbWVFbmRlZCIsInBsYXllcldvbiIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwibWFwcGVkRGFtYWdlIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiYm9kaWVzIiwiQ29tcG9zaXRlIiwiYWxsQm9kaWVzIiwiaXNTbGVlcGluZyIsIm1hc3MiLCJlbGVtZW50IiwiaiIsImlzQ29tcGxldGUiLCJnYW1lTWFuYWdlciIsImVuZFRpbWUiLCJzZWNvbmRzIiwiZGlzcGxheVRleHRGb3IiLCJkaXNwbGF5U3RhcnRGb3IiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsInNldFRpbWVvdXQiLCJjcmVhdGVGbGFncyIsImN1cnJlbnREYXRlVGltZSIsIkRhdGUiLCJnZXRUaW1lIiwicmVjdE1vZGUiLCJDRU5URVIiLCJ0ZXh0QWxpZ24iLCJkcmF3IiwiYmFja2dyb3VuZCIsImN1cnJlbnRUaW1lIiwiZGlmZiIsIk1hdGgiLCJmbG9vciIsInRleHRTaXplIiwidGV4dCIsImZvcm1hdHRlZEZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVBQSxhO0FBQ0EsMkJBQUFDLENBQUEsRUFBQUMsQ0FBQSxFQUFBQyxLQUFBLEVBQUFDLE1BQUEsRUFBQUMsS0FBQSxFQUFBQyxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBQyxJQUFBLEdBQUFDLE9BQUFDLE1BQUEsQ0FBQUMsU0FBQSxDQUFBVCxDQUFBLEVBQUFDLENBQUEsRUFBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUE7QUFDQU8sbUJBQUEsaUJBREE7QUFFQUMsc0JBQUEsQ0FGQTtBQUdBQyx5QkFBQSxDQUhBO0FBSUFDLHNCQUFBLElBSkE7QUFLQUMsNkJBQUE7QUFDQUMsMEJBQUFDLFlBREE7QUFFQUMsc0JBQUFDO0FBRkE7QUFMQSxTQUFBLENBQUE7QUFVQVgsZUFBQVksS0FBQSxDQUFBQyxHQUFBLENBQUFoQixLQUFBLEVBQUEsS0FBQUUsSUFBQTtBQUNBQyxlQUFBYyxJQUFBLENBQUFDLGtCQUFBLENBQUEsS0FBQWhCLElBQUEsRUFBQSxHQUFBOztBQUVBLGFBQUFGLEtBQUEsR0FB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ZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIE9iamVjdENvbGxlY3Qge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCwgd29ybGQsIGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2NvbGxlY3RpYmxlRmxhZycsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgaXNTZW5zb3I6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGZsYWdDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IHBsYXllckNhdGVnb3J5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMC41ICogc3FydChzcSh3aWR0aCkgKyBzcShoZWlnaHQpKSArIDU7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcbiAgICAgICAgdGhpcy5hbHBoYVJlZHVjZUFtb3VudCA9IDIwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllck9uZUNvbG9yID0gY29sb3IoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHdvQ29sb3IgPSBjb2xvcigyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMzAwO1xyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VSYXRlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5oZWlnaHQgLSAxMCwgdGhpcy53aWR0aCAqIDIgKiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoLCAzKTtcclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xyXG4gICAgICAgIG5vRmlsbCgpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSB0aGlzLmFscGhhUmVkdWNlQW1vdW50ICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXHJcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aCArPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0LCB2ZWxvY2l0eSA9IDIwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCB2ZWxvY2l0eSkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMTtcclxuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGb3JjZShmb3JjZSkge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcclxuICAgICAgICBsZXQgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xyXG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWaXNpYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cclxuXHJcbmNsYXNzIEV4cGxvc2lvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSwgdmVsb2NpdHkgPSAyMCwgbnVtYmVyT2ZQYXJ0aWNsZXMgPSAxMDApIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXMgPSBudW1iZXJPZlBhcnRpY2xlcztcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCwgdGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0NvbXBsZXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAzO1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJvZHkuZGFtYWdlZCkge1xyXG5cclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHB1c2goKTtcclxuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICAgICAgcG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0IHx8IHBvcy55IDwgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJvdW5kYXJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB3b3JsZCwgbGFiZWwgPSAnYm91bmRhcnlDb250cm9sTGluZXMnLCBpbmRleCA9IC0xKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gYm91bmRhcnlXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAxKVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMTY1LCAwKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICB9KSB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBtb2RpZmllZEhlaWdodCA9IGdyb3VuZEhlaWdodCAtIDIwO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XHJcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcclxuICAgICAgICAgICAgbGFiZWw6ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuZmFrZUJvdHRvbVBhcnQpO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkV2lkdGggPSBtb2RpZmllZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VmVydGljZXMgPSB0aGlzLmJvZHkudmVydGljZXM7XHJcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XHJcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW1xyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMF0sIFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMV0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1syXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzNdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbM11cclxuICAgICAgICBdO1xyXG5cclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcclxuICAgICAgICBlbmRTaGFwZSgpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPlxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdvcmxkLCBwbGF5ZXJJbmRleCwgYW5nbGUgPSAwLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBwbGF5ZXJDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBmbGFnQ2F0ZWdvcnlcclxuICAgIH0pIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCAyMCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xyXG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gcGxheWVySW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzYWJsZUNvbnRyb2xzID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29udHJvbEtleXMoa2V5cykge1xyXG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBsZXQgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuYm9keS5oZWFsdGgsIDAsIHRoaXMubWF4SGVhbHRoLCAwLCAxMDApO1xyXG4gICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5yYWRpdXMgLSAxMCwgKHRoaXMuYm9keS5oZWFsdGggKiAxMDApIC8gMTAwLCAyKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMTY1LCAwKTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodCgxKTtcclxuICAgICAgICBzdHJva2UoMCk7XHJcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xyXG5cclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiAxMDAgKyB3aWR0aCB8fCBwb3MueCA8IC0xMDAgfHwgcG9zLnkgPiBoZWlnaHQgKyAxMDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1szXV0pIHx8XHJcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBsZXQgYWJzWFZlbG9jaXR5ID0gYWJzKHhWZWxvY2l0eSk7XHJcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMF1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogLTAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVDb250cm9scykge1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmlzVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vb2JqZWN0LWNvbGxlY3QuanNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZDtcclxuICAgICAgICB0aGlzLmVuZ2luZS53b3JsZC5ncmF2aXR5LnNjYWxlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5ncm91bmRzID0gW107XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucGxheWVyV29uID0gLTE7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxhdGZvcm1zKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmNyZWF0ZUZsYWdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlR3JvdW5kcygpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTIuNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDEyNSwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyNTAsIHJhbmRvbVZhbHVlLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDE1MCwgaGVpZ2h0IC8gNi4zNCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDApKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDEpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAvIDMuMTcsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxheWVycygpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHNbMF0uYm9keS5wb3NpdGlvbi54ICsgdGhpcy5ncm91bmRzWzBdLndpZHRoIC8gMiAtIDQwLFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzBdKTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuZ3JvdW5kcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRzW2xlbmd0aCAtIDFdLmJvZHkucG9zaXRpb24ueCAtIHRoaXMuZ3JvdW5kc1tsZW5ndGggLSAxXS53aWR0aCAvIDIgKyA0MCxcclxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEsIDE3OSkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVGbGFncygpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCg1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xyXG4gICAgICAgIGxldCBwb3NYID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueCArIGJhc2ljRmlyZUIucG9zaXRpb24ueCkgLyAyO1xyXG4gICAgICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmVBLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJhc2ljRmlyZUIuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uQWlyID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3NYLCBwb3NZKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcclxuICAgICAgICBwbGF5ZXIuZGFtYWdlTGV2ZWwgKz0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudDtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlID0gbWFwKGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQsIDIuNSwgNiwgNSwgMzQpO1xyXG4gICAgICAgIHBsYXllci5oZWFsdGggLT0gbWFwcGVkRGFtYWdlO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBidWxsZXRQb3MgPSBjcmVhdGVWZWN0b3IoYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KTtcclxuICAgICAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIGxldCBkaXJlY3Rpb25WZWN0b3IgPSBwNS5WZWN0b3Iuc3ViKHBsYXllclBvcywgYnVsbGV0UG9zKTtcclxuICAgICAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0TWFnKHRoaXMubWluRm9yY2VNYWduaXR1ZGUgKiBwbGF5ZXIuZGFtYWdlTGV2ZWwgKiAwLjA1KTtcclxuXHJcbiAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZShwbGF5ZXIsIHBsYXllci5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICB4OiBkaXJlY3Rpb25WZWN0b3IueCxcclxuICAgICAgICAgICAgeTogZGlyZWN0aW9uVmVjdG9yLnlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVFbmdpbmUoKSB7XHJcbiAgICAgICAgbGV0IGJvZGllcyA9IE1hdHRlci5Db21wb3NpdGUuYWxsQm9kaWVzKHRoaXMuZW5naW5lLndvcmxkKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBib2RpZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYm9keS5pc1N0YXRpYyB8fCBib2R5LmlzU2xlZXBpbmcgfHwgYm9keS5sYWJlbCA9PT0gJ2Jhc2ljRmlyZScgfHxcclxuICAgICAgICAgICAgICAgIGJvZHkubGFiZWwgPT09ICdjb2xsZWN0aWJsZUZsYWcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkuaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uID0gMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuXHJcbmNvbnN0IHBsYXllcktleXMgPSBbXHJcbiAgICBbNjUsIDY4LCA4NywgODMsIDY3LCA4Nl0sXHJcbiAgICBbMzcsIDM5LCAzOCwgNDAsIDEzLCAzMl1cclxuXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDEzOiBmYWxzZSwgLy8gRU5URVJcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UsIC8vIERcclxuICAgIDg2OiBmYWxzZSwgLy8gVlxyXG4gICAgNjc6IGZhbHNlIC8vIENcclxufTtcclxuXHJcbmNvbnN0IGdyb3VuZENhdGVnb3J5ID0gMHgwMDAxO1xyXG5jb25zdCBwbGF5ZXJDYXRlZ29yeSA9IDB4MDAwMjtcclxuY29uc3QgYmFzaWNGaXJlQ2F0ZWdvcnkgPSAweDAwMDQ7XHJcbmNvbnN0IGJ1bGxldENvbGxpc2lvbkxheWVyID0gMHgwMDA4O1xyXG5jb25zdCBmbGFnQ2F0ZWdvcnkgPSAweDAwMTY7XHJcblxyXG5sZXQgZ2FtZU1hbmFnZXI7XHJcbmxldCBlbmRUaW1lO1xyXG5sZXQgc2Vjb25kcyA9IDY7XHJcbmxldCBkaXNwbGF5VGV4dEZvciA9IDEyMDtcclxubGV0IGRpc3BsYXlTdGFydEZvciA9IDEyMDtcclxuXHJcbmZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XHJcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoKTtcclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBnYW1lTWFuYWdlci5jcmVhdGVGbGFncygpO1xyXG4gICAgfSwgNTAwMCk7XHJcblxyXG4gICAgbGV0IGN1cnJlbnREYXRlVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBlbmRUaW1lID0gbmV3IERhdGUoY3VycmVudERhdGVUaW1lLmdldFRpbWUoKSArIDYwMDApLmdldFRpbWUoKTtcclxuXHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgIGlmIChzZWNvbmRzID4gMCkge1xyXG4gICAgICAgIGxldCBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIGxldCBkaWZmID0gZW5kVGltZSAtIGN1cnJlbnRUaW1lO1xyXG4gICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKChkaWZmICUgKDEwMDAgKiA2MCkpIC8gMTAwMCk7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgdGV4dChgQ3J5c3RhbHMgYXBwZWFyIGluOiAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChkaXNwbGF5VGV4dEZvciA+IDApIHtcclxuICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgICAgICB0ZXh0KGBDYXB0dXJlIHRoZSBvcHBvbmVudCdzIGJhc2VgLCB3aWR0aCAvIDIsIDUwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGdhbWVNYW5hZ2VyLmdhbWVFbmRlZCkge1xyXG4gICAgICAgIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24gPT09IDApIHtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMSBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uID09PSAxKSB7XHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgdGV4dChgUGxheWVyIDIgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRpc3BsYXlTdGFydEZvciA+IDApIHtcclxuICAgICAgICBkaXNwbGF5U3RhcnRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgdGV4dChgRklHSFRgLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdHRlZEZyYW1lUmF0ZSgpIHtcclxuICAgIHJldHVybiBmcmFtZVJhdGUoKSA8PSAwID8gNjAgOiBmcmFtZVJhdGUoKTtcclxufSJdfQ==
