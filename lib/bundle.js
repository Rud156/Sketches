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
            var mappedDamage = map(basicFire.damageAmount, 5, 12, 5, 34);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiaXNTZW5zb3IiLCJjb2xsaXNpb25GaWx0ZXIiLCJjYXRlZ29yeSIsImZsYWdDYXRlZ29yeSIsIm1hc2siLCJwbGF5ZXJDYXRlZ29yeSIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9wcG9uZW50Q29sbGlkZWQiLCJwbGF5ZXJDb2xsaWRlZCIsImFscGhhIiwiYWxwaGFSZWR1Y2VBbW91bnQiLCJwbGF5ZXJPbmVDb2xvciIsImNvbG9yIiwicGxheWVyVHdvQ29sb3IiLCJtYXhIZWFsdGgiLCJoZWFsdGgiLCJjaGFuZ2VSYXRlIiwicG9zIiwicG9zaXRpb24iLCJhbmdsZSIsImN1cnJlbnRDb2xvciIsImxlcnBDb2xvciIsImZpbGwiLCJub1N0cm9rZSIsInB1c2giLCJ0cmFuc2xhdGUiLCJyb3RhdGUiLCJyZWN0Iiwic3Ryb2tlIiwic3Ryb2tlV2VpZ2h0Iiwibm9GaWxsIiwiZWxsaXBzZSIsInBvcCIsImZyYW1lUmF0ZSIsInJlbW92ZSIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJ2ZWxvY2l0eSIsImNyZWF0ZVZlY3RvciIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiZm9yY2UiLCJjb2xvclZhbHVlIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJudW1iZXIiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwiZm9yRWFjaCIsInNob3ciLCJsZW5ndGgiLCJhcHBseUZvcmNlIiwidXBkYXRlIiwiaXNWaXNpYmxlIiwic3BsaWNlIiwiQmFzaWNGaXJlIiwiY2F0QW5kTWFzayIsImNpcmNsZSIsInJlc3RpdHV0aW9uIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWQiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImNvcyIsInNpbiIsIkJvdW5kYXJ5IiwiYm91bmRhcnlXaWR0aCIsImJvdW5kYXJ5SGVpZ2h0IiwiaXNTdGF0aWMiLCJncm91bmRDYXRlZ29yeSIsImJhc2ljRmlyZUNhdGVnb3J5IiwiYnVsbGV0Q29sbGlzaW9uTGF5ZXIiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsIm1vZGlmaWVkWSIsIm1vZGlmaWVkSGVpZ2h0IiwibW9kaWZpZWRXaWR0aCIsImZha2VCb3R0b21QYXJ0IiwiYm9keVZlcnRpY2VzIiwidmVydGljZXMiLCJmYWtlQm90dG9tVmVydGljZXMiLCJiZWdpblNoYXBlIiwidmVydGV4IiwiZW5kU2hhcGUiLCJQbGF5ZXIiLCJwbGF5ZXJJbmRleCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsImRhbWFnZUxldmVsIiwiZnVsbEhlYWx0aENvbG9yIiwiaGFsZkhlYWx0aENvbG9yIiwiemVyb0hlYWx0aENvbG9yIiwia2V5cyIsImRpc2FibGVDb250cm9scyIsIm1hcHBlZEhlYWx0aCIsImxpbmUiLCJhY3RpdmVLZXlzIiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5IiwiYWJzIiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJnYW1lRW5kZWQiLCJwbGF5ZXJXb24iLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJwbGF5ZXJLZXlzIiwiRXZlbnRzIiwib24iLCJldmVudCIsIm9uVHJpZ2dlckVudGVyIiwib25UcmlnZ2VyRXhpdCIsInVwZGF0ZUVuZ2luZSIsInBhaXJzIiwibGFiZWxBIiwiYm9keUEiLCJsYWJlbEIiLCJib2R5QiIsIm1hdGNoIiwiYmFzaWNGaXJlIiwicGxheWVyIiwiZGFtYWdlUGxheWVyQmFzaWMiLCJiYXNpY0ZpcmVBIiwiYmFzaWNGaXJlQiIsImV4cGxvc2lvbkNvbGxpZGUiLCJwb3NYIiwicG9zWSIsIm1hcHBlZERhbWFnZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImJvZGllcyIsIkNvbXBvc2l0ZSIsImFsbEJvZGllcyIsImlzU2xlZXBpbmciLCJtYXNzIiwiZWxlbWVudCIsImoiLCJpc0NvbXBsZXRlIiwiZ2FtZU1hbmFnZXIiLCJlbmRUaW1lIiwic2Vjb25kcyIsImRpc3BsYXlUZXh0Rm9yIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJzZXRUaW1lb3V0IiwiY3JlYXRlRmxhZ3MiLCJjdXJyZW50RGF0ZVRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwidGV4dEFsaWduIiwiZHJhdyIsImJhY2tncm91bmQiLCJjdXJyZW50VGltZSIsImRpZmYiLCJNYXRoIiwiZmxvb3IiLCJ0ZXh0U2l6ZSIsInRleHQiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFTUEsYTtBQUNGLDJCQUFZQyxDQUFaLEVBQWVDLENBQWYsRUFBa0JDLEtBQWxCLEVBQXlCQyxNQUF6QixFQUFpQ0MsS0FBakMsRUFBd0NDLEtBQXhDLEVBQStDO0FBQUE7O0FBQzNDLGFBQUtDLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjQyxTQUFkLENBQXdCVCxDQUF4QixFQUEyQkMsQ0FBM0IsRUFBOEJDLEtBQTlCLEVBQXFDQyxNQUFyQyxFQUE2QztBQUNyRE8sbUJBQU8saUJBRDhDO0FBRXJEQyxzQkFBVSxDQUYyQztBQUdyREMseUJBQWEsQ0FId0M7QUFJckRDLHNCQUFVLElBSjJDO0FBS3JEQyw2QkFBaUI7QUFDYkMsMEJBQVVDLFlBREc7QUFFYkMsc0JBQU1DO0FBRk87QUFMb0MsU0FBN0MsQ0FBWjtBQVVBWCxlQUFPWSxLQUFQLENBQWFDLEdBQWIsQ0FBaUJoQixLQUFqQixFQUF3QixLQUFLRSxJQUE3QjtBQUNBQyxlQUFPYyxJQUFQLENBQVlDLGtCQUFaLENBQStCLEtBQUtoQixJQUFwQyxFQUEwQyxHQUExQzs7QUFFQSxhQUFLRixLQUFMLEdBQWFBLEtBQWI7O0FBRUEsYUFBS0YsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsYUFBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsYUFBS29CLE1BQUwsR0FBYyxNQUFNQyxLQUFLQyxHQUFHdkIsS0FBSCxJQUFZdUIsR0FBR3RCLE1BQUgsQ0FB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QVVrRyxPQUFWLElBQXFCLElBQXJCOztBQUVKLFdBQU8sS0FBUDtBQUNIOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBV2xHLFNBQWYsRUFDSUEsVUFBVWtHLE9BQVYsSUFBcUIsS0FBckI7O0FBRUosV0FBTyxLQUFQO0FBQ0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBPYmplY3RDb2xsZWN0IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIHdvcmxkLCBpbmRleCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdjb2xsZWN0aWJsZUZsYWcnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIGlzU2Vuc29yOiB0cnVlLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBmbGFnQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBwbGF5ZXJDYXRlZ29yeVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwLjEpO1xyXG5cclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSkgKyA1O1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkub3Bwb25lbnRDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5wbGF5ZXJDb2xsaWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xyXG4gICAgICAgIHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgPSAyMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVDb2xvciA9IGNvbG9yKDIwOCwgMCwgMjU1KTtcclxuICAgICAgICB0aGlzLnBsYXllclR3b0NvbG9yID0gY29sb3IoMjU1LCAxNjUsIDApO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDMwMDtcclxuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlUmF0ZSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMucGxheWVyVHdvQ29sb3IsIHRoaXMucGxheWVyT25lQ29sb3IsIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMucGxheWVyT25lQ29sb3IsIHRoaXMucGxheWVyVHdvQ29sb3IsIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGgpO1xyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xyXG4gICAgICAgIG5vRmlsbCgpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSB0aGlzLmFscGhhUmVkdWNlQW1vdW50ICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5hbHBoYSA8IDApXHJcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAyNTU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkucGxheWVyQ29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPCB0aGlzLm1heEhlYWx0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aCArPSB0aGlzLmNoYW5nZVJhdGUgKiA2MCAvIGZyYW1lUmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ib2R5Lm9wcG9uZW50Q29sbGlkZWQgJiYgdGhpcy5oZWFsdGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IHRoaXMuY2hhbmdlUmF0ZSAqIDYwIC8gZnJhbWVSYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcbn1cbmNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQsIHZlbG9jaXR5ID0gMjApIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIHZlbG9jaXR5KSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xyXG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gY29sb3IoYGhzbGEoJHt0aGlzLmNvbG9yTnVtYmVyfSwgMTAwJSwgNTAlLCAke3RoaXMuYWxwaGF9KWApO1xyXG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XHJcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1Zpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBFeHBsb3Npb24ge1xyXG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUsIHZlbG9jaXR5ID0gMjAsIG51bWJlciA9IDEwMCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xyXG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgdGhpcy5udW1iZXIgPSBudW1iZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cGxvZGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlcjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvcixcclxuICAgICAgICAgICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0LCB0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ29tcGxldGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbkFpcjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VBbW91bnQgPSB0aGlzLnJhZGl1cyAvIDI7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5LmRhbWFnZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgICAgIHBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IHdpZHRoIHx8IHBvcy54IDwgMCB8fCBwb3MueSA+IGhlaWdodCB8fCBwb3MueSA8IDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJvdW5kYXJ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB3b3JsZCwgbGFiZWwgPSAnYm91bmRhcnlDb250cm9sTGluZXMnLCBpbmRleCA9IC0xKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gYm91bmRhcnlXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGJvdW5kYXJ5SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm9keS5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2R5LmluZGV4ID09PSAxKVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMTY1LCAwKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgIH0pIHtcclxuICAgICAgICBsZXQgbW9kaWZpZWRZID0geSAtIGdyb3VuZEhlaWdodCAvIDIgKyAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcclxuICAgICAgICB0aGlzLmZha2VCb3R0b21QYXJ0ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSArIDEwLCBtb2RpZmllZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxyXG4gICAgICAgICAgICBsYWJlbDogJ2JvdW5kYXJ5Q29udHJvbExpbmVzJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZEhlaWdodCA9IG1vZGlmaWVkSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgdmVydGljZXMgPSBbXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSwgXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1sxXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMV0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMl0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbM10sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMF0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1szXVxyXG4gICAgICAgIF07XHJcblxyXG5cclxuICAgICAgICBiZWdpblNoYXBlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xyXG4gICAgICAgIGVuZFNoYXBlKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGFuZ2xlID0gMCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgZmxhZ0NhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDIwO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDA7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUxldmVsID0gMTtcclxuICAgICAgICB0aGlzLmJvZHkuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XHJcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9keS5pbmRleCA9IHBsYXllckluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmRpc2FibGVDb250cm9scyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsICh0aGlzLmJvZHkuaGVhbHRoICogMTAwKSAvIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJvZHkuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vb2JqZWN0LWNvbGxlY3QuanNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZDtcclxuICAgICAgICB0aGlzLmVuZ2luZS53b3JsZC5ncmF2aXR5LnNjYWxlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5ncm91bmRzID0gW107XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucGxheWVyV29uID0gLTE7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxhdGZvcm1zKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmNyZWF0ZUZsYWdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlR3JvdW5kcygpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTIuNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDEyNSwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyNTAsIHJhbmRvbVZhbHVlLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDE1MCwgaGVpZ2h0IC8gNi4zNCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDApKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcsIDEpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAvIDMuMTcsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxheWVycygpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKHRoaXMuZ3JvdW5kc1swXS5ib2R5LnBvc2l0aW9uLngsIGhlaWdodCAvIDEuODExLCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKHRoaXMuZ3JvdW5kc1t0aGlzLmdyb3VuZHMubGVuZ3RoIC0gMV0uYm9keS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMSwgMTc5KSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzFdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUZsYWdzKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KDUwLCA1MCwgMjAsIDIwLCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3Qod2lkdGggLSA1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyKGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uRW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRXhpdChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2JlZm9yZVVwZGF0ZScsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVuZ2luZShldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRW50ZXIoZXZlbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFiYXNpY0ZpcmUuZGFtYWdlZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVCID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnY29sbGVjdGlibGVGbGFnJyAmJiBsYWJlbEIgPT09ICdwbGF5ZXInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFpcnNbaV0uYm9keUEuaW5kZXggIT09IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEub3Bwb25lbnRDb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLnBsYXllckNvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIucGxheWVyQ29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckV4aXQoZXZlbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2NvbGxlY3RpYmxlRmxhZycgJiYgbGFiZWxCID09PSAncGxheWVyJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhaXJzW2ldLmJvZHlBLmluZGV4ICE9PSBldmVudC5wYWlyc1tpXS5ib2R5Qi5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLm9wcG9uZW50Q29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEucGxheWVyQ29sbGlkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdjb2xsZWN0aWJsZUZsYWcnICYmIGxhYmVsQSA9PT0gJ3BsYXllcicpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWlyc1tpXS5ib2R5QS5pbmRleCAhPT0gZXZlbnQucGFpcnNbaV0uYm9keUIuaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5vcHBvbmVudENvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLnBsYXllckNvbGxpZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKSB7XHJcbiAgICAgICAgbGV0IHBvc1ggPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi54ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi54KSAvIDI7XHJcbiAgICAgICAgbGV0IHBvc1kgPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi55ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi55KSAvIDI7XHJcblxyXG4gICAgICAgIGJhc2ljRmlyZUEuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlQi5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYmFzaWNGaXJlQi5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb25BaXIgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvc1gsIHBvc1kpKTtcclxuICAgIH1cclxuXHJcbiAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSkge1xyXG4gICAgICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIGxldCBtYXBwZWREYW1hZ2UgPSBtYXAoYmFzaWNGaXJlLmRhbWFnZUFtb3VudCwgNSwgMTIsIDUsIDM0KTtcclxuICAgICAgICBwbGF5ZXIuaGVhbHRoIC09IG1hcHBlZERhbWFnZTtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnIHx8XHJcbiAgICAgICAgICAgICAgICBib2R5LmxhYmVsID09PSAnY29sbGVjdGlibGVGbGFnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIDAuMDAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlibGVGbGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVFbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5ib2R5LmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJXb24gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCwgOTAsIDIwMCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllcldvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihwb3MueCwgcG9zLnksIDEwLCA5MCwgMjAwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucGxheWVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tqXS5kaXNhYmxlQ29udHJvbHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmJvZHkuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xyXG4gICAgWzY1LCA2OCwgODcsIDgzLCA5MCwgODhdLFxyXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxMywgMzJdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICA5MDogZmFsc2UsIC8vIFpcclxuICAgIDg4OiBmYWxzZSAvLyBYXHJcbn07XHJcblxyXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcclxuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XHJcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xyXG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcclxuY29uc3QgZmxhZ0NhdGVnb3J5ID0gMHgwMDE2O1xyXG5cclxubGV0IGdhbWVNYW5hZ2VyO1xyXG5sZXQgZW5kVGltZTtcclxubGV0IHNlY29uZHMgPSA2O1xyXG5sZXQgZGlzcGxheVRleHRGb3IgPSAxMjA7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuY3JlYXRlRmxhZ3MoKTtcclxuICAgIH0sIDUwMDApO1xyXG5cclxuICAgIGxldCBjdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgZW5kVGltZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCkgKyA2MDAwKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLmRyYXcoKTtcclxuXHJcbiAgICBpZiAoc2Vjb25kcyA+IDApIHtcclxuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBsZXQgZGlmZiA9IGVuZFRpbWUgLSBjdXJyZW50VGltZTtcclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcigoZGlmZiAlICgxMDAwICogNjApKSAvIDEwMDApO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgIHRleHQoYCR7c2Vjb25kc31gLCB3aWR0aCAvIDIsIDUwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGRpc3BsYXlUZXh0Rm9yID4gMCkge1xyXG4gICAgICAgICAgICBkaXNwbGF5VGV4dEZvciAtPSAxICogNjAgLyBmcmFtZVJhdGUoKTtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgIHRleHQoYENhcHR1cmUgdGhlIG9wcG9uZW50J3MgYmFzZWAsIHdpZHRoIC8gMiwgNTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZ2FtZU1hbmFnZXIuZ2FtZUVuZGVkKSB7XHJcbiAgICAgICAgaWYgKGdhbWVNYW5hZ2VyLnBsYXllcldvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIHRleHRTaXplKDEwMCk7XHJcbiAgICAgICAgICAgIHRleHQoYFBsYXllciAxIFdvbmAsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnYW1lTWFuYWdlci5wbGF5ZXJXb24gPT09IDEpIHtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgxMDApO1xyXG4gICAgICAgICAgICB0ZXh0KGBQbGF5ZXIgMiBXb25gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59Il19
