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
var displayTime = 120;

var gameManager = void 0;
var endTime = void 0;
var seconds = 6;
var displayTextFor = displayTime;
var displayStartFor = displayTime;

var timeoutCalled = false;
var button = void 0;
var buttonDisplayed = false;

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
        if (gameManager.playerWon.length === 1) {
            if (gameManager.playerWon[0] === 0) {
                fill(255);
                textSize(100);
                text('Player 1 Won', width / 2, height / 2);
            } else if (gameManager.playerWon[0] === 1) {
                fill(255);
                textSize(100);
                text('Player 2 Won', width / 2, height / 2);
            }
        } else if (gameManager.playerWon.length === 2) {
            fill(255);
            textSize(100);
            text('Draw', width / 2, height / 2);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImdhbWVFbmRlZCIsInBsYXllcldvbiIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwiZGFtYWdlQSIsImRhbWFnZUIiLCJtYXBwZWREYW1hZ2VBIiwibWFwcGVkRGFtYWdlQiIsIm1hcHBlZERhbWFnZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImJvZGllcyIsIkNvbXBvc2l0ZSIsImFsbEJvZGllcyIsImlzU2xlZXBpbmciLCJtYXNzIiwiZWxlbWVudCIsImoiLCJpc0NvbXBsZXRlIiwiZGlzcGxheVRpbWUiLCJnYW1lTWFuYWdlciIsImVuZFRpbWUiLCJzZWNvbmRzIiwiZGlzcGxheVRleHRGb3IiLCJkaXNwbGF5U3RhcnRGb3IiLCJ0aW1lb3V0Q2FsbGVkIiwiYnV0dG9uIiwiYnV0dG9uRGlzcGxheWVkIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJzZXRUaW1lb3V0IiwiY3JlYXRlRmxhZ3MiLCJjdXJyZW50RGF0ZVRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJjdXJyZW50VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJ0ZXh0U2l6ZSIsInRleHQiLCJmb3JtYXR0ZWRGcmFtZVJhdGUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFQUEsYTtBQUNBLDJCQUFBQyxDQUFBLEVBQUFDLENBQUEsRUFBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUFDLEtBQUEsRUFBQUMsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQUMsSUFBQSxHQUFBQyxPQUFBQyxNQUFBLENBQUFDLFNBQUEsQ0FBQVQsQ0FBQSxFQUFBQyxDQUFBLEVBQUFDLEtBQUEsRUFBQUMsTUFBQSxFQUFBO0FBQ0FPLG1CQUFBLGlCQURBO0FBRUFDLHNCQUFBLENBRkE7QUFHQUMseUJBQUEsQ0FIQTtBQUlBQyxzQkFBQSxJQUpBO0FBS0FDLDZCQUFBO0FBQ0FDLDBCQUFBQyxZQURBO0FBRUFDLHNCQUFBQztBQUZBO0FBTEEsU0FBQSxDQUFBO0FBVUFYLGVBQUFZLEtBQUEsQ0FBQUMs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LFdBQUEsS0FBQTtBQUNBOztBQUVBLFNBQUFDLFdBQUEsR0FBQTtBQUNBLFFBQUFELFdBQUE1RyxTQUFBLEVBQ0FBLFVBQUE0RyxPQUFBLElBQUEsS0FBQTs7QUFFQSxXQUFBLEtBQUE7QUFDQTs7QUFFQSxTQUFBRixrQkFBQSxHQUFBO0FBQ0EsV0FBQW5NLGVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQUEsV0FBQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgT2JqZWN0Q29sbGVjdCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0LCB3b3JsZCwgaW5kZXgpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnY29sbGVjdGlibGVGbGFnJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxyXG4gICAgICAgICAgICBpc1NlbnNvcjogdHJ1ZSxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZmxhZ0NhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogcGxheWVyQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMC4xKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAwLjUgKiBzcXJ0KHNxKHdpZHRoKSArIHNxKGhlaWdodCkpICsgNTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IDI1NTtcclxuICAgICAgICB0aGlzLmFscGhhUmVkdWNlQW1vdW50ID0gMjA7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVyT25lQ29sb3IgPSBjb2xvcigyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29Db2xvciA9IGNvbG9yKDI1NSwgMTY1LCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAzMDA7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmNoYW5nZVJhdGUgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLmhlaWdodCAtIDEwLCB0aGlzLndpZHRoICogMiAqIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgsIDMpO1xyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2UoMjU1LCB0aGlzLmFscGhhKTtcclxuICAgICAgICBzdHJva2VXZWlnaHQoMyk7XHJcbiAgICAgICAgbm9GaWxsKCk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmFscGhhIC09IHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmFscGhhIDwgMClcclxuICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDI1NTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA8IHRoaXMubWF4SGVhbHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoICs9IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkub3Bwb25lbnRDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gdGhpcy5jaGFuZ2VSYXRlICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufSIsImNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQsIHZlbG9jaXR5ID0gMjApIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIHZlbG9jaXR5KSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xyXG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gY29sb3IoYGhzbGEoJHt0aGlzLmNvbG9yTnVtYmVyfSwgMTAwJSwgNTAlLCAke3RoaXMuYWxwaGF9KWApO1xyXG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XHJcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1Zpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxyXG5cclxuY2xhc3MgRXhwbG9zaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQgPSA1LCB2ZWxvY2l0eSA9IDIwLCBudW1iZXJPZlBhcnRpY2xlcyA9IDEwMCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xyXG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy5udW1iZXJPZlBhcnRpY2xlcyA9IG51bWJlck9mUGFydGljbGVzO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBsb2RlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZlBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvcixcclxuICAgICAgICAgICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0LCB0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ29tcGxldGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFzaWNGaXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgYW5nbGUsIHdvcmxkLCBjYXRBbmRNYXNrKSB7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlQW1vdW50ID0gdGhpcy5yYWRpdXMgLyAyO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gbWFwKHRoaXMucmFkaXVzLCA1LCAxMiwgMzQsIDEwMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgICAgIHBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCb3VuZGFyeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJywgaW5kZXggPSAtMSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJvdW5kYXJ5V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMSlcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgfSkge1xyXG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCBtb2RpZmllZFksIGdyb3VuZFdpZHRoLCAyMCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcclxuICAgICAgICBsZXQgbW9kaWZpZWRXaWR0aCA9IDUwO1xyXG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCBmYWtlQm90dG9tVmVydGljZXMgPSB0aGlzLmZha2VCb3R0b21QYXJ0LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzBdLCBcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMl0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1sxXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1swXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXHJcbiAgICAgICAgXTtcclxuXHJcblxyXG4gICAgICAgIGJlZ2luU2hhcGUoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XHJcbiAgICAgICAgZW5kU2hhcGUoKTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgZmxhZ0NhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IHBsYXllckluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmRpc2FibGVDb250cm9scyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsICh0aGlzLmJvZHkuaGVhbHRoICogMTAwKSAvIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ib3VuZGFyeS5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL29iamVjdC1jb2xsZWN0LmpzXCIgLz5cclxuXHJcbmNsYXNzIEdhbWVNYW5hZ2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgICAgICB0aGlzLndvcmxkID0gdGhpcy5lbmdpbmUud29ybGQ7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUud29ybGQuZ3Jhdml0eS5zY2FsZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm1pbkZvcmNlTWFnbml0dWRlID0gMC4wNTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBsYXllcldvbiA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUdyb3VuZHMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUJvdW5kYXJpZXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVHcm91bmRzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxMi41OyBpIDwgd2lkdGggLSAxMDA7IGkgKz0gMjc1KSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbShoZWlnaHQgLyA2LjM0LCBoZWlnaHQgLyAzLjE3KTtcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgMTI1LCBoZWlnaHQgLSByYW5kb21WYWx1ZSAvIDIsIDI1MCwgcmFuZG9tVmFsdWUsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQm91bmRhcmllcygpIHtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkoNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCA1LCB3aWR0aCwgMTAsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLSA1LCB3aWR0aCwgMTAsIHRoaXMud29ybGQpKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQbGF0Zm9ybXMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTUwLCBoZWlnaHQgLyA2LjM0LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJywgMCkpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTUwLCBoZWlnaHQgLyA2LjQzLCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJywgMSkpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxMDAsIGhlaWdodCAvIDIuMTcsIDIwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxMDAsIGhlaWdodCAvIDIuMTcsIDIwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMy4xNywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQbGF5ZXJzKCkge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kc1swXS5ib2R5LnBvc2l0aW9uLnggKyB0aGlzLmdyb3VuZHNbMF0ud2lkdGggLyAyIC0gNDAsXHJcbiAgICAgICAgICAgIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5ncm91bmRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHNbbGVuZ3RoIC0gMV0uYm9keS5wb3NpdGlvbi54IC0gdGhpcy5ncm91bmRzW2xlbmd0aCAtIDFdLndpZHRoIC8gMiArIDQwLFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMSwgMTc5KSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzFdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUZsYWdzKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KDUwLCA1MCwgMjAsIDIwLCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3Qod2lkdGggLSA1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyKGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uRW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRXhpdChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2JlZm9yZVVwZGF0ZScsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVuZ2luZShldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRW50ZXIoZXZlbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFiYXNpY0ZpcmUuZGFtYWdlZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVCID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEIgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIucGxheWVyQ29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckV4aXQoZXZlbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKSB7XHJcbiAgICAgICAgbGV0IHBvc1ggPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi54ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi54KSAvIDI7XHJcbiAgICAgICAgbGV0IHBvc1kgPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi55ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi55KSAvIDI7XHJcblxyXG4gICAgICAgIGxldCBkYW1hZ2VBID0gYmFzaWNGaXJlQS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgbGV0IGRhbWFnZUIgPSBiYXNpY0ZpcmVCLmRhbWFnZUFtb3VudDtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlQSA9IG1hcChkYW1hZ2VBLCAyLjUsIDYsIDM0LCAxMDApO1xyXG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2VCID0gbWFwKGRhbWFnZUIsIDIuNSwgNiwgMzQsIDEwMCk7XHJcblxyXG4gICAgICAgIGJhc2ljRmlyZUEuaGVhbHRoIC09IG1hcHBlZERhbWFnZUI7XHJcbiAgICAgICAgYmFzaWNGaXJlQi5oZWFsdGggLT0gbWFwcGVkRGFtYWdlQTtcclxuXHJcbiAgICAgICAgaWYgKGJhc2ljRmlyZUEuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChiYXNpY0ZpcmVCLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3NYLCBwb3NZKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcclxuICAgICAgICBwbGF5ZXIuZGFtYWdlTGV2ZWwgKz0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudDtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlID0gbWFwKGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQsIDIuNSwgNiwgNSwgMzQpO1xyXG4gICAgICAgIHBsYXllci5oZWFsdGggLT0gbWFwcGVkRGFtYWdlO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBidWxsZXRQb3MgPSBjcmVhdGVWZWN0b3IoYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KTtcclxuICAgICAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIGxldCBkaXJlY3Rpb25WZWN0b3IgPSBwNS5WZWN0b3Iuc3ViKHBsYXllclBvcywgYnVsbGV0UG9zKTtcclxuICAgICAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0TWFnKHRoaXMubWluRm9yY2VNYWduaXR1ZGUgKiBwbGF5ZXIuZGFtYWdlTGV2ZWwgKiAwLjA1KTtcclxuXHJcbiAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZShwbGF5ZXIsIHBsYXllci5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICB4OiBkaXJlY3Rpb25WZWN0b3IueCxcclxuICAgICAgICAgICAgeTogZGlyZWN0aW9uVmVjdG9yLnlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVFbmdpbmUoKSB7XHJcbiAgICAgICAgbGV0IGJvZGllcyA9IE1hdHRlci5Db21wb3NpdGUuYWxsQm9kaWVzKHRoaXMuZW5naW5lLndvcmxkKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBib2RpZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYm9keS5pc1N0YXRpYyB8fCBib2R5LmlzU2xlZXBpbmcgfHwgYm9keS5sYWJlbCA9PT0gJ2Jhc2ljRmlyZScgfHxcclxuICAgICAgICAgICAgICAgIGJvZHkubGFiZWwgPT09ICdjb2xsZWN0aWJsZUZsYWcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkuaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbal0uZGlzYWJsZUNvbnRyb2xzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnVwZGF0ZShrZXlTdGF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5ib2R5LmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5wbGF5ZXJzW2ldLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKHRoaXMucGxheWVyc1tpXS5ib2R5LmluZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucGxheWVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tqXS5kaXNhYmxlQ29udHJvbHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5leHBsb3Npb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV4cGxvc2lvbnNbaV0uaXNDb21wbGV0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xyXG4gICAgWzY1LCA2OCwgODcsIDgzLCA2NywgODZdLFxyXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxMywgMzJdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICA4NjogZmFsc2UsIC8vIFZcclxuICAgIDY3OiBmYWxzZSAvLyBDXHJcbn07XHJcblxyXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcclxuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XHJcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xyXG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcclxuY29uc3QgZmxhZ0NhdGVnb3J5ID0gMHgwMDE2O1xyXG5jb25zdCBkaXNwbGF5VGltZSA9IDEyMDtcclxuXHJcblxyXG5sZXQgZ2FtZU1hbmFnZXI7XHJcbmxldCBlbmRUaW1lO1xyXG5sZXQgc2Vjb25kcyA9IDY7XHJcbmxldCBkaXNwbGF5VGV4dEZvciA9IGRpc3BsYXlUaW1lO1xyXG5sZXQgZGlzcGxheVN0YXJ0Rm9yID0gZGlzcGxheVRpbWU7XHJcblxyXG5sZXQgdGltZW91dENhbGxlZCA9IGZhbHNlO1xyXG5sZXQgYnV0dG9uO1xyXG5sZXQgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLmRyYXcoKTtcclxuXHJcbiAgICBpZiAoc2Vjb25kcyA+IDApIHtcclxuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBsZXQgZGlmZiA9IGVuZFRpbWUgLSBjdXJyZW50VGltZTtcclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigoZGlmZiAlICgxMDAwICogNjApKSAvIDEwMDApO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgIHRleHQoYENyeXN0YWxzIGFwcGVhciBpbjogJHtzZWNvbmRzfWAsIHdpZHRoIC8gMiwgNTApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoZGlzcGxheVRleHRGb3IgPiAwKSB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlUZXh0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICAgICAgdGV4dChgQ2FwdHVyZSB0aGUgb3Bwb25lbnQncyBiYXNlYCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChnYW1lTWFuYWdlci5nYW1lRW5kZWQpIHtcclxuICAgICAgICBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICAgICAgdGV4dChgUGxheWVyIDEgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24ubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcclxuICAgICAgICAgICAgdGV4dChgRHJhd2AsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXNwbGF5U3RhcnRGb3IgPiAwKSB7XHJcbiAgICAgICAgZGlzcGxheVN0YXJ0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgIHRleHQoYEZJR0hUYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXR0ZWRGcmFtZVJhdGUoKSB7XHJcbiAgICByZXR1cm4gZnJhbWVSYXRlKCkgPD0gMCA/IDYwIDogZnJhbWVSYXRlKCk7XHJcbn0iXX0=
