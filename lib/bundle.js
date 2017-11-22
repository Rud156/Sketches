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
            this.players.push(new Player(this.grounds[0].body.position.x, height / 1.811, this.world, 0));
            this.players[0].setControlKeys(playerKeys[0]);

            this.players.push(new Player(this.grounds[this.grounds.length - 1].body.position.x, height / 1.811, this.world, 1, 179));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImdhbWVFbmRlZCIsInBsYXllcldvbiIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwibWFwcGVkRGFtYWdlIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiYm9kaWVzIiwiQ29tcG9zaXRlIiwiYWxsQm9kaWVzIiwiaXNTbGVlcGluZyIsIm1hc3MiLCJlbGVtZW50IiwiaiIsImlzQ29tcGxldGUiLCJnYW1lTWFuYWdlciIsImVuZFRpbWUiLCJzZWNvbmRzIiwiZGlzcGxheVRleHRGb3IiLCJkaXNwbGF5U3RhcnRGb3IiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsInNldFRpbWVvdXQiLCJjcmVhdGVGbGFncyIsImN1cnJlbnREYXRlVGltZSIsIkRhdGUiLCJnZXRUaW1lIiwicmVjdE1vZGUiLCJDRU5URVIiLCJ0ZXh0QWxpZ24iLCJkcmF3IiwiYmFja2dyb3VuZCIsImN1cnJlbnRUaW1lIiwiZGlmZiIsIk1hdGgiLCJmbG9vciIsInRleHRTaXplIiwidGV4dCIsImZvcm1hdHRlZEZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVBQSxhO0FBQ0EsMkJBQUFDLENBQUEsRUFBQUMsQ0FBQSxFQUFBQyxLQUFBLEVBQUFDLE1BQUEsRUFBQUMsS0FBQSxFQUFBQyxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBQyxJQUFBLEdBQUFDLE9BQUFDLE1BQUEsQ0FBQUMsU0FBQSxDQUFBVCxDQUFBLEVBQUFDLENBQUEsRUFBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUE7QUFDQU8sbUJBQUEsaUJBREE7QUFFQUMsc0JBQUEsQ0FGQTtBQUdBQyx5QkFBQSxDQUhBO0FBSUFDLHNCQUFBLElBSkE7QUFLQUMsNkJBQUE7QUFDQUMsMEJBQUFDLFlBREE7QUFFQUMsc0JBQUFDO0FBRkE7QUFMQSxTQUFBLENBQUE7QUFVQVgsZUFBQVksS0FBQSxDQUFBQyxHQUFBLENBQUFoQixLQUFBLEVBQUEsS0FBQUUsSUFBQTtBQUNBQyxlQUFBYyxJQUFBLENBQUFDLGtCQUFBLENBQUEsS0FBQWhCLElBQUEsRUFBQSxHQUFBOztBQUVBLGFBQUFGLEtBQUEsR0FB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QUE7QUFDQTtBQUNBOztBQUVBLFFBQUFpTixZQUFBNUMsU0FBQSxFQUFBO0FBQ0EsWUFBQTRDLFlBQUEzQyxTQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EvSCxpQkFBQSxHQUFBO0FBQ0FvTSxxQkFBQSxHQUFBO0FBQ0FDLGlDQUFBNU8sUUFBQSxDQUFBLEVBQUFDLFNBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBZ04sWUFBQTNDLFNBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQS9ILGlCQUFBLEdBQUE7QUFDQW9NLHFCQUFBLEdBQUE7QUFDQUMsaUNBQUE1TyxRQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBO0FBQ0E7QUFDQTs7QUFFQSxRQUFBb04sa0JBQUEsQ0FBQSxFQUFBO0FBQ0FBLDJCQUFBLElBQUEsRUFBQSxHQUFBd0Isb0JBQUE7QUFDQXRNLGFBQUEsR0FBQTtBQUNBb00saUJBQUEsR0FBQTtBQUNBQyxzQkFBQTVPLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUE7QUFDQTtBQUNBOztBQUVBLFNBQUE2TyxVQUFBLEdBQUE7QUFDQSxRQUFBQyxXQUFBcEcsU0FBQSxFQUNBQSxVQUFBb0csT0FBQSxJQUFBLElBQUE7O0FBRUEsV0FBQSxLQUFBO0FBQ0E7O0FBRUEsU0FBQUMsV0FBQSxHQUFBO0FBQ0EsUUFBQUQsV0FBQXBHLFNBQUEsRUFDQUEsVUFBQW9HLE9BQUEsSUFBQSxLQUFBOztBQUVBLFdBQUEsS0FBQTtBQUNBOztBQUVBLFNBQUFGLGtCQUFBLEdBQUE7QUFDQSxXQUFBM0wsZUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBQSxXQUFBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIE9iamVjdENvbGxlY3Qge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIHdvcmxkLCBpbmRleCkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7XG4gICAgICAgICAgICBsYWJlbDogJ2NvbGxlY3RpYmxlRmxhZycsXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxuICAgICAgICAgICAgaXNTZW5zb3I6IHRydWUsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZmxhZ0NhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IHBsYXllckNhdGVnb3J5XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwLjEpO1xuXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcblxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSkgKyA1O1xuXG4gICAgICAgIHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcblxuICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xuICAgICAgICB0aGlzLmFscGhhUmVkdWNlQW1vdW50ID0gMjA7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVDb2xvciA9IGNvbG9yKDIwOCwgMCwgMjU1KTtcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29Db2xvciA9IGNvbG9yKDI1NSwgMTY1LCAwKTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDMwMDtcbiAgICAgICAgdGhpcy5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcbiAgICAgICAgdGhpcy5jaGFuZ2VSYXRlID0gMTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5oZWlnaHQgLSAxMCwgdGhpcy53aWR0aCAqIDIgKiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoLCAzKTtcbiAgICAgICAgcHVzaCgpO1xuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XG4gICAgICAgIHN0cm9rZVdlaWdodCgzKTtcbiAgICAgICAgbm9GaWxsKCk7XG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcbiAgICAgICAgcG9wKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLmFscGhhIC09IHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgKiA2MCAvIGZyYW1lUmF0ZSgpO1xuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xuICAgICAgICAgICAgdGhpcy5oZWFsdGggKz0gdGhpcy5jaGFuZ2VSYXRlICogNjAgLyBmcmFtZVJhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XG4gICAgfVxufSIsImNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0LCB2ZWxvY2l0eSA9IDIwKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCB2ZWxvY2l0eSkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcbiAgICB9XG5cbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBjb2xvcihgaHNsYSgke3RoaXMuY29sb3JOdW1iZXJ9LCAxMDAlLCA1MCUsICR7dGhpcy5hbHBoYX0pYCk7XG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xuXG4gICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcblxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcblxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xuICAgIH1cblxuICAgIGlzVmlzaWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XG5cbmNsYXNzIEV4cGxvc2lvbiB7XG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUsIHZlbG9jaXR5ID0gMjAsIG51bWJlck9mUGFydGljbGVzID0gMTAwKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XG5cbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xuXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICAgICAgdGhpcy5udW1iZXJPZlBhcnRpY2xlcyA9IG51bWJlck9mUGFydGljbGVzO1xuXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgIH1cblxuICAgIGV4cGxvZGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZlBhcnRpY2xlczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0NvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgQmFzaWNGaXJlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XG5cbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcblxuICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XG4gICAgICAgICAgICBwb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZlbG9jaXR5KCkge1xuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcbiAgICB9XG5cbiAgICBpc1ZlbG9jaXR5WmVybygpIHtcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xuICAgIH1cblxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcbiAgICAgICAgKTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEJvdW5kYXJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJywgaW5kZXggPSAtMSkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwge1xuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBib3VuZGFyeVdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAxKVxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgR3JvdW5kIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxuICAgIH0pIHtcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XG5cbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSwgXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMV0sXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMl0sXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMV0sIFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLCBcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSwgXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMF0sXG4gICAgICAgICAgICBib2R5VmVydGljZXNbM11cbiAgICAgICAgXTtcblxuXG4gICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcbiAgICAgICAgZW5kU2hhcGUoKTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cblxuY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBmbGFnQ2F0ZWdvcnlcbiAgICB9KSB7XG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcblxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xuXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xuICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMDtcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBwbGF5ZXJJbmRleDtcblxuICAgICAgICB0aGlzLmRpc2FibGVDb250cm9scyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgIGxldCBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5ib2R5LmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XG4gICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgfVxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5yYWRpdXMgLSAxMCwgKHRoaXMuYm9keS5oZWFsdGggKiAxMDApIC8gMTAwLCAyKTtcblxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xuXG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XG5cbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xuXG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XG5cbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xuICAgICAgICBzdHJva2UoMCk7XG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcblxuICAgICAgICBwb3AoKTtcbiAgICB9XG5cbiAgICBpc091dE9mU2NyZWVuKCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgcG9zLnggPiAxMDAgKyB3aWR0aCB8fCBwb3MueCA8IC0xMDAgfHwgcG9zLnkgPiBoZWlnaHQgKyAxMDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzJdXSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmICFrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkgfHxcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkpIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcblxuICAgICAgICBsZXQgYWJzWFZlbG9jaXR5ID0gYWJzKHhWZWxvY2l0eSk7XG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcblxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMF1dKSB7XG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XG4gICAgICAgICAgICAgICAgeDogLTAuMDA1LFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1sxXV0pIHtcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXG4gICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcbiAgICB9XG5cbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuY3VycmVudENoYXJnZVZhbHVlID4gdGhpcy5tYXhDaGFyZ2VWYWx1ZSA/XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLmRyYXdDaGFyZ2VkU2hvdCh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSk7XG5cbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQsIHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcbiAgICAgICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmlzVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL29iamVjdC1jb2xsZWN0LmpzXCIgLz5cblxuY2xhc3MgR2FtZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMud29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZDtcbiAgICAgICAgdGhpcy5lbmdpbmUud29ybGQuZ3Jhdml0eS5zY2FsZSA9IDA7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMuZ3JvdW5kcyA9IFtdO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb3Npb25zID0gW107XG5cbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzID0gW107XG5cbiAgICAgICAgdGhpcy5taW5Gb3JjZU1hZ25pdHVkZSA9IDAuMDU7XG5cbiAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5ZXJXb24gPSAtMTtcblxuICAgICAgICB0aGlzLmNyZWF0ZUdyb3VuZHMoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCb3VuZGFyaWVzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlUGxhdGZvcm1zKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgICAgICAgLy8gdGhpcy5jcmVhdGVGbGFncygpO1xuICAgIH1cblxuICAgIGNyZWF0ZUdyb3VuZHMoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAxMi41OyBpIDwgd2lkdGggLSAxMDA7IGkgKz0gMjc1KSB7XG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyAxMjUsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjUwLCByYW5kb21WYWx1ZSwgdGhpcy53b3JsZCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlQm91bmRhcmllcygpIHtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCA1LCB3aWR0aCwgMTAsIHRoaXMud29ybGQpKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XG4gICAgfVxuXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAwKSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTUwLCBoZWlnaHQgLyA2LjQzLCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJywgMSkpO1xuXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxMDAsIGhlaWdodCAvIDIuMTcsIDIwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XG5cbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xuICAgIH1cblxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIodGhpcy5ncm91bmRzWzBdLmJvZHkucG9zaXRpb24ueCwgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDApKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xuXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIodGhpcy5ncm91bmRzW3RoaXMuZ3JvdW5kcy5sZW5ndGggLSAxXS5ib2R5LnBvc2l0aW9uLngsXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMSwgMTc5KSk7XG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcbiAgICB9XG5cbiAgICBjcmVhdGVGbGFncygpIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3QoNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDApKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3Qod2lkdGggLSA1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMSkpO1xuICAgIH1cblxuICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFeGl0KGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRW5naW5lKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25UcmlnZ2VyRW50ZXIoZXZlbnQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEIgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcbiAgICAgICAgbGV0IHBvc1kgPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi55ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi55KSAvIDI7XG5cbiAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgYmFzaWNGaXJlQi5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICB9O1xuICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgIH07XG4gICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb24gPSAxO1xuICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uQWlyID0gMTtcbiAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbiA9IDE7XG4gICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb25BaXIgPSAxO1xuXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xuICAgIH1cblxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XG4gICAgICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlID0gbWFwKGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQsIDIuNSwgNiwgNSwgMzQpO1xuICAgICAgICBwbGF5ZXIuaGVhbHRoIC09IG1hcHBlZERhbWFnZTtcblxuICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBidWxsZXRQb3MgPSBjcmVhdGVWZWN0b3IoYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KTtcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIGxldCBkaXJlY3Rpb25WZWN0b3IgPSBwNS5WZWN0b3Iuc3ViKHBsYXllclBvcywgYnVsbGV0UG9zKTtcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XG5cbiAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZShwbGF5ZXIsIHBsYXllci5wb3NpdGlvbiwge1xuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXG4gICAgICAgICAgICB5OiBkaXJlY3Rpb25WZWN0b3IueVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xuICAgIH1cblxuICAgIHVwZGF0ZUVuZ2luZSgpIHtcbiAgICAgICAgbGV0IGJvZGllcyA9IE1hdHRlci5Db21wb3NpdGUuYWxsQm9kaWVzKHRoaXMuZW5naW5lLndvcmxkKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljIHx8IGJvZHkuaXNTbGVlcGluZyB8fCBib2R5LmxhYmVsID09PSAnYmFzaWNGaXJlJyB8fFxuICAgICAgICAgICAgICAgIGJvZHkubGFiZWwgPT09ICdjb2xsZWN0aWJsZUZsYWcnKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZSh0aGlzLmVuZ2luZSk7XG5cbiAgICAgICAgdGhpcy5ncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5zaG93KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkucG9zaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24gPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbal0uZGlzYWJsZUNvbnRyb2xzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5ib2R5LmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmV4cGxvc2lvbnNbaV0uaXNDb21wbGV0ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG5cbmNvbnN0IHBsYXllcktleXMgPSBbXG4gICAgWzY1LCA2OCwgODcsIDgzLCA2NywgODZdLFxuICAgIFszNywgMzksIDM4LCA0MCwgMTMsIDMyXVxuXTtcblxuY29uc3Qga2V5U3RhdGVzID0ge1xuICAgIDEzOiBmYWxzZSwgLy8gRU5URVJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcbiAgICA0MDogZmFsc2UsIC8vIERPV05cbiAgICA4NzogZmFsc2UsIC8vIFdcbiAgICA2NTogZmFsc2UsIC8vIEFcbiAgICA4MzogZmFsc2UsIC8vIFNcbiAgICA2ODogZmFsc2UsIC8vIERcbiAgICA4NjogZmFsc2UsIC8vIFZcbiAgICA2NzogZmFsc2UgLy8gQ1xufTtcblxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XG5jb25zdCBwbGF5ZXJDYXRlZ29yeSA9IDB4MDAwMjtcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XG5jb25zdCBmbGFnQ2F0ZWdvcnkgPSAweDAwMTY7XG5cbmxldCBnYW1lTWFuYWdlcjtcbmxldCBlbmRUaW1lO1xubGV0IHNlY29uZHMgPSA2O1xubGV0IGRpc3BsYXlUZXh0Rm9yID0gMTIwO1xubGV0IGRpc3BsYXlTdGFydEZvciA9IDEyMDtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuXG4gICAgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGdhbWVNYW5hZ2VyLmNyZWF0ZUZsYWdzKCk7XG4gICAgfSwgNTAwMCk7XG5cbiAgICBsZXQgY3VycmVudERhdGVUaW1lID0gbmV3IERhdGUoKTtcbiAgICBlbmRUaW1lID0gbmV3IERhdGUoY3VycmVudERhdGVUaW1lLmdldFRpbWUoKSArIDYwMDApLmdldFRpbWUoKTtcblxuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKTtcbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuXG4gICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xuXG4gICAgaWYgKHNlY29uZHMgPiAwKSB7XG4gICAgICAgIGxldCBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBsZXQgZGlmZiA9IGVuZFRpbWUgLSBjdXJyZW50VGltZTtcbiAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoKGRpZmYgJSAoMTAwMCAqIDYwKSkgLyAxMDAwKTtcblxuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIHRleHRTaXplKDMwKTtcbiAgICAgICAgdGV4dChgQ3J5c3RhbHMgYXBwZWFyIGluOiAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xuICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XG4gICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XG4gICAgICAgICAgICB0ZXh0KGBDYXB0dXJlIHRoZSBvcHBvbmVudCdzIGJhc2VgLCB3aWR0aCAvIDIsIDUwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChnYW1lTWFuYWdlci5nYW1lRW5kZWQpIHtcbiAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbiA9PT0gMCkge1xuICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcbiAgICAgICAgICAgIHRleHQoYFBsYXllciAxIFdvbmAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uID09PSAxKSB7XG4gICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xuICAgICAgICAgICAgdGV4dChgUGxheWVyIDIgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXNwbGF5U3RhcnRGb3IgPiAwKSB7XG4gICAgICAgIGRpc3BsYXlTdGFydEZvciAtPSAxICogNjAgLyBmb3JtYXR0ZWRGcmFtZVJhdGUoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICB0ZXh0U2l6ZSgxMDApO1xuICAgICAgICB0ZXh0KGBGSUdIVGAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0dGVkRnJhbWVSYXRlKCkge1xuICAgIHJldHVybiBmcmFtZVJhdGUoKSA8PSAwID8gNjAgOiBmcmFtZVJhdGUoKTtcbn0iXX0=
