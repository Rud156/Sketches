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
    button.position(width / 2 - 62, height / 1.5 + 30);
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
        textSize(30);
        noStroke();
        fill(color('hsl(' + int(random(359)) + ', 100%, 50%)'));
        text('BALL BLASTERS', width / 2 + 10, height / 4);
        fill(255);
        text('ARROW KEYS to move, SPACE to jump and ENTER to fire for Player 1', width / 2, height / 2.5);
        text('WASD to move, V to jump and C to fire for Player 2', width / 2, height / 2);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImV4cGxvc2lvbkF1ZGlvIiwicGxheSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiZmlyZUF1ZGlvIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImdhbWVFbmRlZCIsInBsYXllcldvbiIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwiZGFtYWdlQSIsImRhbWFnZUIiLCJtYXBwZWREYW1hZ2VBIiwibWFwcGVkRGFtYWdlQiIsIm1hcHBlZERhbWFnZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImJvZGllcyIsIkNvbXBvc2l0ZSIsImFsbEJvZGllcyIsImlzU2xlZXBpbmciLCJtYXNzIiwiZWxlbWVudCIsImoiLCJpc0NvbXBsZXRlIiwiZGlzcGxheVRpbWUiLCJnYW1lTWFuYWdlciIsImVuZFRpbWUiLCJzZWNvbmRzIiwiZGlzcGxheVRleHRGb3IiLCJkaXNwbGF5U3RhcnRGb3IiLCJzY2VuZUNvdW50IiwiYnV0dG9uIiwiYnV0dG9uRGlzcGxheWVkIiwiYmFja2dyb3VuZEF1ZGlvIiwiZGl2RWxlbWVudCIsInByZWxvYWQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImZvbnRTaXplIiwiaWQiLCJjbGFzc05hbWUiLCJhcHBlbmRDaGlsZCIsImxvYWRTb3VuZCIsInN1Y2Nlc3NMb2FkIiwiZmFpbExvYWQiLCJ3aGlsZUxvYWRpbmciLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsImNyZWF0ZUJ1dHRvbiIsImVsdCIsImRpc3BsYXkiLCJtb3VzZVByZXNzZWQiLCJyZXNldEdhbWUiLCJzZXRWb2x1bWUiLCJsb29wIiwicmVjdE1vZGUiLCJDRU5URVIiLCJ0ZXh0QWxpZ24iLCJkcmF3IiwiYmFja2dyb3VuZCIsInRleHRTdHlsZSIsIkJPTEQiLCJ0ZXh0U2l6ZSIsInRleHQiLCJpbm5lclRleHQiLCJjdXJyZW50VGltZSIsIkRhdGUiLCJnZXRUaW1lIiwiZGlmZiIsIk1hdGgiLCJmbG9vciIsImZvcm1hdHRlZEZyYW1lUmF0ZSIsInNldFRpbWVvdXQiLCJjcmVhdGVGbGFncyIsImN1cnJlbnREYXRlVGltZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiLCJjb25zb2xlIiwibG9nIiwidmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVB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QUEyTCxRQUFBLEdBQUE7QUFDQVgsZUFBQW9DLFNBQUEsR0FBQSwwREFBQTtBQUNBOztBQUVBLFNBQUExQixXQUFBLEdBQUE7QUFDQXdDLFlBQUFDLEdBQUEsQ0FBQSw0QkFBQTtBQUNBbkQsZUFBQUksS0FBQSxDQUFBa0IsT0FBQSxHQUFBLE1BQUE7QUFDQTs7QUFFQSxTQUFBVixZQUFBLENBQUF3QyxLQUFBLEVBQUE7QUFDQXBELGVBQUFvQyxTQUFBLEdBQUFnQixRQUFBLEdBQUE7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIE9iamVjdENvbGxlY3Qge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCwgd29ybGQsIGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2NvbGxlY3RpYmxlRmxhZycsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgaXNTZW5zb3I6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGZsYWdDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IHBsYXllckNhdGVnb3J5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMC41ICogc3FydChzcSh3aWR0aCkgKyBzcShoZWlnaHQpKSArIDU7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcbiAgICAgICAgdGhpcy5hbHBoYVJlZHVjZUFtb3VudCA9IDIwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllck9uZUNvbG9yID0gY29sb3IoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHdvQ29sb3IgPSBjb2xvcigyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMzAwO1xyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VSYXRlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5oZWlnaHQgLSAxMCwgdGhpcy53aWR0aCAqIDIgKiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoLCAzKTtcclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xyXG4gICAgICAgIG5vRmlsbCgpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSB0aGlzLmFscGhhUmVkdWNlQW1vdW50ICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXHJcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aCArPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0LCB2ZWxvY2l0eSA9IDIwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCB2ZWxvY2l0eSkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMTtcclxuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGb3JjZShmb3JjZSkge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcclxuICAgICAgICBsZXQgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xyXG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWaXNpYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cclxuXHJcbmNsYXNzIEV4cGxvc2lvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSwgdmVsb2NpdHkgPSAyMCwgbnVtYmVyT2ZQYXJ0aWNsZXMgPSAxMDApIHtcclxuICAgICAgICBleHBsb3Npb25BdWRpby5wbGF5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xyXG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy5udW1iZXJPZlBhcnRpY2xlcyA9IG51bWJlck9mUGFydGljbGVzO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBsb2RlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZlBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvcixcclxuICAgICAgICAgICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0LCB0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ29tcGxldGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFzaWNGaXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgYW5nbGUsIHdvcmxkLCBjYXRBbmRNYXNrKSB7XHJcbiAgICAgICAgZmlyZUF1ZGlvLnBsYXkoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlQW1vdW50ID0gdGhpcy5yYWRpdXMgLyAyO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gbWFwKHRoaXMucmFkaXVzLCA1LCAxMiwgMzQsIDEwMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgICAgIHBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCb3VuZGFyeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJywgaW5kZXggPSAtMSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJvdW5kYXJ5V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMSlcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgfSkge1xyXG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCBtb2RpZmllZFksIGdyb3VuZFdpZHRoLCAyMCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcclxuICAgICAgICBsZXQgbW9kaWZpZWRXaWR0aCA9IDUwO1xyXG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMCwgMTAwLCAyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VmVydGljZXMgPSB0aGlzLmJvZHkudmVydGljZXM7XHJcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XHJcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW1xyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMF0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1sxXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMV0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzNdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMF0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1szXVxyXG4gICAgICAgIF07XHJcblxyXG5cclxuICAgICAgICBiZWdpblNoYXBlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xyXG4gICAgICAgIGVuZFNoYXBlKCk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd29ybGQsIHBsYXllckluZGV4LCBhbmdsZSA9IDAsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGZsYWdDYXRlZ29yeVxyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhbmdsZTogYW5nbGVcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XHJcbiAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICAgICAgdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWUgPSA1O1xyXG4gICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgPSAxMjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VMZXZlbCA9IDE7XHJcbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xyXG5cclxuICAgICAgICB0aGlzLmtleXMgPSBbXTtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBwbGF5ZXJJbmRleDtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNhYmxlQ29udHJvbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb250cm9sS2V5cyhrZXlzKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIGxldCBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5ib2R5LmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XHJcbiAgICAgICAgaWYgKG1hcHBlZEhlYWx0aCA8IDUwKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAobWFwcGVkSGVhbHRoIC0gNTApIC8gNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLnJhZGl1cyAtIDEwLCAodGhpcy5ib2R5LmhlYWx0aCAqIDEwMCkgLyAxMDAsIDIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IDEwMCArIHdpZHRoIHx8IHBvcy54IDwgLTEwMCB8fCBwb3MueSA+IGhlaWdodCArIDEwMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzJdXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbM11dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmICFrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkgfHxcclxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbM11dKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcclxuICAgICAgICBsZXQgc2lnbiA9IHhWZWxvY2l0eSA8IDAgPyAtMSA6IDE7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1sxXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IDAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuYm9keS5ncm91bmRlZCAmJiB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPCB0aGlzLm1heEp1bXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYm9keS5ncm91bmRlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlICs9IHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuY3VycmVudENoYXJnZVZhbHVlID4gdGhpcy5tYXhDaGFyZ2VWYWx1ZSA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlIDogdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRyYXdDaGFyZ2VkU2hvdCh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSAmJiB0aGlzLmNoYXJnZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQsIHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBiYXNpY0ZpcmVDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZUNvbnRyb2xzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uaXNWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYm91bmRhcnkuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9vYmplY3QtY29sbGVjdC5qc1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLndvcmxkLmdyYXZpdHkuc2NhbGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmdyb3VuZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5taW5Gb3JjZU1hZ25pdHVkZSA9IDAuMDU7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJXb24gPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVHcm91bmRzKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVCb3VuZGFyaWVzKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXllcnMoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlR3JvdW5kcygpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTIuNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDEyNSwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyNTAsIHJhbmRvbVZhbHVlLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDE1MCwgaGVpZ2h0IC8gNi4zNCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDApKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDEpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAvIDMuMTcsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxheWVycygpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHNbMF0uYm9keS5wb3NpdGlvbi54ICsgdGhpcy5ncm91bmRzWzBdLndpZHRoIC8gMiAtIDQwLFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzBdKTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuZ3JvdW5kcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRzW2xlbmd0aCAtIDFdLmJvZHkucG9zaXRpb24ueCAtIHRoaXMuZ3JvdW5kc1tsZW5ndGggLSAxXS53aWR0aCAvIDIgKyA0MCxcclxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEsIDE3OSkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVGbGFncygpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCg1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xyXG4gICAgICAgIGxldCBwb3NYID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueCArIGJhc2ljRmlyZUIucG9zaXRpb24ueCkgLyAyO1xyXG4gICAgICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xyXG5cclxuICAgICAgICBsZXQgZGFtYWdlQSA9IGJhc2ljRmlyZUEuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIGxldCBkYW1hZ2VCID0gYmFzaWNGaXJlQi5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZUEgPSBtYXAoZGFtYWdlQSwgMi41LCA2LCAzNCwgMTAwKTtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlQiA9IG1hcChkYW1hZ2VCLCAyLjUsIDYsIDM0LCAxMDApO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmVBLmhlYWx0aCAtPSBtYXBwZWREYW1hZ2VCO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuaGVhbHRoIC09IG1hcHBlZERhbWFnZUE7XHJcblxyXG4gICAgICAgIGlmIChiYXNpY0ZpcmVBLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFzaWNGaXJlQi5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XHJcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgbGV0IG1hcHBlZERhbWFnZSA9IG1hcChiYXNpY0ZpcmUuZGFtYWdlQW1vdW50LCAyLjUsIDYsIDUsIDM0KTtcclxuICAgICAgICBwbGF5ZXIuaGVhbHRoIC09IG1hcHBlZERhbWFnZTtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnIHx8XHJcbiAgICAgICAgICAgICAgICBib2R5LmxhYmVsID09PSAnY29sbGVjdGlibGVGbGFnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIDAuMDAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlibGVGbGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCh0aGlzLnBsYXllcnNbaV0uYm9keS5pbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbal0uZGlzYWJsZUNvbnRyb2xzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG5cclxuY29uc3QgcGxheWVyS2V5cyA9IFtcclxuICAgIFs2NSwgNjgsIDg3LCA4MywgNjcsIDg2XSxcclxuICAgIFszNywgMzksIDM4LCA0MCwgMTMsIDMyXVxyXG5dO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMTM6IGZhbHNlLCAvLyBFTlRFUlxyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG4gICAgODY6IGZhbHNlLCAvLyBWXHJcbiAgICA2NzogZmFsc2UgLy8gQ1xyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcbmNvbnN0IGZsYWdDYXRlZ29yeSA9IDB4MDAxNjtcclxuY29uc3QgZGlzcGxheVRpbWUgPSAxMjA7XHJcblxyXG5sZXQgZ2FtZU1hbmFnZXIgPSBudWxsO1xyXG5sZXQgZW5kVGltZTtcclxubGV0IHNlY29uZHMgPSA2O1xyXG5sZXQgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcclxubGV0IGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xyXG5cclxubGV0IHNjZW5lQ291bnQgPSAwO1xyXG5sZXQgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxubGV0IGJ1dHRvbjtcclxubGV0IGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xyXG5cclxubGV0IGJhY2tncm91bmRBdWRpbztcclxubGV0IGZpcmVBdWRpbztcclxubGV0IGV4cGxvc2lvbkF1ZGlvO1xyXG5cclxubGV0IGRpdkVsZW1lbnQ7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9ICcxMDBweCc7XHJcbiAgICBkaXZFbGVtZW50LmlkID0gJ2xvYWRpbmdEaXYnO1xyXG4gICAgZGl2RWxlbWVudC5jbGFzc05hbWUgPSAnanVzdGlmeS1ob3Jpem9udGFsJztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2RWxlbWVudCk7XHJcblxyXG4gICAgLy8gYmFja2dyb3VuZEF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8xNTUvMTU1MTM5XzIwOTg4ODQtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkLCB3aGlsZUxvYWRpbmcpO1xyXG4gICAgLy8gZmlyZUF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8yNzAvMjcwMzM1XzUxMjM4NTEtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuICAgIC8vIGV4cGxvc2lvbkF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8zODYvMzg2ODYyXzY4OTExMDItbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuXHJcbiAgICBiYWNrZ3JvdW5kQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vQmFja2dyb3VuZC5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQsIHdoaWxlTG9hZGluZyk7XHJcbiAgICBmaXJlQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vU2hvb3QubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcclxuICAgIGV4cGxvc2lvbkF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL0V4cGxvc2lvbi5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUGxheScpO1xyXG4gICAgYnV0dG9uLnBvc2l0aW9uKHdpZHRoIC8gMiAtIDYyLCBoZWlnaHQgLyAxLjUgKyAzMCk7XHJcbiAgICBidXR0b24uZWx0LmNsYXNzTmFtZSA9ICdidXR0b24gcHVsc2UnO1xyXG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgYnV0dG9uLm1vdXNlUHJlc3NlZChyZXNldEdhbWUpO1xyXG5cclxuICAgIGJhY2tncm91bmRBdWRpby5zZXRWb2x1bWUoMC4xKTtcclxuICAgIGJhY2tncm91bmRBdWRpby5wbGF5KCk7XHJcbiAgICBiYWNrZ3JvdW5kQXVkaW8ubG9vcCgpO1xyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuICAgIGlmIChzY2VuZUNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgdGV4dFN0eWxlKEJPTEQpO1xyXG4gICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgIGZpbGwoY29sb3IoYGhzbCgke2ludChyYW5kb20oMzU5KSl9LCAxMDAlLCA1MCUpYCkpO1xyXG4gICAgICAgIHRleHQoJ0JBTEwgQkxBU1RFUlMnLCB3aWR0aCAvIDIgKyAxMCwgaGVpZ2h0IC8gNCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHQoJ0FSUk9XIEtFWVMgdG8gbW92ZSwgU1BBQ0UgdG8ganVtcCBhbmQgRU5URVIgdG8gZmlyZSBmb3IgUGxheWVyIDEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIuNSk7XHJcbiAgICAgICAgdGV4dCgnV0FTRCB0byBtb3ZlLCBWIHRvIGp1bXAgYW5kIEMgdG8gZmlyZSBmb3IgUGxheWVyIDInLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5lbHQuaW5uZXJUZXh0ID0gJ1BsYXkgR2FtZSc7XHJcbiAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChzY2VuZUNvdW50ID09PSAxKSB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgICAgICBpZiAoc2Vjb25kcyA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gZW5kVGltZSAtIGN1cnJlbnRUaW1lO1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigoZGlmZiAlICgxMDAwICogNjApKSAvIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgIHRleHQoYENyeXN0YWxzIGFwcGVhciBpbjogJHtzZWNvbmRzfWAsIHdpZHRoIC8gMiwgNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChkaXNwbGF5VGV4dEZvciA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlUZXh0Rm9yIC09IDEgKiA2MCAvIGZvcm1hdHRlZEZyYW1lUmF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgICAgICAgICAgdGV4dChgQ2FwdHVyZSB0aGUgb3Bwb25lbnQncyBiYXNlYCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkaXNwbGF5U3RhcnRGb3IgPiAwKSB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlTdGFydEZvciAtPSAxICogNjAgLyBmb3JtYXR0ZWRGcmFtZVJhdGUoKTtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICB0ZXh0KGBGSUdIVGAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2FtZU1hbmFnZXIuZ2FtZUVuZGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24ubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dChgUGxheWVyIDEgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyIC0gMTAwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uWzBdID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dChgUGxheWVyIDIgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyIC0gMTAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24ubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICAgICAgdGV4dChgRHJhd2AsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiAtIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xyXG4gICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjEpIHtcclxuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXhwbG9zaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgaGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIDEwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgOTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwMFxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25BdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChleHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XHJcbiAgICBzY2VuZUNvdW50ID0gMTtcclxuICAgIHNlY29uZHMgPSA2O1xyXG4gICAgZGlzcGxheVRleHRGb3IgPSBkaXNwbGF5VGltZTtcclxuICAgIGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcblxyXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XHJcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybWF0dGVkRnJhbWVSYXRlKCkge1xyXG4gICAgcmV0dXJuIGZyYW1lUmF0ZSgpIDw9IDAgPyA2MCA6IGZyYW1lUmF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmYWlsTG9hZCgpIHtcclxuICAgIGRpdkVsZW1lbnQuaW5uZXJUZXh0ID0gJ1VuYWJsZSB0byBsb2FkIHRoZSBzb3VuZC4gUGxlYXNlIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlJztcclxufVxyXG5cclxuZnVuY3Rpb24gc3VjY2Vzc0xvYWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQWxsIFNvdW5kcyBMb2FkZWQgUHJvcGVybHknKTtcclxuICAgIGRpdkVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gd2hpbGVMb2FkaW5nKHZhbHVlKSB7XHJcbiAgICBkaXZFbGVtZW50LmlubmVyVGV4dCA9IGAke3ZhbHVlICogMTAwfSAlYDtcclxufSJdfQ==
