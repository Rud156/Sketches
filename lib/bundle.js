'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectCollect = function () {
    function ObjectCollect(x, y, width, height, world) {
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
        this.radius = 0.5 * sqrt(sq(width) + sq(height));

        this.objectCollected = false;
    }

    _createClass(ObjectCollect, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;
            var angle = this.body.angle;

            fill(255);
            noStroke();

            push();
            translate(pos.x, pos.y);
            rotate(angle);
            rect(0, 0, this.width, this.height);
            pop();
        }
    }, {
        key: 'update',
        value: function update() {}
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
        var label = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'boundaryControlLines';

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
    }

    _createClass(Boundary, [{
        key: 'show',
        value: function show() {
            var pos = this.body.position;

            fill(255, 0, 0);
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
            rect(pos.x, pos.y - this.radius - 10, 100, 2);

            fill(0, 255, 0);

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

        this.createFlags();
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
            this.platforms.push(new Boundary(150, height / 6.34, 300, 20, this.world, 'staticGround'));
            this.platforms.push(new Boundary(width - 150, height / 6.43, 300, 20, this.world, 'staticGround'));

            this.platforms.push(new Boundary(100, height / 2.17, 200, 20, this.world, 'staticGround'));
            this.platforms.push(new Boundary(width - 100, height / 2.17, 200, 20, this.world, 'staticGround'));

            this.platforms.push(new Boundary(width / 2, height / 3.17, 300, 20, this.world, 'staticGround'));
        }
    }, {
        key: 'createPlayers',
        value: function createPlayers() {
            this.players.push(new Player(this.grounds[0].body.position.x, height / 2.536, this.world, 0));
            this.players[0].setControlKeys(playerKeys[0]);

            this.players.push(new Player(this.grounds[this.grounds.length - 1].body.position.x, height / 2.536, this.world, 1, 179));
            this.players[1].setControlKeys(playerKeys[1]);
        }
    }, {
        key: 'createFlags',
        value: function createFlags() {
            this.collectibleFlags.push(new ObjectCollect(50, 50, 30, 30, this.world));
            this.collectibleFlags.push(new ObjectCollect(width - 50, 50, 30, 30, this.world));
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

                    this.players.splice(_i, 1);
                    _i -= 1;
                }

                if (this.players[_i].isOutOfScreen()) {
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

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    gameManager = new GameManager();

    rectMode(CENTER);
}

function draw() {
    background(0);

    gameManager.draw();

    fill(255);
    textSize(30);
    text('' + round(frameRate()), width - 75, 50);
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;

    return false;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;

    return false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJPYmplY3RDb2xsZWN0IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsIndvcmxkIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsInJlY3RhbmdsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJmcmljdGlvbkFpciIsIldvcmxkIiwiYWRkIiwiQm9keSIsInNldEFuZ3VsYXJWZWxvY2l0eSIsInJhZGl1cyIsInNxcnQiLCJzcSIsIm9iamVjdENvbGxlY3RlZCIsInBvcyIsInBvc2l0aW9uIiwiYW5nbGUiLCJmaWxsIiwibm9TdHJva2UiLCJwdXNoIiwidHJhbnNsYXRlIiwicm90YXRlIiwicmVjdCIsInBvcCIsIlBhcnRpY2xlIiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJjcmVhdGVWZWN0b3IiLCJ2ZWxvY2l0eSIsInA1IiwiVmVjdG9yIiwicmFuZG9tMkQiLCJtdWx0IiwicmFuZG9tIiwiYWNjZWxlcmF0aW9uIiwiYWxwaGEiLCJmb3JjZSIsImNvbG9yVmFsdWUiLCJjb2xvciIsIm1hcHBlZFN0cm9rZVdlaWdodCIsIm1hcCIsInN0cm9rZVdlaWdodCIsInN0cm9rZSIsInBvaW50IiwiRXhwbG9zaW9uIiwic3Bhd25YIiwic3Bhd25ZIiwiZ3Jhdml0eSIsInJhbmRvbUNvbG9yIiwiaW50IiwicGFydGljbGVzIiwiZXhwbG9kZSIsImkiLCJwYXJ0aWNsZSIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsImNhdEFuZE1hc2siLCJjaXJjbGUiLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIm1vdmVtZW50U3BlZWQiLCJkYW1hZ2VkIiwiZGFtYWdlQW1vdW50Iiwic2V0VmVsb2NpdHkiLCJlbGxpcHNlIiwiY29zIiwic2luIiwicmVtb3ZlIiwiQm91bmRhcnkiLCJib3VuZGFyeVdpZHRoIiwiYm91bmRhcnlIZWlnaHQiLCJpc1N0YXRpYyIsImdyb3VuZENhdGVnb3J5IiwicGxheWVyQ2F0ZWdvcnkiLCJiYXNpY0ZpcmVDYXRlZ29yeSIsImJ1bGxldENvbGxpc2lvbkxheWVyIiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJtb2RpZmllZFkiLCJtb2RpZmllZEhlaWdodCIsIm1vZGlmaWVkV2lkdGgiLCJmYWtlQm90dG9tUGFydCIsImJvZHlWZXJ0aWNlcyIsInZlcnRpY2VzIiwiZmFrZUJvdHRvbVZlcnRpY2VzIiwiYmVnaW5TaGFwZSIsInZlcnRleCIsImVuZFNoYXBlIiwiUGxheWVyIiwicGxheWVySW5kZXgiLCJhbmd1bGFyVmVsb2NpdHkiLCJqdW1wSGVpZ2h0IiwianVtcEJyZWF0aGluZ1NwYWNlIiwiZ3JvdW5kZWQiLCJtYXhKdW1wTnVtYmVyIiwiY3VycmVudEp1bXBOdW1iZXIiLCJidWxsZXRzIiwiaW5pdGlhbENoYXJnZVZhbHVlIiwibWF4Q2hhcmdlVmFsdWUiLCJjdXJyZW50Q2hhcmdlVmFsdWUiLCJjaGFyZ2VJbmNyZW1lbnRWYWx1ZSIsImNoYXJnZVN0YXJ0ZWQiLCJtYXhIZWFsdGgiLCJkYW1hZ2VMZXZlbCIsImhlYWx0aCIsImZ1bGxIZWFsdGhDb2xvciIsImhhbGZIZWFsdGhDb2xvciIsInplcm9IZWFsdGhDb2xvciIsImtleXMiLCJpbmRleCIsImN1cnJlbnRDb2xvciIsIm1hcHBlZEhlYWx0aCIsImxlcnBDb2xvciIsImxpbmUiLCJhY3RpdmVLZXlzIiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5IiwiYWJzIiwic2lnbiIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaXNWZWxvY2l0eVplcm8iLCJpc091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiR2FtZU1hbmFnZXIiLCJlbmdpbmUiLCJFbmdpbmUiLCJjcmVhdGUiLCJzY2FsZSIsInBsYXllcnMiLCJncm91bmRzIiwiYm91bmRhcmllcyIsInBsYXRmb3JtcyIsImV4cGxvc2lvbnMiLCJjb2xsZWN0aWJsZUZsYWdzIiwibWluRm9yY2VNYWduaXR1ZGUiLCJjcmVhdGVHcm91bmRzIiwiY3JlYXRlQm91bmRhcmllcyIsImNyZWF0ZVBsYXRmb3JtcyIsImNyZWF0ZVBsYXllcnMiLCJhdHRhY2hFdmVudExpc3RlbmVycyIsImNyZWF0ZUZsYWdzIiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInBsYXllcktleXMiLCJFdmVudHMiLCJvbiIsImV2ZW50Iiwib25UcmlnZ2VyRW50ZXIiLCJvblRyaWdnZXJFeGl0IiwidXBkYXRlRW5naW5lIiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giLCJiYXNpY0ZpcmUiLCJwbGF5ZXIiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsImJhc2ljRmlyZUEiLCJiYXNpY0ZpcmVCIiwiZXhwbG9zaW9uQ29sbGlkZSIsInBvc1giLCJwb3NZIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiYm9kaWVzIiwiQ29tcG9zaXRlIiwiYWxsQm9kaWVzIiwiaXNTbGVlcGluZyIsIm1hc3MiLCJlbGVtZW50IiwiaXNDb21wbGV0ZSIsImdhbWVNYW5hZ2VyIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJyZWN0TW9kZSIsIkNFTlRFUiIsImRyYXciLCJiYWNrZ3JvdW5kIiwidGV4dFNpemUiLCJ0ZXh0Iiwicm91bmQiLCJmcmFtZVJhdGUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFTUEsYTtBQUNGLDJCQUFZQyxDQUFaLEVBQWVDLENB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Sjs7QUFFQSxTQUFTQyxLQUFULEdBQWlCO0FBQ2IsUUFBSUMsU0FBU0MsYUFBYUMsT0FBT0MsVUFBUCxHQUFvQixFQUFqQyxFQUFxQ0QsT0FBT0UsV0FBUCxHQUFxQixFQUExRCxDQUFiO0FBQ0FKLFdBQU9LLE1BQVAsQ0FBYyxlQUFkOztBQUVBUCxrQkFBYyxJQUFJckQsV0FBSixFQUFkOztBQUVBNkQsYUFBU0MsTUFBVDtBQUNIOztBQUVELFNBQVNDLElBQVQsR0FBZ0I7QUFDWkMsZUFBVyxDQUFYOztBQUVBWCxnQkFBWVUsSUFBWjs7QUFFQXhMLFNBQUssR0FBTDtBQUNBMEwsYUFBUyxFQUFUO0FBQ0FDLGNBQVFDLE1BQU1DLFdBQU4sQ0FBUixFQUE4QmxOLFFBQVEsRUFBdEMsRUFBMEMsRUFBMUM7QUFDSDs7QUFFRCxTQUFTbU4sVUFBVCxHQUFzQjtBQUNsQixRQUFJQyxXQUFXcEYsU0FBZixFQUNJQSxVQUFVb0YsT0FBVixJQUFxQixJQUFyQjs7QUFFSixXQUFPLEtBQVA7QUFDSDs7QUFFRCxTQUFTQyxXQUFULEdBQXVCO0FBQ25CLFFBQUlELFdBQVdwRixTQUFmLEVBQ0lBLFVBQVVvRixPQUFWLElBQXFCLEtBQXJCOztBQUVKLFdBQU8sS0FBUDtBQUNIIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgT2JqZWN0Q29sbGVjdCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0LCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdjb2xsZWN0aWJsZUZsYWcnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb25BaXI6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDAuMSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNSAqIHNxcnQoc3Eod2lkdGgpICsgc3EoaGVpZ2h0KSk7XHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0Q29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuXHJcbiAgICB9XHJcbn1cbmNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDIwKSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xyXG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gY29sb3IoYGhzbGEoJHt0aGlzLmNvbG9yTnVtYmVyfSwgMTAwJSwgNTAlLCAke3RoaXMuYWxwaGF9KWApO1xyXG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XHJcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1Zpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBFeHBsb3Npb24ge1xyXG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvciwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNDb21wbGV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAzO1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJvZHkuZGFtYWdlZCkge1xyXG5cclxuICAgICAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHB1c2goKTtcclxuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICAgICAgcG9wKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHB1c2goKTtcclxuICAgICAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICAgICAgcG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0IHx8IHBvcy55IDwgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQm91bmRhcnkge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgYm91bmRhcnlXaWR0aCwgYm91bmRhcnlIZWlnaHQsIHdvcmxkLCBsYWJlbCA9ICdib3VuZGFyeUNvbnRyb2xMaW5lcycpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBib3VuZGFyeVdpZHRoLCBib3VuZGFyeUhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBib3VuZGFyeVdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRhcnlIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgcmVjdChwb3MueCwgcG9zLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICB9KSB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBtb2RpZmllZEhlaWdodCA9IGdyb3VuZEhlaWdodCAtIDIwO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XHJcbiAgICAgICAgdGhpcy5mYWtlQm90dG9tUGFydCA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHkgKyAxMCwgbW9kaWZpZWRXaWR0aCwgbW9kaWZpZWRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcclxuICAgICAgICAgICAgbGFiZWw6ICdib3VuZGFyeUNvbnRyb2xMaW5lcycsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuZmFrZUJvdHRvbVBhcnQpO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRIZWlnaHQgPSBtb2RpZmllZEhlaWdodDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkV2lkdGggPSBtb2RpZmllZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VmVydGljZXMgPSB0aGlzLmJvZHkudmVydGljZXM7XHJcbiAgICAgICAgbGV0IGZha2VCb3R0b21WZXJ0aWNlcyA9IHRoaXMuZmFrZUJvdHRvbVBhcnQudmVydGljZXM7XHJcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW1xyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMF0sIFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMV0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1syXSxcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzJdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzNdLCBcclxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxyXG4gICAgICAgICAgICBib2R5VmVydGljZXNbM11cclxuICAgICAgICBdO1xyXG5cclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcclxuICAgICAgICBlbmRTaGFwZSgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd29ybGQsIHBsYXllckluZGV4LCBhbmdsZSA9IDAsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhbmdsZTogYW5nbGVcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XHJcbiAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICAgICAgdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWUgPSA1O1xyXG4gICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgPSAxMjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwO1xyXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VMZXZlbCA9IDE7XHJcbiAgICAgICAgdGhpcy5ib2R5LmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xyXG5cclxuICAgICAgICB0aGlzLmtleXMgPSBbXTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gcGxheWVySW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29udHJvbEtleXMoa2V5cykge1xyXG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBsZXQgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuYm9keS5oZWFsdGgsIDAsIHRoaXMubWF4SGVhbHRoLCAwLCAxMDApO1xyXG4gICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xyXG4gICAgICAgIHJlY3QocG9zLngsIHBvcy55IC0gdGhpcy5yYWRpdXMgLSAxMCwgMTAwLCAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0T2ZTY3JlZW4oKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBwb3MueCA+IDEwMCArIHdpZHRoIHx8IHBvcy54IDwgLTEwMCB8fCBwb3MueSA+IGhlaWdodCArIDEwMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzJdXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbM11dKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmICFrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkgfHxcclxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbM11dKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcclxuICAgICAgICBsZXQgc2lnbiA9IHhWZWxvY2l0eSA8IDAgPyAtMSA6IDE7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXHJcbiAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1sxXV0pIHtcclxuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcclxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgIHg6IDAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuYm9keS5ncm91bmRlZCAmJiB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPCB0aGlzLm1heEp1bXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYm9keS5ncm91bmRlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlICs9IHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuY3VycmVudENoYXJnZVZhbHVlID4gdGhpcy5tYXhDaGFyZ2VWYWx1ZSA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlIDogdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRyYXdDaGFyZ2VkU2hvdCh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSAmJiB0aGlzLmNoYXJnZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQsIHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBiYXNpY0ZpcmVDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICB0aGlzLnJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uaXNWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uaXNPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYm91bmRhcnkuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9vYmplY3QtY29sbGVjdC5qc1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHRoaXMuZW5naW5lLndvcmxkO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLndvcmxkLmdyYXZpdHkuc2NhbGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmdyb3VuZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5taW5Gb3JjZU1hZ25pdHVkZSA9IDAuMDU7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlR3JvdW5kcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQm91bmRhcmllcygpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxhdGZvcm1zKCk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUZsYWdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlR3JvdW5kcygpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTIuNTsgaSA8IHdpZHRoIC0gMTAwOyBpICs9IDI3NSkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oaGVpZ2h0IC8gNi4zNCwgaGVpZ2h0IC8gMy4xNyk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoaSArIDEyNSwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyNTAsIHJhbmRvbVZhbHVlLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvdW5kYXJpZXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KDUsIGhlaWdodCAvIDIsIDEwLCBoZWlnaHQsIHRoaXMud29ybGQpKTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaChuZXcgQm91bmRhcnkod2lkdGggLSA1LCBoZWlnaHQgLyAyLCAxMCwgaGVpZ2h0LCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNSwgd2lkdGgsIDEwLCB0aGlzLndvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxhdGZvcm1zKCkge1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KDE1MCwgaGVpZ2h0IC8gNi4zNCwgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAtIDE1MCwgaGVpZ2h0IC8gNi40MywgMzAwLCAyMCwgdGhpcy53b3JsZCwgJ3N0YXRpY0dyb3VuZCcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgQm91bmRhcnkoMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IEJvdW5kYXJ5KHdpZHRoIC0gMTAwLCBoZWlnaHQgLyAyLjE3LCAyMDAsIDIwLCB0aGlzLndvcmxkLCAnc3RhdGljR3JvdW5kJykpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBCb3VuZGFyeSh3aWR0aCAvIDIsIGhlaWdodCAvIDMuMTcsIDMwMCwgMjAsIHRoaXMud29ybGQsICdzdGF0aWNHcm91bmQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUGxheWVycygpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKHRoaXMuZ3JvdW5kc1swXS5ib2R5LnBvc2l0aW9uLngsIGhlaWdodCAvIDIuNTM2LCB0aGlzLndvcmxkLCAwKSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzBdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMF0pO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKHRoaXMuZ3JvdW5kc1t0aGlzLmdyb3VuZHMubGVuZ3RoIC0gMV0uYm9keS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICBoZWlnaHQgLyAyLjUzNiwgdGhpcy53b3JsZCwgMSwgMTc5KSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzFdLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUZsYWdzKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlibGVGbGFncy5wdXNoKG5ldyBPYmplY3RDb2xsZWN0KDUwLCA1MCwgMzAsIDMwLCB0aGlzLndvcmxkKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzLnB1c2gobmV3IE9iamVjdENvbGxlY3Qod2lkdGggLSA1MCwgNTAsIDMwLCAzMCwgdGhpcy53b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIE1hdHRlci5FdmVudHMub24odGhpcy5lbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyKGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuRXZlbnRzLm9uKHRoaXMuZW5naW5lLCAnY29sbGlzaW9uRW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmlnZ2VyRXhpdChldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLkV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2JlZm9yZVVwZGF0ZScsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVuZ2luZShldmVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRW50ZXIoZXZlbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8Ym91bmRhcnlDb250cm9sTGluZXMpJC8pKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFiYXNpY0ZpcmUuZGFtYWdlZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBiYXNpY0ZpcmUuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uQWlyID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGJvdW5kYXJ5Q29udHJvbExpbmVzKSQvKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgICAgIGlmICghYmFzaWNGaXJlLmRhbWFnZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYmFzaWNGaXJlLmZyaWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJhc2ljRmlyZS5mcmljdGlvbkFpciA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxCID09PSAnYmFzaWNGaXJlJykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgICAgIGxldCBiYXNpY0ZpcmVCID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25Db2xsaWRlKGJhc2ljRmlyZUEsIGJhc2ljRmlyZUIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckV4aXQoZXZlbnQpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKSB7XHJcbiAgICAgICAgbGV0IHBvc1ggPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi54ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi54KSAvIDI7XHJcbiAgICAgICAgbGV0IHBvc1kgPSAoYmFzaWNGaXJlQS5wb3NpdGlvbi55ICsgYmFzaWNGaXJlQi5wb3NpdGlvbi55KSAvIDI7XHJcblxyXG4gICAgICAgIGJhc2ljRmlyZUEuZGFtYWdlZCA9IHRydWU7XHJcbiAgICAgICAgYmFzaWNGaXJlQi5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmVBLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYmFzaWNGaXJlQi5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUEuZnJpY3Rpb25BaXIgPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb24gPSAxO1xyXG4gICAgICAgIGJhc2ljRmlyZUIuZnJpY3Rpb25BaXIgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvc1gsIHBvc1kpKTtcclxuICAgIH1cclxuXHJcbiAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSkge1xyXG4gICAgICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xyXG4gICAgICAgIHBsYXllci5oZWFsdGggLT0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudCAqIDI7XHJcblxyXG4gICAgICAgIGJhc2ljRmlyZS5kYW1hZ2VkID0gdHJ1ZTtcclxuICAgICAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGJ1bGxldFBvcyA9IGNyZWF0ZVZlY3RvcihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIGxldCBwbGF5ZXJQb3MgPSBjcmVhdGVWZWN0b3IocGxheWVyLnBvc2l0aW9uLngsIHBsYXllci5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgbGV0IGRpcmVjdGlvblZlY3RvciA9IHA1LlZlY3Rvci5zdWIocGxheWVyUG9zLCBidWxsZXRQb3MpO1xyXG4gICAgICAgIGRpcmVjdGlvblZlY3Rvci5zZXRNYWcodGhpcy5taW5Gb3JjZU1hZ25pdHVkZSAqIHBsYXllci5kYW1hZ2VMZXZlbCAqIDAuMDUpO1xyXG5cclxuICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHBsYXllciwgcGxheWVyLnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgIHg6IGRpcmVjdGlvblZlY3Rvci54LFxyXG4gICAgICAgICAgICB5OiBkaXJlY3Rpb25WZWN0b3IueVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUVuZ2luZSgpIHtcclxuICAgICAgICBsZXQgYm9kaWVzID0gTWF0dGVyLkNvbXBvc2l0ZS5hbGxCb2RpZXModGhpcy5lbmdpbmUud29ybGQpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYm9keSA9IGJvZGllc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljIHx8IGJvZHkuaXNTbGVlcGluZyB8fCBib2R5LmxhYmVsID09PSAnYmFzaWNGaXJlJyB8fFxyXG4gICAgICAgICAgICAgICAgYm9keS5sYWJlbCA9PT0gJ2NvbGxlY3RpYmxlRmxhZycpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGJvZHkuZm9yY2UueSArPSBib2R5Lm1hc3MgKiAwLjAwMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZSh0aGlzLmVuZ2luZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RpYmxlRmxhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aWJsZUZsYWdzW2ldLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RpYmxlRmxhZ3NbaV0uc2hvdygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLnVwZGF0ZShrZXlTdGF0ZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5ib2R5LmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5wbGF5ZXJzW2ldLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvcy54LCBwb3MueSwgMTApKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5leHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxyXG5cclxuY29uc3QgcGxheWVyS2V5cyA9IFtcclxuICAgIFs2NSwgNjgsIDg3LCA4MywgOTAsIDg4XSxcclxuICAgIFszNywgMzksIDM4LCA0MCwgMTMsIDMyXVxyXG5dO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMTM6IGZhbHNlLCAvLyBFTlRFUlxyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG4gICAgOTA6IGZhbHNlLCAvLyBaXHJcbiAgICA4ODogZmFsc2UgLy8gWFxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcblxyXG5sZXQgZ2FtZU1hbmFnZXI7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKCk7XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgIGZpbGwoMjU1KTtcclxuICAgIHRleHRTaXplKDMwKTtcclxuICAgIHRleHQoYCR7cm91bmQoZnJhbWVSYXRlKCkpfWAsIHdpZHRoIC0gNzUsIDUwKVxyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0iXX0=
