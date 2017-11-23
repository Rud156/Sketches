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
            this.players.push(new Player(this.grounds[0].body.position.x + this.grounds[0].width / 2 - 40, height / 1.811, this.world, 1));
            this.players[0].setControlKeys(playerKeys[0]);

            var length = this.grounds.length;
            this.players.push(new Player(this.grounds[length - 1].body.position.x - this.grounds[length - 1].width / 2 + 40, height / 1.811, this.world, 0, 179));
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

var playerKeys = [[65, 68, 87, 83, 84, 89], [37, 39, 38, 40, 17, 32]];

var keyStates = {
    32: false,
    17: false,
    37: false,
    38: false,
    39: false,
    40: false,
    87: false,
    65: false,
    83: false,
    68: false,
    84: false,
    89: false };

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

    backgroundAudio.setVolume(0.05);
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
        textSize(30);
        text('ARROW KEYS to move, DOT to jump and ENTER to fire for Player 1', width / 2, height / 4);
        text('WASD to move, Y to jump and T to fire for Player 2', width / 2, height / 2.75);
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
            if (randomValue < 0.1) {
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
    divElement.innerText = value * 100 + ' %';
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImV4cGxvc2lvbkF1ZGlvIiwicGxheSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiZmlyZUF1ZGlvIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImdhbWVFbmRlZCIsInBsYXllcldvbiIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwiZGFtYWdlQSIsImRhbWFnZUIiLCJtYXBwZWREYW1hZ2VBIiwibWFwcGVkRGFtYWdlQiIsIm1hcHBlZERhbWFnZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImJvZGllcyIsIkNvbXBvc2l0ZSIsImFsbEJvZGllcyIsImlzU2xlZXBpbmciLCJtYXNzIiwiZWxlbWVudCIsImoiLCJpc0NvbXBsZXRlIiwiZGlzcGxheVRpbWUiLCJnYW1lTWFuYWdlciIsImVuZFRpbWUiLCJzZWNvbmRzIiwiZGlzcGxheVRleHRGb3IiLCJkaXNwbGF5U3RhcnRGb3IiLCJzY2VuZUNvdW50IiwiYnV0dG9uIiwiYnV0dG9uRGlzcGxheWVkIiwiYmFja2dyb3VuZEF1ZGlvIiwiZGl2RWxlbWVudCIsInByZWxvYWQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImZvbnRTaXplIiwiaWQiLCJjbGFzc05hbWUiLCJhcHBlbmRDaGlsZCIsImxvYWRTb3VuZCIsInN1Y2Nlc3NMb2FkIiwiZmFpbExvYWQiLCJ3aGlsZUxvYWRpbmciLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsImNyZWF0ZUJ1dHRvbiIsImVsdCIsImRpc3BsYXkiLCJtb3VzZVByZXNzZWQiLCJyZXNldEdhbWUiLCJzZXRWb2x1bWUiLCJsb29wIiwicmVjdE1vZGUiLCJDRU5URVIiLCJ0ZXh0QWxpZ24iLCJkcmF3IiwiYmFja2dyb3VuZCIsInRleHRTdHlsZSIsIkJPTEQiLCJ0ZXh0U2l6ZSIsInRleHQiLCJpbm5lclRleHQiLCJjdXJyZW50VGltZSIsIkRhdGUiLCJnZXRUaW1lIiwiZGlmZiIsIk1hdGgiLCJmbG9vciIsImZvcm1hdHRlZEZyYW1lUmF0ZSIsInNldFRpbWVvdXQiLCJjcmVhdGVGbGFncyIsImN1cnJlbnREYXRlVGltZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVB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LEtBQUE7O0FBRUEsV0FBQSxLQUFBO0FBQ0E7O0FBRUEsU0FBQUwsa0JBQUEsR0FBQTtBQUNBLFdBQUEzTixlQUFBLENBQUEsR0FBQSxFQUFBLEdBQUFBLFdBQUE7QUFDQTs7QUFFQSxTQUFBMkwsUUFBQSxHQUFBO0FBQ0FYLGVBQUFvQyxTQUFBLEdBQUEsMERBQUE7QUFDQTs7QUFFQSxTQUFBMUIsV0FBQSxHQUFBO0FBQ0F3QyxZQUFBQyxHQUFBLENBQUEsNEJBQUE7QUFDQW5ELGVBQUFJLEtBQUEsQ0FBQWtCLE9BQUEsR0FBQSxNQUFBO0FBQ0E7O0FBRUEsU0FBQVYsWUFBQSxDQUFBd0MsS0FBQSxFQUFBO0FBQ0FwRCxlQUFBb0MsU0FBQSxHQUFBZ0IsUUFBQSxHQUFBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIE9iamVjdENvbGxlY3Qge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIHdvcmxkLCBpbmRleCkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7XG4gICAgICAgICAgICBsYWJlbDogJ2NvbGxlY3RpYmxlRmxhZycsXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxuICAgICAgICAgICAgaXNTZW5zb3I6IHRydWUsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZmxhZ0NhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IHBsYXllckNhdGVnb3J5XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwLjEpO1xuXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcblxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSkgKyA1O1xuXG4gICAgICAgIHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcblxuICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xuICAgICAgICB0aGlzLmFscGhhUmVkdWNlQW1vdW50ID0gMjA7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVDb2xvciA9IGNvbG9yKDIwOCwgMCwgMjU1KTtcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29Db2xvciA9IGNvbG9yKDI1NSwgMTY1LCAwKTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDMwMDtcbiAgICAgICAgdGhpcy5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcbiAgICAgICAgdGhpcy5jaGFuZ2VSYXRlID0gMTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5oZWlnaHQgLSAxMCwgdGhpcy53aWR0aCAqIDIgKiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoLCAzKTtcbiAgICAgICAgcHVzaCgpO1xuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XG4gICAgICAgIHN0cm9rZVdlaWdodCgzKTtcbiAgICAgICAgbm9GaWxsKCk7XG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcbiAgICAgICAgcG9wKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLmFscGhhIC09IHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgKiA2MCAvIGZyYW1lUmF0ZSgpO1xuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xuICAgICAgICAgICAgdGhpcy5oZWFsdGggKz0gdGhpcy5jaGFuZ2VSYXRlICogNjAgLyBmcmFtZVJhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XG4gICAgfVxufSIsImNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0LCB2ZWxvY2l0eSA9IDIwKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCB2ZWxvY2l0eSkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcbiAgICB9XG5cbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBjb2xvcihgaHNsYSgke3RoaXMuY29sb3JOdW1iZXJ9LCAxMDAlLCA1MCUsICR7dGhpcy5hbHBoYX0pYCk7XG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xuXG4gICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcblxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcblxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xuICAgIH1cblxuICAgIGlzVmlzaWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XG5cbmNsYXNzIEV4cGxvc2lvbiB7XG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUsIHZlbG9jaXR5ID0gMjAsIG51bWJlck9mUGFydGljbGVzID0gMTAwKSB7XG4gICAgICAgIGV4cGxvc2lvbkF1ZGlvLnBsYXkoKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuXG4gICAgICAgIGxldCByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XG4gICAgICAgIHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXMgPSBudW1iZXJPZlBhcnRpY2xlcztcblxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICB9XG5cbiAgICBleHBsb2RlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXM7IGkrKykge1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLFxuICAgICAgICAgICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0LCB0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XG4gICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNDb21wbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEJhc2ljRmlyZSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcbiAgICAgICAgZmlyZUF1ZGlvLnBsYXkoKTtcblxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XG5cbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IG1hcCh0aGlzLnJhZGl1cywgNSwgMTIsIDM0LCAxMDApO1xuXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBpZiAoIXRoaXMuYm9keS5kYW1hZ2VkKSB7XG5cbiAgICAgICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG5cbiAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xuICAgICAgICAgICAgcG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRWZWxvY2l0eSgpIHtcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XG4gICAgfVxuXG4gICAgaXNWZWxvY2l0eVplcm8oKSB7XG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcbiAgICB9XG5cbiAgICBpc091dE9mU2NyZWVuKCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHQgfHwgcG9zLnkgPCAwXG4gICAgICAgICk7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxuXG5jbGFzcyBCb3VuZGFyeSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHdvcmxkLCBsYWJlbCA9ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsIGluZGV4ID0gLTEpIHtcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHtcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLndpZHRoID0gYm91bmRhcnlXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gaW5kZXg7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcblxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMSlcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEdyb3VuZCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcbiAgICB9KSB7XG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xuXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXG4gICAgICAgICAgICBsYWJlbDogJ2JvdW5kYXJ5Q29udHJvbExpbmVzJyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgZmlsbCgwLCAxMDAsIDI1NSk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSxcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1sxXSxcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1syXSxcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1sxXSxcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSxcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSxcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1swXSxcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1szXVxuICAgICAgICBdO1xuXG5cbiAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xuICAgICAgICBlbmRTaGFwZSgpO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPlxuXG5jbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdvcmxkLCBwbGF5ZXJJbmRleCwgYW5nbGUgPSAwLCBjYXRBbmRNYXNrID0ge1xuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGZsYWdDYXRlZ29yeVxuICAgIH0pIHtcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlXG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xuXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XG5cbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcbiAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcblxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWUgPSA1O1xuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XG4gICAgICAgIHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWUgPSAwLjE7XG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwO1xuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IHBsYXllckluZGV4O1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZUNvbnRyb2xzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0Q29udHJvbEtleXMoa2V5cykge1xuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcbiAgICAgICAgaWYgKG1hcHBlZEhlYWx0aCA8IDUwKSB7XG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAobWFwcGVkSGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICB9XG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLnJhZGl1cyAtIDEwLCAodGhpcy5ib2R5LmhlYWx0aCAqIDEwMCkgLyAxMDAsIDIpO1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XG5cbiAgICAgICAgcHVzaCgpO1xuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcblxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XG5cbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcblxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XG4gICAgICAgIHN0cm9rZSgwKTtcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xuXG4gICAgICAgIHBvcCgpO1xuICAgIH1cblxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwb3MueCA+IDEwMCArIHdpZHRoIHx8IHBvcy54IDwgLTEwMCB8fCBwb3MueSA+IGhlaWdodCArIDEwMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbM11dKSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXG4gICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcbiAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cykge1xuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xuICAgIH1cblxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xuXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlICs9IHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cbiAgICAgICAgICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlIDogdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcblxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBiYXNpY0ZpcmVDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVDb250cm9scykge1xuICAgICAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xuICAgICAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcbiAgICAgICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uaXNWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYm91bmRhcnkuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vb2JqZWN0LWNvbGxlY3QuanNcIiAvPlxuXG5jbGFzcyBHYW1lTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xuICAgICAgICB0aGlzLmVuZ2luZS53b3JsZC5ncmF2aXR5LnNjYWxlID0gMDtcblxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5ncm91bmRzID0gW107XG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IFtdO1xuICAgICAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcblxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MgPSBbXTtcblxuICAgICAgICB0aGlzLm1pbkZvcmNlTWFnbml0dWRlID0gMC4wNTtcblxuICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXllcldvbiA9IFtdO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xuICAgICAgICB0aGlzLmNyZWF0ZUJvdW5kYXJpZXMoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICBjcmVhdGVHcm91bmRzKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMTIuNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKGhlaWdodCAvIDYuMzQsIGhlaWdodCAvIDMuMTcpO1xuICAgICAgICAgICAgdGhpcy5ncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgMTI1LCBoZWlnaHQgLSByYW5kb21WYWx1ZSAvIDIsIDI1MCwgcmFuZG9tVmFsdWUsIHRoaXMud29ybGQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSg1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAtIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xuICAgIH1cblxuICAgIGNyZWF0ZVBsYXRmb3JtcygpIHtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTUwLCBoZWlnaHQgLyA2LjM0LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJywgMCkpO1xuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDEpKTtcblxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxMDAsIGhlaWdodCAvIDIuMTcsIDIwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xuXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMy4xNywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxuICAgICAgICAgICAgdGhpcy5ncm91bmRzWzBdLmJvZHkucG9zaXRpb24ueCArIHRoaXMuZ3JvdW5kc1swXS53aWR0aCAvIDIgLSA0MCxcbiAgICAgICAgICAgIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAxKSk7XG4gICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzBdKTtcblxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5ncm91bmRzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kc1tsZW5ndGggLSAxXS5ib2R5LnBvc2l0aW9uLnggLSB0aGlzLmdyb3VuZHNbbGVuZ3RoIC0gMV0ud2lkdGggLyAyICsgNDAsXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCwgMTc5KSk7XG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcbiAgICB9XG5cbiAgICBjcmVhdGVGbGFncygpIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3QoNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDApKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3Qod2lkdGggLSA1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMSkpO1xuICAgIH1cblxuICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFeGl0KGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRW5naW5lKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25UcmlnZ2VyRW50ZXIoZXZlbnQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEIgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcbiAgICAgICAgbGV0IHBvc1kgPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi55ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi55KSAvIDI7XG5cbiAgICAgICAgbGV0IGRhbWFnZUEgPSBiYXNpY0ZpcmVBLmRhbWFnZUFtb3VudDtcbiAgICAgICAgbGV0IGRhbWFnZUIgPSBiYXNpY0ZpcmVCLmRhbWFnZUFtb3VudDtcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZUEgPSBtYXAoZGFtYWdlQSwgMi41LCA2LCAzNCwgMTAwKTtcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZUIgPSBtYXAoZGFtYWdlQiwgMi41LCA2LCAzNCwgMTAwKTtcblxuICAgICAgICBiYXNpY0ZpcmVBLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2VCO1xuICAgICAgICBiYXNpY0ZpcmVCLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2VBO1xuXG4gICAgICAgIGlmIChiYXNpY0ZpcmVBLmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICAgICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmFzaWNGaXJlQi5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgYmFzaWNGaXJlQi5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb24gPSAxO1xuICAgICAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbkFpciA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvc1gsIHBvc1kpKTtcbiAgICB9XG5cbiAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSkge1xuICAgICAgICBwbGF5ZXIuZGFtYWdlTGV2ZWwgKz0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudDtcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZSA9IG1hcChiYXNpY0ZpcmUuZGFtYWdlQW1vdW50LCAyLjUsIDYsIDUsIDM0KTtcbiAgICAgICAgcGxheWVyLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2U7XG5cbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XG4gICAgICAgIGxldCBwbGF5ZXJQb3MgPSBjcmVhdGVWZWN0b3IocGxheWVyLnBvc2l0aW9uLngsIHBsYXllci5wb3NpdGlvbi55KTtcblxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XG4gICAgICAgIGRpcmVjdGlvblZlY3Rvci5zZXRNYWcodGhpcy5taW5Gb3JjZU1hZ25pdHVkZSAqIHBsYXllci5kYW1hZ2VMZXZlbCAqIDAuMDUpO1xuXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcbiAgICAgICAgICAgIHg6IGRpcmVjdGlvblZlY3Rvci54LFxuICAgICAgICAgICAgeTogZGlyZWN0aW9uVmVjdG9yLnlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVFbmdpbmUoKSB7XG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoYm9keS5pc1N0YXRpYyB8fCBib2R5LmlzU2xlZXBpbmcgfHwgYm9keS5sYWJlbCA9PT0gJ2Jhc2ljRmlyZScgfHxcbiAgICAgICAgICAgICAgICBib2R5LmxhYmVsID09PSAnY29sbGVjdGlibGVGbGFnJylcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIDAuMDAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xuXG4gICAgICAgIHRoaXMuZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICB9KVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uc2hvdygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LnBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbal0uZGlzYWJsZUNvbnRyb2xzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5ib2R5LmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uLnB1c2godGhpcy5wbGF5ZXJzW2ldLmJvZHkuaW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cblxuY29uc3QgcGxheWVyS2V5cyA9IFtcbiAgICBbNjUsIDY4LCA4NywgODMsIDg0LCA4OV0sXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxNywgMzJdXG5dO1xuXG5jb25zdCBrZXlTdGF0ZXMgPSB7XG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxuICAgIDE3OiBmYWxzZSwgLy8gQ1RSTFxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxuICAgIDM4OiBmYWxzZSwgLy8gVVBcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXG4gICAgODc6IGZhbHNlLCAvLyBXXG4gICAgNjU6IGZhbHNlLCAvLyBBXG4gICAgODM6IGZhbHNlLCAvLyBTXG4gICAgNjg6IGZhbHNlLCAvLyBEXG4gICAgODQ6IGZhbHNlLCAvLyBUXG4gICAgODk6IGZhbHNlIC8vIFlcbn07XG5cbmNvbnN0IGdyb3VuZENhdGVnb3J5ID0gMHgwMDAxO1xuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcbmNvbnN0IGJ1bGxldENvbGxpc2lvbkxheWVyID0gMHgwMDA4O1xuY29uc3QgZmxhZ0NhdGVnb3J5ID0gMHgwMDE2O1xuY29uc3QgZGlzcGxheVRpbWUgPSAxMjA7XG5cbmxldCBnYW1lTWFuYWdlciA9IG51bGw7XG5sZXQgZW5kVGltZTtcbmxldCBzZWNvbmRzID0gNjtcbmxldCBkaXNwbGF5VGV4dEZvciA9IGRpc3BsYXlUaW1lO1xubGV0IGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xuXG5sZXQgc2NlbmVDb3VudCA9IDA7XG5sZXQgZXhwbG9zaW9ucyA9IFtdO1xuXG5sZXQgYnV0dG9uO1xubGV0IGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuXG5sZXQgYmFja2dyb3VuZEF1ZGlvO1xubGV0IGZpcmVBdWRpbztcbmxldCBleHBsb3Npb25BdWRpbztcblxubGV0IGRpdkVsZW1lbnQ7XG5cbmZ1bmN0aW9uIHByZWxvYWQoKSB7XG4gICAgZGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdkVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSAnMTAwcHgnO1xuICAgIGRpdkVsZW1lbnQuaWQgPSAnbG9hZGluZ0Rpdic7XG4gICAgZGl2RWxlbWVudC5jbGFzc05hbWUgPSAnanVzdGlmeS1ob3Jpem9udGFsJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdkVsZW1lbnQpO1xuXG4gICAgLy8gYmFja2dyb3VuZEF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8xNTUvMTU1MTM5XzIwOTg4ODQtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkLCB3aGlsZUxvYWRpbmcpO1xuICAgIC8vIGZpcmVBdWRpbyA9IGxvYWRTb3VuZCgnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMjcwLzI3MDMzNV81MTIzODUxLWxxLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XG4gICAgLy8gZXhwbG9zaW9uQXVkaW8gPSBsb2FkU291bmQoJ2h0dHBzOi8vZnJlZXNvdW5kLm9yZy9kYXRhL3ByZXZpZXdzLzM4Ni8zODY4NjJfNjg5MTEwMi1scS5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQpO1xuXG4gICAgYmFja2dyb3VuZEF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL0JhY2tncm91bmQubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkLCB3aGlsZUxvYWRpbmcpO1xuICAgIGZpcmVBdWRpbyA9IGxvYWRTb3VuZCgnL2Fzc2V0cy9hdWRpby9TaG9vdC5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQpO1xuICAgIGV4cGxvc2lvbkF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL0V4cGxvc2lvbi5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQpO1xufVxuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG5cbiAgICBidXR0b24gPSBjcmVhdGVCdXR0b24oJ1BsYXknKTtcbiAgICBidXR0b24ucG9zaXRpb24od2lkdGggLyAyIC0gNjIsIGhlaWdodCAvIDEuNik7XG4gICAgYnV0dG9uLmVsdC5jbGFzc05hbWUgPSAnYnV0dG9uIHB1bHNlJztcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgYnV0dG9uLm1vdXNlUHJlc3NlZChyZXNldEdhbWUpO1xuXG4gICAgYmFja2dyb3VuZEF1ZGlvLnNldFZvbHVtZSgwLjA1KTtcbiAgICBiYWNrZ3JvdW5kQXVkaW8ucGxheSgpO1xuICAgIGJhY2tncm91bmRBdWRpby5sb29wKCk7XG5cbiAgICByZWN0TW9kZShDRU5URVIpO1xuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUik7XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcbiAgICBpZiAoc2NlbmVDb3VudCA9PT0gMCkge1xuICAgICAgICB0ZXh0U3R5bGUoQk9MRCk7XG4gICAgICAgIHRleHRTaXplKDUwKTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbChjb2xvcihgaHNsKCR7aW50KHJhbmRvbSgzNTkpKX0sIDEwMCUsIDUwJSlgKSk7XG4gICAgICAgIHRleHQoJ0JBTEwgQkxBU1RFUlMnLCB3aWR0aCAvIDIgKyAxMCwgNTApO1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIHRleHRTaXplKDMwKTtcbiAgICAgICAgdGV4dCgnQVJST1cgS0VZUyB0byBtb3ZlLCBET1QgdG8ganVtcCBhbmQgRU5URVIgdG8gZmlyZSBmb3IgUGxheWVyIDEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDQpO1xuICAgICAgICB0ZXh0KCdXQVNEIHRvIG1vdmUsIFkgdG8ganVtcCBhbmQgVCB0byBmaXJlIGZvciBQbGF5ZXIgMicsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMi43NSk7XG4gICAgICAgIGZpbGwoY29sb3IoYGhzbCgke2ludChyYW5kb20oMzU5KSl9LCAxMDAlLCA1MCUpYCkpO1xuICAgICAgICB0ZXh0KCdEZXN0cm95IHlvdXIgb3Bwb25lbnQgb3IgY2FwdHVyZSB0aGVpciBjcnlzdGFsIHRvIHdpbicsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUGxheSBHYW1lJztcbiAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNjZW5lQ291bnQgPT09IDEpIHtcbiAgICAgICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xuXG4gICAgICAgIGlmIChzZWNvbmRzID4gMCkge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBsZXQgZGlmZiA9IGVuZFRpbWUgLSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKChkaWZmICUgKDEwMDAgKiA2MCkpIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgICAgIHRleHRTaXplKDMwKTtcbiAgICAgICAgICAgIHRleHQoYENyeXN0YWxzIGFwcGVhciBpbjogJHtzZWNvbmRzfWAsIHdpZHRoIC8gMiwgNTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlUZXh0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xuICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XG4gICAgICAgICAgICAgICAgdGV4dChgQ2FwdHVyZSB0aGUgb3Bwb25lbnQncyBiYXNlYCwgd2lkdGggLyAyLCA1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlzcGxheVN0YXJ0Rm9yID4gMCkge1xuICAgICAgICAgICAgZGlzcGxheVN0YXJ0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xuICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcbiAgICAgICAgICAgIHRleHQoYEZJR0hUYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChnYW1lTWFuYWdlci5nYW1lRW5kZWQpIHtcbiAgICAgICAgICAgIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvblswXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIHRleHQoYFBsYXllciAxIFdvbmAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiAtIDEwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb25bMF0gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xuICAgICAgICAgICAgICAgIHRleHQoYERyYXdgLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIgLSAxMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuMSkge1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgbmV3IEV4cGxvc2lvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgwLCB3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICA5MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwMFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBleHBsb3Npb25BdWRpby5wbGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnNbaV0uc2hvdygpO1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdSZXBsYXknO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XG4gICAgc2NlbmVDb3VudCA9IDE7XG4gICAgc2Vjb25kcyA9IDY7XG4gICAgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcbiAgICBkaXNwbGF5U3RhcnRGb3IgPSBkaXNwbGF5VGltZTtcbiAgICBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcblxuICAgIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIGV4cGxvc2lvbnMgPSBbXTtcblxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBnYW1lTWFuYWdlci5jcmVhdGVGbGFncygpO1xuICAgIH0sIDUwMDApO1xuXG4gICAgbGV0IGN1cnJlbnREYXRlVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBmb3JtYXR0ZWRGcmFtZVJhdGUoKSB7XG4gICAgcmV0dXJuIGZyYW1lUmF0ZSgpIDw9IDAgPyA2MCA6IGZyYW1lUmF0ZSgpO1xufVxuXG5mdW5jdGlvbiBmYWlsTG9hZCgpIHtcbiAgICBkaXZFbGVtZW50LmlubmVyVGV4dCA9ICdVbmFibGUgdG8gbG9hZCB0aGUgc291bmQuIFBsZWFzZSB0cnkgcmVmcmVzaGluZyB0aGUgcGFnZSc7XG59XG5cbmZ1bmN0aW9uIHN1Y2Nlc3NMb2FkKCkge1xuICAgIGNvbnNvbGUubG9nKCdBbGwgU291bmRzIExvYWRlZCBQcm9wZXJseScpO1xuICAgIGRpdkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbn1cblxuZnVuY3Rpb24gd2hpbGVMb2FkaW5nKHZhbHVlKSB7XG4gICAgZGl2RWxlbWVudC5pbm5lclRleHQgPSBgJHt2YWx1ZSAqIDEwMH0gJWA7XG59Il19
