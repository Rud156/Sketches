'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectCollect = function () {
    function ObjectCollect(x, y, width, height, world, index) {
        _classCallCheck(this, ObjectCollect);

        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            label: 'collectibleFlag',
            friction: 0,
            frictionAir: 0
        });
        Matter.World.add(world, this.body);
        Matter.Body.setAngularVelocity(this.body, 0.1);

        this.width = width;
        this.height = height;
        this.radius = 0.5 * sqrt(sq(width) + sq(height)) + 5;

        this.body.objectCollected = false;
        this.index = index;

        this.alpha = 255;
        this.alphaReduceAmount = 20;
    }

    _createClass(ObjectCollect, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;
            var angle = this.body.angle;

            if (this.index === 0) fill(208, 0, 255);else fill(255, 165, 0);
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
            this.alpha -= this.alphaReduceAmount;
            if (this.alpha < 0) this.alpha = 255;
        }
    }]);

    return ObjectCollect;
}();

var Particle = function () {
    function Particle(x, y, colorNumber, maxStrokeWeight) {
        _classCallCheck(this, Particle);

        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(0, 20));
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

        _classCallCheck(this, Explosion);

        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        var randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.explode();
    }

    _createClass(Explosion, [{
        key: 'explode',
        value: function explode() {
            for (var i = 0; i < 100; i++) {
                var particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight);
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
            } else {
                fill(0, 255, 0);
                noStroke();

                var _pos = this.body.position;

                push();
                translate(_pos.x, _pos.y);
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
        var index = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : -1;
        var label = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'boundaryControlLines';

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
        this.index = index;
    }

    _createClass(Boundary, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;

            if (this.index === 0) fill(208, 0, 255);else if (this.index === 1) fill(255, 165, 0);else fill(255, 0, 0);
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
            mask: groundCategory | playerCategory | basicFireCategory
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
        this.index = playerIndex;
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

            if (this.index === 0) fill(208, 0, 255);else fill(255, 165, 0);

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
            this.rotateBlaster(activeKeys);
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys);

            this.chargeAndShoot(activeKeys);

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
            this.platforms.push(new Boundary(150, height / 6.34, 300, 20, this.world, 0, 'staticGround'));
            this.platforms.push(new Boundary(width - 150, height / 6.43, 300, 20, this.world, 1, 'staticGround'));

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
            }
        }
    }, {
        key: 'onTriggerExit',
        value: function onTriggerExit(event) {}
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
            player.health -= basicFire.damageAmount * 2;

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
            }

            for (var _i = 0; _i < this.players.length; _i++) {
                this.players[_i].show();
                this.players[_i].update(keyStates);

                if (this.players[_i].body.health <= 0) {
                    var pos = this.players[_i].body.position;
                    this.explosions.push(new Explosion(pos.x, pos.y, 10));

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
            displayTextFor -= 1;
            fill(255);
            textSize(30);
            text('Capture the opponent\'s base', width / 2, 50);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiaW5kZXgiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwicmVjdGFuZ2xlIiwibGFiZWwiLCJmcmljdGlvbiIsImZyaWN0aW9uQWlyIiwiV29ybGQiLCJhZGQiLCJCb2R5Iiwic2V0QW5ndWxhclZlbG9jaXR5IiwicmFkaXVzIiwic3FydCIsInNxIiwib2JqZWN0Q29sbGVjdGVkIiwiYWxwaGEiLCJhbHBoYVJlZHVjZUFtb3VudCIsInBvcyIsInBvc2l0aW9uIiwiYW5nbGUiLCJmaWxsIiwibm9TdHJva2UiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwicmVjdCIsInN0cm9rZSIsInN0cm9rZVdlaWdodCIsIm5vRmlsbCIsImVsbGlwc2UiLCJwb3AiLCJQYXJ0aWNsZSIsImNvbG9yTnVtYmVyIiwibWF4U3Ryb2tlV2VpZ2h0IiwiY3JlYXRlVmVjdG9yIiwidmVsb2NpdHkiLCJwNSIsIlZlY3RvciIsInJhbmRvbTJEIiwibXVsdCIsInJhbmRvbSIsImFjY2VsZXJhdGlvbiIsImZvcmNlIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwiZm9yRWFjaCIsInNob3ciLCJsZW5ndGgiLCJhcHBseUZvcmNlIiwidXBkYXRlIiwiaXNWaXNpYmxlIiwic3BsaWNlIiwiQmFzaWNGaXJlIiwiY2F0QW5kTWFzayIsImNpcmNsZSIsInJlc3RpdHV0aW9uIiwiY29sbGlzaW9uRmlsdGVyIiwiY2F0ZWdvcnkiLCJtYXNrIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWQiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImNvcyIsInNpbiIsInJlbW92ZSIsIkJvdW5kYXJ5IiwiYm91bmRhcnlXaWR0aCIsImJvdW5kYXJ5SGVpZ2h0IiwiaXNTdGF0aWMiLCJncm91bmRDYXRlZ29yeSIsInBsYXllckNhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIkdyb3VuZCIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0IiwibW9kaWZpZWRZIiwibW9kaWZpZWRIZWlnaHQiLCJtb2RpZmllZFdpZHRoIiwiZmFrZUJvdHRvbVBhcnQiLCJib2R5VmVydGljZXMiLCJ2ZXJ0aWNlcyIsImZha2VCb3R0b21WZXJ0aWNlcyIsImJlZ2luU2hhcGUiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsInBsYXllckluZGV4IiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwibWF4SGVhbHRoIiwiZGFtYWdlTGV2ZWwiLCJoZWFsdGgiLCJmdWxsSGVhbHRoQ29sb3IiLCJoYWxmSGVhbHRoQ29sb3IiLCJ6ZXJvSGVhbHRoQ29sb3IiLCJrZXlzIiwiY3VycmVudENvbG9yIiwibWFwcGVkSGVhbHRoIiwibGVycENvbG9yIiwibGluZSIsImFjdGl2ZUtleXMiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJpc1ZlbG9jaXR5WmVybyIsImlzT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJHYW1lTWFuYWdlciIsImVuZ2luZSIsIkVuZ2luZSIsImNyZWF0ZSIsInNjYWxlIiwicGxheWVycyIsImdyb3VuZHMiLCJib3VuZGFyaWVzIiwicGxhdGZvcm1zIiwiZXhwbG9zaW9ucyIsImNvbGxlY3RpYmxlRmxhZ3MiLCJtaW5Gb3JjZU1hZ25pdHVkZSIsImNyZWF0ZUdyb3VuZHMiLCJjcmVhdGVCb3VuZGFyaWVzIiwiY3JlYXRlUGxhdGZvcm1zIiwiY3JlYXRlUGxheWVycyIsImF0dGFjaEV2ZW50TGlzdGVuZXJzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiYm9kaWVzIiwiQ29tcG9zaXRlIiwiYWxsQm9kaWVzIiwiaXNTbGVlcGluZyIsIm1hc3MiLCJlbGVtZW50IiwiaXNDb21wbGV0ZSIsImdhbWVNYW5hZ2VyIiwiZW5kVGltZSIsInNlY29uZHMiLCJkaXNwbGF5VGV4dEZvciIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50Iiwic2V0VGltZW91dCIsImNyZWF0ZUZsYWdzIiwiY3VycmVudERhdGVUaW1lIiwiRGF0ZSIsImdldFRpbWUiLCJyZWN0TW9kZSIsIkNFTlRFUiIsInRleHRBbGlnbiIsImRyYXciLCJiYWNrZ3JvdW5kIiwiY3VycmVudFRpbWUiLCJkaWZmIiwiTWF0aCIsImZsb29yIiwidGV4dFNpemUiLCJ0ZXh0Iiwia2V5UHJlc3NlZCIsImtleUNvZGUiLCJrZXlSZWxlYXNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLGE7QUFDRiwyQkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxLQUFsQixFQUF5QkMsTUFBekIsRUFBaUNDLEtBQWpDLEVBQXdDQyxLQUF4QyxFQUErQztBQUFBOztBQUMzQyxhQUFLQyxJQUFMLEdBQVlDLE9BQU9DLE1BQVAsQ0FBY0MsU0FBZCxDQUF3QlQsQ0FBeEIsRUFBMkJDLENBQTNCLEVBQThCQyxLQUE5QixFQUFxQ0MsTUFBckMsRUFBNkM7QUFDckRPLG1CQUFPLGlCQUQ4QztBQUVyREMsc0JBQVUsQ0FGMkM7QUFHckRDLHlCQUFhO0FBSHdDLFNBQTdDLENBQVo7QUFLQUwsZUFBT00sS0FBUCxDQUFhQyxHQUFiLENBQWlCVixLQUFqQixFQUF3QixLQUFLRSxJQUE3QjtBQUNBQyxlQUFPUSxJQUFQLENBQVlDLGtCQUFaLENBQStCLEtBQUtWLElBQXBDLEVBQTBDLEdBQTFDOztBQUVBLGFBQUtKLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGFBQUtjLE1BQUwsR0FBYyxNQUFNQyxLQUFLQyxHQUFHakIsS0FBSCxJQUFZaUIsR0FBR2hCLE1BQUgsQ0FBakIsQ0FBTixHQUFxQyxDQUFuRDs7QUFFQSxhQUFLRyxJQUFMLENBQVVjLGVBQVYsR0FBNEIsS0FBNUI7QUFDQSxhQUFLZixLQUFMLEdBQWFBLEtBQWI7O0FBRUEsYUFBS2dCLEtBQUwsR0FBYSxHQUFiO0FBQ0EsYUFBS0MsaUJBQUwsR0FBeUIsRUFBekI7QUFDSDs7OzsrQkFFTTtBQUNILGdCQUFJQyxNQUFNLEtBQUtqQixJQUFMLENBQVVrQixRQUFwQjtBQUNBLGdCQUFJQyxRQUFRLEtBQUtuQixJQUFMLENBQVVtQixLQUF0Qjs7QUFFQSxnQkFBSSxLQUFLcEIsS0FBTCxLQUFlLENBQW5CLEVB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QVY7O0FBRUFsTSxhQUFLLEdBQUw7QUFDQXFNLGlCQUFTLEVBQVQ7QUFDQUMsa0JBQVF4QixPQUFSLEVBQW1CdE0sUUFBUSxDQUEzQixFQUE4QixFQUE5QjtBQUNILEtBUkQsTUFRTztBQUNILFlBQUl1TSxpQkFBaUIsQ0FBckIsRUFBd0I7QUFDcEJBLDhCQUFrQixDQUFsQjtBQUNBL0ssaUJBQUssR0FBTDtBQUNBcU0scUJBQVMsRUFBVDtBQUNBQyxpREFBb0M5TixRQUFRLENBQTVDLEVBQStDLEVBQS9DO0FBQ0g7QUFDSjtBQUNKOztBQUVELFNBQVMrTixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVc5RixTQUFmLEVBQ0lBLFVBQVU4RixPQUFWLElBQXFCLElBQXJCOztBQUVKLFdBQU8sS0FBUDtBQUNIOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBVzlGLFNBQWYsRUFDSUEsVUFBVThGLE9BQVYsSUFBcUIsS0FBckI7O0FBRUosV0FBTyxLQUFQO0FBQ0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBPYmplY3RDb2xsZWN0IHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIHdvcmxkLCBpbmRleCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdjb2xsZWN0aWJsZUZsYWcnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSkgKyA1O1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkub2JqZWN0Q29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMjU1O1xyXG4gICAgICAgIHRoaXMuYWxwaGFSZWR1Y2VBbW91bnQgPSAyMDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMTY1LCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlKDI1NSwgdGhpcy5hbHBoYSk7XHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDMpO1xyXG4gICAgICAgIG5vRmlsbCgpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSB0aGlzLmFscGhhUmVkdWNlQW1vdW50O1xyXG4gICAgICAgIGlmICh0aGlzLmFscGhhIDwgMClcclxuICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDI1NTtcclxuICAgIH1cclxufVxuY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgY29sb3JOdW1iZXIsIG1heFN0cm9rZVdlaWdodCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdChyYW5kb20oMCwgMjApKTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XHJcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoZm9yY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbGV0IGNvbG9yVmFsdWUgPSBjb2xvcihgaHNsYSgke3RoaXMuY29sb3JOdW1iZXJ9LCAxMDAlLCA1MCUsICR7dGhpcy5hbHBoYX0pYCk7XHJcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcclxuICAgICAgICBwb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmlzaWJsZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cclxuXHJcbmNsYXNzIEV4cGxvc2lvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0ID0gNSkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xyXG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xyXG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBsb2RlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0NvbXBsZXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFzaWNGaXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgYW5nbGUsIHdvcmxkLCBjYXRBbmRNYXNrKSB7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDM7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlQW1vdW50ID0gdGhpcy5yYWRpdXMgLyAyO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm9keS5kYW1hZ2VkKSB7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgICAgICBwb3AoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XHJcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgICAgICBwb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHQgfHwgcG9zLnkgPCAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCb3VuZGFyeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwgd29ybGQsIGluZGV4ID0gLTEsIGxhYmVsID0gJ2JvdW5kYXJ5Q29udHJvbExpbmVzJykge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGJvdW5kYXJ5V2lkdGgsIGJvdW5kYXJ5SGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJvdW5kYXJ5V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBib3VuZGFyeUhlaWdodDtcclxuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbmRleCA9PT0gMClcclxuICAgICAgICAgICAgZmlsbCgyMDgsIDAsIDI1NSk7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pbmRleCA9PT0gMSlcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICB9KSB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBtb2RpZmllZEhlaWdodCA9IGdyb3VuZEhlaWdodCAtIDIwO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XHJcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcclxuICAgICAgICAgICAgbGFiZWw6ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuZmFrZUJvdHRvbVBhcnQpO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkV2lkdGggPSBtb2RpZmllZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VmVydGljZXMgPSB0aGlzLmJvZHkudmVydGljZXM7XHJcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XHJcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW1xyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMF0sIFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMV0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1syXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzNdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbM11cclxuICAgICAgICBdO1xyXG5cclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcclxuICAgICAgICBlbmRTaGFwZSgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd29ybGQsIHBsYXllckluZGV4LCBhbmdsZSA9IDAsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhbmdsZTogYW5nbGVcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XHJcbiAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICAgICAgdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWUgPSA1O1xyXG4gICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgPSAxMjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VMZXZlbCA9IDE7XHJcbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xyXG5cclxuICAgICAgICB0aGlzLmtleXMgPSBbXTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gcGxheWVySW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29udHJvbEtleXMoa2V5cykge1xyXG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBsZXQgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuYm9keS5oZWFsdGgsIDAsIHRoaXMubWF4SGVhbHRoLCAwLCAxMDApO1xyXG4gICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5yYWRpdXMgLSAxMCwgKHRoaXMuYm9keS5oZWFsdGggKiAxMDApIC8gMTAwLCAyKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPT09IDApXHJcbiAgICAgICAgICAgIGZpbGwoMjA4LCAwLCAyNTUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmlsbCgyNTUsIDE2NSwgMCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gMTAwICsgd2lkdGggfHwgcG9zLnggPCAtMTAwIHx8IHBvcy55ID4gaGVpZ2h0ICsgMTAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1szXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xyXG4gICAgICAgIGxldCBzaWduID0geFZlbG9jaXR5IDwgMCA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5pc1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5pc091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JvdW5kYXJ5LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vb2JqZWN0LWNvbGxlY3QuanNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZDtcclxuICAgICAgICB0aGlzLmVuZ2luZS53b3JsZC5ncmF2aXR5LnNjYWxlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5ncm91bmRzID0gW107XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMubWluRm9yY2VNYWduaXR1ZGUgPSAwLjA1O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUdyb3VuZHMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUJvdW5kYXJpZXMoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVycygpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5jcmVhdGVGbGFncygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUdyb3VuZHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDEyLjU7IGkgPCB3aWR0aCAtIDEwMDsgaSArPSAyNzUpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKGhlaWdodCAvIDYuMzQsIGhlaWdodCAvIDMuMTcpO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyAxMjUsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjUwLCByYW5kb21WYWx1ZSwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVCb3VuZGFyaWVzKCkge1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSg1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gNSwgaGVpZ2h0IC8gMiwgMTAsIGhlaWdodCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAtIDUsIHdpZHRoLCAxMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXRmb3JtcygpIHtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSgxNTAsIGhlaWdodCAvIDYuMzQsIDMwMCwgMjAsIHRoaXMud29ybGQsIDAsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSAxNTAsIGhlaWdodCAvIDYuNDMsIDMwMCwgMjAsIHRoaXMud29ybGQsIDEsICdzdGF0aWNHcm91bmQnKSk7XHJcblxyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDEwMCwgaGVpZ2h0IC8gMi4xNywgMjAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLyAyLCBoZWlnaHQgLyAzLjE3LCAzMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBsYXllcnMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcih0aGlzLmdyb3VuZHNbMF0uYm9keS5wb3NpdGlvbi54LCBoZWlnaHQgLyAxLjgxMSwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzBdKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcih0aGlzLmdyb3VuZHNbdGhpcy5ncm91bmRzLmxlbmd0aCAtIDFdLmJvZHkucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgaGVpZ2h0IC8gMS44MTEsIHRoaXMud29ybGQsIDEsIDE3OSkpO1xyXG4gICAgICAgIHRoaXMucGxheWVyc1sxXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzWzFdKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVGbGFncygpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MucHVzaChuZXcgT2JqZWN0Q29sbGVjdCg1MCwgNTAsIDIwLCAyMCwgdGhpcy53b3JsZCwgMCkpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KHdpZHRoIC0gNTAsIDUwLCAyMCwgMjAsIHRoaXMud29ybGQsIDEpKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlcihldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2NvbGxpc2lvbkVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckV4aXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFbmdpbmUoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGV2ZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEIubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxib3VuZGFyeUNvbnRyb2xMaW5lcykkLykpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2ljRmlyZS5kYW1hZ2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVBID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFeGl0KGV2ZW50KSB7XHJcbiAgICAgICAgLy8gV2lsbCBiZSB1c2VkIHRvIGNoZWNrIHdoZW4gdGhlIHBsYXllciBsZWF2ZXMgaXRzIGZsYWcgbG9jYXRpb25cclxuICAgIH1cclxuXHJcbiAgICBleHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpIHtcclxuICAgICAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcclxuICAgICAgICBsZXQgcG9zWSA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnkgKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLnkpIC8gMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlQS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuICAgICAgICBiYXNpY0ZpcmVCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgYmFzaWNGaXJlQS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbiA9IDE7XHJcbiAgICAgICAgYmFzaWNGaXJlQi5mcmljdGlvbkFpciA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zWCwgcG9zWSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKSB7XHJcbiAgICAgICAgcGxheWVyLmRhbWFnZUxldmVsICs9IGJhc2ljRmlyZS5kYW1hZ2VBbW91bnQ7XHJcbiAgICAgICAgcGxheWVyLmhlYWx0aCAtPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50ICogMjtcclxuXHJcbiAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICAgICAgbGV0IHBsYXllclBvcyA9IGNyZWF0ZVZlY3RvcihwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XHJcbiAgICAgICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyh0aGlzLm1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsICogMC4wNSk7XHJcblxyXG4gICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRW5naW5lKCkge1xyXG4gICAgICAgIGxldCBib2RpZXMgPSBNYXR0ZXIuQ29tcG9zaXRlLmFsbEJvZGllcyh0aGlzLmVuZ2luZS53b3JsZCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nIHx8IGJvZHkubGFiZWwgPT09ICdiYXNpY0ZpcmUnIHx8XHJcbiAgICAgICAgICAgICAgICBib2R5LmxhYmVsID09PSAnY29sbGVjdGlibGVGbGFnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIDAuMDAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlibGVGbGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFnc1tpXS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmJvZHkuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllcnNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhwbG9zaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xyXG4gICAgWzY1LCA2OCwgODcsIDgzLCA5MCwgODhdLFxyXG4gICAgWzM3LCAzOSwgMzgsIDQwLCAxMywgMzJdXHJcbl07XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICA5MDogZmFsc2UsIC8vIFpcclxuICAgIDg4OiBmYWxzZSAvLyBYXHJcbn07XHJcblxyXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcclxuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XHJcbmNvbnN0IGJhc2ljRmlyZUNhdGVnb3J5ID0gMHgwMDA0O1xyXG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcclxuXHJcbmxldCBnYW1lTWFuYWdlcjtcclxubGV0IGVuZFRpbWU7XHJcbmxldCBzZWNvbmRzID0gNjtcclxubGV0IGRpc3BsYXlUZXh0Rm9yID0gMTIwO1xyXG5cclxuZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcclxuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcclxuXHJcbiAgICBnYW1lTWFuYWdlciA9IG5ldyBHYW1lTWFuYWdlcigpO1xyXG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGdhbWVNYW5hZ2VyLmNyZWF0ZUZsYWdzKCk7XHJcbiAgICB9LCA1MDAwKTtcclxuXHJcbiAgICBsZXQgY3VycmVudERhdGVUaW1lID0gbmV3IERhdGUoKTtcclxuICAgIGVuZFRpbWUgPSBuZXcgRGF0ZShjdXJyZW50RGF0ZVRpbWUuZ2V0VGltZSgpICsgNjAwMCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuXHJcbiAgICBnYW1lTWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgaWYgKHNlY29uZHMgPiAwKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgbGV0IGRpZmYgPSBlbmRUaW1lIC0gY3VycmVudFRpbWU7XHJcbiAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoKGRpZmYgJSAoMTAwMCAqIDYwKSkgLyAxMDAwKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHRTaXplKDMwKTtcclxuICAgICAgICB0ZXh0KGAke3NlY29uZHN9YCwgd2lkdGggLyAyLCA1MCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChkaXNwbGF5VGV4dEZvciA+IDApIHtcclxuICAgICAgICAgICAgZGlzcGxheVRleHRGb3IgLT0gMTtcclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICB0ZXh0U2l6ZSgzMCk7XHJcbiAgICAgICAgICAgIHRleHQoYENhcHR1cmUgdGhlIG9wcG9uZW50J3MgYmFzZWAsIHdpZHRoIC8gMiwgNTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59Il19
