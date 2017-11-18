'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            friction: 0.1,
            restitution: 0.8,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);

        this.movementSpeed = this.radius * 1.4;
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
        key: 'checkVelocityZero',
        value: function checkVelocityZero() {
            var velocity = this.body.velocity;
            return sqrt(sq(velocity.x) + sq(velocity.y)) <= 0.07;
        }
    }, {
        key: 'isOutOfScreen',
        value: function isOutOfScreen() {
            var pos = this.body.position;
            return pos.x > width || pos.x < 0 || pos.y > height;
        }
    }]);

    return BasicFire;
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
            label: 'fakeBottomPart',
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
        var catAndMask = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
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
            }
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

                if (this.bullets[i].checkVelocityZero() || this.bullets[i].isOutOfScreen()) {
                    this.bullets[i].removeFromWorld();
                    this.bullets.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }]);

    return Player;
}();

var engine = void 0;
var world = void 0;

var grounds = [];
var players = [];
var explosions = [];
var minForceMagnitude = 20;

var playerKeys = [[37, 39, 38, 40, 13, 32], [65, 68, 87, 83, 16, 18]];

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
    16: false,
    18: false };

var groundCategory = 0x0001;
var playerCategory = 0x0002;
var basicFireCategory = 0x0004;
var bulletCollisionLayer = 0x0008;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    engine = Matter.Engine.create();
    world = engine.world;

    Matter.Events.on(engine, 'collisionStart', collisionEvent);

    for (var i = 25; i < width; i += 250) {
        var randomValue = random(100, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 200, randomValue, world));
    }

    for (var _i = 0; _i < 2; _i++) {
        if (!grounds[_i]) break;

        players.push(new Player(grounds[_i].body.position.x, 0, world, _i));
        players[_i].setControlKeys(playerKeys[_i]);
    }

    rectMode(CENTER);
}

