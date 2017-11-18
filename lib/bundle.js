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
    function Explosion(spawnX, spawnY, maxStrokeWeight) {
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

        this.body.damagedPlayer = false;
        this.body.damageAmount = this.radius / 2;

        this.setVelocity();
    }

    _createClass(BasicFire, [{
        key: 'show',
        value: function show() {
            if (!this.body.damagedPlayer) {

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
        key: 'checkOutOfScreen',
        value: function checkOutOfScreen() {
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
    function Player(x, y, world) {
        var catAndMask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
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

        this.body.damageLevel = 1;
        this.keys = [];
    }

    _createClass(Player, [{
        key: 'setControlKeys',
        value: function setControlKeys(keys) {
            this.keys = keys;
        }
    }, {
        key: 'show',
        value: function show() {
            fill(0, 255, 0);
            noStroke();

            var pos = this.body.position;
            var angle = this.body.angle;

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
        value: function moveVertical(activeKeys, groundObjects) {
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
        value: function update(activeKeys, groundObjects) {
            this.rotateBlaster(activeKeys);
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys, groundObjects);

            this.chargeAndShoot(activeKeys);

            for (var i = 0; i < this.bullets.length; i++) {
                this.bullets[i].show();

                if (this.bullets[i].checkVelocityZero() || this.bullets[i].checkOutOfScreen()) {
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

        players.push(new Player(grounds[_i].body.position.x, 0, world));
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

    players.forEach(function (element) {
        element.show();
        element.update(keyStates, grounds);
    });

    for (var i = 0; i < explosions.length; i++) {
        explosions[i].show();
        explosions[i].update();

        if (explosions[i].isComplete()) {
            explosions.splice(i, 1);
            i -= 1;
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

    basicFire.damagedPlayer = true;
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

    explosions.push(new Explosion(basicFire.position.x, basicFire.position.y, 10));
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
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwicHVzaCIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWRQbGF5ZXIiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImZpbGwiLCJub1N0cm9rZSIsInBvcyIsInRyYW5zbGF0ZSIsImVsbGlwc2UiLCJwb3AiLCJCb2R5IiwiY29zIiwic2luIiwicmVtb3ZlIiwic3FydCIsInNxIiwid2lkdGgiLCJoZWlnaHQiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsImdyb3VuZENhdGVnb3J5IiwicGxheWVyQ2F0ZWdvcnkiLCJiYXNpY0ZpcmVDYXRlZ29yeSIsImJ1bGxldENvbGxpc2lvbkxheWVyIiwibW9kaWZpZWRZIiwicmVjdGFuZ2xlIiwiaXNTdGF0aWMiLCJtb2RpZmllZEhlaWdodCIsIm1vZGlmaWVkV2lkdGgiLCJmYWtlQm90dG9tUGFydCIsImJvZHlWZXJ0aWNlcyIsInZlcnRpY2VzIiwiZmFrZUJvdHRvbVZlcnRpY2VzIiwiYmVnaW5TaGFwZSIsInZlcnRleCIsImVuZFNoYXBlIiwiUGxheWVyIiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsImluaXRpYWxDaGFyZ2VWYWx1ZSIsIm1heENoYXJnZVZhbHVlIiwiY3VycmVudENoYXJnZVZhbHVlIiwiY2hhcmdlSW5jcmVtZW50VmFsdWUiLCJjaGFyZ2VTdGFydGVkIiwiZGFtYWdlTGV2ZWwiLCJrZXlzIiwicm90YXRlIiwicmVjdCIsImxpbmUiLCJhY3RpdmVLZXlzIiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwieFZlbG9jaXR5IiwiYWJzWFZlbG9jaXR5IiwiYWJzIiwic2lnbiIsImdyb3VuZE9iamVjdHMiLCJkcmF3Q2hhcmdlZFNob3QiLCJyb3RhdGVCbGFzdGVyIiwibW92ZUhvcml6b250YWwiLCJtb3ZlVmVydGljYWwiLCJjaGFyZ2VBbmRTaG9vdCIsImNoZWNrVmVsb2NpdHlaZXJvIiwiY2hlY2tPdXRPZlNjcmVlbiIsInJlbW92ZUZyb21Xb3JsZCIsImVuZ2luZSIsImdyb3VuZHMiLCJwbGF5ZXJzIiwiZXhwbG9zaW9ucyIsIm1pbkZvcmNlTWFnbml0dWRlIiwicGxheWVyS2V5cyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwiRXZlbnRzIiwib24iLCJjb2xsaXNpb25FdmVudCIsInJhbmRvbVZhbHVlIiwic2V0Q29udHJvbEtleXMiLCJyZWN0TW9kZSIsIkNFTlRFUiIsImRyYXciLCJiYWNrZ3JvdW5kIiwiZWxlbWVudCIsImlzQ29tcGxldGUiLCJ0ZXh0U2l6ZSIsInRleHQiLCJyb3VuZCIsImZyYW1lUmF0ZSIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiLCJkYW1hZ2VQbGF5ZXJCYXNpYyIsInBsYXllciIsImJhc2ljRmlyZSIsImJ1bGxldFBvcyIsInBsYXllclBvcyIsImRpcmVjdGlvblZlY3RvciIsInN1YiIsInNldE1hZyIsImV2ZW50IiwicGFpcnMiLCJsYWJlbEEiLCJib2R5QSIsImxhYmVsQiIsImJvZHlCIiwibWF0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxRO0FBQ0Ysc0JBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsV0FBbEIsRUFBK0JDLGVBQS9CLEVBQWdEO0FBQUE7O0FBQzVDLGFBQUtDLFFBQUwsR0FBZ0JDLGFBQWFMLENBQWIsRUFBZ0JDLENBQWhCLENBQWhCO0FBQ0EsYUFBS0ssUUFBTCxHQUFnQkMsR0FBR0MsTUFBSCxDQUFVQyxRQUFWLEVBQWhCO0FBQ0EsYUFBS0gsUUFBTCxDQUFjSSxJQUFkLENBQW1CQyxPQUFPLENBQVAsRUFBVSxFQUFWLENBQW5CO0FBQ0EsYUFBS0MsWUFBTCxHQUFvQlAsYUFBYSxDQUFiLEVBQWdCLENBQWhCLENBQXBCOztBQUVBLGFBQUtRLEtBQUwsR0FBYSxDQUFiO0FBQ0EsYUFBS1gsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxhQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNIOzs7O21DQUVVVyxLLEVBQU87QUFDZCxpQkFBS0YsWUFBTCxDQUFrQkcsR0FBbEIsQ0FBc0JELEtBQXRCO0FBQ0g7OzsrQkFFTTtBQUNILGdCQUFJRSxhQUFhQyxnQkFBYyxLQUFLZixXQUFuQixxQkFBOEMsS0FBS1csS0FBbkQsT0FBakI7QUFDQSxnQkFBSUsscUJBQXFCQyxJQUFJLEtBQUtOLEtBQVQsRUFBZ0IsQ0FBaEIsRUFB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QUEwQkMsVUFBMUI7QUFDSDtBQUNKO0FBQ0oiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDIwKSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuICAgIH1cblxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG5cbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xuXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgfVxuXG4gICAgaXNWaXNpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxuXG5jbGFzcyBFeHBsb3Npb24ge1xuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcblxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgfVxuXG4gICAgZXhwbG9kZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzQ29tcGxldGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEJhc2ljRmlyZSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDEuNDtcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWRQbGF5ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcblxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvZHkuZGFtYWdlZFBsYXllcikge1xuXG4gICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuXG4gICAgICAgICAgICBwdXNoKCk7XG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcbiAgICAgICAgICAgIHBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmVsb2NpdHkoKSB7XG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xuICAgIH1cblxuICAgIGNoZWNrVmVsb2NpdHlaZXJvKCkge1xuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XG4gICAgfVxuXG4gICAgY2hlY2tPdXRPZlNjcmVlbigpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0XG4gICAgICAgICk7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEdyb3VuZCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcbiAgICB9KSB7XG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xuXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XG4gICAgICAgIGxldCBtb2RpZmllZFdpZHRoID0gNTA7XG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIG1vZGlmaWVkV2lkdGgsIG1vZGlmaWVkSGVpZ2h0LCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXG4gICAgICAgICAgICBsYWJlbDogJ2Zha2VCb3R0b21QYXJ0JyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5mYWtlQm90dG9tUGFydCk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IDIwO1xuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XG4gICAgICAgIHRoaXMubW9kaWZpZWRXaWR0aCA9IG1vZGlmaWVkV2lkdGg7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIGxldCBib2R5VmVydGljZXMgPSB0aGlzLmJvZHkudmVydGljZXM7XG4gICAgICAgIGxldCBmYWtlQm90dG9tVmVydGljZXMgPSB0aGlzLmZha2VCb3R0b21QYXJ0LnZlcnRpY2VzO1xuICAgICAgICBsZXQgdmVydGljZXMgPSBbXG4gICAgICAgICAgICBib2R5VmVydGljZXNbMF0sIFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzFdLFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzJdLFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzFdLCBcbiAgICAgICAgICAgIGZha2VCb3R0b21WZXJ0aWNlc1syXSwgXG4gICAgICAgICAgICBmYWtlQm90dG9tVmVydGljZXNbM10sIFxuICAgICAgICAgICAgZmFrZUJvdHRvbVZlcnRpY2VzWzBdLFxuICAgICAgICAgICAgYm9keVZlcnRpY2VzWzNdXG4gICAgICAgIF07XG5cblxuICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB2ZXJ0ZXgodmVydGljZXNbaV0ueCwgdmVydGljZXNbaV0ueSk7XG4gICAgICAgIGVuZFNoYXBlKCk7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cblxuXG5jbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdvcmxkLCBjYXRBbmRNYXNrID0ge1xuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxuICAgIH0pIHtcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgMjAsIHtcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyMDtcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xuXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XG5cbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcbiAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcblxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWUgPSA1O1xuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XG4gICAgICAgIHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWUgPSAwLjE7XG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYm9keS5kYW1hZ2VMZXZlbCA9IDE7XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgIH1cblxuICAgIHNldENvbnRyb2xLZXlzKGtleXMpIHtcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xuXG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XG5cbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xuXG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XG5cbiAgICAgICAgLy8gZWxsaXBzZSgtdGhpcy5yYWRpdXMgKiAxLjUsIDAsIDUpO1xuXG4gICAgICAgIHN0cm9rZVdlaWdodCgxKTtcbiAgICAgICAgc3Ryb2tlKDApO1xuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XG5cbiAgICAgICAgcG9wKCk7XG4gICAgfVxuXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1syXV0pIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbM11dKSB7XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzJdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1szXV0pIHx8XG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1szXV0pKSB7XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG5cbiAgICAgICAgbGV0IGFic1hWZWxvY2l0eSA9IGFicyh4VmVsb2NpdHkpO1xuICAgICAgICBsZXQgc2lnbiA9IHhWZWxvY2l0eSA8IDAgPyAtMSA6IDE7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzBdXSkge1xuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIHg6IC0wLjAwNSxcbiAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMV1dKSB7XG4gICAgICAgICAgICBpZiAoYWJzWFZlbG9jaXR5ID4gdGhpcy5tb3ZlbWVudFNwZWVkKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpZ24sXG4gICAgICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuYXBwbHlGb3JjZSh0aGlzLmJvZHksIHRoaXMuYm9keS5wb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIHg6IDAuMDA1LFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmRPYmplY3RzKSB7XG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcblxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNV1dKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYm9keS5ncm91bmRlZCAmJiB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPCB0aGlzLm1heEp1bXBOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYm9keS5ncm91bmRlZCkge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XG4gICAgfVxuXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XG5cbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcblxuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbNF1dKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcblxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIWFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSAmJiB0aGlzLmNoYXJnZVN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kT2JqZWN0cykge1xuICAgICAgICB0aGlzLnJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cyk7XG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZE9iamVjdHMpO1xuXG4gICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uY2hlY2tWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uY2hlY2tPdXRPZlNjcmVlbigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG5cbmxldCBlbmdpbmU7XG5sZXQgd29ybGQ7XG5cbmxldCBncm91bmRzID0gW107XG5sZXQgcGxheWVycyA9IFtdO1xubGV0IGV4cGxvc2lvbnMgPSBbXTtcbmxldCBtaW5Gb3JjZU1hZ25pdHVkZSA9IDIwO1xuXG5jb25zdCBwbGF5ZXJLZXlzID0gW1xuICAgIFszNywgMzksIDM4LCA0MCwgMTMsIDMyXSxcbiAgICBbNjUsIDY4LCA4NywgODMsIDE2LCAxOF1cbl07XG5cbmNvbnN0IGtleVN0YXRlcyA9IHtcbiAgICAxMzogZmFsc2UsIC8vIEVOVEVSXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxuICAgIDM4OiBmYWxzZSwgLy8gVVBcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXG4gICAgODc6IGZhbHNlLCAvLyBXXG4gICAgNjU6IGZhbHNlLCAvLyBBXG4gICAgODM6IGZhbHNlLCAvLyBTXG4gICAgNjg6IGZhbHNlLCAvLyBEXG4gICAgMTY6IGZhbHNlLCAvLyBTaGlmdFxuICAgIDE4OiBmYWxzZSAvLyBBbHRcbn07XG5cbmNvbnN0IGdyb3VuZENhdGVnb3J5ID0gMHgwMDAxO1xuY29uc3QgcGxheWVyQ2F0ZWdvcnkgPSAweDAwMDI7XG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcbmNvbnN0IGJ1bGxldENvbGxpc2lvbkxheWVyID0gMHgwMDA4O1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcbiAgICB3b3JsZCA9IGVuZ2luZS53b3JsZDtcblxuICAgIE1hdHRlci5FdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBjb2xsaXNpb25FdmVudCk7XG5cbiAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRoOyBpICs9IHdpZHRoKSB7XG4gICAgLy8gICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgxMDAsIDMwMCk7XG4gICAgLy8gICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCB3aWR0aCwgcmFuZG9tVmFsdWUsIHdvcmxkKSk7XG4gICAgLy8gfVxuXG4gICAgZm9yIChsZXQgaSA9IDI1OyBpIDwgd2lkdGg7IGkgKz0gMjUwKSB7XG4gICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgxMDAsIDMwMCk7XG4gICAgICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyA1MCwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAyMDAsIHJhbmRvbVZhbHVlLCB3b3JsZCkpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgIGlmICghZ3JvdW5kc1tpXSlcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKGdyb3VuZHNbaV0uYm9keS5wb3NpdGlvbi54LCAwLCB3b3JsZCkpO1xuICAgICAgICBwbGF5ZXJzW2ldLnNldENvbnRyb2xLZXlzKHBsYXllcktleXNbaV0pO1xuICAgIH1cblxuICAgIHJlY3RNb2RlKENFTlRFUik7XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcbiAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZShlbmdpbmUpO1xuXG4gICAgZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICB9KTtcblxuICAgIHBsYXllcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcywgZ3JvdW5kcyk7XG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwbG9zaW9uc1tpXS5zaG93KCk7XG4gICAgICAgIGV4cGxvc2lvbnNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKGV4cGxvc2lvbnNbaV0uaXNDb21wbGV0ZSgpKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbGwoMjU1KTtcbiAgICB0ZXh0U2l6ZSgzMCk7XG4gICAgdGV4dChgJHtyb3VuZChmcmFtZVJhdGUoKSl9YCwgd2lkdGggLSA3NSwgNTApXG59XG5cbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSkge1xuICAgIHBsYXllci5kYW1hZ2VMZXZlbCArPSBiYXNpY0ZpcmUuZGFtYWdlQW1vdW50O1xuXG4gICAgYmFzaWNGaXJlLmRhbWFnZWRQbGF5ZXIgPSB0cnVlO1xuICAgIGJhc2ljRmlyZS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICB9O1xuXG4gICAgbGV0IGJ1bGxldFBvcyA9IGNyZWF0ZVZlY3RvcihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnkpO1xuICAgIGxldCBwbGF5ZXJQb3MgPSBjcmVhdGVWZWN0b3IocGxheWVyLnBvc2l0aW9uLngsIHBsYXllci5wb3NpdGlvbi55KTtcblxuICAgIGxldCBkaXJlY3Rpb25WZWN0b3IgPSBwNS5WZWN0b3Iuc3ViKHBsYXllclBvcywgYnVsbGV0UG9zKTtcbiAgICBkaXJlY3Rpb25WZWN0b3Iuc2V0TWFnKG1pbkZvcmNlTWFnbml0dWRlICogcGxheWVyLmRhbWFnZUxldmVsKTtcblxuICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UocGxheWVyLCBwbGF5ZXIucG9zaXRpb24sIHtcbiAgICAgICAgeDogZGlyZWN0aW9uVmVjdG9yLngsXG4gICAgICAgIHk6IGRpcmVjdGlvblZlY3Rvci55XG4gICAgfSk7XG5cbiAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihiYXNpY0ZpcmUucG9zaXRpb24ueCwgYmFzaWNGaXJlLnBvc2l0aW9uLnksIDEwKSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxpc2lvbkV2ZW50KGV2ZW50KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbGFiZWxBID0gZXZlbnQucGFpcnNbaV0uYm9keUEubGFiZWw7XG4gICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcblxuICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxCLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxmYWtlQm90dG9tUGFydCkkLykpKSB7XG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jb2xsaXNpb25GaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQS5tYXRjaCgvXihzdGF0aWNHcm91bmR8ZmFrZUJvdHRvbVBhcnQpJC8pKSkge1xuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScpIHtcbiAgICAgICAgICAgIGxldCBiYXNpY0ZpcmUgPSBldmVudC5wYWlyc1tpXS5ib2R5QTtcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBldmVudC5wYWlyc1tpXS5ib2R5QjtcbiAgICAgICAgICAgIGRhbWFnZVBsYXllckJhc2ljKHBsYXllciwgYmFzaWNGaXJlKTtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=
