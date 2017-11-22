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
        var number = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 100;

        _classCallCheck(this, Explosion);

        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        var randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.velocity = velocity;
        this.number = number;

        this.explode();
    }

    _createClass(Explosion, [{
        key: 'explode',
        value: function explode() {
            for (var i = 0; i < this.number; i++) {
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
                    this.explosions.push(new Explosion(_pos.x, _pos.y, 10));

                    this.players[_i].removeFromWorld();
                    this.players.splice(_i, 1);
                    _i -= 1;
                }

                if (this.players[_i].isOutOfScreen()) {
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

var playerKeys = [[65, 68, 87, 83, 88, 90], [37, 39, 38, 40, 13, 32]];

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
var flagCategory = 0x0016;

var gameManager = void 0;
var endTime = void 0;
var seconds = 6;
var displayTextFor = 120;

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
        text('' + seconds, width / 2, 50);
    } else {
        if (displayTextFor > 0) {
            displayTextFor -= 1 * 60 / frameRate();
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
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;

    return false;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;

    return false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC1jb2xsZWN0LmpzIiwicGFydGljbGUuanMiLCJleHBsb3Npb24uanMiLCJiYXNpYy1maXJlLmpzIiwiYm91bmRhcnkuanMiLCJncm91bmQuanMiLCJwbGF5ZXIuanMiLCJnYW1lLW1hbmFnZXIuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInJlY3QiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXIiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwiZm9yRWFjaCIsInNob3ciLCJsZW5ndGgiLCJhcHBseUZvcmNlIiwidXBkYXRlIiwiaXNWaXNpYmxlIiwic3BsaWNlIiwiQmFzaWNGaXJlIiwiY2F0QW5kTWFzayIsImNpcmNsZSIsInJlc3RpdHV0aW9uIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWQiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImNvcyIsInNpbiIsIkJvdW5kYXJ5IiwiYm91bmRhcnlXaWR0aCIsImJvdW5kYXJ5SGVpZ2h0IiwiaXNTdGF0aWMiLCJncm91bmRDYXRlZ29yeSIsImJhc2ljRmlyZUNhdGVnb3J5IiwiYnVsbGV0Q29sbGlzaW9uTGF5ZXIiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsIm1vZGlmaWVkWSIsIm1vZGlmaWVkSGVpZ2h0IiwibW9kaWZpZWRXaWR0aCIsImZha2VCb3R0b21QYXJ0IiwiYm9keVZlcnRpY2VzIiwidmVydGljZXMiLCJmYWtlQm90dG9tVmVydGljZXMiLCJiZWdpblNoYXBlIiwidmVydGV4IiwiZW5kU2hhcGUiLCJQbGF5ZXIiLCJwbGF5ZXJJbmRleCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsImRhbWFnZUxldmVsIiwiZnVsbEhlYWx0aENvbG9yIiwiaGFsZkhlYWx0aENvbG9yIiwiemVyb0hlYWx0aENvbG9yIiwia2V5cyIsImRpc2FibGVDb250cm9scyIsIm1hcHBlZEhlYWx0aCIsImxpbmUiLCJhY3RpdmVLZXlzIiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5IiwiYWJzIiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJnYW1lRW5kZWQiLCJwbGF5ZXJXb24iLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJwbGF5ZXJLZXlzIiwiRXZlbnRzIiwib24iLCJldmVudCIsIm9uVHJpZ2dlckVudGVyIiwib25UcmlnZ2VyRXhpdCIsInVwZGF0ZUVuZ2luZSIsInBhaXJzIiwibGFiZWxBIiwiYm9keUEiLCJsYWJlbEIiLCJib2R5QiIsIm1hdGNoIiwiYmFzaWNGaXJlIiwicGxheWVyIiwiZGFtYWdlUGxheWVyQmFzaWMiLCJiYXNpY0ZpcmVBIiwiYmFzaWNGaXJlQiIsImV4cGxvc2lvbkNvbGxpZGUiLCJwb3NYIiwicG9zWSIsIm1hcHBlZERhbWFnZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImJvZGllcyIsIkNvbXBvc2l0ZSIsImFsbEJvZGllcyIsImlzU2xlZXBpbmciLCJtYXNzIiwiZWxlbWVudCIsImoiLCJpc0NvbXBsZXRlIiwiZ2FtZU1hbmFnZXIiLCJlbmRUaW1lIiwic2Vjb25kcyIsImRpc3BsYXlUZXh0Rm9yIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJzZXRUaW1lb3V0IiwiY3JlYXRlRmxhZ3MiLCJjdXJyZW50RGF0ZVRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJjdXJyZW50VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJ0ZXh0U2l6ZSIsInRleHQiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFQUEsYTtBQUNBLDJCQUFBQyxDQUFBLEVBQUFDLENBQUEsRUFBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUFDLEtBQUEsRUFBQUMsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQUMsSUFBQSxHQUFBQyxPQUFBQyxNQUFBLENBQUFDLFNBQUEsQ0FBQVQsQ0FBQSxFQUFBQyxDQUFBLEVBQUFDLEtBQUEsRUFBQUMsTUFBQSxFQUFBO0FBQ0FPLG1CQUFBLGlCQURBO0FBRUFDLHNCQUFBLENBRkE7QUFHQUMseUJBQUEsQ0FIQTtBQUlBQyxzQkFBQSxJQUpBO0FBS0FDLDZCQUFBO0FBQ0FDLDBCQUFBQyxZQURBO0FBRUFDLHNCQUFBQztBQUZBO0FBTEEsU0FBQSxDQUFBO0FBVUFYLGVBQUFZLEtBQUEsQ0FBQUMsR0FBQSxDQUFBaEIsS0FBQSxFQUFBLEtBQUFFLElBQUE7QUFDQUMsZUFBQWMsSUFBQSxDQUFBQyxrQkFBQSxDQUFBLEtBQUFoQixJQUFBLEVBQUEsR0FBQTs7QUFFQSxhQUFBRixLQUFBLEdBQUFBLEtBQUE7O0FBRUEsYUFBQUYsS0FBQSxHQUFBQSxLQUFBO0FBQ0EsYUFBQUMsTUFB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SyxXQUFBO0FBQ0FYLGlCQUFBLEdBQUE7QUFDQW1NLHFCQUFBLEVBQUE7QUFDQUMsaURBQUEzTyxRQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0E7QUFDQTs7QUFFQSxRQUFBaU4sWUFBQTVDLFNBQUEsRUFBQTtBQUNBLFlBQUE0QyxZQUFBM0MsU0FBQSxLQUFBLENBQUEsRUFBQTtBQUNBL0gsaUJBQUEsR0FBQTtBQUNBbU0scUJBQUEsR0FBQTtBQUNBQyxpQ0FBQTNPLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUE7QUFDQSxTQUpBLE1BSUEsSUFBQWdOLFlBQUEzQyxTQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EvSCxpQkFBQSxHQUFBO0FBQ0FtTSxxQkFBQSxHQUFBO0FBQ0FDLGlDQUFBM08sUUFBQSxDQUFBLEVBQUFDLFNBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFBMk8sVUFBQSxHQUFBO0FBQ0EsUUFBQUMsV0FBQWxHLFNBQUEsRUFDQUEsVUFBQWtHLE9BQUEsSUFBQSxJQUFBOztBQUVBLFdBQUEsS0FBQTtBQUNBOztBQUVBLFNBQUFDLFdBQUEsR0FBQTtBQUNBLFFBQUFELFdBQUFsRyxTQUFBLEVBQ0FBLFVBQUFrRyxPQUFBLElBQUEsS0FBQTs7QUFFQSxXQUFBLEtBQUE7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIE9iamVjdENvbGxlY3Qge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCwgd29ybGQsIGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2NvbGxlY3RpYmxlRmxhZycsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgaXNTZW5zb3I6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGZsYWdDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IHBsYXllckNhdGVnb3J5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMC41ICogc3FydChzcSh3aWR0aCkgKyBzcShoZWlnaHQpKSArIDU7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcbiAgICAgICAgdGhpcy5hbHBoYVJlZHVjZUFtb3VudCA9IDIwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllck9uZUNvbG9yID0gY29sb3IoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHdvQ29sb3IgPSBjb2xvcigyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMzAwO1xyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VSYXRlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5wbGF5ZXJPbmVDb2xvciwgdGhpcy5wbGF5ZXJUd29Db2xvciwgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCk7XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5oZWlnaHQgLSAxMCwgdGhpcy53aWR0aCAqIDIgKiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoLCAzKTtcclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xyXG4gICAgICAgIG5vRmlsbCgpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSB0aGlzLmFscGhhUmVkdWNlQW1vdW50ICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXHJcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aCArPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0LCB2ZWxvY2l0eSA9IDIwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCB2ZWxvY2l0eSkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMTtcclxuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGb3JjZShmb3JjZSkge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcclxuICAgICAgICBsZXQgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xyXG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWaXNpYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cclxuXHJcbmNsYXNzIEV4cGxvc2lvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSwgdmVsb2NpdHkgPSAyMCwgbnVtYmVyID0gMTAwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XHJcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcblxyXG4gICAgICAgIGxldCByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlcjtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQsIHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNDb21wbGV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgICAgIHBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCb3VuZGFyeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJywgaW5kZXggPSAtMSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJvdW5kYXJ5V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcclxuICAgICAgICB0aGlzLmJvZHkuaW5kZXggPSBpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMSlcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBjYXRBbmRNYXNrID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgfSkge1xyXG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCBtb2RpZmllZFksIGdyb3VuZFdpZHRoLCAyMCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgbW9kaWZpZWRIZWlnaHQgPSBncm91bmRIZWlnaHQgLSAyMDtcclxuICAgICAgICBsZXQgbW9kaWZpZWRXaWR0aCA9IDUwO1xyXG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnYm91bmRhcnlDb250cm9sTGluZXMnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFdpZHRoID0gbW9kaWZpZWRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCBmYWtlQm90dG9tVmVydGljZXMgPSB0aGlzLmZha2VCb3R0b21QYXJ0LnZlcnRpY2VzO1xyXG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzBdLCBcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMl0sXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1sxXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1szXSwgXHJcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1swXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXHJcbiAgICAgICAgXTtcclxuXHJcblxyXG4gICAgICAgIGJlZ2luU2hhcGUoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XHJcbiAgICAgICAgZW5kU2hhcGUoKTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgZmxhZ0NhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IHBsYXllckluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmRpc2FibGVDb250cm9scyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsICh0aGlzLmJvZHkuaGVhbHRoICogMTAwKSAvIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ib3VuZGFyeS5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL29iamVjdC1jb2xsZWN0LmpzXCIgLz5cclxuXHJcbmNsYXNzIEdhbWVNYW5hZ2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgICAgICB0aGlzLndvcmxkID0gdGhpcy5lbmdpbmUud29ybGQ7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUud29ybGQuZ3Jhdml0eS5zY2FsZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLm1pbkZvcmNlTWFnbml0dWRlID0gMC4wNTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lRW5kZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBsYXllcldvbiA9IC0xO1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUdyb3VuZHMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUJvdW5kYXJpZXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5jcmVhdGVGbGFncygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUdyb3VuZHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEyLjU7IGkgPCB3aWR0aCAtIDEwMDsgaSArPSAyNzUpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKGhlaWdodCAvIDYuMzQsIGhlaWdodCAvIDMuMTcpO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyAxMjUsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjUwLCByYW5kb21WYWx1ZSwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVCb3VuZGFyaWVzKCkge1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSg1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAtIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXRmb3JtcygpIHtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxNTAsIGhlaWdodCAvIDYuNDMsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnLCAxKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcih0aGlzLmdyb3VuZHNbMF0uYm9keS5wb3NpdGlvbi54LCBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzBdKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcih0aGlzLmdyb3VuZHNbdGhpcy5ncm91bmRzLmxlbmd0aCAtIDFdLmJvZHkucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEsIDE3OSkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVGbGFncygpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCg1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5wbGF5ZXJDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQiA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEEgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQikge1xyXG4gICAgICAgIGxldCBwb3NYID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueCArIGJhc2ljRmlyZUIucG9zaXRpb24ueCkgLyAyO1xyXG4gICAgICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmVBLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJhc2ljRmlyZUIuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uID0gMTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmZyaWN0aW9uQWlyID0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3NYLCBwb3NZKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcclxuICAgICAgICBwbGF5ZXIuZGFtYWdlTGV2ZWwgKz0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudDtcclxuICAgICAgICBsZXQgbWFwcGVkRGFtYWdlID0gbWFwKGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQsIDIuNSwgNiwgNSwgMzQpO1xyXG4gICAgICAgIHBsYXllci5oZWFsdGggLT0gbWFwcGVkRGFtYWdlO1xyXG5cclxuICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBidWxsZXRQb3MgPSBjcmVhdGVWZWN0b3IoYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KTtcclxuICAgICAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIGxldCBkaXJlY3Rpb25WZWN0b3IgPSBwNS5WZWN0b3Iuc3ViKHBsYXllclBvcywgYnVsbGV0UG9zKTtcclxuICAgICAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0TWFnKHRoaXMubWluRm9yY2VNYWduaXR1ZGUgKiBwbGF5ZXIuZGFtYWdlTGV2ZWwgKiAwLjA1KTtcclxuXHJcbiAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZShwbGF5ZXIsIHBsYXllci5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICB4OiBkaXJlY3Rpb25WZWN0b3IueCxcclxuICAgICAgICAgICAgeTogZGlyZWN0aW9uVmVjdG9yLnlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVFbmdpbmUoKSB7XHJcbiAgICAgICAgbGV0IGJvZGllcyA9IE1hdHRlci5Db21wb3NpdGUuYWxsQm9kaWVzKHRoaXMuZW5naW5lLndvcmxkKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBib2RpZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYm9keS5pc1N0YXRpYyB8fCBib2R5LmlzU2xlZXBpbmcgfHwgYm9keS5sYWJlbCA9PT0gJ2Jhc2ljRmlyZScgfHxcclxuICAgICAgICAgICAgICAgIGJvZHkubGFiZWwgPT09ICdjb2xsZWN0aWJsZUZsYWcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBib2R5LmZvcmNlLnkgKz0gYm9keS5tYXNzICogMC4wMDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgTWF0dGVyLkVuZ2luZS51cGRhdGUodGhpcy5lbmdpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkuaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyV29uID0gMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTAsIDkwLCAyMDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2pdLmRpc2FibGVDb250cm9scyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS51cGRhdGUoa2V5U3RhdGVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uYm9keS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMucGxheWVyc1tpXS5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5leHBsb3Npb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV4cGxvc2lvbnNbaV0uaXNDb21wbGV0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xyXG4gICAgWzY1LCA2OCwgODcsIDgzLCA4OCwgOTBdLFxyXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxMywgMzJdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICA5MDogZmFsc2UsIC8vIFpcclxuICAgIDg4OiBmYWxzZSAvLyBYXHJcbn07XHJcblxyXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcclxuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XHJcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xyXG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcclxuY29uc3QgZmxhZ0NhdGVnb3J5ID0gMHgwMDE2O1xyXG5cclxubGV0IGdhbWVNYW5hZ2VyO1xyXG5sZXQgZW5kVGltZTtcclxubGV0IHNlY29uZHMgPSA2O1xyXG5sZXQgZGlzcGxheVRleHRGb3IgPSAxMjA7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLmRyYXcoKTtcclxuXHJcbiAgICBpZiAoc2Vjb25kcyA+IDApIHtcclxuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBsZXQgZGlmZiA9IGVuZFRpbWUgLSBjdXJyZW50VGltZTtcclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigoZGlmZiAlICgxMDAwICogNjApKSAvIDEwMDApO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgIHRleHQoYCR7c2Vjb25kc31gLCB3aWR0aCAvIDIsIDUwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xyXG4gICAgICAgICAgICBkaXNwbGF5VGV4dEZvciAtPSAxICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgIHRleHQoYENhcHR1cmUgdGhlIG9wcG9uZW50J3MgYmFzZWAsIHdpZHRoIC8gMiwgNTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZ2FtZU1hbmFnZXIuZ2FtZUVuZGVkKSB7XHJcbiAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgIHRleHQoYFBsYXllciAxIFdvbmAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24gPT09IDEpIHtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59Il19