function draw() {
    background(0);
    Matter.Engine.update(engine);

    grounds.forEach(function (element) {
        element.show();
    });

    for (var i = 0; i < players.length; i++) {
        players[i].show();
        players[i].update(keyStates);

        if (players[i].body.health <= 0) {
            var pos = players[i].body.position;
            explosions.push(new Explosion(pos.x, pos.y, 10));

            players.splice(i, 1);
            i -= 1;
        }

        if (players[i].isOutOfScreen()) {
            players.splice(i, 1);
            i -= 1;
        }
    }

    for (var _i2 = 0; _i2 < explosions.length; _i2++) {
        explosions[_i2].show();
        explosions[_i2].update();

        if (explosions[_i2].isComplete()) {
            explosions.splice(_i2, 1);
            _i2 -= 1;
        }
    }

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

function damagePlayerBasic(player, basicFire) {
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
    directionVector.setMag(minForceMagnitude * player.damageLevel);

    Matter.Body.applyForce(player, player.position, {
        x: directionVector.x,
        y: directionVector.y
    });

    explosions.push(new Explosion(basicFire.position.x, basicFire.position.y));
}

function explosionCollide(basicFireA, basicFireB) {
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

    explosions.push(new Explosion(posX, posY));
}

function collisionEvent(event) {
    for (var i = 0; i < event.pairs.length; i++) {
        var labelA = event.pairs[i].bodyA.label;
        var labelB = event.pairs[i].bodyB.label;

        if (labelA === 'basicFire' && labelB.match(/^(staticGround|fakeBottomPart)$/)) {
            event.pairs[i].bodyA.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        } else if (labelB === 'basicFire' && labelA.match(/^(staticGround|fakeBottomPart)$/)) {
            event.pairs[i].bodyB.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        }

        if (labelA === 'player' && labelB === 'staticGround') {
            event.pairs[i].bodyA.grounded = true;
            event.pairs[i].bodyA.currentJumpNumber = 0;
        } else if (labelB === 'player' && labelA === 'staticGround') {
            event.pairs[i].bodyB.grounded = true;
            event.pairs[i].bodyB.currentJumpNumber = 0;
        }

        if (labelA === 'player' && labelB === 'basicFire') {
            var basicFire = event.pairs[i].bodyB;
            var player = event.pairs[i].bodyA;
            damagePlayerBasic(player, basicFire);
        } else if (labelB === 'player' && labelA === 'basicFire') {
            var _basicFire = event.pairs[i].bodyA;
            var _player = event.pairs[i].bodyB;
            damagePlayerBasic(_player, _basicFire);
        }

        if (labelA === 'basicFire' && labelB === 'basicFire') {
            var basicFireA = event.pairs[i].bodyA;
            var basicFireB = event.pairs[i].bodyB;

            explosionCollide(basicFireA, basicFireB);
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwicHVzaCIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWQiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImZpbGwiLCJub1N0cm9rZSIsInBvcyIsInRyYW5zbGF0ZSIsImVsbGlwc2UiLCJwb3AiLCJCb2R5IiwiY29zIiwic2luIiwicmVtb3ZlIiwic3FydCIsInNxIiwid2lkdGgiLCJoZWlnaHQiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsImdyb3VuZENhdGVnb3J5IiwicGxheWVyQ2F0ZWdvcnkiLCJiYXNpY0ZpcmVDYXRlZ29yeSIsImJ1bGxldENvbGxpc2lvbkxheWVyIiwibW9kaWZpZWRZIiwicmVjdGFuZ2xlIiwiaXNTdGF0aWMiLCJtb2RpZmllZEhlaWdodCIsIm1vZGlmaWVkV2lkdGgiLCJmYWtlQm90dG9tUGFydCIsImJvZHlWZXJ0aWNlcyIsInZlcnRpY2VzIiwiZmFrZUJvdHRvbVZlcnRpY2VzIiwiYmVnaW5TaGFwZSIsInZlcnRleCIsImVuZFNoYXBlIiwiUGxheWVyIiwicGxheWVySW5kZXgiLCJhbmd1bGFyVmVsb2NpdHkiLCJqdW1wSGVpZ2h0IiwianVtcEJyZWF0aGluZ1NwYWNlIiwiZ3JvdW5kZWQiLCJtYXhKdW1wTnVtYmVyIiwiY3VycmVudEp1bXBOdW1iZXIiLCJidWxsZXRzIiwiaW5pdGlhbENoYXJnZVZhbHVlIiwibWF4Q2hhcmdlVmFsdWUiLCJjdXJyZW50Q2hhcmdlVmFsdWUiLCJjaGFyZ2VJbmNyZW1lbnRWYWx1ZSIsImNoYXJnZVN0YXJ0ZWQiLCJtYXhIZWFsdGgiLCJkYW1hZ2VMZXZlbCIsImhlYWx0aCIsImZ1bGxIZWFsdGhDb2xvciIsImhhbGZIZWFsdGhDb2xvciIsInplcm9IZWFsdGhDb2xvciIsImtleXMiLCJpbmRleCIsImN1cnJlbnRDb2xvciIsIm1hcHBlZEhlYWx0aCIsImxlcnBDb2xvciIsInJlY3QiLCJyb3RhdGUiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImtleVN0YXRlcyIsInlWZWxvY2l0eSIsInhWZWxvY2l0eSIsImFic1hWZWxvY2l0eSIsImFicyIsInNpZ24iLCJkcmF3Q2hhcmdlZFNob3QiLCJyb3RhdGVCbGFzdGVyIiwibW92ZUhvcml6b250YWwiLCJtb3ZlVmVydGljYWwiLCJjaGFyZ2VBbmRTaG9vdCIsImNoZWNrVmVsb2NpdHlaZXJvIiwiaXNPdXRPZlNjcmVlbiIsInJlbW92ZUZyb21Xb3JsZCIsImVuZ2luZSIsImdyb3VuZHMiLCJwbGF5ZXJzIiwiZXhwbG9zaW9ucyIsIm1pbkZvcmNlTWFnbml0dWRlIiwicGxheWVyS2V5cyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwiRXZlbnRzIiwib24iLCJjb2xsaXNpb25FdmVudCIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJyZWN0TW9kZSIsIkNFTlRFUiIsImRyYXciLCJiYWNrZ3JvdW5kIiwiZWxlbWVudCIsImlzQ29tcGxldGUiLCJ0ZXh0U2l6ZSIsInRleHQiLCJyb3VuZCIsImZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsInBsYXllciIsImJhc2ljRmlyZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImV4cGxvc2lvbkNvbGxpZGUiLCJiYXNpY0ZpcmVBIiwiYmFzaWNGaXJlQiIsInBvc1giLCJwb3NZIiwiZXZlbnQiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU1BLFE7QUFDRixzQkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxXQUFsQixFQUErQkMsZUFBL0IsRUFBZ0Q7QUFBQTs7QUFDNUMsYUFBS0MsUUFBTCxHQUFnQkMsYUFBYUwsQ0FBYixFQUFnQkMsQ0FBaEIsQ0FBaEI7QUFDQSxhQUFLSyxRQUFMLEdBQWdCQyxHQUFHQyxNQUFILENBQVVDLFFBQVYsRUFBaEI7QUFDQSxhQUFLSCxRQUFMLENBQWNJLElBQWQsQ0FBbUJDLE9BQU8sQ0FBUCxFQUFVLEVBQVYsQ0FBbkI7QUFDQSxhQUFLQyxZQUFMLEdBQW9CUCxhQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBcEI7O0FBRUEsYUFBS1EsS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLWCxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLGFBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0g7Ozs7bUNBRVVXLEss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LE1BQU1DLEtBQU4sQ0FBWTFKLENBQVosRUFBZTRKLEtBQTVCO0FBQ0FoQiw4QkFBa0JDLE1BQWxCLEVBQTBCQyxTQUExQjtBQUNILFNBSkQsTUFJTyxJQUFJZSxXQUFXLFFBQVgsSUFBdUJGLFdBQVcsV0FBdEMsRUFBbUQ7QUFDdEQsZ0JBQUliLGFBQVlXLE1BQU1DLEtBQU4sQ0FBWTFKLENBQVosRUFBZTRKLEtBQS9CO0FBQ0EsZ0JBQUlmLFVBQVNZLE1BQU1DLEtBQU4sQ0FBWTFKLENBQVosRUFBZThKLEtBQTVCO0FBQ0FsQiw4QkFBa0JDLE9BQWxCLEVBQTBCQyxVQUExQjtBQUNIOztBQUVELFlBQUlhLFdBQVcsV0FBWCxJQUEwQkUsV0FBVyxXQUF6QyxFQUFzRDtBQUNsRCxnQkFBSVIsYUFBYUksTUFBTUMsS0FBTixDQUFZMUosQ0FBWixFQUFlNEosS0FBaEM7QUFDQSxnQkFBSU4sYUFBYUcsTUFBTUMsS0FBTixDQUFZMUosQ0FBWixFQUFlOEosS0FBaEM7O0FBRUFWLDZCQUFpQkMsVUFBakIsRUFBNkJDLFVBQTdCO0FBQ0g7QUFDSjtBQUNKIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDIwKSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xyXG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseUZvcmNlKGZvcmNlKSB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGxldCBjb2xvclZhbHVlID0gY29sb3IoYGhzbGEoJHt0aGlzLmNvbG9yTnVtYmVyfSwgMTAwJSwgNTAlLCAke3RoaXMuYWxwaGF9KWApO1xyXG4gICAgICAgIGxldCBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcclxuICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XHJcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xyXG5cclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1Zpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XHJcblxyXG5jbGFzcyBFeHBsb3Npb24ge1xyXG4gICAgY29uc3RydWN0b3Ioc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCA9IDUpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvciwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNDb21wbGV0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAxLjQ7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlQW1vdW50ID0gdGhpcy5yYWRpdXMgLyAyO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm9keS5kYW1hZ2VkKSB7XHJcblxyXG4gICAgICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgICAgICBwb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgIH0pIHtcclxuICAgICAgICBsZXQgbW9kaWZpZWRZID0geSAtIGdyb3VuZEhlaWdodCAvIDIgKyAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgbW9kaWZpZWRZLCBncm91bmRXaWR0aCwgMjAsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkV2lkdGggPSA1MDtcclxuICAgICAgICB0aGlzLmZha2VCb3R0b21QYXJ0ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSArIDEwLCBtb2RpZmllZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxyXG4gICAgICAgICAgICBsYWJlbDogJ2Zha2VCb3R0b21QYXJ0JyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZEhlaWdodCA9IG1vZGlmaWVkSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgdmVydGljZXMgPSBbXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1swXSwgXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1sxXSxcclxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMV0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMl0sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbM10sIFxyXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbMF0sXHJcbiAgICAgICAgICAgIGJvZHlWZXJ0aWNlc1szXVxyXG4gICAgICAgIF07XHJcblxyXG5cclxuICAgICAgICBiZWdpblNoYXBlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xyXG4gICAgICAgIGVuZFNoYXBlKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgcGxheWVySW5kZXgsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xyXG4gICAgICAgIHRoaXMuYm9keS5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcclxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XHJcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IHBsYXllckluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgbGV0IG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmJvZHkuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuICAgICAgICByZWN0KHBvcy54LCBwb3MueSAtIHRoaXMucmFkaXVzIC0gMTAsIDEwMCwgMik7XHJcblxyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodCgxKTtcclxuICAgICAgICBzdHJva2UoMCk7XHJcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xyXG5cclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBpc091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiAxMDAgKyB3aWR0aCB8fCBwb3MueCA8IC0xMDAgfHwgcG9zLnkgPiBoZWlnaHQgKyAxMDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1szXV0pIHx8XHJcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzNdXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBsZXQgYWJzWFZlbG9jaXR5ID0gYWJzKHhWZWxvY2l0eSk7XHJcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMF1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgeDogLTAuMDA1LFxyXG4gICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHRoaXMuYm9keSwgdGhpcy5ib2R5LnBvc2l0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcclxuICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmNoZWNrVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XHJcblxyXG5sZXQgZW5naW5lO1xyXG5sZXQgd29ybGQ7XHJcblxyXG5sZXQgZ3JvdW5kcyA9IFtdO1xyXG5sZXQgcGxheWVycyA9IFtdO1xyXG5sZXQgZXhwbG9zaW9ucyA9IFtdO1xyXG5sZXQgbWluRm9yY2VNYWduaXR1ZGUgPSAyMDtcclxuXHJcbmNvbnN0IHBsYXllcktleXMgPSBbXHJcbiAgICBbMzcsIDM5LCAzOCwgNDAsIDEzLCAzMl0sXHJcbiAgICBbNjUsIDY4LCA4NywgODMsIDE2LCAxOF1cclxuXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDEzOiBmYWxzZSwgLy8gRU5URVJcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UsIC8vIERcclxuICAgIDE2OiBmYWxzZSwgLy8gU2hpZnRcclxuICAgIDE4OiBmYWxzZSAvLyBBbHRcclxufTtcclxuXHJcbmNvbnN0IGdyb3VuZENhdGVnb3J5ID0gMHgwMDAxO1xyXG5jb25zdCBwbGF5ZXJDYXRlZ29yeSA9IDB4MDAwMjtcclxuY29uc3QgYmFzaWNGaXJlQ2F0ZWdvcnkgPSAweDAwMDQ7XHJcbmNvbnN0IGJ1bGxldENvbGxpc2lvbkxheWVyID0gMHgwMDA4O1xyXG5cclxuZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcclxuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcclxuICAgIGVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICB3b3JsZCA9IGVuZ2luZS53b3JsZDtcclxuXHJcbiAgICBNYXR0ZXIuRXZlbnRzLm9uKGVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgY29sbGlzaW9uRXZlbnQpO1xyXG5cclxuICAgIC8vIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGg7IGkgKz0gd2lkdGgpIHtcclxuICAgIC8vICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oMTAwLCAzMDApO1xyXG4gICAgLy8gICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCB3aWR0aCwgcmFuZG9tVmFsdWUsIHdvcmxkKSk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDI1OyBpIDwgd2lkdGg7IGkgKz0gMjUwKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKDEwMCwgMzAwKTtcclxuICAgICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgNTAsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjAwLCByYW5kb21WYWx1ZSwgd29ybGQpKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkrKykge1xyXG4gICAgICAgIGlmICghZ3JvdW5kc1tpXSlcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKGdyb3VuZHNbaV0uYm9keS5wb3NpdGlvbi54LCAwLCB3b3JsZCwgaSkpO1xyXG4gICAgICAgIHBsYXllcnNbaV0uc2V0Q29udHJvbEtleXMocGxheWVyS2V5c1tpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZShlbmdpbmUpO1xyXG5cclxuICAgIGdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBsYXllcnNbaV0uc2hvdygpO1xyXG4gICAgICAgIHBsYXllcnNbaV0udXBkYXRlKGtleVN0YXRlcyk7XHJcblxyXG4gICAgICAgIGlmIChwbGF5ZXJzW2ldLmJvZHkuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgbGV0IHBvcyA9IHBsYXllcnNbaV0uYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24ocG9zLngsIHBvcy55LCAxMCkpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwbGF5ZXJzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBleHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAoZXhwbG9zaW9uc1tpXS5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZmlsbCgyNTUpO1xyXG4gICAgdGV4dFNpemUoMzApO1xyXG4gICAgdGV4dChgJHtyb3VuZChmcmFtZVJhdGUoKSl9YCwgd2lkdGggLSA3NSwgNTApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcclxuICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xyXG4gICAgcGxheWVyLmhlYWx0aCAtPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50ICogMjtcclxuXHJcbiAgICBiYXNpY0ZpcmUuZGFtYWdlZCA9IHRydWU7XHJcbiAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgYnVsbGV0UG9zID0gY3JlYXRlVmVjdG9yKGJhc2ljRmlyZS5wb3NpdGlvbi54LCBiYXNpY0ZpcmUucG9zaXRpb24ueSk7XHJcbiAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XHJcblxyXG4gICAgbGV0IGRpcmVjdGlvblZlY3RvciA9IHA1LlZlY3Rvci5zdWIocGxheWVyUG9zLCBidWxsZXRQb3MpO1xyXG4gICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyhtaW5Gb3JjZU1hZ25pdHVkZSAqIHBsYXllci5kYW1hZ2VMZXZlbCk7XHJcblxyXG4gICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZShwbGF5ZXIsIHBsYXllci5wb3NpdGlvbiwge1xyXG4gICAgICAgIHg6IGRpcmVjdGlvblZlY3Rvci54LFxyXG4gICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XHJcbiAgICB9KTtcclxuXHJcbiAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhwbG9zaW9uQ29sbGlkZShiYXNpY0ZpcmVBLCBiYXNpY0ZpcmVCKSB7XHJcbiAgICBsZXQgcG9zWCA9IChiYXNpY0ZpcmVBLnBvc2l0aW9uLnggKyBiYXNpY0ZpcmVCLnBvc2l0aW9uLngpIC8gMjtcclxuICAgIGxldCBwb3NZID0gKGJhc2ljRmlyZUEucG9zaXRpb24ueSArIGJhc2ljRmlyZUIucG9zaXRpb24ueSkgLyAyO1xyXG5cclxuICAgIGJhc2ljRmlyZUEuZGFtYWdlZCA9IHRydWU7XHJcbiAgICBiYXNpY0ZpcmVCLmRhbWFnZWQgPSB0cnVlO1xyXG4gICAgYmFzaWNGaXJlQS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICB9O1xyXG4gICAgYmFzaWNGaXJlQi5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICB9O1xyXG5cclxuICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHBvc1gsIHBvc1kpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGlzaW9uRXZlbnQoZXZlbnQpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XHJcbiAgICAgICAgbGV0IGxhYmVsQiA9IGV2ZW50LnBhaXJzW2ldLmJvZHlCLmxhYmVsO1xyXG5cclxuICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxmYWtlQm90dG9tUGFydCkkLykpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGZha2VCb3R0b21QYXJ0KSQvKSkpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XHJcbiAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgbGV0IGJhc2ljRmlyZSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBO1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XHJcbiAgICAgICAgICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcclxuICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUEgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcclxuICAgICAgICAgICAgbGV0IGJhc2ljRmlyZUIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcclxuXHJcbiAgICAgICAgICAgIGV4cGxvc2lvbkNvbGxpZGUoYmFzaWNGaXJlQSwgYmFzaWNGaXJlQik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
