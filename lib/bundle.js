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

            var angle = this.angle;

            if (activeKeys[this.keys[2]]) {
                if (angle > PI) this.angle -= this.angularVelocity;else if (angle < PI) this.angle += this.angularVelocity;
            }
            if (activeKeys[this.keys[3]]) {
                if (angle > 0) this.angle -= this.angularVelocity;else if (angle < 0) this.angle += this.angularVelocity;
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

var playerKeys = [[65, 68, 71, 74, 89, 72, 83, 87], [37, 39, 100, 102, 104, 101, 40, 38]];

var keyStates = {
    102: false,
    100: false,
    104: false,
    101: false,
    37: false,
    38: false,
    39: false,
    40: false,
    87: false,
    65: false,
    83: false,
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
        textSize(30);
        text('ARROW KEYS to move, SPACE to jump and CTRL to fire for Player 1', width / 2, height / 4);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXJPZlBhcnRpY2xlcyIsImV4cGxvc2lvbkF1ZGlvIiwicGxheSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJCYXNpY0ZpcmUiLCJjYXRBbmRNYXNrIiwiZmlyZUF1ZGlvIiwiY2lyY2xlIiwicmVzdGl0dXRpb24iLCJtb3ZlbWVudFNwZWVkIiwiZGFtYWdlZCIsImRhbWFnZUFtb3VudCIsInNldFZlbG9jaXR5IiwiY29zIiwic2luIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiZGlzYWJsZUNvbnRyb2xzIiwibWFwcGVkSGVhbHRoIiwibGluZSIsImFjdGl2ZUtleXMiLCJQSSIsInNldEFuZ2xlIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5IiwiYWJzIiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJnYW1lRW5kZWQiLCJwbGF5ZXJXb24iLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJwbGF5ZXJLZXlzIiwiRXZlbnRzIiwib24iLCJldmVudCIsIm9uVHJpZ2dlckVudGVyIiwib25UcmlnZ2VyRXhpdCIsInVwZGF0ZUVuZ2luZSIsInBhaXJzIiwibGFiZWxBIiwiYm9keUEiLCJsYWJlbEIiLCJib2R5QiIsIm1hdGNoIiwiYmFzaWNGaXJlIiwicGxheWVyIiwiZGFtYWdlUGxheWVyQmFzaWMiLCJiYXNpY0ZpcmVBIiwiYmFzaWNGaXJlQiIsImV4cGxvc2lvbkNvbGxpZGUiLCJwb3NYIiwicG9zWSIsImRhbWFnZUEiLCJkYW1hZ2VCIiwibWFwcGVkRGFtYWdlQSIsIm1hcHBlZERhbWFnZUIiLCJtYXBwZWREYW1hZ2UiLCJidWxsZXRQb3MiLCJwbGF5ZXJQb3MiLCJkaXJlY3Rpb25WZWN0b3IiLCJzdWIiLCJzZXRNYWciLCJib2RpZXMiLCJDb21wb3NpdGUiLCJhbGxCb2RpZXMiLCJpc1NsZWVwaW5nIiwibWFzcyIsImVsZW1lbnQiLCJqIiwia2V5U3RhdGVzIiwiaXNDb21wbGV0ZSIsImRpc3BsYXlUaW1lIiwiZ2FtZU1hbmFnZXIiLCJlbmRUaW1lIiwic2Vjb25kcyIsImRpc3BsYXlUZXh0Rm9yIiwiZGlzcGxheVN0YXJ0Rm9yIiwic2NlbmVDb3VudCIsImJ1dHRvbiIsImJ1dHRvbkRpc3BsYXllZCIsImJhY2tncm91bmRBdWRpbyIsImRpdkVsZW1lbnQiLCJwcmVsb2FkIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJmb250U2l6ZSIsImlkIiwiY2xhc3NOYW1lIiwiYXBwZW5kQ2hpbGQiLCJsb2FkU291bmQiLCJzdWNjZXNzTG9hZCIsImZhaWxMb2FkIiwid2hpbGVMb2FkaW5nIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJjcmVhdGVCdXR0b24iLCJlbHQiLCJkaXNwbGF5IiwibW91c2VQcmVzc2VkIiwicmVzZXRHYW1lIiwic2V0Vm9sdW1lIiwibG9vcCIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0ZXh0U3R5bGUiLCJCT0xEIiwidGV4dFNpemUiLCJ0ZXh0IiwiaW5uZXJUZXh0IiwiY3VycmVudFRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJmb3JtYXR0ZWRGcmFtZVJhdGUiLCJzZXRUaW1lb3V0IiwiY3JlYXRlRmxhZ3MiLCJjdXJyZW50RGF0ZVRpbWUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIiwiY29uc29sZSIsImxvZyIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFQUEsYTtBQUNBLDJCQUFBQyxDQUFBLEVBQUFDLENBQUEsRUFBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUFDLEtBQUEsRUFBQUMsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQUMsSUFBQSxHQUFBQyxPQUFBQyxNQUFBLENBQUFDLFNBQUEsQ0FBQVQsQ0FBQSxFQUFBQyxDQUFBLEVBQUFDLEtBQUEsRUFBQUMsTUFBQSxFQUFBO0FBQ0FPLG1CQUFBLGlCQURBO0FBRUFDLHNCQUFBLENBRkE7QUFHQUMseUJBQUEsQ0FIQTtBQUlBQyxzQkFBQSxJQUpBO0FBS0FDLDZCQUFBO0FBQ0FDLDBCQUFBQyxZQURBO0FBRUFDLHNCQUFBQztBQUZBO0FBTEEsU0FBQSxDQUFBO0FBVUFYLGVBQUFZLEtBQUEsQ0FBQUMsR0FBQSxDQUFBaEIsS0FBQSxFQUFBLEtBQUFFLElBQUE7QUFDQUMsZUFBQWMsSUFBQSxDQUFBQyxrQkFBQSxDQUFBLEtBQUFoQixJQUFBLEVBQUEsR0FBQTs7QUFFQSxhQUFBRixLQUFBLEdBQUFBLEtBQUE7O0FBRUEsYUFBQUYsS0FBQSxHQUFBQSxLQUFBO0FBQ0EsYUFBQUMsTUFBQSxHQUFBQSxNQUFBO0FBQ0EsYUFBQW9CLE1BQUEsR0FBQSxNQUFBQyxLQUFBQyxHQUFBdkIsS0FBQSxJQUFBdUIsR0FBQXRCLE1BQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxhQUFBRyxJQUFBLENBQUFvQixnQkFBQSxHQUFBLEtBQUE7QUFDQSxhQUFBcEIsSUFBQSxDQUFBcUIsY0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBckIsSUFBQSxDQUFBRCxLQUFBLEdBQUFBLEtBQUE7O0FBRUEsYUFBQXVCLEtBQUEsR0FBQSxHQUFBO0FBQ0EsYUFBQUMsaUJBQUEsR0FBQSxFQUFBOztBQUVBLGFBQUFDLGNBQUEsR0FBQUMsTUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLGFBQUFDLGNBQUEsR0FBQUQsTUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBRSxTQUFBLEdBQUEsR0FBQTtBQUNBLGFBQUFDLE1BQUEsR0FBQSxLQUFBRCxTQUFBO0FBQ0EsYUFBQUUsVUFBQSxHQUFBLENBQUE7QUFDQTs7OzsrQkFFQTtBQUNBLGdCQUFBQyxNQUFBLEtBQUE5QixJQUFBLENBQUErQixRQUFBO0FBQ0EsZ0JBQUFDLFFBQUEsS0FBQWhDLElBQUEsQ0FBQWdDLEtBQUE7O0FBRUEsZ0JBQUFDLGVBQUEsSUFBQTtBQUNBLGdCQUFBLEtBQUFqQyxJQUFBLENBQUFELEtBQUEsS0FBQSxDQUFBLEVBQ0FrQyxlQUFBQyxVQUFBLEtBQUFSLGNBQUEsRUFBQSxLQUFBRixjQUFBLEVBQUEsS0FBQUksTUFBQSxHQUFBLEtBQUFELFNBQUEsQ0FBQSxDQURBLEtBR0FNLGVBQUFDLFVBQUEsS0FBQVYsY0FBQSxFQUFBLEtBQUFFLGNBQUEsRUFBQSxLQUFBRSxNQUFBLEdBQUEsS0FBQUQsU0FBQSxDQUFBO0FBQ0FRLGlCQUFBRixZQUFBO0FBQ0FHOztBQUVBQyxpQkFBQVAsSUFBQXBDLENBQUEsRUFBQW9DLElBQUFuQyxDQUFBLEdBQUEsS0FBQUUsTUFBQSxHQUFBLEVBQUEsRUFBQSxLQUFBRCxLQUFBLEdBQUEsQ0FBQSxHQUFBLEtBQUFnQyxNQUFBLEdBQUEsS0FBQUQsU0FBQSxFQUFBLENBQUE7QUFDQVc7QUFDQUMsc0JBQUFULElBQUFwQyxDQUFBLEVBQUFvQyxJQUFBbkMsQ0FBQTtBQUNBNkMsbUJBQUFSLEtBQUE7QUFDQUssaUJBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBekMsS0FBQSxFQUFBLEtBQUFDLE1BQUE7O0FBRUE0QyxtQkFBQSxHQUFBLEVBQUEsS0FBQW5CLEtBQUE7QUFDQW9CLHlCQUFBLENBQUE7QUFDQUM7QUFDQUMsb0JBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBM0IsTUFBQSxHQUFBLENBQUE7QUFDQTRCO0FBQ0E7OztpQ0FFQTtBQUNBLGlCQUFBdkIsS0FBQSxJQUFBLEtBQUFDLGlCQUFBLEdBQUEsRUFBQSxHQUFBdUIsV0FBQTtBQUNBLGdCQUFBLEtBQUF4QixLQUFBLEdBQUEsQ0FBQSxFQUNBLEtBQUFBLEtBQUEsR0FBQSxHQUFBOztBQUVBLGdCQUFBLEtBQUF0QixJQUFBLENBQUFxQixjQUFBLElBQUEsS0FBQU8sTUFBQSxHQUFBLEtBQUFELFNBQUEsRUFBQTtBQUNBLHFCQUFBQyxNQUFBLElBQUEsS0FBQUMsVUFBQSxHQUFBLEVBQUEsR0FBQWlCLFdBQUE7QUFDQTtBQUNBLGdCQUFBLEtBQUE5QyxJQUFBLENBQUFvQixnQkFBQSxJQUFBLEtBQUFRLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQkFBQUEsTUFBQSxJQUFBLEtBQUFDLFVBQUEsR0FBQSxFQUFBLEdBQUFpQixXQUFBO0FBQ0E7QUFDQTs7OzBDQUVBO0FBQ0E3QyxtQkFBQVksS0FBQSxDQUFBa0MsTUFBQSxDQUFBLEtBQUFqRCxLQUFBLEVBQUEsS0FBQUUsSUFBQTtBQUNBOzs7Ozs7SUM5RUFnRCxRO0FBQ0Esc0JBQUF0RCxDQUFBLEVBQUFDLENBQUEsRUFBQXNELFdBQUEsRUFBQUMsZUFBQSxFQUFBO0FBQUEsWUFBQUMsUUFBQSx1RUFBQSxFQUFBOztBQUFBOztBQUNBLGFBQUFwQixRQUFBLEdBQUFxQixhQUFBMUQsQ0FBQSxFQUFBQyxDQUFBLENBQUE7QUFDQSxhQUFBd0QsUUFBQSxHQUFBRSxHQUFBQyxNQUFBLENBQUFDLFFBQUEsRUFBQTtBQUNBLGFBQUFKLFFBQUEsQ0FBQUssSUFBQSxDQUFBQyxPQUFBLENBQUEsRUFBQU4sUUFBQSxDQUFBO0FBQ0EsYUFBQU8sWUFBQSxHQUFBTixhQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQTlCLEtBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQTJCLFdBQUEsR0FBQUEsV0FBQTtBQUNBLGFBQUFDLGVBQUEsR0FBQUEsZUFBQTtBQUNBOzs7O21DQUVBUyxLLEVBQUE7QUFDQSxpQkFBQUQsWUFBQSxDQUFBNUMsR0FBQSxDQUFBNkMsS0FBQTtBQUNBOzs7K0JBRUE7QUFDQSxnQkFBQUMsYUFBQW5DLGdCQUFBLEtBQUF3QixXQUFBLHFCQUFBLEtBQUEzQixLQUFBLE9BQUE7QUFDQSxnQkFBQXVDLHFCQUFBQyxJQUFBLEtBQUF4QyxLQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQTRCLGVBQUEsQ0FBQTs7QUFFQVIseUJBQUFtQixrQkFBQTtBQUNBcEIsbUJBQUFtQixVQUFBO0FBQ0FHLGtCQUFBLEtBQUFoQyxRQUFBLENBQUFyQyxDQUFBLEVBQUEsS0FBQXFDLFFBQUEsQ0FBQXBDLENBQUE7O0FBRUEsaUJBQUEyQixLQUFBLElBQUEsSUFBQTtBQUNBOzs7aUNBRUE7QUFDQSxpQkFBQTZCLFFBQUEsQ0FBQUssSUFBQSxDQUFBLEdBQUE7O0FBRUEsaUJBQUFMLFFBQUEsQ0FBQXJDLEdBQUEsQ0FBQSxLQUFBNEMsWUFBQTtBQUNBLGlCQUFBM0IsUUFBQSxDQUFBakIsR0FBQSxDQUFBLEtBQUFxQyxRQUFBO0FBQ0EsaUJBQUFPLFlBQUEsQ0FBQUYsSUFBQSxDQUFBLENBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQWxDLEtBQUEsR0FBQSxDQUFBO0FBQ0E7Ozs7OztJQ25DQTBDLFM7QUFDQSx1QkFBQUMsTUFBQSxFQUFBQyxNQUFBLEVBQUE7QUFBQSxZQUFBaEIsZUFBQSx1RUFBQSxDQUFBO0FBQUEsWUFBQUMsUUFBQSx1RUFBQSxFQUFBO0FBQUEsWUFBQWdCLGlCQUFBLHVFQUFBLEdBQUE7O0FBQUE7O0FBQ0FDLHVCQUFBQyxJQUFBOztBQUVBLGFBQUF0QyxRQUFBLEdBQUFxQixhQUFBYSxNQUFBLEVBQUFDLE1BQUEsQ0FBQTtBQUNBLGFBQUFJLE9BQUEsR0FBQWxCLGFBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLGFBQUFGLGVBQUEsR0FBQUEsZUFBQTs7QUFFQSxZQUFBcUIsY0FBQUMsSUFBQWYsT0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBaEMsS0FBQSxHQUFBOEMsV0FBQTs7QUFFQSxhQUFBRSxTQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUF0QixRQUFBLEdBQUFBLFFBQUE7QUFDQSxhQUFBZ0IsaUJBQUEsR0FBQUEsaUJBQUE7O0FBRUEsYUFBQU8sT0FBQTtBQUNBOzs7O2tDQUVBO0FBQ0EsaUJBQUEsSUFBQUMsSUFBQSxDQUFBLEVBQUFBLElBQUEsS0FBQVIsaUJBQUEsRUFBQVEsR0FBQSxFQUFBO0FBQ0Esb0JBQUFDLFdBQUEsSUFBQTVCLFFBQUEsQ0FBQSxLQUFBakIsUUFBQSxDQUFBckMsQ0FBQSxFQUFBLEtBQUFxQyxRQUFBLENBQUFwQyxDQUFBLEVBQUEsS0FBQThCLEtBQUEsRUFDQSxLQUFBeUIsZUFEQSxFQUNBLEtBQUFDLFFBREEsQ0FBQTtBQUVBLHFCQUFBc0IsU0FBQSxDQUFBbkMsSUFBQSxDQUFBc0MsUUFBQTtBQUNBO0FBQ0E7OzsrQkFFQTtBQUNBLGlCQUFBSCxTQUFBLENBQUFJLE9BQUEsQ0FBQSxvQkFBQTtBQUNBRCx5QkFBQUUsSUFBQTtBQUNBLGFBRkE7QUFHQTs7O2lDQUVBO0FBQ0EsaUJBQUEsSUFBQUgsSUFBQSxDQUFBLEVBQUFBLElBQUEsS0FBQUYsU0FBQSxDQUFBTSxNQUFBLEVBQUFKLEdBQUEsRUFBQTtBQUNBLHFCQUFBRixTQUFBLENBQUFFLENBQUEsRUFBQUssVUFBQSxDQUFBLEtBQUFWLE9BQUE7QUFDQSxxQkFBQUcsU0FBQSxDQUFBRSxDQUFBLEVBQUFNLE1BQUE7O0FBRUEsb0JBQUEsQ0FBQSxLQUFBUixTQUFBLENBQUFFLENBQUEsRUFBQU8sU0FBQSxFQUFBLEVBQUE7QUFDQSx5QkFBQVQsU0FBQSxDQUFBVSxNQUFBLENBQUFSLENBQUEsRUFBQSxDQUFBO0FBQ0FBLHlCQUFBLENBQUE7QUFDQTtBQUNBO0FBQ0E7OztxQ0FFQTtBQUNBLG1CQUFBLEtBQUFGLFNBQUEsQ0FBQU0sTUFBQSxLQUFBLENBQUE7QUFDQTs7Ozs7O0lDOUNBSyxTO0FBQ0EsdUJBQUExRixDQUFBLEVBQUFDLENBQUEsRUFBQXNCLE1BQUEsRUFBQWUsS0FBQSxFQUFBbEMsS0FBQSxFQUFBdUYsVUFBQSxFQUFBO0FBQUE7O0FBQ0FDLGtCQUFBakIsSUFBQTs7QUFFQSxhQUFBcEQsTUFBQSxHQUFBQSxNQUFBO0FBQ0EsYUFBQWpCLElBQUEsR0FBQUMsT0FBQUMsTUFBQSxDQUFBcUYsTUFBQSxDQUFBN0YsQ0FBQSxFQUFBQyxDQUFBLEVBQUEsS0FBQXNCLE1BQUEsRUFBQTtBQUNBYixtQkFBQSxXQURBO0FBRUFDLHNCQUFBLENBRkE7QUFHQUMseUJBQUEsQ0FIQTtBQUlBa0YseUJBQUEsQ0FKQTtBQUtBaEYsNkJBQUE7QUFDQUMsMEJBQUE0RSxXQUFBNUUsUUFEQTtBQUVBRSxzQkFBQTBFLFdBQUExRTtBQUZBO0FBTEEsU0FBQSxDQUFBO0FBVUFWLGVBQUFZLEtBQUEsQ0FBQUMsR0FBQSxDQUFBaEIsS0FBQSxFQUFBLEtBQUFFLElBQUE7O0FBRUEsYUFBQXlGLGFBQUEsR0FBQSxLQUFBeEUsTUFBQSxHQUFBLENBQUE7QUFDQSxhQUFBZSxLQUFBLEdBQUFBLEtBQUE7QUFDQSxhQUFBbEMsS0FBQSxHQUFBQSxLQUFBOztBQUVBLGFBQUFFLElBQUEsQ0FBQTBGLE9BQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQTFGLElBQUEsQ0FBQTJGLFlBQUEsR0FBQSxLQUFBMUUsTUFBQSxHQUFBLENBQUE7O0FBRUEsYUFBQWpCLElBQUEsQ0FBQTRCLE1BQUEsR0FBQWtDLElBQUEsS0FBQTdDLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLENBQUE7O0FBRUEsYUFBQTJFLFdBQUE7QUFDQTs7OzsrQkFFQTtBQUNBLGdCQUFBLENBQUEsS0FBQTVGLElBQUEsQ0FBQTBGLE9BQUEsRUFBQTs7QUFFQXZELHFCQUFBLEdBQUE7QUFDQUM7O0FBRUEsb0JBQUFOLE1BQUEsS0FBQTlCLElBQUEsQ0FBQStCLFFBQUE7O0FBRUFPO0FBQ0FDLDBCQUFBVCxJQUFBcEMsQ0FBQSxFQUFBb0MsSUFBQW5DLENBQUE7QUFDQWlELHdCQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQTNCLE1BQUEsR0FBQSxDQUFBO0FBQ0E0QjtBQUNBO0FBQ0E7OztzQ0FFQTtBQUNBNUMsbUJBQUFjLElBQUEsQ0FBQTZFLFdBQUEsQ0FBQSxLQUFBNUYsSUFBQSxFQUFBO0FBQ0FOLG1CQUFBLEtBQUErRixhQUFBLEdBQUFJLElBQUEsS0FBQTdELEtBQUEsQ0FEQTtBQUVBckMsbUJBQUEsS0FBQThGLGFBQUEsR0FBQUssSUFBQSxLQUFBOUQsS0FBQTtBQUZBLGFBQUE7QUFJQTs7OzBDQUVBO0FBQ0EvQixtQkFBQVksS0FBQSxDQUFBa0MsTUFBQSxDQUFBLEtBQUFqRCxLQUFBLEVBQUEsS0FBQUUsSUFBQTtBQUNBOzs7eUNBRUE7QUFDQSxnQkFBQW1ELFdBQUEsS0FBQW5ELElBQUEsQ0FBQW1ELFFBQUE7QUFDQSxtQkFBQWpDLEtBQUFDLEdBQUFnQyxTQUFBekQsQ0FBQSxJQUFBeUIsR0FBQWdDLFNBQUF4RCxDQUFBLENBQUEsS0FBQSxJQUFBO0FBQ0E7Ozt3Q0FFQTtBQUNBLGdCQUFBbUMsTUFBQSxLQUFBOUIsSUFBQSxDQUFBK0IsUUFBQTtBQUNBLG1CQUNBRCxJQUFBcEMsQ0FBQSxHQUFBRSxLQUFBLElBQUFrQyxJQUFBcEMsQ0FBQSxHQUFBLENBQUEsSUFBQW9DLElBQUFuQyxDQUFBLEdBQUFFLE1BQUEsSUFBQWlDLElBQUFuQyxDQUFBLEdBQUEsQ0FEQTtBQUdBOzs7Ozs7SUNqRUFvRyxRO0FBQ0Esc0JBQUFyRyxDQUFBLEVBQUFDLENBQUEsRUFBQXFHLGFBQUEsRUFBQUMsY0FBQSxFQUFBbkcsS0FBQSxFQUFBO0FBQUEsWUFBQU0sS0FBQSx1RUFBQSxzQkFBQTtBQUFBLFlBQUFMLEtBQUEsdUVBQUEsQ0FBQSxDQUFBOztBQUFBOztBQUNBLGFBQUFDLElBQUEsR0FBQUMsT0FBQUMsTUFBQSxDQUFBQyxTQUFBLENBQUFULENBQUEsRUFBQUMsQ0FBQSxFQUFBcUcsYUFBQSxFQUFBQyxjQUFBLEVBQUE7QUFDQUMsc0JBQUEsSUFEQTtBQUVBN0Ysc0JBQUEsQ0FGQTtBQUdBbUYseUJBQUEsQ0FIQTtBQUlBcEYsbUJBQUFBLEtBSkE7QUFLQUksNkJBQUE7QUFDQUMsMEJBQUEwRixjQURBO0FBRUF4RixzQkFBQXdGLGlCQUFBdkYsY0FBQSxHQUFBd0YsaUJBQUEsR0FBQUM7QUFGQTtBQUxBLFNBQUEsQ0FBQTtBQVVBcEcsZUFBQVksS0FBQSxDQUFBQyxHQUFBLENBQUFoQixLQUFBLEVBQUEsS0FBQUUsSUFBQTs7QUFFQSxhQUFBSixLQUFBLEdBQUFvRyxhQUFBO0FBQ0EsYUFBQW5HLE1BQUEsR0FBQW9HLGNBQUE7QUFDQSxhQUFBakcsSUFBQSxDQUFBRCxLQUFBLEdBQUFBLEtBQUE7QUFDQTs7OzsrQkFFQTtBQUNBLGdCQUFBK0IsTUFBQSxLQUFBOUIsSUFBQSxDQUFBK0IsUUFBQTs7QUFFQSxnQkFBQSxLQUFBL0IsSUFBQSxDQUFBRCxLQUFBLEtBQUEsQ0FBQSxFQUNBb0MsS0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFEQSxLQUVBLElBQUEsS0FBQW5DLElBQUEsQ0FBQUQsS0FBQSxLQUFBLENBQUEsRUFDQW9DLEtBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEVBREEsS0FHQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQUM7O0FBRUFDLGlCQUFBUCxJQUFBcEMsQ0FBQSxFQUFBb0MsSUFBQW5DLENBQUEsRUFBQSxLQUFBQyxLQUFBLEVBQUEsS0FBQUMsTUFBQTtBQUNBOzs7Ozs7SUMvQkF5RyxNO0FBQ0Esb0JBQUE1RyxDQUFBLEVBQUFDLENBQUEsRUFBQTRHLFdBQUEsRUFBQUMsWUFBQSxFQUFBMUcsS0FBQSxFQUdBO0FBQUEsWUFIQXVGLFVBR0EsdUVBSEE7QUFDQTVFLHNCQUFBMEYsY0FEQTtBQUVBeEYsa0JBQUF3RixpQkFBQXZGLGNBQUEsR0FBQXdGLGlCQUFBLEdBQUFDO0FBRkEsU0FHQTs7QUFBQTs7QUFDQSxZQUFBSSxZQUFBOUcsSUFBQTZHLGVBQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsYUFBQXhHLElBQUEsR0FBQUMsT0FBQUMsTUFBQSxDQUFBQyxTQUFBLENBQUFULENBQUEsRUFBQStHLFNBQUEsRUFBQUYsV0FBQSxFQUFBLEVBQUEsRUFBQTtBQUNBTCxzQkFBQSxJQURBO0FBRUE3RixzQkFBQSxDQUZBO0FBR0FtRix5QkFBQSxDQUhBO0FBSUFwRixtQkFBQSxjQUpBO0FBS0FJLDZCQUFBO0FBQ0FDLDBCQUFBNEUsV0FBQTVFLFFBREE7QUFFQUUsc0JBQUEwRSxXQUFBMUU7QUFGQTtBQUxBLFNBQUEsQ0FBQTs7QUFXQSxZQUFBK0YsaUJBQUFGLGVBQUEsRUFBQTtBQUNBLFlBQUFHLGdCQUFBLEVBQUE7QUFDQSxhQUFBQyxjQUFBLEdBQUEzRyxPQUFBQyxNQUFBLENBQUFDLFNBQUEsQ0FBQVQsQ0FBQSxFQUFBQyxJQUFBLEVBQUEsRUFBQWdILGFBQUEsRUFBQUQsY0FBQSxFQUFBO0FBQ0FSLHNCQUFBLElBREE7QUFFQTdGLHNCQUFBLENBRkE7QUFHQW1GLHlCQUFBLENBSEE7QUFJQXBGLG1CQUFBLHNCQUpBO0FBS0FJLDZCQUFBO0FBQ0FDLDBCQUFBNEUsV0FBQTVFLFFBREE7QUFFQUUsc0JBQUEwRSxXQUFBMUU7QUFGQTtBQUxBLFNBQUEsQ0FBQTtBQVVBVixlQUFBWSxLQUFBLENBQUFDLEdBQUEsQ0FBQWhCLEtBQUEsRUFBQSxLQUFBOEcsY0FBQTtBQUNBM0csZUFBQVksS0FBQSxDQUFBQyxHQUFBLENBQUFoQixLQUFBLEVBQUEsS0FBQUUsSUFBQTs7QUFFQSxhQUFBSixLQUFBLEdBQUEyRyxXQUFBO0FBQ0EsYUFBQTFHLE1BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQTZHLGNBQUEsR0FBQUEsY0FBQTtBQUNBLGFBQUFDLGFBQUEsR0FBQUEsYUFBQTtBQUNBOzs7OytCQUVBO0FBQ0F4RSxpQkFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUE7QUFDQUM7O0FBRUEsZ0JBQUF5RSxlQUFBLEtBQUE3RyxJQUFBLENBQUE4RyxRQUFBO0FBQ0EsZ0JBQUFDLHFCQUFBLEtBQUFILGNBQUEsQ0FBQUUsUUFBQTtBQUNBLGdCQUFBQSxXQUFBLENBQ0FELGFBQUEsQ0FBQSxDQURBLEVBRUFBLGFBQUEsQ0FBQSxDQUZBLEVBR0FBLGFBQUEsQ0FBQSxDQUhBLEVBSUFFLG1CQUFBLENBQUEsQ0FKQSxFQUtBQSxtQkFBQSxDQUFBLENBTEEsRUFNQUEsbUJBQUEsQ0FBQSxDQU5BLEVBT0FBLG1CQUFBLENBQUEsQ0FQQSxFQVFBRixhQUFBLENBQUEsQ0FSQSxDQUFBOztBQVlBRztBQUNBLGlCQUFBLElBQUFyQyxJQUFBLENBQUEsRUFBQUEsSUFBQW1DLFNBQUEvQixNQUFBLEVBQUFKLEdBQUE7QUFDQXNDLHVCQUFBSCxTQUFBbkMsQ0FBQSxFQUFBakYsQ0FBQSxFQUFBb0gsU0FBQW5DLENBQUEsRUFBQWhGLENBQUE7QUFEQSxhQUVBdUg7QUFDQTs7Ozs7O0lDNURBQyxNO0FBQ0Esb0JBQUF6SCxDQUFBLEVBQUFDLENBQUEsRUFBQUcsS0FBQSxFQUFBc0gsV0FBQSxFQUdBO0FBQUEsWUFIQXBGLEtBR0EsdUVBSEEsQ0FHQTtBQUFBLFlBSEFxRCxVQUdBLHVFQUhBO0FBQ0E1RSxzQkFBQUcsY0FEQTtBQUVBRCxrQkFBQXdGLGlCQUFBdkYsY0FBQSxHQUFBd0YsaUJBQUEsR0FBQTFGO0FBRkEsU0FHQTs7QUFBQTs7QUFDQSxhQUFBVixJQUFBLEdBQUFDLE9BQUFDLE1BQUEsQ0FBQXFGLE1BQUEsQ0FBQTdGLENBQUEsRUFBQUMsQ0FBQSxFQUFBLEVBQUEsRUFBQTtBQUNBUyxtQkFBQSxRQURBO0FBRUFDLHNCQUFBLEdBRkE7QUFHQW1GLHlCQUFBLEdBSEE7QUFJQWhGLDZCQUFBO0FBQ0FDLDBCQUFBNEUsV0FBQTVFLFFBREE7QUFFQUUsc0JBQUEwRSxXQUFBMUU7QUFGQSxhQUpBO0FBUUFxQixtQkFBQUE7QUFSQSxTQUFBLENBQUE7QUFVQS9CLGVBQUFZLEtBQUEsQ0FBQUMsR0FBQSxDQUFBaEIsS0FBQSxFQUFBLEtBQUFFLElBQUE7QUFDQSxhQUFBRixLQUFBLEdBQUFBLEtBQUE7O0FBRUEsYUFBQW1CLE1BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQXdFLGFBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQTRCLGVBQUEsR0FBQSxHQUFBOztBQUVBLGFBQUFDLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQUMsa0JBQUEsR0FBQSxDQUFBOztBQUVBLGFBQUF2SCxJQUFBLENBQUF3SCxRQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUFDLGFBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQXpILElBQUEsQ0FBQTBILGlCQUFBLEdBQUEsQ0FBQTs7QUFFQSxhQUFBQyxPQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUFDLGtCQUFBLEdBQUEsQ0FBQTtBQUNBLGFBQUFDLGNBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQUMsa0JBQUEsR0FBQSxLQUFBRixrQkFBQTtBQUNBLGFBQUFHLG9CQUFBLEdBQUEsR0FBQTtBQUNBLGFBQUFDLGFBQUEsR0FBQSxLQUFBOztBQUVBLGFBQUFyRyxTQUFBLEdBQUEsR0FBQTtBQUNBLGFBQUEzQixJQUFBLENBQUFpSSxXQUFBLEdBQUEsQ0FBQTtBQUNBLGFBQUFqSSxJQUFBLENBQUE0QixNQUFBLEdBQUEsS0FBQUQsU0FBQTtBQUNBLGFBQUF1RyxlQUFBLEdBQUF6RyxNQUFBLHFCQUFBLENBQUE7QUFDQSxhQUFBMEcsZUFBQSxHQUFBMUcsTUFBQSxvQkFBQSxDQUFBO0FBQ0EsYUFBQTJHLGVBQUEsR0FBQTNHLE1BQUEsbUJBQUEsQ0FBQTs7QUFFQSxhQUFBNEcsSUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBckksSUFBQSxDQUFBRCxLQUFBLEdBQUFxSCxXQUFBOztBQUVBLGFBQUFrQixlQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUF0RyxLQUFBLEdBQUFBLEtBQUE7QUFDQTs7Ozt1Q0FFQXFHLEksRUFBQTtBQUNBLGlCQUFBQSxJQUFBLEdBQUFBLElBQUE7QUFDQTs7OytCQUVBO0FBQ0FqRztBQUNBLGdCQUFBTixNQUFBLEtBQUE5QixJQUFBLENBQUErQixRQUFBO0FBQ0EsZ0JBQUFDLFFBQUEsS0FBQWhDLElBQUEsQ0FBQWdDLEtBQUE7O0FBRUEsZ0JBQUFDLGVBQUEsSUFBQTtBQUNBLGdCQUFBc0csZUFBQXpFLElBQUEsS0FBQTlELElBQUEsQ0FBQTRCLE1BQUEsRUFBQSxDQUFBLEVBQUEsS0FBQUQsU0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLENBQUE7QUFDQSxnQkFBQTRHLGVBQUEsRUFBQSxFQUFBO0FBQ0F0RywrQkFBQUMsVUFBQSxLQUFBa0csZUFBQSxFQUFBLEtBQUFELGVBQUEsRUFBQUksZUFBQSxFQUFBLENBQUE7QUFDQSxhQUZBLE1BRUE7QUFDQXRHLCtCQUFBQyxVQUFBLEtBQUFpRyxlQUFBLEVBQUEsS0FBQUQsZUFBQSxFQUFBLENBQUFLLGVBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBO0FBQ0FwRyxpQkFBQUYsWUFBQTtBQUNBSSxpQkFBQVAsSUFBQXBDLENBQUEsRUFBQW9DLElBQUFuQyxDQUFBLEdBQUEsS0FBQXNCLE1BQUEsR0FBQSxFQUFBLEVBQUEsS0FBQWpCLElBQUEsQ0FBQTRCLE1BQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsZ0JBQUEsS0FBQTVCLElBQUEsQ0FBQUQsS0FBQSxLQUFBLENBQUEsRUFDQW9DLEtBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBREEsS0FHQUEsS0FBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUFHO0FBQ0FDLHNCQUFBVCxJQUFBcEMsQ0FBQSxFQUFBb0MsSUFBQW5DLENBQUE7QUFDQTZDLG1CQUFBUixLQUFBOztBQUVBWSxvQkFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEzQixNQUFBLEdBQUEsQ0FBQTs7QUFFQWtCLGlCQUFBLEdBQUE7QUFDQVMsb0JBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBM0IsTUFBQTtBQUNBb0IsaUJBQUEsSUFBQSxLQUFBcEIsTUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQUEsTUFBQSxHQUFBLEdBQUEsRUFBQSxLQUFBQSxNQUFBLEdBQUEsQ0FBQTs7QUFFQXlCLHlCQUFBLENBQUE7QUFDQUQsbUJBQUEsQ0FBQTtBQUNBK0YsaUJBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBdkgsTUFBQSxHQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBNEI7QUFDQTs7O3dDQUVBO0FBQ0EsZ0JBQUFmLE1BQUEsS0FBQTlCLElBQUEsQ0FBQStCLFFBQUE7QUFDQSxtQkFDQUQsSUFBQXBDLENBQUEsR0FBQSxNQUFBRSxLQUFBLElBQUFrQyxJQUFBcEMsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBb0MsSUFBQW5DLENBQUEsR0FBQUUsU0FBQSxHQURBO0FBR0E7OztzQ0FFQTRJLFUsRUFBQTs7QUFNQSxnQkFBQXpHLFFBQUEsS0FBQUEsS0FBQTs7QUFFQSxnQkFBQXlHLFdBQUEsS0FBQUosSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQXJHLFFBQUEwRyxFQUFBLEVBQ0EsS0FBQTFHLEtBQUEsSUFBQSxLQUFBcUYsZUFBQSxDQURBLEtBRUEsSUFBQXJGLFFBQUEwRyxFQUFBLEVBQ0EsS0FBQTFHLEtBQUEsSUFBQSxLQUFBcUYsZUFBQTtBQUNBO0FBQ0EsZ0JBQUFvQixXQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUFyRyxRQUFBLENBQUEsRUFDQSxLQUFBQSxLQUFBLElBQUEsS0FBQXFGLGVBQUEsQ0FEQSxLQUVBLElBQUFyRixRQUFBLENBQUEsRUFDQSxLQUFBQSxLQUFBLElBQUEsS0FBQXFGLGVBQUE7QUFDQTtBQUNBLGdCQUFBb0IsV0FBQSxLQUFBSixJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBckcsUUFBQSxJQUFBMEcsRUFBQSxHQUFBLENBQUEsRUFDQSxLQUFBMUcsS0FBQSxJQUFBLEtBQUFxRixlQUFBLENBREEsS0FFQSxJQUFBckYsUUFBQSxJQUFBMEcsRUFBQSxHQUFBLENBQUEsRUFDQSxLQUFBMUcsS0FBQSxJQUFBLEtBQUFxRixlQUFBO0FBQ0E7QUFDQSxnQkFBQW9CLFdBQUEsS0FBQUosSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQXJHLFFBQUEwRyxLQUFBLENBQUEsRUFDQSxLQUFBMUcsS0FBQSxJQUFBLEtBQUFxRixlQUFBLENBREEsS0FFQSxJQUFBckYsUUFBQTBHLEtBQUEsQ0FBQSxFQUNBLEtBQUExRyxLQUFBLElBQUEsS0FBQXFGLGVBQUE7QUFDQTs7QUFFQXBILG1CQUFBYyxJQUFBLENBQUE0SCxRQUFBLENBQUEsS0FBQTNJLElBQUEsRUFBQSxLQUFBZ0MsS0FBQTtBQUNBOzs7dUNBRUF5RyxVLEVBQUE7QUFDQSxnQkFBQUcsWUFBQSxLQUFBNUksSUFBQSxDQUFBbUQsUUFBQSxDQUFBeEQsQ0FBQTtBQUNBLGdCQUFBa0osWUFBQSxLQUFBN0ksSUFBQSxDQUFBbUQsUUFBQSxDQUFBekQsQ0FBQTs7QUFFQSxnQkFBQW9KLGVBQUFDLElBQUFGLFNBQUEsQ0FBQTtBQUNBLGdCQUFBRyxPQUFBSCxZQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBOztBQUVBLGdCQUFBSixXQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUFTLGVBQUEsS0FBQXJELGFBQUEsRUFBQTtBQUNBeEYsMkJBQUFjLElBQUEsQ0FBQTZFLFdBQUEsQ0FBQSxLQUFBNUYsSUFBQSxFQUFBO0FBQ0FOLDJCQUFBLEtBQUErRixhQUFBLEdBQUF1RCxJQURBO0FBRUFySiwyQkFBQWlKO0FBRkEscUJBQUE7QUFJQTs7QUFFQTNJLHVCQUFBYyxJQUFBLENBQUFpRSxVQUFBLENBQUEsS0FBQWhGLElBQUEsRUFBQSxLQUFBQSxJQUFBLENBQUErQixRQUFBLEVBQUE7QUFDQXJDLHVCQUFBLENBQUEsS0FEQTtBQUVBQyx1QkFBQTtBQUZBLGlCQUFBO0FBSUEsYUFaQSxNQVlBLElBQUE4SSxXQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUFTLGVBQUEsS0FBQXJELGFBQUEsRUFBQTtBQUNBeEYsMkJBQUFjLElBQUEsQ0FBQTZFLFdBQUEsQ0FBQSxLQUFBNUYsSUFBQSxFQUFBO0FBQ0FOLDJCQUFBLEtBQUErRixhQUFBLEdBQUF1RCxJQURBO0FBRUFySiwyQkFBQWlKO0FBRkEscUJBQUE7QUFJQTtBQUNBM0ksdUJBQUFjLElBQUEsQ0FBQWlFLFVBQUEsQ0FBQSxLQUFBaEYsSUFBQSxFQUFBLEtBQUFBLElBQUEsQ0FBQStCLFFBQUEsRUFBQTtBQUNBckMsdUJBQUEsS0FEQTtBQUVBQyx1QkFBQTtBQUZBLGlCQUFBO0FBSUE7QUFDQTs7O3FDQUVBOEksVSxFQUFBO0FBQ0EsZ0JBQUFJLFlBQUEsS0FBQTdJLElBQUEsQ0FBQW1ELFFBQUEsQ0FBQXpELENBQUE7O0FBRUEsZ0JBQUErSSxXQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxLQUFBckksSUFBQSxDQUFBd0gsUUFBQSxJQUFBLEtBQUF4SCxJQUFBLENBQUEwSCxpQkFBQSxHQUFBLEtBQUFELGFBQUEsRUFBQTtBQUNBeEgsMkJBQUFjLElBQUEsQ0FBQTZFLFdBQUEsQ0FBQSxLQUFBNUYsSUFBQSxFQUFBO0FBQ0FOLDJCQUFBbUosU0FEQTtBQUVBbEosMkJBQUEsQ0FBQSxLQUFBMkg7QUFGQSxxQkFBQTtBQUlBLHlCQUFBdEgsSUFBQSxDQUFBMEgsaUJBQUE7QUFDQSxpQkFOQSxNQU1BLElBQUEsS0FBQTFILElBQUEsQ0FBQXdILFFBQUEsRUFBQTtBQUNBdkgsMkJBQUFjLElBQUEsQ0FBQTZFLFdBQUEsQ0FBQSxLQUFBNUYsSUFBQSxFQUFBO0FBQ0FOLDJCQUFBbUosU0FEQTtBQUVBbEosMkJBQUEsQ0FBQSxLQUFBMkg7QUFGQSxxQkFBQTtBQUlBLHlCQUFBdEgsSUFBQSxDQUFBMEgsaUJBQUE7QUFDQSx5QkFBQTFILElBQUEsQ0FBQXdILFFBQUEsR0FBQSxLQUFBO0FBQ0E7QUFDQTs7QUFFQWlCLHVCQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxLQUFBO0FBQ0E7Ozt3Q0FFQTNJLEMsRUFBQUMsQyxFQUFBc0IsTSxFQUFBO0FBQ0FrQixpQkFBQSxHQUFBO0FBQ0FDOztBQUVBUSxvQkFBQWxELENBQUEsRUFBQUMsQ0FBQSxFQUFBc0IsU0FBQSxDQUFBO0FBQ0E7Ozt1Q0FFQXdILFUsRUFBQTtBQUNBLGdCQUFBM0csTUFBQSxLQUFBOUIsSUFBQSxDQUFBK0IsUUFBQTtBQUNBLGdCQUFBQyxRQUFBLEtBQUFoQyxJQUFBLENBQUFnQyxLQUFBOztBQUVBLGdCQUFBdEMsSUFBQSxLQUFBdUIsTUFBQSxHQUFBNEUsSUFBQTdELEtBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQUYsSUFBQXBDLENBQUE7QUFDQSxnQkFBQUMsSUFBQSxLQUFBc0IsTUFBQSxHQUFBNkUsSUFBQTlELEtBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQUYsSUFBQW5DLENBQUE7O0FBRUEsZ0JBQUE4SSxXQUFBLEtBQUFKLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EscUJBQUFMLGFBQUEsR0FBQSxJQUFBO0FBQ0EscUJBQUFGLGtCQUFBLElBQUEsS0FBQUMsb0JBQUE7O0FBRUEscUJBQUFELGtCQUFBLEdBQUEsS0FBQUEsa0JBQUEsR0FBQSxLQUFBRCxjQUFBLEdBQ0EsS0FBQUEsY0FEQSxHQUNBLEtBQUFDLGtCQURBOztBQUdBLHFCQUFBbUIsZUFBQSxDQUFBdkosQ0FBQSxFQUFBQyxDQUFBLEVBQUEsS0FBQW1JLGtCQUFBO0FBRUEsYUFUQSxNQVNBLElBQUEsQ0FBQVcsV0FBQSxLQUFBSixJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxLQUFBTCxhQUFBLEVBQUE7QUFDQSxxQkFBQUwsT0FBQSxDQUFBckYsSUFBQSxDQUFBLElBQUE4QyxTQUFBLENBQUExRixDQUFBLEVBQUFDLENBQUEsRUFBQSxLQUFBbUksa0JBQUEsRUFBQTlGLEtBQUEsRUFBQSxLQUFBbEMsS0FBQSxFQUFBO0FBQ0FXLDhCQUFBMkYsaUJBREE7QUFFQXpGLDBCQUFBd0YsaUJBQUF2RixjQUFBLEdBQUF3RjtBQUZBLGlCQUFBLENBQUE7O0FBS0EscUJBQUE0QixhQUFBLEdBQUEsS0FBQTtBQUNBLHFCQUFBRixrQkFBQSxHQUFBLEtBQUFGLGtCQUFBO0FBQ0E7QUFDQTs7OytCQUVBYSxVLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUFILGVBQUEsRUFBQTtBQUNBLHFCQUFBWSxhQUFBLENBQUFULFVBQUE7QUFDQSxxQkFBQVUsY0FBQSxDQUFBVixVQUFBO0FBQ0EscUJBQUFXLFlBQUEsQ0FBQVgsVUFBQTs7QUFFQSxxQkFBQVksY0FBQSxDQUFBWixVQUFBOztBQUVBeEksdUJBQUFjLElBQUEsQ0FBQUMsa0JBQUEsQ0FBQSxLQUFBaEIsSUFBQSxFQUFBLENBQUE7QUFDQTs7QUFFQSxpQkFBQSxJQUFBMkUsSUFBQSxDQUFBLEVBQUFBLElBQUEsS0FBQWdELE9BQUEsQ0FBQTVDLE1BQUEsRUFBQUosR0FBQSxFQUFBO0FBQ0EscUJBQUFnRCxPQUFBLENBQUFoRCxDQUFBLEVBQUFHLElBQUE7O0FBRUEsb0JBQUEsS0FBQTZDLE9BQUEsQ0FBQWhELENBQUEsRUFBQTJFLGNBQUEsTUFBQSxLQUFBM0IsT0FBQSxDQUFBaEQsQ0FBQSxFQUFBNEUsYUFBQSxFQUFBLEVBQUE7QUFDQSx5QkFBQTVCLE9BQUEsQ0FBQWhELENBQUEsRUFBQTZFLGVBQUE7QUFDQSx5QkFBQTdCLE9BQUEsQ0FBQXhDLE1BQUEsQ0FBQVIsQ0FBQSxFQUFBLENBQUE7QUFDQUEseUJBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTs7OzBDQUVBO0FBQ0ExRSxtQkFBQVksS0FBQSxDQUFBa0MsTUFBQSxDQUFBLEtBQUFqRCxLQUFBLEVBQUEsS0FBQUUsSUFBQTtBQUNBOzs7Ozs7SUNwUEF5SixXO0FBQ0EsMkJBQUE7QUFBQTs7QUFDQSxhQUFBQyxNQUFBLEdBQUF6SixPQUFBMEosTUFBQSxDQUFBQyxNQUFBLEVBQUE7QUFDQSxhQUFBOUosS0FBQSxHQUFBLEtBQUE0SixNQUFBLENBQUE1SixLQUFBO0FBQ0EsYUFBQTRKLE1BQUEsQ0FBQTVKLEtBQUEsQ0FBQXdFLE9BQUEsQ0FBQXVGLEtBQUEsR0FBQSxDQUFBOztBQUVBLGFBQUFDLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQUMsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBQyxVQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUFDLFNBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQUMsVUFBQSxHQUFBLEVBQUE7O0FBRUEsYUFBQUMsZ0JBQUEsR0FBQSxFQUFBOztBQUVBLGFBQUFDLGlCQUFBLEdBQUEsSUFBQTs7QUFFQSxhQUFBQyxTQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUFDLFNBQUEsR0FBQSxFQUFBOztBQUVBLGFBQUFDLGFBQUE7QUFDQSxhQUFBQyxnQkFBQTtBQUNBLGFBQUFDLGVBQUE7QUFDQSxhQUFBQyxhQUFBO0FBQ0EsYUFBQUMsb0JBQUE7QUFDQTs7Ozt3Q0FFQTtBQUNBLGlCQUFBLElBQUFoRyxJQUFBLElBQUEsRUFBQUEsSUFBQS9FLFFBQUEsR0FBQSxFQUFBK0UsS0FBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQWlHLGNBQUFuSCxPQUFBNUQsU0FBQSxJQUFBLEVBQUFBLFNBQUEsSUFBQSxDQUFBO0FBQ0EscUJBQUFrSyxPQUFBLENBQUF6SCxJQUFBLENBQUEsSUFBQWdFLE1BQUEsQ0FBQTNCLElBQUEsR0FBQSxFQUFBOUUsU0FBQStLLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQUEsV0FBQSxFQUFBLEtBQUE5SyxLQUFBLENBQUE7QUFDQTtBQUNBOzs7MkNBRUE7QUFDQSxpQkFBQWtLLFVBQUEsQ0FBQTFILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBLENBQUEsRUFBQWxHLFNBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQUEsTUFBQSxFQUFBLEtBQUFDLEtBQUEsQ0FBQTtBQUNBLGlCQUFBa0ssVUFBQSxDQUFBMUgsSUFBQSxDQUFBLElBQUF5RCxRQUFBLENBQUFuRyxRQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBQSxNQUFBLEVBQUEsS0FBQUMsS0FBQSxDQUFBO0FBQ0EsaUJBQUFrSyxVQUFBLENBQUExSCxJQUFBLENBQUEsSUFBQXlELFFBQUEsQ0FBQW5HLFFBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxLQUFBRSxLQUFBLENBQUE7QUFDQSxpQkFBQWtLLFVBQUEsQ0FBQTFILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBbkcsUUFBQSxDQUFBLEVBQUFDLFNBQUEsQ0FBQSxFQUFBRCxLQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUFFLEtBQUEsQ0FBQTtBQUNBOzs7MENBRUE7QUFDQSxpQkFBQW1LLFNBQUEsQ0FBQTNILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBLEdBQUEsRUFBQWxHLFNBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQUMsS0FBQSxFQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxpQkFBQW1LLFNBQUEsQ0FBQTNILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBbkcsUUFBQSxHQUFBLEVBQUFDLFNBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQUMsS0FBQSxFQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUFtSyxTQUFBLENBQUEzSCxJQUFBLENBQUEsSUFBQXlELFFBQUEsQ0FBQSxHQUFBLEVBQUFsRyxTQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUFDLEtBQUEsRUFBQSxjQUFBLENBQUE7QUFDQSxpQkFBQW1LLFNBQUEsQ0FBQTNILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBbkcsUUFBQSxHQUFBLEVBQUFDLFNBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQUMsS0FBQSxFQUFBLGNBQUEsQ0FBQTs7QUFFQSxpQkFBQW1LLFNBQUEsQ0FBQTNILElBQUEsQ0FBQSxJQUFBeUQsUUFBQSxDQUFBbkcsUUFBQSxDQUFBLEVBQUFDLFNBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQUMsS0FBQSxFQUFBLGNBQUEsQ0FBQTtBQUNBOzs7d0NBRUE7QUFDQSxpQkFBQWdLLE9BQUEsQ0FBQXhILElBQUEsQ0FBQSxJQUFBNkUsTUFBQSxDQUNBLEtBQUE0QyxPQUFBLENBQUEsQ0FBQSxFQUFBL0osSUFBQSxDQUFBK0IsUUFBQSxDQUFBckMsQ0FBQSxHQUFBLEtBQUFxSyxPQUFBLENBQUEsQ0FBQSxFQUFBbkssS0FBQSxHQUFBLENBQUEsR0FBQSxFQURBLEVBRUFDLFNBQUEsS0FGQSxFQUVBLEtBQUFDLEtBRkEsRUFFQSxDQUZBLENBQUE7QUFHQSxpQkFBQWdLLE9BQUEsQ0FBQSxDQUFBLEVBQUFlLGNBQUEsQ0FBQUMsV0FBQSxDQUFBLENBQUE7O0FBRUEsZ0JBQUEvRixTQUFBLEtBQUFnRixPQUFBLENBQUFoRixNQUFBO0FBQ0EsaUJBQUErRSxPQUFBLENBQUF4SCxJQUFBLENBQUEsSUFBQTZFLE1BQUEsQ0FDQSxLQUFBNEMsT0FBQSxDQUFBaEYsU0FBQSxDQUFBLEVBQUEvRSxJQUFBLENBQUErQixRQUFBLENBQUFyQyxDQUFBLEdBQUEsS0FBQXFLLE9BQUEsQ0FBQWhGLFNBQUEsQ0FBQSxFQUFBbkYsS0FBQSxHQUFBLENBQUEsR0FBQSxFQURBLEVBRUFDLFNBQUEsS0FGQSxFQUVBLEtBQUFDLEtBRkEsRUFFQSxDQUZBLEVBRUE0SSxFQUZBLENBQUE7QUFHQSxpQkFBQW9CLE9BQUEsQ0FBQSxDQUFBLEVBQUFlLGNBQUEsQ0FBQUMsV0FBQSxDQUFBLENBQUE7QUFDQTs7O3NDQUVBO0FBQ0EsaUJBQUFYLGdCQUFBLENBQUE3SCxJQUFBLENBQUEsSUFBQTdDLGFBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQUssS0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBcUssZ0JBQUEsQ0FBQTdILElBQUEsQ0FBQSxJQUFBN0MsYUFBQSxDQUFBRyxRQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxLQUFBRSxLQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7OzsrQ0FFQTtBQUFBOztBQUNBRyxtQkFBQThLLE1BQUEsQ0FBQUMsRUFBQSxDQUFBLEtBQUF0QixNQUFBLEVBQUEsZ0JBQUEsRUFBQSxVQUFBdUIsS0FBQSxFQUFBO0FBQ0Esc0JBQUFDLGNBQUEsQ0FBQUQsS0FBQTtBQUNBLGFBRkE7QUFHQWhMLG1CQUFBOEssTUFBQSxDQUFBQyxFQUFBLENBQUEsS0FBQXRCLE1BQUEsRUFBQSxjQUFBLEVBQUEsVUFBQXVCLEtBQUEsRUFBQTtBQUNBLHNCQUFBRSxhQUFBLENBQUFGLEtBQUE7QUFDQSxhQUZBO0FBR0FoTCxtQkFBQThLLE1BQUEsQ0FBQUMsRUFBQSxDQUFBLEtBQUF0QixNQUFBLEVBQUEsY0FBQSxFQUFBLFVBQUF1QixLQUFBLEVBQUE7QUFDQSxzQkFBQUcsWUFBQSxDQUFBSCxLQUFBO0FBQ0EsYUFGQTtBQUdBOzs7dUNBRUFBLEssRUFBQTtBQUNBLGlCQUFBLElBQUF0RyxJQUFBLENBQUEsRUFBQUEsSUFBQXNHLE1BQUFJLEtBQUEsQ0FBQXRHLE1BQUEsRUFBQUosR0FBQSxFQUFBO0FBQ0Esb0JBQUEyRyxTQUFBTCxNQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE0RyxLQUFBLENBQUFuTCxLQUFBO0FBQ0Esb0JBQUFvTCxTQUFBUCxNQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE4RyxLQUFBLENBQUFyTCxLQUFBOztBQUVBLG9CQUFBa0wsV0FBQSxXQUFBLElBQUFFLE9BQUFFLEtBQUEsQ0FBQSx1Q0FBQSxDQUFBLEVBQUE7QUFDQSx3QkFBQUMsWUFBQVYsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQTtBQUNBLHdCQUFBLENBQUFJLFVBQUFqRyxPQUFBLEVBQ0EsS0FBQXdFLFVBQUEsQ0FBQTVILElBQUEsQ0FBQSxJQUFBMEIsU0FBQSxDQUFBMkgsVUFBQTVKLFFBQUEsQ0FBQXJDLENBQUEsRUFBQWlNLFVBQUE1SixRQUFBLENBQUFwQyxDQUFBLENBQUE7QUFDQWdNLDhCQUFBakcsT0FBQSxHQUFBLElBQUE7QUFDQWlHLDhCQUFBbkwsZUFBQSxHQUFBO0FBQ0FDLGtDQUFBNEYsb0JBREE7QUFFQTFGLDhCQUFBd0Y7QUFGQSxxQkFBQTtBQUlBd0YsOEJBQUF0TCxRQUFBLEdBQUEsQ0FBQTtBQUNBc0wsOEJBQUFyTCxXQUFBLEdBQUEsQ0FBQTtBQUNBLGlCQVhBLE1BV0EsSUFBQWtMLFdBQUEsV0FBQSxJQUFBRixPQUFBSSxLQUFBLENBQUEsdUNBQUEsQ0FBQSxFQUFBO0FBQ0Esd0JBQUFDLGFBQUFWLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUE7QUFDQSx3QkFBQSxDQUFBRSxXQUFBakcsT0FBQSxFQUNBLEtBQUF3RSxVQUFBLENBQUE1SCxJQUFBLENBQUEsSUFBQTBCLFNBQUEsQ0FBQTJILFdBQUE1SixRQUFBLENBQUFyQyxDQUFBLEVBQUFpTSxXQUFBNUosUUFBQSxDQUFBcEMsQ0FBQSxDQUFBO0FBQ0FnTSwrQkFBQWpHLE9BQUEsR0FBQSxJQUFBO0FBQ0FpRywrQkFBQW5MLGVBQUEsR0FBQTtBQUNBQyxrQ0FBQTRGLG9CQURBO0FBRUExRiw4QkFBQXdGO0FBRkEscUJBQUE7QUFJQXdGLCtCQUFBdEwsUUFBQSxHQUFBLENBQUE7QUFDQXNMLCtCQUFBckwsV0FBQSxHQUFBLENBQUE7QUFDQTs7QUFFQSxvQkFBQWdMLFdBQUEsUUFBQSxJQUFBRSxXQUFBLGNBQUEsRUFBQTtBQUNBUCwwQkFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBL0QsUUFBQSxHQUFBLElBQUE7QUFDQXlELDBCQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE0RyxLQUFBLENBQUE3RCxpQkFBQSxHQUFBLENBQUE7QUFDQSxpQkFIQSxNQUdBLElBQUE4RCxXQUFBLFFBQUEsSUFBQUYsV0FBQSxjQUFBLEVBQUE7QUFDQUwsMEJBQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUEsQ0FBQWpFLFFBQUEsR0FBQSxJQUFBO0FBQ0F5RCwwQkFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQSxDQUFBL0QsaUJBQUEsR0FBQSxDQUFBO0FBQ0E7O0FBRUEsb0JBQUE0RCxXQUFBLFFBQUEsSUFBQUUsV0FBQSxXQUFBLEVBQUE7QUFDQSx3QkFBQUcsY0FBQVYsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQTtBQUNBLHdCQUFBRyxTQUFBWCxNQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE0RyxLQUFBO0FBQ0EseUJBQUFNLGlCQUFBLENBQUFELE1BQUEsRUFBQUQsV0FBQTtBQUNBLGlCQUpBLE1BSUEsSUFBQUgsV0FBQSxRQUFBLElBQUFGLFdBQUEsV0FBQSxFQUFBO0FBQ0Esd0JBQUFLLGNBQUFWLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUE7QUFDQSx3QkFBQUssVUFBQVgsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQTtBQUNBLHlCQUFBSSxpQkFBQSxDQUFBRCxPQUFBLEVBQUFELFdBQUE7QUFDQTs7QUFFQSxvQkFBQUwsV0FBQSxXQUFBLElBQUFFLFdBQUEsV0FBQSxFQUFBO0FBQ0Esd0JBQUFNLGFBQUFiLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUE7QUFDQSx3QkFBQVEsYUFBQWQsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQTs7QUFFQSx5QkFBQU8sZ0JBQUEsQ0FBQUYsVUFBQSxFQUFBQyxVQUFBO0FBQ0E7O0FBRUEsb0JBQUFULFdBQUEsaUJBQUEsSUFBQUUsV0FBQSxRQUFBLEVBQUE7QUFDQSx3QkFBQVAsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBeEwsS0FBQSxLQUFBa0wsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQSxDQUFBMUwsS0FBQSxFQUFBO0FBQ0FrTCw4QkFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBbkssZ0JBQUEsR0FBQSxJQUFBO0FBQ0EscUJBRkEsTUFFQTtBQUNBNkosOEJBQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUEsQ0FBQWxLLGNBQUEsR0FBQSxJQUFBO0FBQ0E7QUFDQSxpQkFOQSxNQU1BLElBQUFtSyxXQUFBLGlCQUFBLElBQUFGLFdBQUEsUUFBQSxFQUFBO0FBQ0Esd0JBQUFMLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUEsQ0FBQXhMLEtBQUEsS0FBQWtMLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUEsQ0FBQTFMLEtBQUEsRUFBQTtBQUNBa0wsOEJBQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUEsQ0FBQXJLLGdCQUFBLEdBQUEsSUFBQTtBQUNBLHFCQUZBLE1BRUE7QUFDQTZKLDhCQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE4RyxLQUFBLENBQUFwSyxjQUFBLEdBQUEsSUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7c0NBRUE0SixLLEVBQUE7QUFDQSxpQkFBQSxJQUFBdEcsSUFBQSxDQUFBLEVBQUFBLElBQUFzRyxNQUFBSSxLQUFBLENBQUF0RyxNQUFBLEVBQUFKLEdBQUEsRUFBQTtBQUNBLG9CQUFBMkcsU0FBQUwsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBbkwsS0FBQTtBQUNBLG9CQUFBb0wsU0FBQVAsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQSxDQUFBckwsS0FBQTs7QUFFQSxvQkFBQWtMLFdBQUEsaUJBQUEsSUFBQUUsV0FBQSxRQUFBLEVBQUE7QUFDQSx3QkFBQVAsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBeEwsS0FBQSxLQUFBa0wsTUFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBOEcsS0FBQSxDQUFBMUwsS0FBQSxFQUFBO0FBQ0FrTCw4QkFBQUksS0FBQSxDQUFBMUcsQ0FBQSxFQUFBNEcsS0FBQSxDQUFBbkssZ0JBQUEsR0FBQSxLQUFBO0FBQ0EscUJBRkEsTUFFQTtBQUNBNkosOEJBQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUEsQ0FBQWxLLGNBQUEsR0FBQSxLQUFBO0FBQ0E7QUFDQSxpQkFOQSxNQU1BLElBQUFtSyxXQUFBLGlCQUFBLElBQUFGLFdBQUEsUUFBQSxFQUFBO0FBQ0Esd0JBQUFMLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQTRHLEtBQUEsQ0FBQXhMLEtBQUEsS0FBQWtMLE1BQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUEsQ0FBQTFMLEtBQUEsRUFBQTtBQUNBa0wsOEJBQUFJLEtBQUEsQ0FBQTFHLENBQUEsRUFBQThHLEtBQUEsQ0FBQXJLLGdCQUFBLEdBQUEsS0FBQTtBQUNBLHFCQUZBLE1BRUE7QUFDQTZKLDhCQUFBSSxLQUFBLENBQUExRyxDQUFBLEVBQUE4RyxLQUFBLENBQUFwSyxjQUFBLEdBQUEsS0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7eUNBRUF5SyxVLEVBQUFDLFUsRUFBQTtBQUNBLGdCQUFBRSxPQUFBLENBQUFILFdBQUEvSixRQUFBLENBQUFyQyxDQUFBLEdBQUFxTSxXQUFBaEssUUFBQSxDQUFBckMsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQXdNLE9BQUEsQ0FBQUosV0FBQS9KLFFBQUEsQ0FBQXBDLENBQUEsR0FBQW9NLFdBQUFoSyxRQUFBLENBQUFwQyxDQUFBLElBQUEsQ0FBQTs7QUFFQSxnQkFBQXdNLFVBQUFMLFdBQUFuRyxZQUFBO0FBQ0EsZ0JBQUF5RyxVQUFBTCxXQUFBcEcsWUFBQTtBQUNBLGdCQUFBMEcsZ0JBQUF2SSxJQUFBcUksT0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBRyxnQkFBQXhJLElBQUFzSSxPQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxDQUFBOztBQUVBTix1QkFBQWxLLE1BQUEsSUFBQTBLLGFBQUE7QUFDQVAsdUJBQUFuSyxNQUFBLElBQUF5SyxhQUFBOztBQUVBLGdCQUFBUCxXQUFBbEssTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBa0ssMkJBQUFwRyxPQUFBLEdBQUEsSUFBQTtBQUNBb0csMkJBQUF0TCxlQUFBLEdBQUE7QUFDQUMsOEJBQUE0RixvQkFEQTtBQUVBMUYsMEJBQUF3RjtBQUZBLGlCQUFBO0FBSUEyRiwyQkFBQXpMLFFBQUEsR0FBQSxDQUFBO0FBQ0F5TCwyQkFBQXhMLFdBQUEsR0FBQSxDQUFBO0FBQ0E7QUFDQSxnQkFBQXlMLFdBQUFuSyxNQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0FtSywyQkFBQXJHLE9BQUEsR0FBQSxJQUFBO0FBQ0FxRywyQkFBQXZMLGVBQUEsR0FBQTtBQUNBQyw4QkFBQTRGLG9CQURBO0FBRUExRiwwQkFBQXdGO0FBRkEsaUJBQUE7QUFJQTRGLDJCQUFBMUwsUUFBQSxHQUFBLENBQUE7QUFDQTBMLDJCQUFBekwsV0FBQSxHQUFBLENBQUE7QUFDQTs7QUFFQSxpQkFBQTRKLFVBQUEsQ0FBQTVILElBQUEsQ0FBQSxJQUFBMEIsU0FBQSxDQUFBaUksSUFBQSxFQUFBQyxJQUFBLENBQUE7QUFDQTs7OzBDQUVBTixNLEVBQUFELFMsRUFBQTtBQUNBQyxtQkFBQTNELFdBQUEsSUFBQTBELFVBQUFoRyxZQUFBO0FBQ0EsZ0JBQUE0RyxlQUFBekksSUFBQTZILFVBQUFoRyxZQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBO0FBQ0FpRyxtQkFBQWhLLE1BQUEsSUFBQTJLLFlBQUE7O0FBRUFaLHNCQUFBakcsT0FBQSxHQUFBLElBQUE7QUFDQWlHLHNCQUFBbkwsZUFBQSxHQUFBO0FBQ0FDLDBCQUFBNEYsb0JBREE7QUFFQTFGLHNCQUFBd0Y7QUFGQSxhQUFBOztBQUtBLGdCQUFBcUcsWUFBQXBKLGFBQUF1SSxVQUFBNUosUUFBQSxDQUFBckMsQ0FBQSxFQUFBaU0sVUFBQTVKLFFBQUEsQ0FBQXBDLENBQUEsQ0FBQTtBQUNBLGdCQUFBOE0sWUFBQXJKLGFBQUF3SSxPQUFBN0osUUFBQSxDQUFBckMsQ0FBQSxFQUFBa00sT0FBQTdKLFFBQUEsQ0FBQXBDLENBQUEsQ0FBQTs7QUFFQSxnQkFBQStNLGtCQUFBckosR0FBQUMsTUFBQSxDQUFBcUosR0FBQSxDQUFBRixTQUFBLEVBQUFELFNBQUEsQ0FBQTtBQUNBRSw0QkFBQUUsTUFBQSxDQUFBLEtBQUF4QyxpQkFBQSxHQUFBd0IsT0FBQTNELFdBQUEsR0FBQSxJQUFBOztBQUVBaEksbUJBQUFjLElBQUEsQ0FBQWlFLFVBQUEsQ0FBQTRHLE1BQUEsRUFBQUEsT0FBQTdKLFFBQUEsRUFBQTtBQUNBckMsbUJBQUFnTixnQkFBQWhOLENBREE7QUFFQUMsbUJBQUErTSxnQkFBQS9NO0FBRkEsYUFBQTs7QUFLQSxpQkFBQXVLLFVBQUEsQ0FBQTVILElBQUEsQ0FBQSxJQUFBMEIsU0FBQSxDQUFBMkgsVUFBQTVKLFFBQUEsQ0FBQXJDLENBQUEsRUFBQWlNLFVBQUE1SixRQUFBLENBQUFwQyxDQUFBLENBQUE7QUFDQTs7O3VDQUVBO0FBQ0EsZ0JBQUFrTixTQUFBNU0sT0FBQTZNLFNBQUEsQ0FBQUMsU0FBQSxDQUFBLEtBQUFyRCxNQUFBLENBQUE1SixLQUFBLENBQUE7O0FBRUEsaUJBQUEsSUFBQTZFLElBQUEsQ0FBQSxFQUFBQSxJQUFBa0ksT0FBQTlILE1BQUEsRUFBQUosR0FBQSxFQUFBO0FBQ0Esb0JBQUEzRSxPQUFBNk0sT0FBQWxJLENBQUEsQ0FBQTs7QUFFQSxvQkFBQTNFLEtBQUFrRyxRQUFBLElBQUFsRyxLQUFBZ04sVUFBQSxJQUFBaE4sS0FBQUksS0FBQSxLQUFBLFdBQUEsSUFDQUosS0FBQUksS0FBQSxLQUFBLGlCQURBLEVBRUE7O0FBRUFKLHFCQUFBMkQsS0FBQSxDQUFBaEUsQ0FBQSxJQUFBSyxLQUFBaU4sSUFBQSxHQUFBLEtBQUE7QUFDQTtBQUNBOzs7K0JBRUE7QUFDQWhOLG1CQUFBMEosTUFBQSxDQUFBMUUsTUFBQSxDQUFBLEtBQUF5RSxNQUFBOztBQUVBLGlCQUFBSyxPQUFBLENBQUFsRixPQUFBLENBQUEsbUJBQUE7QUFDQXFJLHdCQUFBcEksSUFBQTtBQUNBLGFBRkE7QUFHQSxpQkFBQWtGLFVBQUEsQ0FBQW5GLE9BQUEsQ0FBQSxtQkFBQTtBQUNBcUksd0JBQUFwSSxJQUFBO0FBQ0EsYUFGQTtBQUdBLGlCQUFBbUYsU0FBQSxDQUFBcEYsT0FBQSxDQUFBLG1CQUFBO0FBQ0FxSSx3QkFBQXBJLElBQUE7QUFDQSxhQUZBOztBQUlBLGlCQUFBLElBQUFILElBQUEsQ0FBQSxFQUFBQSxJQUFBLEtBQUF3RixnQkFBQSxDQUFBcEYsTUFBQSxFQUFBSixHQUFBLEVBQUE7QUFDQSxxQkFBQXdGLGdCQUFBLENBQUF4RixDQUFBLEVBQUFNLE1BQUE7QUFDQSxxQkFBQWtGLGdCQUFBLENBQUF4RixDQUFBLEVBQUFHLElBQUE7O0FBRUEsb0JBQUEsS0FBQXFGLGdCQUFBLENBQUF4RixDQUFBLEVBQUEvQyxNQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0Esd0JBQUFFLE1BQUEsS0FBQXFJLGdCQUFBLENBQUF4RixDQUFBLEVBQUEzRSxJQUFBLENBQUErQixRQUFBO0FBQ0EseUJBQUFzSSxTQUFBLEdBQUEsSUFBQTs7QUFFQSx3QkFBQSxLQUFBRixnQkFBQSxDQUFBeEYsQ0FBQSxFQUFBM0UsSUFBQSxDQUFBRCxLQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsNkJBQUF1SyxTQUFBLENBQUFoSSxJQUFBLENBQUEsQ0FBQTtBQUNBLDZCQUFBNEgsVUFBQSxDQUFBNUgsSUFBQSxDQUFBLElBQUEwQixTQUFBLENBQUFsQyxJQUFBcEMsQ0FBQSxFQUFBb0MsSUFBQW5DLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLHFCQUhBLE1BR0E7QUFDQSw2QkFBQTJLLFNBQUEsQ0FBQWhJLElBQUEsQ0FBQSxDQUFBO0FBQ0EsNkJBQUE0SCxVQUFBLENBQUE1SCxJQUFBLENBQUEsSUFBQTBCLFNBQUEsQ0FBQWxDLElBQUFwQyxDQUFBLEVBQUFvQyxJQUFBbkMsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7O0FBRUEseUJBQUF3SyxnQkFBQSxDQUFBeEYsQ0FBQSxFQUFBNkUsZUFBQTtBQUNBLHlCQUFBVyxnQkFBQSxDQUFBaEYsTUFBQSxDQUFBUixDQUFBLEVBQUEsQ0FBQTtBQUNBQSx5QkFBQSxDQUFBOztBQUVBLHlCQUFBLElBQUF3SSxJQUFBLENBQUEsRUFBQUEsSUFBQSxLQUFBckQsT0FBQSxDQUFBL0UsTUFBQSxFQUFBb0ksR0FBQSxFQUFBO0FBQ0EsNkJBQUFyRCxPQUFBLENBQUFxRCxDQUFBLEVBQUE3RSxlQUFBLEdBQUEsSUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBQSxJQUFBM0QsS0FBQSxDQUFBLEVBQUFBLEtBQUEsS0FBQW1GLE9BQUEsQ0FBQS9FLE1BQUEsRUFBQUosSUFBQSxFQUFBO0FBQ0EscUJBQUFtRixPQUFBLENBQUFuRixFQUFBLEVBQUFHLElBQUE7QUFDQSxxQkFBQWdGLE9BQUEsQ0FBQW5GLEVBQUEsRUFBQU0sTUFBQSxDQUFBbUksU0FBQTs7QUFFQSxvQkFBQSxLQUFBdEQsT0FBQSxDQUFBbkYsRUFBQSxFQUFBM0UsSUFBQSxDQUFBNEIsTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBLHdCQUFBRSxPQUFBLEtBQUFnSSxPQUFBLENBQUFuRixFQUFBLEVBQUEzRSxJQUFBLENBQUErQixRQUFBO0FBQ0EseUJBQUFtSSxVQUFBLENBQUE1SCxJQUFBLENBQUEsSUFBQTBCLFNBQUEsQ0FBQWxDLEtBQUFwQyxDQUFBLEVBQUFvQyxLQUFBbkMsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxDQUFBOztBQUVBLHlCQUFBMEssU0FBQSxHQUFBLElBQUE7QUFDQSx5QkFBQUMsU0FBQSxDQUFBaEksSUFBQSxDQUFBLEtBQUF3SCxPQUFBLENBQUFuRixFQUFBLEVBQUEzRSxJQUFBLENBQUFELEtBQUE7O0FBRUEseUJBQUEsSUFBQW9OLEtBQUEsQ0FBQSxFQUFBQSxLQUFBLEtBQUFyRCxPQUFBLENBQUEvRSxNQUFBLEVBQUFvSSxJQUFBLEVBQUE7QUFDQSw2QkFBQXJELE9BQUEsQ0FBQXFELEVBQUEsRUFBQTdFLGVBQUEsR0FBQSxJQUFBO0FBQ0E7O0FBRUEseUJBQUF3QixPQUFBLENBQUFuRixFQUFBLEVBQUE2RSxlQUFBO0FBQ0EseUJBQUFNLE9BQUEsQ0FBQTNFLE1BQUEsQ0FBQVIsRUFBQSxFQUFBLENBQUE7QUFDQTtBQUNBOztBQUVBLGlCQUFBLElBQUFBLE1BQUEsQ0FBQSxFQUFBQSxNQUFBLEtBQUF1RixVQUFBLENBQUFuRixNQUFBLEVBQUFKLEtBQUEsRUFBQTtBQUNBLHFCQUFBdUYsVUFBQSxDQUFBdkYsR0FBQSxFQUFBRyxJQUFBO0FBQ0EscUJBQUFvRixVQUFBLENBQUF2RixHQUFBLEVBQUFNLE1BQUE7O0FBRUEsb0JBQUEsS0FBQWlGLFVBQUEsQ0FBQXZGLEdBQUEsRUFBQTBJLFVBQUEsRUFBQSxFQUFBO0FBQ0EseUJBQUFuRCxVQUFBLENBQUEvRSxNQUFBLENBQUFSLEdBQUEsRUFBQSxDQUFBO0FBQ0FBLDJCQUFBLENBQUE7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQzFUQSxJQUFBbUcsYUFBQSxDQUVBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FGQSxFQUdBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FIQSxDQUFBOztBQU1BLElBQUFzQyxZQUFBO0FBQ0EsU0FBQSxLQURBO0FBRUEsU0FBQSxLQUZBO0FBR0EsU0FBQSxLQUhBO0FBSUEsU0FBQSxLQUpBO0FBS0EsUUFBQSxLQUxBO0FBTUEsUUFBQSxLQU5BO0FBT0EsUUFBQSxLQVBBO0FBUUEsUUFBQSxLQVJBO0FBU0EsUUFBQSxLQVRBO0FBVUEsUUFBQSxLQVZBO0FBV0EsUUFBQSxLQVhBO0FBWUEsUUFBQSxLQVpBO0FBYUEsUUFBQSxLQWJBO0FBY0EsUUFBQSxLQWRBO0FBZUEsUUFBQSxLQWZBO0FBZ0JBLFFBQUEsS0FoQkEsRUFBQTs7QUFtQkEsSUFBQWpILGlCQUFBLE1BQUE7QUFDQSxJQUFBdkYsaUJBQUEsTUFBQTtBQUNBLElBQUF3RixvQkFBQSxNQUFBO0FBQ0EsSUFBQUMsdUJBQUEsTUFBQTtBQUNBLElBQUEzRixlQUFBLE1BQUE7QUFDQSxJQUFBNE0sY0FBQSxHQUFBOztBQUVBLElBQUFDLGNBQUEsSUFBQTtBQUNBLElBQUFDLGdCQUFBO0FBQ0EsSUFBQUMsVUFBQSxDQUFBO0FBQ0EsSUFBQUMsaUJBQUFKLFdBQUE7QUFDQSxJQUFBSyxrQkFBQUwsV0FBQTs7QUFFQSxJQUFBTSxhQUFBLENBQUE7QUFDQSxJQUFBMUQsYUFBQSxFQUFBOztBQUVBLElBQUEyRCxlQUFBO0FBQ0EsSUFBQUMsa0JBQUEsS0FBQTs7QUFFQSxJQUFBQyx3QkFBQTtBQUNBLElBQUF6SSxrQkFBQTtBQUNBLElBQUFsQix1QkFBQTs7QUFFQSxJQUFBNEosbUJBQUE7O0FBRUEsU0FBQUMsT0FBQSxHQUFBO0FBQ0FELGlCQUFBRSxTQUFBQyxhQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0FILGVBQUFJLEtBQUEsQ0FBQUMsUUFBQSxHQUFBLE9BQUE7QUFDQUwsZUFBQU0sRUFBQSxHQUFBLFlBQUE7QUFDQU4sZUFBQU8sU0FBQSxHQUFBLG9CQUFBO0FBQ0FMLGFBQUFsTyxJQUFBLENBQUF3TyxXQUFBLENBQUFSLFVBQUE7O0FBTUFELHNCQUFBVSxVQUFBLDhCQUFBLEVBQUFDLFdBQUEsRUFBQUMsUUFBQSxFQUFBQyxZQUFBLENBQUE7QUFDQXRKLGdCQUFBbUosVUFBQSx5QkFBQSxFQUFBQyxXQUFBLEVBQUFDLFFBQUEsQ0FBQTtBQUNBdksscUJBQUFxSyxVQUFBLDZCQUFBLEVBQUFDLFdBQUEsRUFBQUMsUUFBQSxDQUFBO0FBQ0E7O0FBRUEsU0FBQUUsS0FBQSxHQUFBO0FBQ0EsUUFBQUMsU0FBQUMsYUFBQUMsT0FBQUMsVUFBQSxHQUFBLEVBQUEsRUFBQUQsT0FBQUUsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBSixXQUFBSyxNQUFBLENBQUEsZUFBQTs7QUFFQXRCLGFBQUF1QixhQUFBLE1BQUEsQ0FBQTtBQUNBdkIsV0FBQTlMLFFBQUEsQ0FBQW5DLFFBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQUMsU0FBQSxHQUFBO0FBQ0FnTyxXQUFBd0IsR0FBQSxDQUFBZCxTQUFBLEdBQUEsY0FBQTtBQUNBVixXQUFBd0IsR0FBQSxDQUFBakIsS0FBQSxDQUFBa0IsT0FBQSxHQUFBLE1BQUE7QUFDQXpCLFdBQUEwQixZQUFBLENBQUFDLFNBQUE7O0FBRUF6QixvQkFBQTBCLFNBQUEsQ0FBQSxHQUFBO0FBQ0ExQixvQkFBQTFKLElBQUE7QUFDQTBKLG9CQUFBMkIsSUFBQTs7QUFFQUMsYUFBQUMsTUFBQTtBQUNBQyxjQUFBRCxNQUFBLEVBQUFBLE1BQUE7QUFDQTs7QUFFQSxTQUFBRSxJQUFBLEdBQUE7QUFDQUMsZUFBQSxDQUFBO0FBQ0EsUUFBQW5DLGVBQUEsQ0FBQSxFQUFBO0FBQ0FvQyxrQkFBQUMsSUFBQTtBQUNBQyxpQkFBQSxFQUFBO0FBQ0E5TjtBQUNBRCxhQUFBVixlQUFBK0MsSUFBQWYsT0FBQSxHQUFBLENBQUEsQ0FBQSxrQkFBQTtBQUNBME0sYUFBQSxlQUFBLEVBQUF2USxRQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQTtBQUNBdUMsYUFBQSxHQUFBO0FBQ0ErTixpQkFBQSxFQUFBO0FBQ0FDLGFBQUEsaUVBQUEsRUFBQXZRLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUE7QUFDQXNRLGFBQUEsb0RBQUEsRUFBQXZRLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLElBQUE7QUFDQXNDLGFBQUFWLGVBQUErQyxJQUFBZixPQUFBLEdBQUEsQ0FBQSxDQUFBLGtCQUFBO0FBQ0EwTSxhQUFBLHVEQUFBLEVBQUF2USxRQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBaU8sZUFBQSxFQUFBO0FBQ0FELG1CQUFBd0IsR0FBQSxDQUFBakIsS0FBQSxDQUFBa0IsT0FBQSxHQUFBLE9BQUE7QUFDQXpCLG1CQUFBd0IsR0FBQSxDQUFBZSxTQUFBLEdBQUEsV0FBQTtBQUNBdEMsOEJBQUEsSUFBQTtBQUNBO0FBQ0EsS0FqQkEsTUFpQkEsSUFBQUYsZUFBQSxDQUFBLEVBQUE7QUFDQUwsb0JBQUF1QyxJQUFBOztBQUVBLFlBQUFyQyxVQUFBLENBQUEsRUFBQTtBQUNBLGdCQUFBNEMsY0FBQSxJQUFBQyxJQUFBLEdBQUFDLE9BQUEsRUFBQTtBQUNBLGdCQUFBQyxPQUFBaEQsVUFBQTZDLFdBQUE7QUFDQTVDLHNCQUFBZ0QsS0FBQUMsS0FBQSxDQUFBRixRQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBck8saUJBQUEsR0FBQTtBQUNBK04scUJBQUEsRUFBQTtBQUNBQywwQ0FBQTFDLE9BQUEsRUFBQTdOLFFBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxTQVJBLE1BUUE7QUFDQSxnQkFBQThOLGlCQUFBLENBQUEsRUFBQTtBQUNBQSxrQ0FBQSxJQUFBLEVBQUEsR0FBQWlELG9CQUFBO0FBQ0F4TyxxQkFBQSxHQUFBO0FBQ0ErTix5QkFBQSxFQUFBO0FBQ0FDLHFEQUFBdlEsUUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBO0FBQ0E7O0FBRUEsWUFBQStOLGtCQUFBLENBQUEsRUFBQTtBQUNBQSwrQkFBQSxJQUFBLEVBQUEsR0FBQWdELG9CQUFBO0FBQ0F4TyxpQkFBQSxHQUFBO0FBQ0ErTixxQkFBQSxHQUFBO0FBQ0FDLDBCQUFBdlEsUUFBQSxDQUFBLEVBQUFDLFNBQUEsQ0FBQTtBQUNBOztBQUVBLFlBQUEwTixZQUFBbEQsU0FBQSxFQUFBO0FBQ0EsZ0JBQUFrRCxZQUFBakQsU0FBQSxDQUFBdkYsTUFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBd0ksWUFBQWpELFNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0FuSSx5QkFBQSxHQUFBO0FBQ0ErTiw2QkFBQSxHQUFBO0FBQ0FDLHlDQUFBdlEsUUFBQSxDQUFBLEVBQUFDLFNBQUEsQ0FBQSxHQUFBLEdBQUE7QUFDQSxpQkFKQSxNQUlBLElBQUEwTixZQUFBakQsU0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEVBQUE7QUFDQW5JLHlCQUFBLEdBQUE7QUFDQStOLDZCQUFBLEdBQUE7QUFDQUMseUNBQUF2USxRQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBLEdBQUEsR0FBQTtBQUNBO0FBQ0EsYUFWQSxNQVVBLElBQUEwTixZQUFBakQsU0FBQSxDQUFBdkYsTUFBQSxLQUFBLENBQUEsRUFBQTtBQUNBNUMscUJBQUEsR0FBQTtBQUNBK04seUJBQUEsR0FBQTtBQUNBQyw2QkFBQXZRLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0E7O0FBRUEsZ0JBQUErSyxjQUFBbkgsUUFBQTtBQUNBLGdCQUFBbUgsY0FBQSxHQUFBLEVBQUE7QUFDQVYsMkJBQUE1SCxJQUFBLENBQ0EsSUFBQTBCLFNBQUEsQ0FDQVAsT0FBQSxDQUFBLEVBQUE3RCxLQUFBLENBREEsRUFFQTZELE9BQUEsQ0FBQSxFQUFBNUQsTUFBQSxDQUZBLEVBR0E0RCxPQUFBLENBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxFQUpBLEVBS0EsR0FMQSxDQURBO0FBU0FXLCtCQUFBQyxJQUFBO0FBQ0E7O0FBRUEsaUJBQUEsSUFBQU0sSUFBQSxDQUFBLEVBQUFBLElBQUF1RixXQUFBbkYsTUFBQSxFQUFBSixHQUFBLEVBQUE7QUFDQXVGLDJCQUFBdkYsQ0FBQSxFQUFBRyxJQUFBO0FBQ0FvRiwyQkFBQXZGLENBQUEsRUFBQU0sTUFBQTs7QUFFQSxvQkFBQWlGLFdBQUF2RixDQUFBLEVBQUEwSSxVQUFBLEVBQUEsRUFBQTtBQUNBbkQsK0JBQUEvRSxNQUFBLENBQUFSLENBQUEsRUFBQSxDQUFBO0FBQ0FBLHlCQUFBLENBQUE7QUFDQTtBQUNBOztBQUVBLGdCQUFBLENBQUFtSixlQUFBLEVBQUE7QUFDQUQsdUJBQUF3QixHQUFBLENBQUFqQixLQUFBLENBQUFrQixPQUFBLEdBQUEsT0FBQTtBQUNBekIsdUJBQUF3QixHQUFBLENBQUFlLFNBQUEsR0FBQSxRQUFBO0FBQ0F0QyxrQ0FBQSxJQUFBO0FBQ0E7QUFDQTtBQUNBLEtBMUVBLE1BMEVBLENBRUE7QUFDQTs7QUFFQSxTQUFBMEIsU0FBQSxHQUFBO0FBQ0E1QixpQkFBQSxDQUFBO0FBQ0FILGNBQUEsQ0FBQTtBQUNBQyxxQkFBQUosV0FBQTtBQUNBSyxzQkFBQUwsV0FBQTtBQUNBUSxzQkFBQSxLQUFBOztBQUVBQSxzQkFBQSxLQUFBO0FBQ0FELFdBQUF3QixHQUFBLENBQUFqQixLQUFBLENBQUFrQixPQUFBLEdBQUEsTUFBQTs7QUFFQXBGLGlCQUFBLEVBQUE7O0FBRUFxRCxrQkFBQSxJQUFBOUQsV0FBQSxFQUFBO0FBQ0F1RixXQUFBNEIsVUFBQSxDQUFBLFlBQUE7QUFDQXJELG9CQUFBc0QsV0FBQTtBQUNBLEtBRkEsRUFFQSxJQUZBOztBQUlBLFFBQUFDLGtCQUFBLElBQUFSLElBQUEsRUFBQTtBQUNBOUMsY0FBQSxJQUFBOEMsSUFBQSxDQUFBUSxnQkFBQVAsT0FBQSxLQUFBLElBQUEsRUFBQUEsT0FBQSxFQUFBO0FBQ0E7O0FBRUEsU0FBQVEsVUFBQSxHQUFBO0FBQ0EsUUFBQUMsV0FBQTVELFNBQUEsRUFDQUEsVUFBQTRELE9BQUEsSUFBQSxJQUFBOztBQUVBLFdBQUEsS0FBQTtBQUNBOztBQUVBLFNBQUFDLFdBQUEsR0FBQTtBQUNBLFFBQUFELFdBQUE1RCxTQUFBLEVBQ0FBLFVBQUE0RCxPQUFBLElBQUEsS0FBQTs7QUFFQSxXQUFBLEtBQUE7QUFDQTs7QUFFQSxTQUFBTCxrQkFBQSxHQUFBO0FBQ0EsV0FBQTdOLGVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQUEsV0FBQTtBQUNBOztBQUVBLFNBQUE2TCxRQUFBLEdBQUE7QUFDQVgsZUFBQW9DLFNBQUEsR0FBQSwwREFBQTtBQUNBOztBQUVBLFNBQUExQixXQUFBLEdBQUE7QUFDQXdDLFlBQUFDLEdBQUEsQ0FBQSw0QkFBQTtBQUNBbkQsZUFBQUksS0FBQSxDQUFBa0IsT0FBQSxHQUFBLE1BQUE7QUFDQTs7QUFFQSxTQUFBVixZQUFBLENBQUF3QyxLQUFBLEVBQUE7QUFDQXBELGVBQUFvQyxTQUFBLEdBQUFnQixRQUFBLEdBQUE7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgT2JqZWN0Q29sbGVjdCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCwgd29ybGQsIGluZGV4KSB7XG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcbiAgICAgICAgICAgIGxhYmVsOiAnY29sbGVjdGlibGVGbGFnJyxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXG4gICAgICAgICAgICBpc1NlbnNvcjogdHJ1ZSxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBmbGFnQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogcGxheWVyQ2F0ZWdvcnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XG5cbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMucmFkaXVzID0gMC41ICogc3FydChzcSh3aWR0aCkgKyBzcShoZWlnaHQpKSArIDU7XG5cbiAgICAgICAgdGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib2R5LnBsYXllckNvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XG4gICAgICAgIHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgPSAyMDtcblxuICAgICAgICB0aGlzLnBsYXllck9uZUNvbG9yID0gY29sb3IoMjA4LCAwLCAyNTUpO1xuICAgICAgICB0aGlzLnBsYXllclR3b0NvbG9yID0gY29sb3IoMjU1LCAxNjUsIDApO1xuXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMzAwO1xuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xuICAgICAgICB0aGlzLmNoYW5nZVJhdGUgPSAxO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnBsYXllclR3b0NvbG9yLCB0aGlzLnBsYXllck9uZUNvbG9yLCB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMucGxheWVyT25lQ29sb3IsIHRoaXMucGxheWVyVHdvQ29sb3IsIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgpO1xuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnkgLSB0aGlzLmhlaWdodCAtIDEwLCB0aGlzLndpZHRoICogMiAqIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgsIDMpO1xuICAgICAgICBwdXNoKCk7XG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xuICAgICAgICByb3RhdGUoYW5nbGUpO1xuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICBzdHJva2UoMjU1LCB0aGlzLmFscGhhKTtcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xuICAgICAgICBub0ZpbGwoKTtcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xuICAgICAgICBwb3AoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuYWxwaGEgLT0gdGhpcy5hbHBoYVJlZHVjZUFtb3VudCAqIDYwIC8gZnJhbWVSYXRlKCk7XG4gICAgICAgIGlmICh0aGlzLmFscGhhIDwgMClcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XG5cbiAgICAgICAgaWYgKHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA8IHRoaXMubWF4SGVhbHRoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCArPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmJvZHkub3Bwb25lbnRDb2xsaWRlZCAmJiB0aGlzLmhlYWx0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcbiAgICB9XG59IiwiY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQsIHZlbG9jaXR5ID0gMjApIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIHZlbG9jaXR5KSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuICAgIH1cblxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG5cbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xuXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgfVxuXG4gICAgaXNWaXNpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cblxuY2xhc3MgRXhwbG9zaW9uIHtcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSwgdmVsb2NpdHkgPSAyMCwgbnVtYmVyT2ZQYXJ0aWNsZXMgPSAxMDApIHtcbiAgICAgICAgZXhwbG9zaW9uQXVkaW8ucGxheSgpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XG5cbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xuXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICAgICAgdGhpcy5udW1iZXJPZlBhcnRpY2xlcyA9IG51bWJlck9mUGFydGljbGVzO1xuXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgIH1cblxuICAgIGV4cGxvZGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1iZXJPZlBhcnRpY2xlczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0NvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgQmFzaWNGaXJlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xuICAgICAgICBmaXJlQXVkaW8ucGxheSgpO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMztcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcblxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gbWFwKHRoaXMucmFkaXVzLCA1LCAxMiwgMzQsIDEwMCk7XG5cbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcblxuICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XG4gICAgICAgICAgICBwb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFZlbG9jaXR5KCkge1xuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcbiAgICB9XG5cbiAgICBpc1ZlbG9jaXR5WmVybygpIHtcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xuICAgIH1cblxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcbiAgICAgICAgKTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEJvdW5kYXJ5IHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJywgaW5kZXggPSAtMSkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwge1xuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBib3VuZGFyeVdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXG4gICAgICAgICAgICBmaWxsKDIwOCwgMCwgMjU1KTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAxKVxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgR3JvdW5kIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxuICAgIH0pIHtcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XG5cbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBmaWxsKDAsIDEwMCwgMjU1KTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW1xuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzBdLFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzNdLFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXG4gICAgICAgIF07XG5cblxuICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XG4gICAgICAgIGVuZFNoYXBlKCk7XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XG5cbmNsYXNzIFBsYXllciB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgd29ybGQsIHBsYXllckluZGV4LCBhbmdsZSA9IDAsIGNhdEFuZE1hc2sgPSB7XG4gICAgICAgIGNhdGVnb3J5OiBwbGF5ZXJDYXRlZ29yeSxcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgZmxhZ0NhdGVnb3J5XG4gICAgfSkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCAyMCwge1xuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjMsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmdsZTogYW5nbGVcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcblxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjE7XG5cbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcblxuICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xuXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XG4gICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgPSAxMjtcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcbiAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VMZXZlbCA9IDE7XG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcblxuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gcGxheWVySW5kZXg7XG5cbiAgICAgICAgdGhpcy5kaXNhYmxlQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgIH1cblxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgIGxldCBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5ib2R5LmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XG4gICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgfVxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5yYWRpdXMgLSAxMCwgKHRoaXMuYm9keS5oZWFsdGggKiAxMDApIC8gMTAwLCAyKTtcblxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxNjUsIDApO1xuXG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XG5cbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xuXG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XG5cbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xuICAgICAgICBzdHJva2UoMCk7XG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcblxuICAgICAgICBwb3AoKTtcbiAgICB9XG5cbiAgICBpc091dE9mU2NyZWVuKCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgcG9zLnggPiAxMDAgKyB3aWR0aCB8fCBwb3MueCA8IC0xMDAgfHwgcG9zLnkgPiBoZWlnaHQgKyAxMDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgLy8gMCAtPiBSaWdodFxuICAgICAgICAvLyBQSSAtPiBMZWZ0XG4gICAgICAgIC8vIFBJIC8gMiAtPiBEb3duXG4gICAgICAgIC8vIDMgKiBQSSAvIDIgLT4gVXBcblxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmFuZ2xlO1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcbiAgICAgICAgICAgIGlmIChhbmdsZSA+IFBJKVxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgLT0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgICAgICBlbHNlIGlmIChhbmdsZSA8IFBJKVxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xuICAgICAgICAgICAgaWYgKGFuZ2xlID4gMClcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC09IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xuICAgICAgICAgICAgZWxzZSBpZiAoYW5nbGUgPCAwKVxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xuICAgICAgICAgICAgaWYgKGFuZ2xlID4gMyAqIFBJIC8gMilcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC09IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xuICAgICAgICAgICAgZWxzZSBpZiAoYW5nbGUgPCAzICogUEkgLyAyKVxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSkge1xuICAgICAgICAgICAgaWYgKGFuZ2xlID4gUEkgLyAyKVxuICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgLT0gdGhpcy5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgICAgICBlbHNlIGlmIChhbmdsZSA8IFBJIC8gMilcbiAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbG9jaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5nbGUodGhpcy5ib2R5LCB0aGlzLmFuZ2xlKTtcbiAgICB9XG5cbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXG4gICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIHg6IDAuMDA1LFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s3XV0pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlS2V5c1t0aGlzLmtleXNbN11dID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcbiAgICB9XG5cbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s2XV0pIHtcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuY3VycmVudENoYXJnZVZhbHVlID4gdGhpcy5tYXhDaGFyZ2VWYWx1ZSA/XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLmRyYXdDaGFyZ2VkU2hvdCh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSk7XG5cbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNl1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQsIHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcbiAgICAgICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcblxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ib3VuZGFyeS5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9vYmplY3QtY29sbGVjdC5qc1wiIC8+XG5cbmNsYXNzIEdhbWVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLndvcmxkID0gdGhpcy5lbmdpbmUud29ybGQ7XG4gICAgICAgIHRoaXMuZW5naW5lLndvcmxkLmdyYXZpdHkuc2NhbGUgPSAwO1xuXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmdyb3VuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzID0gW107XG4gICAgICAgIHRoaXMucGxhdGZvcm1zID0gW107XG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncyA9IFtdO1xuXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xuXG4gICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGxheWVyV29uID0gW107XG5cbiAgICAgICAgdGhpcy5jcmVhdGVHcm91bmRzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xuICAgICAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpO1xuICAgICAgICB0aGlzLmNyZWF0ZVBsYXllcnMoKTtcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIGNyZWF0ZUdyb3VuZHMoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAxMi41OyBpIDwgd2lkdGggLSAxMDA7IGkgKz0gMjc1KSB7XG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyAxMjUsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjUwLCByYW5kb21WYWx1ZSwgdGhpcy53b3JsZCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlQm91bmRhcmllcygpIHtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCA1LCB3aWR0aCwgMTAsIHRoaXMud29ybGQpKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XG4gICAgfVxuXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAwKSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTUwLCBoZWlnaHQgLyA2LjQzLCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJywgMSkpO1xuXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxMDAsIGhlaWdodCAvIDIuMTcsIDIwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XG5cbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xuICAgIH1cblxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBQbGF5ZXIoXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHNbMF0uYm9keS5wb3NpdGlvbi54ICsgdGhpcy5ncm91bmRzWzBdLndpZHRoIC8gMiAtIDQwLFxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xuXG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmdyb3VuZHMubGVuZ3RoO1xuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKFxuICAgICAgICAgICAgdGhpcy5ncm91bmRzW2xlbmd0aCAtIDFdLmJvZHkucG9zaXRpb24ueCAtIHRoaXMuZ3JvdW5kc1tsZW5ndGggLSAxXS53aWR0aCAvIDIgKyA0MCxcbiAgICAgICAgICAgIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAwLCBQSSkpO1xuICAgICAgICB0aGlzLnBsYXllcnNbMV0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1sxXSk7XG4gICAgfVxuXG4gICAgY3JlYXRlRmxhZ3MoKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KDUwLCA1MCwgMjAsIDIwLCB0aGlzLndvcmxkLCAwKSk7XG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25FbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRXhpdChldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVuZ2luZShldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQS5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEucGxheWVyQ29sbGlkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25UcmlnZ2VyRXhpdChldmVudCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XG4gICAgICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpIHtcbiAgICAgICAgbGV0IHBvc1ggPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi54ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi54KSAvIDI7XG4gICAgICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xuXG4gICAgICAgIGxldCBkYW1hZ2VBID0gYmFzaWNGaXJlQS5kYW1hZ2VBbW91bnQ7XG4gICAgICAgIGxldCBkYW1hZ2VCID0gYmFzaWNGaXJlQi5kYW1hZ2VBbW91bnQ7XG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2VBID0gbWFwKGRhbWFnZUEsIDIuNSwgNiwgMzQsIDEwMCk7XG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2VCID0gbWFwKGRhbWFnZUIsIDIuNSwgNiwgMzQsIDEwMCk7XG5cbiAgICAgICAgYmFzaWNGaXJlQS5oZWFsdGggLT0gbWFwcGVkRGFtYWdlQjtcbiAgICAgICAgYmFzaWNGaXJlQi5oZWFsdGggLT0gbWFwcGVkRGFtYWdlQTtcblxuICAgICAgICBpZiAoYmFzaWNGaXJlQS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb24gPSAxO1xuICAgICAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbkFpciA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJhc2ljRmlyZUIuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZGFtYWdlZCA9IHRydWU7XG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uID0gMTtcbiAgICAgICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb25BaXIgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3NYLCBwb3NZKSk7XG4gICAgfVxuXG4gICAgZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2UgPSBtYXAoYmFzaWNGaXJlLmRhbWFnZUFtb3VudCwgMi41LCA2LCA1LCAzNCk7XG4gICAgICAgIHBsYXllci5oZWFsdGggLT0gbWFwcGVkRGFtYWdlO1xuXG4gICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcbiAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGJ1bGxldFBvcyA9IGNyZWF0ZVZlY3RvcihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpO1xuICAgICAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XG5cbiAgICAgICAgbGV0IGRpcmVjdGlvblZlY3RvciA9IHA1LlZlY3Rvci5zdWIocGxheWVyUG9zLCBidWxsZXRQb3MpO1xuICAgICAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0TWFnKHRoaXMubWluRm9yY2VNYWduaXR1ZGUgKiBwbGF5ZXIuZGFtYWdlTGV2ZWwgKiAwLjA1KTtcblxuICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHBsYXllciwgcGxheWVyLnBvc2l0aW9uLCB7XG4gICAgICAgICAgICB4OiBkaXJlY3Rpb25WZWN0b3IueCxcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XG4gICAgfVxuXG4gICAgdXBkYXRlRW5naW5lKCkge1xuICAgICAgICBsZXQgYm9kaWVzID0gTWF0dGVyLkNvbXBvc2l0ZS5hbGxCb2RpZXModGhpcy5lbmdpbmUud29ybGQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnIHx8XG4gICAgICAgICAgICAgICAgYm9keS5sYWJlbCA9PT0gJ2NvbGxlY3RpYmxlRmxhZycpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGJvZHkuZm9yY2UueSArPSBib2R5Lm1hc3MgKiAwLjAwMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lKTtcblxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgfSlcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlibGVGbGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnNob3coKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkuaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24ucHVzaCgxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbi5wdXNoKHRoaXMucGxheWVyc1tpXS5ib2R5LmluZGV4KTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tqXS5kaXNhYmxlQ29udHJvbHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmV4cGxvc2lvbnNbaV0uaXNDb21wbGV0ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG5cbmNvbnN0IHBsYXllcktleXMgPSBbXG4gICAgLy8gTGVmdCwgUmlnaHQsIE1vdmUgU2hvb3RlciBMZWZ0LCBNb3ZlIFNob290ZXIgUmlnaHQsIE1vdmUgU2hvb3RlciBVcCwgTW92ZSBTaG9vdGVyIERvd24sIFNob290LCBKdW1wXG4gICAgWzY1LCA2OCwgNzEsIDc0LCA4OSwgNzIsIDgzLCA4N10sXG4gICAgWzM3LCAzOSwgMTAwLCAxMDIsIDEwNCwgMTAxLCA0MCwgMzhdXG5dO1xuXG5jb25zdCBrZXlTdGF0ZXMgPSB7XG4gICAgMTAyOiBmYWxzZSwgLy8gTlVNUEFEIDYgLSBNb3ZlIFNob290ZXIgTGVmdFxuICAgIDEwMDogZmFsc2UsIC8vIE5VTVBBRCA0IC0gTW92ZSBTaG9vdGVyIFJpZ2h0XG4gICAgMTA0OiBmYWxzZSwgLy8gTlVNUEFEIDggLSBNb3ZlIFNob290ZXIgVXBcbiAgICAxMDE6IGZhbHNlLCAvL05VTVBBRCAyIC0gTW92ZSBTaG9vdGVyIERvd25cbiAgICAzNzogZmFsc2UsIC8vIExFRlQgLSBNb3ZlIExlZnRcbiAgICAzODogZmFsc2UsIC8vIFVQIC0gSnVtcFxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFQgLSBNb3ZlIFJpZ2h0XG4gICAgNDA6IGZhbHNlLCAvLyBET1dOIC0gQ2hhcmdlIEFuZCBTaG9vdFxuICAgIDg3OiBmYWxzZSwgLy8gVyAtIEp1bXBcbiAgICA2NTogZmFsc2UsIC8vIEEgLSBNb3ZlIExlZnRcbiAgICA4MzogZmFsc2UsIC8vIFMgLSBDaGFyZ2UgQW5kIFNob290XG4gICAgNjg6IGZhbHNlLCAvLyBEIC0gTW92ZSBSaWdodFxuICAgIDcxOiBmYWxzZSwgLy8gRyAtIE1vdmUgU2hvb3RlciBMZWZ0XG4gICAgNzQ6IGZhbHNlLCAvLyBKIC0gTW92ZSBTaG9vdGVyIFJpZ2h0XG4gICAgODk6IGZhbHNlLCAvLyBZIC0gTW92ZSBTaG9vdGVyIFVwXG4gICAgNzI6IGZhbHNlIC8vIEggLSBNb3ZlIFNob290ZXIgRG93blxufTtcblxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XG5jb25zdCBwbGF5ZXJDYXRlZ29yeSA9IDB4MDAwMjtcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XG5jb25zdCBmbGFnQ2F0ZWdvcnkgPSAweDAwMTY7XG5jb25zdCBkaXNwbGF5VGltZSA9IDEyMDtcblxubGV0IGdhbWVNYW5hZ2VyID0gbnVsbDtcbmxldCBlbmRUaW1lO1xubGV0IHNlY29uZHMgPSA2O1xubGV0IGRpc3BsYXlUZXh0Rm9yID0gZGlzcGxheVRpbWU7XG5sZXQgZGlzcGxheVN0YXJ0Rm9yID0gZGlzcGxheVRpbWU7XG5cbmxldCBzY2VuZUNvdW50ID0gMDtcbmxldCBleHBsb3Npb25zID0gW107XG5cbmxldCBidXR0b247XG5sZXQgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG5cbmxldCBiYWNrZ3JvdW5kQXVkaW87XG5sZXQgZmlyZUF1ZGlvO1xubGV0IGV4cGxvc2lvbkF1ZGlvO1xuXG5sZXQgZGl2RWxlbWVudDtcblxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcbiAgICBkaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9ICcxMDBweCc7XG4gICAgZGl2RWxlbWVudC5pZCA9ICdsb2FkaW5nRGl2JztcbiAgICBkaXZFbGVtZW50LmNsYXNzTmFtZSA9ICdqdXN0aWZ5LWhvcml6b250YWwnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2RWxlbWVudCk7XG5cbiAgICAvLyBiYWNrZ3JvdW5kQXVkaW8gPSBsb2FkU291bmQoJ2h0dHBzOi8vZnJlZXNvdW5kLm9yZy9kYXRhL3ByZXZpZXdzLzE1NS8xNTUxMzlfMjA5ODg4NC1scS5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQsIHdoaWxlTG9hZGluZyk7XG4gICAgLy8gZmlyZUF1ZGlvID0gbG9hZFNvdW5kKCdodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8yNzAvMjcwMzM1XzUxMjM4NTEtbHEubXAzJywgc3VjY2Vzc0xvYWQsIGZhaWxMb2FkKTtcbiAgICAvLyBleHBsb3Npb25BdWRpbyA9IGxvYWRTb3VuZCgnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzg2LzM4Njg2Ml82ODkxMTAyLWxxLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XG5cbiAgICBiYWNrZ3JvdW5kQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vQmFja2dyb3VuZC5tcDMnLCBzdWNjZXNzTG9hZCwgZmFpbExvYWQsIHdoaWxlTG9hZGluZyk7XG4gICAgZmlyZUF1ZGlvID0gbG9hZFNvdW5kKCcvYXNzZXRzL2F1ZGlvL1Nob290Lm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XG4gICAgZXhwbG9zaW9uQXVkaW8gPSBsb2FkU291bmQoJy9hc3NldHMvYXVkaW8vRXhwbG9zaW9uLm1wMycsIHN1Y2Nlc3NMb2FkLCBmYWlsTG9hZCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcblxuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUGxheScpO1xuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMS42KTtcbiAgICBidXR0b24uZWx0LmNsYXNzTmFtZSA9ICdidXR0b24gcHVsc2UnO1xuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBidXR0b24ubW91c2VQcmVzc2VkKHJlc2V0R2FtZSk7XG5cbiAgICBiYWNrZ3JvdW5kQXVkaW8uc2V0Vm9sdW1lKDAuMSk7XG4gICAgYmFja2dyb3VuZEF1ZGlvLnBsYXkoKTtcbiAgICBiYWNrZ3JvdW5kQXVkaW8ubG9vcCgpO1xuXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG4gICAgaWYgKHNjZW5lQ291bnQgPT09IDApIHtcbiAgICAgICAgdGV4dFN0eWxlKEJPTEQpO1xuICAgICAgICB0ZXh0U2l6ZSg1MCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoY29sb3IoYGhzbCgke2ludChyYW5kb20oMzU5KSl9LCAxMDAlLCA1MCUpYCkpO1xuICAgICAgICB0ZXh0KCdCQUxMIEJMQVNURVJTJywgd2lkdGggLyAyICsgMTAsIDUwKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICB0ZXh0U2l6ZSgzMCk7XG4gICAgICAgIHRleHQoJ0FSUk9XIEtFWVMgdG8gbW92ZSwgU1BBQ0UgdG8ganVtcCBhbmQgQ1RSTCB0byBmaXJlIGZvciBQbGF5ZXIgMScsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gNCk7XG4gICAgICAgIHRleHQoJ1dBU0QgdG8gbW92ZSwgWSB0byBqdW1wIGFuZCBUIHRvIGZpcmUgZm9yIFBsYXllciAyJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyLjc1KTtcbiAgICAgICAgZmlsbChjb2xvcihgaHNsKCR7aW50KHJhbmRvbSgzNTkpKX0sIDEwMCUsIDUwJSlgKSk7XG4gICAgICAgIHRleHQoJ0Rlc3Ryb3kgeW91ciBvcHBvbmVudCBvciBjYXB0dXJlIHRoZWlyIGNyeXN0YWwgdG8gd2luJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdQbGF5IEdhbWUnO1xuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc2NlbmVDb3VudCA9PT0gMSkge1xuICAgICAgICBnYW1lTWFuYWdlci5kcmF3KCk7XG5cbiAgICAgICAgaWYgKHNlY29uZHMgPiAwKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGxldCBkaWZmID0gZW5kVGltZSAtIGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoKGRpZmYgJSAoMTAwMCAqIDYwKSkgLyAxMDAwKTtcblxuICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgdGV4dFNpemUoMzApO1xuICAgICAgICAgICAgdGV4dChgQ3J5c3RhbHMgYXBwZWFyIGluOiAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGlzcGxheVRleHRGb3IgPiAwKSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XG4gICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgICAgIHRleHRTaXplKDMwKTtcbiAgICAgICAgICAgICAgICB0ZXh0KGBDYXB0dXJlIHRoZSBvcHBvbmVudCdzIGJhc2VgLCB3aWR0aCAvIDIsIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaXNwbGF5U3RhcnRGb3IgPiAwKSB7XG4gICAgICAgICAgICBkaXNwbGF5U3RhcnRGb3IgLT0gMSAqIDYwIC8gZm9ybWF0dGVkRnJhbWVSYXRlKCk7XG4gICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xuICAgICAgICAgICAgdGV4dChgRklHSFRgLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLmdhbWVFbmRlZCkge1xuICAgICAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZU1hbmFnZXIucGxheWVyV29uWzBdID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dFNpemUoMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dChgUGxheWVyIDEgV29uYCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyIC0gMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvblswXSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIHRleHQoYFBsYXllciAyIFdvbmAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiAtIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24ubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XG4gICAgICAgICAgICAgICAgdGV4dChgRHJhd2AsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiAtIDEwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC4xKSB7XG4gICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBuZXcgRXhwbG9zaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgwLCBoZWlnaHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDkwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMjAwXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvbkF1ZGlvLnBsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBsb3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uc1tpXS5zaG93KCk7XG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChleHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBleHBsb3Npb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuaW5uZXJUZXh0ID0gJ1JlcGxheSc7XG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0R2FtZSgpIHtcbiAgICBzY2VuZUNvdW50ID0gMTtcbiAgICBzZWNvbmRzID0gNjtcbiAgICBkaXNwbGF5VGV4dEZvciA9IGRpc3BsYXlUaW1lO1xuICAgIGRpc3BsYXlTdGFydEZvciA9IGRpc3BsYXlUaW1lO1xuICAgIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgZXhwbG9zaW9ucyA9IFtdO1xuXG4gICAgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGdhbWVNYW5hZ2VyLmNyZWF0ZUZsYWdzKCk7XG4gICAgfSwgNTAwMCk7XG5cbiAgICBsZXQgY3VycmVudERhdGVUaW1lID0gbmV3IERhdGUoKTtcbiAgICBlbmRUaW1lID0gbmV3IERhdGUoY3VycmVudERhdGVUaW1lLmdldFRpbWUoKSArIDYwMDApLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdHRlZEZyYW1lUmF0ZSgpIHtcbiAgICByZXR1cm4gZnJhbWVSYXRlKCkgPD0gMCA/IDYwIDogZnJhbWVSYXRlKCk7XG59XG5cbmZ1bmN0aW9uIGZhaWxMb2FkKCkge1xuICAgIGRpdkVsZW1lbnQuaW5uZXJUZXh0ID0gJ1VuYWJsZSB0byBsb2FkIHRoZSBzb3VuZC4gUGxlYXNlIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlJztcbn1cblxuZnVuY3Rpb24gc3VjY2Vzc0xvYWQoKSB7XG4gICAgY29uc29sZS5sb2coJ0FsbCBTb3VuZHMgTG9hZGVkIFByb3Blcmx5Jyk7XG4gICAgZGl2RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufVxuXG5mdW5jdGlvbiB3aGlsZUxvYWRpbmcodmFsdWUpIHtcbiAgICBkaXZFbGVtZW50LmlubmVyVGV4dCA9IGAke3ZhbHVlICogMTAwfSAlYDtcbn0iXX0=
