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
        this.fakeBottomPart = Matter.Bodies.rectangle(x, y + 10, groundWidth, modifiedHeight, {
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
    }

    _createClass(Ground, [{
        key: 'show',
        value: function show() {
            fill(255, 0, 0);
            noStroke();

            var bodyVertices = this.body.vertices;
            var fakeBottomVertices = this.fakeBottomPart.vertices;
            var vertices = [bodyVertices[0], bodyVertices[1], fakeBottomVertices[2], fakeBottomVertices[3]];

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

var playerKeys = [[37, 39, 38, 40, 13, 32], [65, 68, 87, 83, 49, 50]];

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
    49: false,
    50: false };

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJFeHBsb3Npb24iLCJzcGF3blgiLCJzcGF3blkiLCJncmF2aXR5IiwicmFuZG9tQ29sb3IiLCJpbnQiLCJwYXJ0aWNsZXMiLCJleHBsb2RlIiwiaSIsInBhcnRpY2xlIiwicHVzaCIsImZvckVhY2giLCJzaG93IiwibGVuZ3RoIiwiYXBwbHlGb3JjZSIsInVwZGF0ZSIsImlzVmlzaWJsZSIsInNwbGljZSIsIkJhc2ljRmlyZSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwibW92ZW1lbnRTcGVlZCIsImRhbWFnZWRQbGF5ZXIiLCJkYW1hZ2VBbW91bnQiLCJzZXRWZWxvY2l0eSIsImZpbGwiLCJub1N0cm9rZSIsInBvcyIsInRyYW5zbGF0ZSIsImVsbGlwc2UiLCJwb3AiLCJCb2R5IiwiY29zIiwic2luIiwicmVtb3ZlIiwic3FydCIsInNxIiwid2lkdGgiLCJoZWlnaHQiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsImdyb3VuZENhdGVnb3J5IiwicGxheWVyQ2F0ZWdvcnkiLCJiYXNpY0ZpcmVDYXRlZ29yeSIsImJ1bGxldENvbGxpc2lvbkxheWVyIiwibW9kaWZpZWRZIiwicmVjdGFuZ2xlIiwiaXNTdGF0aWMiLCJtb2RpZmllZEhlaWdodCIsImZha2VCb3R0b21QYXJ0IiwiYm9keVZlcnRpY2VzIiwidmVydGljZXMiLCJmYWtlQm90dG9tVmVydGljZXMiLCJiZWdpblNoYXBlIiwidmVydGV4IiwiZW5kU2hhcGUiLCJQbGF5ZXIiLCJhbmd1bGFyVmVsb2NpdHkiLCJqdW1wSGVpZ2h0IiwianVtcEJyZWF0aGluZ1NwYWNlIiwiZ3JvdW5kZWQiLCJtYXhKdW1wTnVtYmVyIiwiY3VycmVudEp1bXBOdW1iZXIiLCJidWxsZXRzIiwiaW5pdGlhbENoYXJnZVZhbHVlIiwibWF4Q2hhcmdlVmFsdWUiLCJjdXJyZW50Q2hhcmdlVmFsdWUiLCJjaGFyZ2VJbmNyZW1lbnRWYWx1ZSIsImNoYXJnZVN0YXJ0ZWQiLCJkYW1hZ2VMZXZlbCIsImtleXMiLCJyb3RhdGUiLCJyZWN0IiwibGluZSIsImFjdGl2ZUtleXMiLCJzZXRBbmd1bGFyVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ5VmVsb2NpdHkiLCJ4VmVsb2NpdHkiLCJhYnNYVmVsb2NpdHkiLCJhYnMiLCJzaWduIiwiZ3JvdW5kT2JqZWN0cyIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiY2hlY2tWZWxvY2l0eVplcm8iLCJjaGVja091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwiZW5naW5lIiwiZ3JvdW5kcyIsInBsYXllcnMiLCJleHBsb3Npb25zIiwibWluRm9yY2VNYWduaXR1ZGUiLCJwbGF5ZXJLZXlzIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJFbmdpbmUiLCJjcmVhdGUiLCJFdmVudHMiLCJvbiIsImNvbGxpc2lvbkV2ZW50IiwicmFuZG9tVmFsdWUiLCJzZXRDb250cm9sS2V5cyIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJlbGVtZW50IiwiaXNDb21wbGV0ZSIsInRleHRTaXplIiwidGV4dCIsInJvdW5kIiwiZnJhbWVSYXRlIiwia2V5UHJlc3NlZCIsImtleUNvZGUiLCJrZXlSZWxlYXNlZCIsImRhbWFnZVBsYXllckJhc2ljIiwicGxheWVyIiwiYmFzaWNGaXJlIiwiYnVsbGV0UG9zIiwicGxheWVyUG9zIiwiZGlyZWN0aW9uVmVjdG9yIiwic3ViIiwic2V0TWFnIiwiZXZlbnQiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU1BLFE7QUFDRixzQkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxXQUFsQixFQUErQkMsZUFBL0IsRUFBZ0Q7QUFBQTs7QUFDNUMsYUFBS0MsUUFBTCxHQUFnQkMsYUFBYUwsQ0FBYixFQUFnQkMsQ0FBaEIsQ0FBaEI7QUFDQSxhQUFLSyxRQUFMLEdBQWdCQyxHQUFHQyxNQUFILENBQVVDLFFBQVYsRUFBaEI7QUFDQSxhQUFLSCxRQUFMLENBQWNJLElBQWQsQ0FBbUJDLE9BQU8sQ0FBUCxFQUFVLEVBQVYsQ0FBbkI7QUFDQSxhQUFLQyxZQUFMLEdBQW9CUCxhQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBcEI7O0FBRUEsYUFBS1EsS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLWCxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLGFBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0g7Ozs7bUNBRVVXLEssRUFBTztBQUNkLGlCQUFLRixZQUFMLENBQWtCRyxHQUFsQixDQUFzQkQsS0FBdEI7QUFDSDs7OytCQUVNO0FBQ0gsZ0JBQUlFLGFBQWFDLGdCQUFjLEtBQUtmLFdBQW5CLHFCQUE4QyxLQUFLVyxLQUFuRCxPQUFqQjtBQUNBLGdCQUFJSyxxQkFBcUJDLElBQUksS0FBS04sS0FBVCxFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLVixlQUE5QixDQUF6Qjs7QUFFQWlCLHlCQUFhRixrQkFBYjtBQUNBRyxtQkFBT0wsVUFBUDtBQUNBTSxrQkFBTSxLQUFLbEIsUUFBTCxDQUFjSixDQUFwQixFQUF1QixLQUFLSSxRQUFMLENBQWNILENBQXJDOztBQUVBLGlCQUFLWSxLQUFMLElBQWMsSUFBZDtBQUNIOzs7aUNBRVE7QUFDTCxpQkFBS1AsUUFBTCxDQUFjSSxJQUFkLENBQW1CLEdBQW5COztBQUVBLGlCQUFLSixRQUFMLENBQWNTLEdBQWQsQ0FBa0IsS0FBS0gsWUFBdkI7QUFDQSxpQkFBS1IsUUFBTCxDQUFjVyxHQUFkLENBQWtCLEtBQUtULFFBQXZCO0FBQ0EsaUJBQUtNLFlBQUwsQ0FBa0JGLElBQWxCLENBQXVCLENBQXZCO0FBQ0g7OztvQ0FFVztBQUNSLG1CQUFPLEtBQUtHLEtBQUwsR0FBYSxDQUFwQjtBQUNIOzs7Ozs7SUFJQ1UsUztBQUNGLHVCQUFZQyxNQUFaLEVBQW9CQyxNQUFwQixFQUE0QnRCLGVBQTVCLEVBQTZDO0FBQUE7O0FBQ3pDLGFBQUtDLFFBQUwsR0FBZ0JDLGFBQWFtQixNQUFiLEVBQXFCQyxNQUFyQixDQUFoQjtBQUNBLGFBQUtDLE9BQUwsR0FBZXJCLGFBQWEsQ0FBYixFQUFnQixHQUFoQixDQUFmO0FBQ0EsYUFBS0YsZUFBTCxHQUF1QkEsZUFBdkI7O0FBRUEsWUFBSXdCLGNBQWNDLElBQUlqQixPQUFPLENBQVAsRUFBVSxHQUFWLENBQUosQ0FBbEI7QUFDQSxhQUFLTSxLQUFMLEdBQWFVLFdBQWI7O0FBRUEsYUFBS0UsU0FBTCxHQUFpQixFQUFqQjtBQUNBLGFBQUtDLE9BQUw7QUFDSDs7OztrQ0FFUztBQUNOLGlCQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSSxHQUFwQixFQUF5QkEsR0FBekIsRUFBOEI7QUFDMUIsb0JBQUlDLFdBQVcsSUFBSWpDLFFBQUosQ0FBYSxLQUFLSyxRQUFMLENBQWNKLENBQTNCLEVBQThCLEtBQUtJLFFBQUwsQ0FBY0gsQ0FBNUMsRUFBK0MsS0FBS2dCLEtBQXBELEVBQTJELEtBQUtkLGVBQWhFLENBQWY7QUFDQSxxQkFBSzBCLFNBQUwsQ0FBZUksSUFBZixDQUFvQkQsUUFBcEI7QUFDSDtBQUNKOzs7K0JBRU07QUFDSCxpQkFBS0gsU0FBTCxDQUFlSyxPQUFmLENBQXVCLG9CQUFZO0FBQy9CRix5QkFBU0csSUFBVDtBQUNILGFBRkQ7QUFHSDs7O2lDQUVRO0FBQ0wsaUJBQUssSUFBSUosSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUtGLFNBQUwsQ0FBZU8sTUFBbkMsRUFBMkNMLEdBQTNDLEVBQWdEO0FBQzVDLHFCQUFLRixTQUFMLENBQWVFLENBQWYsRUFBa0JNLFVBQWxCLENBQTZCLEtBQUtYLE9BQWxDO0FBQ0EscUJBQUtHLFNBQUwsQ0FBZUUsQ0FBZixFQUFrQk8sTUFBbEI7O0FBRUEsb0JBQUksQ0FBQyxLQUFLVCxTQUFMLENBQWVFLENBQWYsRUFBa0JRLFNBQWxCLEVBQUwsRUFBb0M7QUFDaEMseUJBQUtWLFNBQUwsQ0FBZVcsTUFBZixDQUFzQlQsQ0FBdEIsRUFBeUIsQ0FBekI7QUFDQUEseUJBQUssQ0FBTDtBQUNIO0FBQ0o7QUFDSjs7O3FDQUVZO0FBQ1QsbUJBQU8sS0FBS0YsU0FBTCxDQUFlTyxNQUFmLEtBQTBCLENBQWpDO0FBQ0g7Ozs7OztJQUlDSyxTO0FBQ0YsdUJBQVl6QyxDQUFaLEVBQWVDLENBQWYsRUFBa0J5QyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUNDLEtBQWpDLEVBQXdDQyxVQUF4QyxFQUFvRDtBQUFBOztBQUNoRCxhQUFLSCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxhQUFLSSxJQUFMLEdBQVlDLE9BQU9DLE1BQVAsQ0FBY0MsTUFBZCxDQUFxQmpELENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQixLQUFLeUMsTUFBaEMsRUFBd0M7QUFDaERRLG1CQUFPLFdBRHlDO0FBRWhEQyxzQkFBVSxHQUZzQztBQUdoREMseUJBQWEsR0FIbUM7QUFJaERDLDZCQUFpQjtBQUNiQywwQkFBVVQsV0FBV1MsUUFEUjtBQUViQyxzQkFBTVYsV0FBV1U7QUFGSjtBQUorQixTQUF4QyxDQUFaO0FBU0FSLGVBQU9TLEtBQVAsQ0FBYXpDLEdBQWIsQ0FBaUI2QixLQUFqQixFQUF3QixLQUFLRSxJQUE3Qjs7QUFFQSxhQUFLVyxhQUFMLEdBQXFCLEtBQUtmLE1BQUwsR0FBYyxHQUFuQztBQUNBLGFBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtDLEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxhQUFLRSxJQUFMLENBQVVZLGFBQVYsR0FBMEIsS0FBMUI7QUFDQSxhQUFLWixJQUFMLENBQVVhLFlBQVYsR0FBeUIsS0FBS2pCLE1BQUwsR0FBYyxDQUF2Qzs7QUFFQSxhQUFLa0IsV0FBTDtBQUNIOzs7OytCQUVNO0FBQ0gsZ0JBQUksQ0FBQyxLQUFLZCxJQUFMLENBQVVZLGFBQWYsRUFBOEI7O0FBRTFCRyxxQkFBSyxHQUFMO0FBQ0FDOztBQUVBLG9CQUFJQyxNQUFNLEtBQUtqQixJQUFMLENBQVUxQyxRQUFwQjs7QUFFQTZCO0FBQ0ErQiwwQkFBVUQsSUFBSS9ELENBQWQsRUFBaUIrRCxJQUFJOUQsQ0FBckI7QUFDQWdFLHdCQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsS0FBS3ZCLE1BQUwsR0FBYyxDQUE1QjtBQUNBd0I7QUFDSDtBQUNKOzs7c0NBRWE7QUFDVm5CLG1CQUFPb0IsSUFBUCxDQUFZUCxXQUFaLENBQXdCLEtBQUtkLElBQTdCLEVBQW1DO0FBQy9COUMsbUJBQUcsS0FBS3lELGFBQUwsR0FBcUJXLElBQUksS0FBS3pCLEtBQVQsQ0FETztBQUUvQjFDLG1CQUFHLEtBQUt3RCxhQUFMLEdBQXFCWSxJQUFJLEtBQUsxQixLQUFUO0FBRk8sYUFBbkM7QUFJSDs7OzBDQUVpQjtBQUNkSSxtQkFBT1MsS0FBUCxDQUFhYyxNQUFiLENBQW9CLEtBQUsxQixLQUF6QixFQUFnQyxLQUFLRSxJQUFyQztBQUNIOzs7NENBRW1CO0FBQ2hCLGdCQUFJeEMsV0FBVyxLQUFLd0MsSUFBTCxDQUFVeEMsUUFBekI7QUFDQSxtQkFBT2lFLEtBQUtDLEdBQUdsRSxTQUFTTixDQUFaLElBQWlCd0UsR0FBR2xFLFNBQVNMLENBQVosQ0FBdEIsS0FBeUMsSUFBaEQ7QUFDSDs7OzJDQUVrQjtBQUNmLGdCQUFJOEQsTUFBTSxLQUFLakIsSUFBTCxDQUFVMUMsUUFBcEI7QUFDQSxtQkFDSTJELElBQUkvRCxDQUFKLEdBQVF5RSxLQUFSLElBQWlCVixJQUFJL0QsQ0FBSixHQUFRLENBQXpCLElBQThCK0QsSUFBSTlELENBQUosR0FBUXlFLE1BRDFDO0FBR0g7Ozs7OztJQUlDQyxNO0FBQ0Ysb0JBQVkzRSxDQUFaLEVBQWVDLENBQWYsRUFBa0IyRSxXQUFsQixFQUErQkMsWUFBL0IsRUFBNkNqQyxLQUE3QyxFQUdHO0FBQUEsWUFIaURDLFVBR2pELHVFQUg4RDtBQUM3RFMsc0JBQVV3QixjQURtRDtBQUU3RHZCLGtCQUFNdUIsaUJBQWlCQyxjQUFqQixHQUFrQ0MsaUJBQWxDLEdBQXNEQztBQUZDLFNBRzlEOztBQUFBOztBQUNDLFlBQUlDLFlBQVlqRixJQUFJNEUsZUFBZSxDQUFuQixHQUF1QixFQUF2Qzs7QUFFQSxhQUFLL0IsSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNtQyxTQUFkLENBQXdCbkYsQ0FBeEIsRUFBMkJrRixTQUEzQixFQUFzQ04sV0FBdEMsRUFBbUQsRUFBbkQsRUFBdUQ7QUFDL0RRLHNCQUFVLElBRHFEO0FBRS9EakMsc0JBQVUsQ0FGcUQ7QUFHL0RDLHlCQUFhLENBSGtEO0FBSS9ERixtQkFBTyxjQUp3RDtBQUsvREcsNkJBQWlCO0FBQ2JDLDBCQUFVVCxXQUFXUyxRQURSO0FBRWJDLHNCQUFNVixXQUFXVTtBQUZKO0FBTDhDLFNBQXZELENBQVo7O0FBV0EsWUFBSThCLGlCQUFpQlIsZUFBZSxFQUFwQztBQUNBLGFBQUtTLGNBQUwsR0FBc0J2QyxPQUFPQyxNQUFQLENBQWNtQyxTQUFkLENBQXdCbkYsQ0FBeEIsRUFBMkJDLElBQUksRUFBL0IsRUFBbUMyRSxXQUFuQyxFQUFnRFMsY0FBaEQsRUFBZ0U7QUFDbEZELHNCQUFVLElBRHdFO0FBRWxGakMsc0JBQVUsQ0FGd0U7QUFHbEZDLHlCQUFhLENBSHFFO0FBSWxGRixtQkFBTyxnQkFKMkU7QUFLbEZHLDZCQUFpQjtBQUNiQywwQkFBVVQsV0FBV1MsUUFEUjtBQUViQyxzQkFBTVYsV0FBV1U7QUFGSjtBQUxpRSxTQUFoRSxDQUF0QjtBQVVBUixlQUFPUyxLQUFQLENBQWF6QyxHQUFiLENBQWlCNkIsS0FBakIsRUFBd0IsS0FBSzBDLGNBQTdCO0FBQ0F2QyxlQUFPUyxLQUFQLENBQWF6QyxHQUFiLENBQWlCNkIsS0FBakIsRUFBd0IsS0FBS0UsSUFBN0I7O0FBRUEsYUFBSzJCLEtBQUwsR0FBYUcsV0FBYjtBQUNBLGFBQUtGLE1BQUwsR0FBYyxFQUFkO0FBQ0EsYUFBS1csY0FBTCxHQUFzQkEsY0FBdEI7QUFDSDs7OzsrQkFFTTtBQUNIeEIsaUJBQUssR0FBTCxFQUFVLENBQVYsRUFBYSxDQUFiO0FBQ0FDOztBQUVBLGdCQUFJeUIsZUFBZSxLQUFLekMsSUFBTCxDQUFVMEMsUUFBN0I7QUFDQSxnQkFBSUMscUJBQXFCLEtBQUtILGNBQUwsQ0FBb0JFLFFBQTdDO0FBQ0EsZ0JBQUlBLFdBQVcsQ0FBQ0QsYUFBYSxDQUFiLENBQUQsRUFBa0JBLGFBQWEsQ0FBYixDQUFsQixFQUFtQ0UsbUJBQW1CLENBQW5CLENBQW5DLEVBQTBEQSxtQkFBbUIsQ0FBbkIsQ0FBMUQsQ0FBZjs7QUFFQUM7QUFDQSxpQkFBSyxJQUFJM0QsSUFBSSxDQUFiLEVBQWdCQSxJQUFJeUQsU0FBU3BELE1BQTdCLEVBQXFDTCxHQUFyQztBQUNJNEQsdUJBQU9ILFNBQVN6RCxDQUFULEVBQVkvQixDQUFuQixFQUFzQndGLFNBQVN6RCxDQUFULEVBQVk5QixDQUFsQztBQURKLGFBRUEyRjtBQUNIOzs7Ozs7SUFNQ0MsTTtBQUNGLG9CQUFZN0YsQ0FBWixFQUFlQyxDQUFmLEVBQWtCMkMsS0FBbEIsRUFHRztBQUFBLFlBSHNCQyxVQUd0Qix1RUFIbUM7QUFDbENTLHNCQUFVeUIsY0FEd0I7QUFFbEN4QixrQkFBTXVCLGlCQUFpQkMsY0FBakIsR0FBa0NDO0FBRk4sU0FHbkM7O0FBQUE7O0FBQ0MsYUFBS2xDLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjQyxNQUFkLENBQXFCakQsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCLEVBQTNCLEVBQStCO0FBQ3ZDaUQsbUJBQU8sUUFEZ0M7QUFFdkNDLHNCQUFVLEdBRjZCO0FBR3ZDQyx5QkFBYSxHQUgwQjtBQUl2Q0MsNkJBQWlCO0FBQ2JDLDBCQUFVVCxXQUFXUyxRQURSO0FBRWJDLHNCQUFNVixXQUFXVTtBQUZKO0FBSnNCLFNBQS9CLENBQVo7QUFTQVIsZUFBT1MsS0FBUCxDQUFhekMsR0FBYixDQUFpQjZCLEtBQWpCLEVBQXdCLEtBQUtFLElBQTdCO0FBQ0EsYUFBS0YsS0FBTCxHQUFhQSxLQUFiOztBQUVBLGFBQUtGLE1BQUwsR0FBYyxFQUFkO0FBQ0EsYUFBS2UsYUFBTCxHQUFxQixFQUFyQjtBQUNBLGFBQUtxQyxlQUFMLEdBQXVCLEdBQXZCOztBQUVBLGFBQUtDLFVBQUwsR0FBa0IsRUFBbEI7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixDQUExQjs7QUFFQSxhQUFLbEQsSUFBTCxDQUFVbUQsUUFBVixHQUFxQixJQUFyQjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxhQUFLcEQsSUFBTCxDQUFVcUQsaUJBQVYsR0FBOEIsQ0FBOUI7O0FBRUEsYUFBS0MsT0FBTCxHQUFlLEVBQWY7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixDQUExQjtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsRUFBdEI7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixLQUFLRixrQkFBL0I7QUFDQSxhQUFLRyxvQkFBTCxHQUE0QixHQUE1QjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsS0FBckI7O0FBRUEsYUFBSzNELElBQUwsQ0FBVTRELFdBQVYsR0FBd0IsQ0FBeEI7QUFDQSxhQUFLQyxJQUFMLEdBQVksRUFBWjtBQUNIOzs7O3VDQUVjQSxJLEVBQU07QUFDakIsaUJBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNIOzs7K0JBRU07QUFDSDlDLGlCQUFLLENBQUwsRUFBUSxHQUFSLEVBQWEsQ0FBYjtBQUNBQzs7QUFFQSxnQkFBSUMsTUFBTSxLQUFLakIsSUFBTCxDQUFVMUMsUUFBcEI7QUFDQSxnQkFBSXVDLFFBQVEsS0FBS0csSUFBTCxDQUFVSCxLQUF0Qjs7QUFFQVY7QUFDQStCLHNCQUFVRCxJQUFJL0QsQ0FBZCxFQUFpQitELElBQUk5RCxDQUFyQjtBQUNBMkcsbUJBQU9qRSxLQUFQOztBQUVBc0Isb0JBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxLQUFLdkIsTUFBTCxHQUFjLENBQTVCOztBQUVBbUIsaUJBQUssR0FBTDtBQUNBSSxvQkFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLEtBQUt2QixNQUFuQjtBQUNBbUUsaUJBQUssSUFBSSxLQUFLbkUsTUFBTCxHQUFjLENBQXZCLEVBQTBCLENBQTFCLEVBQTZCLEtBQUtBLE1BQUwsR0FBYyxHQUEzQyxFQUFnRCxLQUFLQSxNQUFMLEdBQWMsQ0FBOUQ7O0FBSUF0Qix5QkFBYSxDQUFiO0FBQ0FDLG1CQUFPLENBQVA7QUFDQXlGLGlCQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsS0FBS3BFLE1BQUwsR0FBYyxJQUF6QixFQUErQixDQUEvQjs7QUFFQXdCO0FBQ0g7OztzQ0FFYTZDLFUsRUFBWTtBQUN0QixnQkFBSUEsV0FBVyxLQUFLSixJQUFMLENBQVUsQ0FBVixDQUFYLENBQUosRUFBOEI7QUFDMUI1RCx1QkFBT29CLElBQVAsQ0FBWTZDLGtCQUFaLENBQStCLEtBQUtsRSxJQUFwQyxFQUEwQyxDQUFDLEtBQUtnRCxlQUFoRDtBQUNILGFBRkQsTUFFTyxJQUFJaUIsV0FBVyxLQUFLSixJQUFMLENBQVUsQ0FBVixDQUFYLENBQUosRUFBOEI7QUFDakM1RCx1QkFBT29CLElBQVAsQ0FBWTZDLGtCQUFaLENBQStCLEtBQUtsRSxJQUFwQyxFQUEwQyxLQUFLZ0QsZUFBL0M7QUFDSDs7QUFFRCxnQkFBSyxDQUFDbUIsVUFBVSxLQUFLTixJQUFMLENBQVUsQ0FBVixDQUFWLENBQUQsSUFBNEIsQ0FBQ00sVUFBVSxLQUFLTixJQUFMLENBQVUsQ0FBVixDQUFWLENBQTlCLElBQ0NNLFVBQVUsS0FBS04sSUFBTCxDQUFVLENBQVYsQ0FBVixLQUEyQk0sVUFBVSxLQUFLTixJQUFMLENBQVUsQ0FBVixDQUFWLENBRGhDLEVBQzBEO0FBQ3RENUQsdUJBQU9vQixJQUFQLENBQVk2QyxrQkFBWixDQUErQixLQUFLbEUsSUFBcEMsRUFBMEMsQ0FBMUM7QUFDSDtBQUNKOzs7dUNBRWNpRSxVLEVBQVk7QUFDdkIsZ0JBQUlHLFlBQVksS0FBS3BFLElBQUwsQ0FBVXhDLFFBQVYsQ0FBbUJMLENBQW5DO0FBQ0EsZ0JBQUlrSCxZQUFZLEtBQUtyRSxJQUFMLENBQVV4QyxRQUFWLENBQW1CTixDQUFuQzs7QUFFQSxnQkFBSW9ILGVBQWVDLElBQUlGLFNBQUosQ0FBbkI7QUFDQSxnQkFBSUcsT0FBT0gsWUFBWSxDQUFaLEdBQWdCLENBQUMsQ0FBakIsR0FBcUIsQ0FBaEM7O0FBRUEsZ0JBQUlKLFdBQVcsS0FBS0osSUFBTCxDQUFVLENBQVYsQ0FBWCxDQUFKLEVBQThCO0FBQzFCLG9CQUFJUyxlQUFlLEtBQUszRCxhQUF4QixFQUF1QztBQUNuQ1YsMkJBQU9vQixJQUFQLENBQVlQLFdBQVosQ0FBd0IsS0FBS2QsSUFBN0IsRUFBbUM7QUFDL0I5QywyQkFBRyxLQUFLeUQsYUFBTCxHQUFxQjZELElBRE87QUFFL0JySCwyQkFBR2lIO0FBRjRCLHFCQUFuQztBQUlIOztBQUVEbkUsdUJBQU9vQixJQUFQLENBQVk5QixVQUFaLENBQXVCLEtBQUtTLElBQTVCLEVBQWtDLEtBQUtBLElBQUwsQ0FBVTFDLFFBQTVDLEVBQXNEO0FBQ2xESix1QkFBRyxDQUFDLEtBRDhDO0FBRWxEQyx1QkFBRztBQUYrQyxpQkFBdEQ7O0FBS0E4Qyx1QkFBT29CLElBQVAsQ0FBWTZDLGtCQUFaLENBQStCLEtBQUtsRSxJQUFwQyxFQUEwQyxDQUExQztBQUNILGFBZEQsTUFjTyxJQUFJaUUsV0FBVyxLQUFLSixJQUFMLENBQVUsQ0FBVixDQUFYLENBQUosRUFBOEI7QUFDakMsb0JBQUlTLGVBQWUsS0FBSzNELGFBQXhCLEVBQXVDO0FBQ25DViwyQkFBT29CLElBQVAsQ0FBWVAsV0FBWixDQUF3QixLQUFLZCxJQUE3QixFQUFtQztBQUMvQjlDLDJCQUFHLEtBQUt5RCxhQUFMLEdBQXFCNkQsSUFETztBQUUvQnJILDJCQUFHaUg7QUFGNEIscUJBQW5DO0FBSUg7QUFDRG5FLHVCQUFPb0IsSUFBUCxDQUFZOUIsVUFBWixDQUF1QixLQUFLUyxJQUE1QixFQUFrQyxLQUFLQSxJQUFMLENBQVUxQyxRQUE1QyxFQUFzRDtBQUNsREosdUJBQUcsS0FEK0M7QUFFbERDLHVCQUFHO0FBRitDLGlCQUF0RDs7QUFLQThDLHVCQUFPb0IsSUFBUCxDQUFZNkMsa0JBQVosQ0FBK0IsS0FBS2xFLElBQXBDLEVBQTBDLENBQTFDO0FBQ0g7QUFDSjs7O3FDQUVZaUUsVSxFQUFZUSxhLEVBQWU7QUFDcEMsZ0JBQUlKLFlBQVksS0FBS3JFLElBQUwsQ0FBVXhDLFFBQVYsQ0FBbUJOLENBQW5DOztBQUVBLGdCQUFJK0csV0FBVyxLQUFLSixJQUFMLENBQVUsQ0FBVixDQUFYLENBQUosRUFBOEI7QUFDMUIsb0JBQUksQ0FBQyxLQUFLN0QsSUFBTCxDQUFVbUQsUUFBWCxJQUF1QixLQUFLbkQsSUFBTCxDQUFVcUQsaUJBQVYsR0FBOEIsS0FBS0QsYUFBOUQsRUFBNkU7QUFDekVuRCwyQkFBT29CLElBQVAsQ0FBWVAsV0FBWixDQUF3QixLQUFLZCxJQUE3QixFQUFtQztBQUMvQjlDLDJCQUFHbUgsU0FENEI7QUFFL0JsSCwyQkFBRyxDQUFDLEtBQUs4RjtBQUZzQixxQkFBbkM7QUFJQSx5QkFBS2pELElBQUwsQ0FBVXFELGlCQUFWO0FBQ0gsaUJBTkQsTUFNTyxJQUFJLEtBQUtyRCxJQUFMLENBQVVtRCxRQUFkLEVBQXdCO0FBQzNCbEQsMkJBQU9vQixJQUFQLENBQVlQLFdBQVosQ0FBd0IsS0FBS2QsSUFBN0IsRUFBbUM7QUFDL0I5QywyQkFBR21ILFNBRDRCO0FBRS9CbEgsMkJBQUcsQ0FBQyxLQUFLOEY7QUFGc0IscUJBQW5DO0FBSUEseUJBQUtqRCxJQUFMLENBQVVxRCxpQkFBVjtBQUNBLHlCQUFLckQsSUFBTCxDQUFVbUQsUUFBVixHQUFxQixLQUFyQjtBQUNIO0FBQ0o7O0FBRURjLHVCQUFXLEtBQUtKLElBQUwsQ0FBVSxDQUFWLENBQVgsSUFBMkIsS0FBM0I7QUFDSDs7O3dDQUVlM0csQyxFQUFHQyxDLEVBQUd5QyxNLEVBQVE7QUFDMUJtQixpQkFBSyxHQUFMO0FBQ0FDOztBQUVBRyxvQkFBUWpFLENBQVIsRUFBV0MsQ0FBWCxFQUFjeUMsU0FBUyxDQUF2QjtBQUNIOzs7dUNBRWNxRSxVLEVBQVk7QUFDdkIsZ0JBQUloRCxNQUFNLEtBQUtqQixJQUFMLENBQVUxQyxRQUFwQjtBQUNBLGdCQUFJdUMsUUFBUSxLQUFLRyxJQUFMLENBQVVILEtBQXRCOztBQUVBLGdCQUFJM0MsSUFBSSxLQUFLMEMsTUFBTCxHQUFjMEIsSUFBSXpCLEtBQUosQ0FBZCxHQUEyQixHQUEzQixHQUFpQ29CLElBQUkvRCxDQUE3QztBQUNBLGdCQUFJQyxJQUFJLEtBQUt5QyxNQUFMLEdBQWMyQixJQUFJMUIsS0FBSixDQUFkLEdBQTJCLEdBQTNCLEdBQWlDb0IsSUFBSTlELENBQTdDOztBQUVBLGdCQUFJOEcsV0FBVyxLQUFLSixJQUFMLENBQVUsQ0FBVixDQUFYLENBQUosRUFBOEI7QUFDMUIscUJBQUtGLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxxQkFBS0Ysa0JBQUwsSUFBMkIsS0FBS0Msb0JBQWhDOztBQUVBLHFCQUFLRCxrQkFBTCxHQUEwQixLQUFLQSxrQkFBTCxHQUEwQixLQUFLRCxjQUEvQixHQUN0QixLQUFLQSxjQURpQixHQUNBLEtBQUtDLGtCQUQvQjs7QUFHQSxxQkFBS2lCLGVBQUwsQ0FBcUJ4SCxDQUFyQixFQUF3QkMsQ0FBeEIsRUFBMkIsS0FBS3NHLGtCQUFoQztBQUVILGFBVEQsTUFTTyxJQUFJLENBQUNRLFdBQVcsS0FBS0osSUFBTCxDQUFVLENBQVYsQ0FBWCxDQUFELElBQTZCLEtBQUtGLGFBQXRDLEVBQXFEO0FBQ3hELHFCQUFLTCxPQUFMLENBQWFuRSxJQUFiLENBQWtCLElBQUlRLFNBQUosQ0FBY3pDLENBQWQsRUFBaUJDLENBQWpCLEVBQW9CLEtBQUtzRyxrQkFBekIsRUFBNkM1RCxLQUE3QyxFQUFvRCxLQUFLQyxLQUF6RCxFQUFnRTtBQUM5RVUsOEJBQVUwQixpQkFEb0U7QUFFOUV6QiwwQkFBTXVCLGlCQUFpQkMsY0FBakIsR0FBa0NDO0FBRnNDLGlCQUFoRSxDQUFsQjs7QUFLQSxxQkFBS3lCLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxxQkFBS0Ysa0JBQUwsR0FBMEIsS0FBS0Ysa0JBQS9CO0FBQ0g7QUFDSjs7OytCQUVNVSxVLEVBQVlRLGEsRUFBZTtBQUM5QixpQkFBS0UsYUFBTCxDQUFtQlYsVUFBbkI7QUFDQSxpQkFBS1csY0FBTCxDQUFvQlgsVUFBcEI7QUFDQSxpQkFBS1ksWUFBTCxDQUFrQlosVUFBbEIsRUFBOEJRLGFBQTlCOztBQUVBLGlCQUFLSyxjQUFMLENBQW9CYixVQUFwQjs7QUFFQSxpQkFBSyxJQUFJaEYsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUtxRSxPQUFMLENBQWFoRSxNQUFqQyxFQUF5Q0wsR0FBekMsRUFBOEM7QUFDMUMscUJBQUtxRSxPQUFMLENBQWFyRSxDQUFiLEVBQWdCSSxJQUFoQjs7QUFFQSxvQkFBSSxLQUFLaUUsT0FBTCxDQUFhckUsQ0FBYixFQUFnQjhGLGlCQUFoQixNQUF1QyxLQUFLekIsT0FBTCxDQUFhckUsQ0FBYixFQUFnQitGLGdCQUFoQixFQUEzQyxFQUErRTtBQUMzRSx5QkFBSzFCLE9BQUwsQ0FBYXJFLENBQWIsRUFBZ0JnRyxlQUFoQjtBQUNBLHlCQUFLM0IsT0FBTCxDQUFhNUQsTUFBYixDQUFvQlQsQ0FBcEIsRUFBdUIsQ0FBdkI7QUFDQUEseUJBQUssQ0FBTDtBQUNIO0FBQ0o7QUFDSjs7Ozs7O0FBT0wsSUFBSWlHLGVBQUo7QUFDQSxJQUFJcEYsY0FBSjs7QUFFQSxJQUFJcUYsVUFBVSxFQUFkO0FBQ0EsSUFBSUMsVUFBVSxFQUFkO0FBQ0EsSUFBSUMsYUFBYSxFQUFqQjtBQUNBLElBQUlDLG9CQUFvQixFQUF4Qjs7QUFFQSxJQUFNQyxhQUFhLENBQ2YsQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQsRUFBYSxFQUFiLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLENBRGUsRUFFZixDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFBcUIsRUFBckIsQ0FGZSxDQUFuQjs7QUFLQSxJQUFNcEIsWUFBWTtBQUNkLFFBQUksS0FEVTtBQUVkLFFBQUksS0FGVTtBQUdkLFFBQUksS0FIVTtBQUlkLFFBQUksS0FKVTtBQUtkLFFBQUksS0FMVTtBQU1kLFFBQUksS0FOVTtBQU9kLFFBQUksS0FQVTtBQVFkLFFBQUksS0FSVTtBQVNkLFFBQUksS0FUVTtBQVVkLFFBQUksS0FWVTtBQVdkLFFBQUksS0FYVTtBQVlkLFFBQUksS0FaVSxFQUFsQjs7QUFlQSxJQUFNbkMsaUJBQWlCLE1BQXZCO0FBQ0EsSUFBTUMsaUJBQWlCLE1BQXZCO0FBQ0EsSUFBTUMsb0JBQW9CLE1BQTFCO0FBQ0EsSUFBTUMsdUJBQXVCLE1BQTdCOztBQUVBLFNBQVNxRCxLQUFULEdBQWlCO0FBQ2IsUUFBSUMsU0FBU0MsYUFBYUMsT0FBT0MsVUFBUCxHQUFvQixFQUFqQyxFQUFxQ0QsT0FBT0UsV0FBUCxHQUFxQixFQUExRCxDQUFiO0FBQ0FKLFdBQU9LLE1BQVAsQ0FBYyxlQUFkO0FBQ0FaLGFBQVNqRixPQUFPOEYsTUFBUCxDQUFjQyxNQUFkLEVBQVQ7QUFDQWxHLFlBQVFvRixPQUFPcEYsS0FBZjs7QUFFQUcsV0FBT2dHLE1BQVAsQ0FBY0MsRUFBZCxDQUFpQmhCLE1BQWpCLEVBQXlCLGdCQUF6QixFQUEyQ2lCLGNBQTNDOztBQU9BLFNBQUssSUFBSWxILElBQUksRUFBYixFQUFpQkEsSUFBSTBDLEtBQXJCLEVBQTRCMUMsS0FBSyxHQUFqQyxFQUFzQztBQUNsQyxZQUFJbUgsY0FBY3ZJLE9BQU8sR0FBUCxFQUFZLEdBQVosQ0FBbEI7QUFDQXNILGdCQUFRaEcsSUFBUixDQUFhLElBQUkwQyxNQUFKLENBQVc1QyxJQUFJLEVBQWYsRUFBbUIyQyxTQUFTd0UsY0FBYyxDQUExQyxFQUE2QyxHQUE3QyxFQUFrREEsV0FBbEQsRUFBK0R0RyxLQUEvRCxDQUFiO0FBQ0g7O0FBRUQsU0FBSyxJQUFJYixLQUFJLENBQWIsRUFBZ0JBLEtBQUksQ0FBcEIsRUFBdUJBLElBQXZCLEVBQTRCO0FBQ3hCLFlBQUksQ0FBQ2tHLFFBQVFsRyxFQUFSLENBQUwsRUFDSTs7QUFFSm1HLGdCQUFRakcsSUFBUixDQUFhLElBQUk0RCxNQUFKLENBQVdvQyxRQUFRbEcsRUFBUixFQUFXZSxJQUFYLENBQWdCMUMsUUFBaEIsQ0FBeUJKLENBQXBDLEVBQXVDLENBQXZDLEVBQTBDNEMsS0FBMUMsQ0FBYjtBQUNBc0YsZ0JBQVFuRyxFQUFSLEVBQVdvSCxjQUFYLENBQTBCZCxXQUFXdEcsRUFBWCxDQUExQjtBQUNIOztBQUVEcUgsYUFBU0MsTUFBVDtBQUNIOztBQUVELFNBQVNDLElBQVQsR0FBZ0I7QUFDWkMsZUFBVyxDQUFYO0FBQ0F4RyxXQUFPOEYsTUFBUCxDQUFjdkcsTUFBZCxDQUFxQjBGLE1BQXJCOztBQUVBQyxZQUFRL0YsT0FBUixDQUFnQixtQkFBVztBQUN2QnNILGdCQUFRckgsSUFBUjtBQUNILEtBRkQ7O0FBSUErRixZQUFRaEcsT0FBUixDQUFnQixtQkFBVztBQUN2QnNILGdCQUFRckgsSUFBUjtBQUNBcUgsZ0JBQVFsSCxNQUFSLENBQWUyRSxTQUFmLEVBQTBCZ0IsT0FBMUI7QUFDSCxLQUhEOztBQUtBLFNBQUssSUFBSWxHLElBQUksQ0FBYixFQUFnQkEsSUFBSW9HLFdBQVcvRixNQUEvQixFQUF1Q0wsR0FBdkMsRUFBNEM7QUFDeENvRyxtQkFBV3BHLENBQVgsRUFBY0ksSUFBZDtBQUNBZ0csbUJBQVdwRyxDQUFYLEVBQWNPLE1BQWQ7O0FBRUEsWUFBSTZGLFdBQVdwRyxDQUFYLEVBQWMwSCxVQUFkLEVBQUosRUFBZ0M7QUFDNUJ0Qix1QkFBVzNGLE1BQVgsQ0FBa0JULENBQWxCLEVBQXFCLENBQXJCO0FBQ0FBLGlCQUFLLENBQUw7QUFDSDtBQUNKOztBQUVEOEIsU0FBSyxHQUFMO0FBQ0E2RixhQUFTLEVBQVQ7QUFDQUMsY0FBUUMsTUFBTUMsV0FBTixDQUFSLEVBQThCcEYsUUFBUSxFQUF0QyxFQUEwQyxFQUExQztBQUNIOztBQUVELFNBQVNxRixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVc5QyxTQUFmLEVBQ0lBLFVBQVU4QyxPQUFWLElBQXFCLElBQXJCOztBQUVKLFdBQU8sS0FBUDtBQUNIOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBVzlDLFNBQWYsRUFDSUEsVUFBVThDLE9BQVYsSUFBcUIsS0FBckI7O0FBRUosV0FBTyxLQUFQO0FBQ0g7O0FBRUQsU0FBU0UsaUJBQVQsQ0FBMkJDLE1BQTNCLEVBQW1DQyxTQUFuQyxFQUE4QztBQUMxQ0QsV0FBT3hELFdBQVAsSUFBc0J5RCxVQUFVeEcsWUFBaEM7O0FBRUF3RyxjQUFVekcsYUFBVixHQUEwQixJQUExQjtBQUNBeUcsY0FBVTlHLGVBQVYsR0FBNEI7QUFDeEJDLGtCQUFVMkIsb0JBRGM7QUFFeEIxQixjQUFNdUI7QUFGa0IsS0FBNUI7O0FBS0EsUUFBSXNGLFlBQVkvSixhQUFhOEosVUFBVS9KLFFBQVYsQ0FBbUJKLENBQWhDLEVBQW1DbUssVUFBVS9KLFFBQVYsQ0FBbUJILENBQXRELENBQWhCO0FBQ0EsUUFBSW9LLFlBQVloSyxhQUFhNkosT0FBTzlKLFFBQVAsQ0FBZ0JKLENBQTdCLEVBQWdDa0ssT0FBTzlKLFFBQVAsQ0FBZ0JILENBQWhELENBQWhCOztBQUVBLFFBQUlxSyxrQkFBa0IvSixHQUFHQyxNQUFILENBQVUrSixHQUFWLENBQWNGLFNBQWQsRUFBeUJELFNBQXpCLENBQXRCO0FBQ0FFLG9CQUFnQkUsTUFBaEIsQ0FBdUJwQyxvQkFBb0I4QixPQUFPeEQsV0FBbEQ7O0FBRUEzRCxXQUFPb0IsSUFBUCxDQUFZOUIsVUFBWixDQUF1QjZILE1BQXZCLEVBQStCQSxPQUFPOUosUUFBdEMsRUFBZ0Q7QUFDNUNKLFdBQUdzSyxnQkFBZ0J0SyxDQUR5QjtBQUU1Q0MsV0FBR3FLLGdCQUFnQnJLO0FBRnlCLEtBQWhEOztBQUtBa0ksZUFBV2xHLElBQVgsQ0FBZ0IsSUFBSVYsU0FBSixDQUFjNEksVUFBVS9KLFFBQVYsQ0FBbUJKLENBQWpDLEVBQW9DbUssVUFBVS9KLFFBQVYsQ0FBbUJILENBQXZELEVBQTBELEVBQTFELENBQWhCO0FBQ0g7O0FBRUQsU0FBU2dKLGNBQVQsQ0FBd0J3QixLQUF4QixFQUErQjtBQUMzQixTQUFLLElBQUkxSSxJQUFJLENBQWIsRUFBZ0JBLElBQUkwSSxNQUFNQyxLQUFOLENBQVl0SSxNQUFoQyxFQUF3Q0wsR0FBeEMsRUFBNkM7QUFDekMsWUFBSTRJLFNBQVNGLE1BQU1DLEtBQU4sQ0FBWTNJLENBQVosRUFBZTZJLEtBQWYsQ0FBcUIxSCxLQUFsQztBQUNBLFlBQUkySCxTQUFTSixNQUFNQyxLQUFOLENBQVkzSSxDQUFaLEVBQWUrSSxLQUFmLENBQXFCNUgsS0FBbEM7O0FBRUEsWUFBSXlILFdBQVcsV0FBWCxJQUEyQkUsT0FBT0UsS0FBUCxDQUFhLGlDQUFiLENBQS9CLEVBQWlGO0FBQzdFTixrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlNkksS0FBZixDQUFxQnZILGVBQXJCLEdBQXVDO0FBQ25DQywwQkFBVTJCLG9CQUR5QjtBQUVuQzFCLHNCQUFNdUI7QUFGNkIsYUFBdkM7QUFJSCxTQUxELE1BS08sSUFBSStGLFdBQVcsV0FBWCxJQUEyQkYsT0FBT0ksS0FBUCxDQUFhLGlDQUFiLENBQS9CLEVBQWlGO0FBQ3BGTixrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlK0ksS0FBZixDQUFxQnpILGVBQXJCLEdBQXVDO0FBQ25DQywwQkFBVTJCLG9CQUR5QjtBQUVuQzFCLHNCQUFNdUI7QUFGNkIsYUFBdkM7QUFJSDs7QUFFRCxZQUFJNkYsV0FBVyxRQUFYLElBQXVCRSxXQUFXLGNBQXRDLEVBQXNEO0FBQ2xESixrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlNkksS0FBZixDQUFxQjNFLFFBQXJCLEdBQWdDLElBQWhDO0FBQ0F3RSxrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlNkksS0FBZixDQUFxQnpFLGlCQUFyQixHQUF5QyxDQUF6QztBQUNILFNBSEQsTUFHTyxJQUFJMEUsV0FBVyxRQUFYLElBQXVCRixXQUFXLGNBQXRDLEVBQXNEO0FBQ3pERixrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlK0ksS0FBZixDQUFxQjdFLFFBQXJCLEdBQWdDLElBQWhDO0FBQ0F3RSxrQkFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlK0ksS0FBZixDQUFxQjNFLGlCQUFyQixHQUF5QyxDQUF6QztBQUNIOztBQUVELFlBQUl3RSxXQUFXLFFBQVgsSUFBdUJFLFdBQVcsV0FBdEMsRUFBbUQ7QUFDL0MsZ0JBQUlWLFlBQVlNLE1BQU1DLEtBQU4sQ0FBWTNJLENBQVosRUFBZStJLEtBQS9CO0FBQ0EsZ0JBQUlaLFNBQVNPLE1BQU1DLEtBQU4sQ0FBWTNJLENBQVosRUFBZTZJLEtBQTVCO0FBQ0FYLDhCQUFrQkMsTUFBbEIsRUFBMEJDLFNBQTFCO0FBQ0gsU0FKRCxNQUlPLElBQUlVLFdBQVcsUUFBWCxJQUF1QkYsV0FBVyxXQUF0QyxFQUFtRDtBQUN0RCxnQkFBSVIsYUFBWU0sTUFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlNkksS0FBL0I7QUFDQSxnQkFBSVYsVUFBU08sTUFBTUMsS0FBTixDQUFZM0ksQ0FBWixFQUFlK0ksS0FBNUI7QUFDQWIsOEJBQWtCQyxPQUFsQixFQUEwQkMsVUFBMUI7QUFDSDtBQUNKO0FBQ0oiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDIwKSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuICAgIH1cblxuICAgIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcbiAgICAgICAgbGV0IG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG5cbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XG4gICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcbiAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xuXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgfVxuXG4gICAgaXNWaXNpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxuXG5jbGFzcyBFeHBsb3Npb24ge1xuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcblxuICAgICAgICBsZXQgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgfVxuXG4gICAgZXhwbG9kZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgbGV0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzQ29tcGxldGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEJhc2ljRmlyZSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcblxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSB0aGlzLnJhZGl1cyAqIDEuNDtcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZWRQbGF5ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib2R5LmRhbWFnZUFtb3VudCA9IHRoaXMucmFkaXVzIC8gMjtcblxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvZHkuZGFtYWdlZFBsYXllcikge1xuXG4gICAgICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuXG4gICAgICAgICAgICBwdXNoKCk7XG4gICAgICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcbiAgICAgICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcbiAgICAgICAgICAgIHBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VmVsb2NpdHkoKSB7XG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xuICAgIH1cblxuICAgIGNoZWNrVmVsb2NpdHlaZXJvKCkge1xuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XG4gICAgfVxuXG4gICAgY2hlY2tPdXRPZlNjcmVlbigpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0XG4gICAgICAgICk7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEdyb3VuZCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XG4gICAgICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcbiAgICB9KSB7XG4gICAgICAgIGxldCBtb2RpZmllZFkgPSB5IC0gZ3JvdW5kSGVpZ2h0IC8gMiArIDEwO1xuXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG1vZGlmaWVkSGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0IC0gMjA7XG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIGdyb3VuZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxuICAgICAgICAgICAgbGFiZWw6ICdmYWtlQm90dG9tUGFydCcsXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuZmFrZUJvdHRvbVBhcnQpO1xuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcbiAgICAgICAgdGhpcy5tb2RpZmllZEhlaWdodCA9IG1vZGlmaWVkSGVpZ2h0O1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICBsZXQgYm9keVZlcnRpY2VzID0gdGhpcy5ib2R5LnZlcnRpY2VzO1xuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcbiAgICAgICAgbGV0IHZlcnRpY2VzID0gW2JvZHlWZXJ0aWNlc1swXSwgYm9keVZlcnRpY2VzWzFdLCBmYWtlQm90dG9tVmVydGljZXNbMl0sIGZha2VCb3R0b21WZXJ0aWNlc1szXV07XG5cbiAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgdmVydGV4KHZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnkpO1xuICAgICAgICBlbmRTaGFwZSgpO1xuICAgIH1cbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XG5cblxuY2xhc3MgUGxheWVyIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxuICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcbiAgICB9KSB7XG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIDIwLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gMjA7XG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcblxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xuXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xuICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmJvZHkuZGFtYWdlTGV2ZWwgPSAxO1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICB9XG5cbiAgICBzZXRDb250cm9sS2V5cyhrZXlzKSB7XG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBwdXNoKCk7XG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xuICAgICAgICByb3RhdGUoYW5nbGUpO1xuXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcblxuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xuXG4gICAgICAgIC8vIGVsbGlwc2UoLXRoaXMucmFkaXVzICogMS41LCAwLCA1KTtcblxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XG4gICAgICAgIHN0cm9rZSgwKTtcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xuXG4gICAgICAgIHBvcCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xuICAgICAgICBpZiAoYWN0aXZlS2V5c1t0aGlzLmtleXNbMl1dKSB7XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzNdXSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1syXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbM11dKSB8fFxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMl1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbM11dKSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xuXG4gICAgICAgIGxldCBhYnNYVmVsb2NpdHkgPSBhYnMoeFZlbG9jaXR5KTtcbiAgICAgICAgbGV0IHNpZ24gPSB4VmVsb2NpdHkgPCAwID8gLTEgOiAxO1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzW3RoaXMua2V5c1swXV0pIHtcbiAgICAgICAgICAgIGlmIChhYnNYVmVsb2NpdHkgPiB0aGlzLm1vdmVtZW50U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogc2lnbixcbiAgICAgICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcbiAgICAgICAgICAgICAgICB4OiAtMC4wMDUsXG4gICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzFdXSkge1xuICAgICAgICAgICAgaWYgKGFic1hWZWxvY2l0eSA+IHRoaXMubW92ZW1lbnRTcGVlZCkge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaWduLFxuICAgICAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB0aGlzLmJvZHkucG9zaXRpb24sIHtcbiAgICAgICAgICAgICAgICB4OiAwLjAwNSxcbiAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kT2JqZWN0cykge1xuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzVdXSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhY3RpdmVLZXlzW3RoaXMua2V5c1s1XV0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xuICAgIH1cblxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xuXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbdGhpcy5rZXlzWzRdXSkge1xuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlICs9IHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cbiAgICAgICAgICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlIDogdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcblxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzW3RoaXMua2V5c1s0XV0gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBiYXNpY0ZpcmVDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMsIGdyb3VuZE9iamVjdHMpIHtcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xuICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmRPYmplY3RzKTtcblxuICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmNoZWNrVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmNoZWNrT3V0T2ZTY3JlZW4oKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxuXG5sZXQgZW5naW5lO1xubGV0IHdvcmxkO1xuXG5sZXQgZ3JvdW5kcyA9IFtdO1xubGV0IHBsYXllcnMgPSBbXTtcbmxldCBleHBsb3Npb25zID0gW107XG5sZXQgbWluRm9yY2VNYWduaXR1ZGUgPSAyMDtcblxuY29uc3QgcGxheWVyS2V5cyA9IFtcbiAgICBbMzcsIDM5LCAzOCwgNDAsIDEzLCAzMl0sXG4gICAgWzY1LCA2OCwgODcsIDgzLCA0OSwgNTBdXG5dO1xuXG5jb25zdCBrZXlTdGF0ZXMgPSB7XG4gICAgMTM6IGZhbHNlLCAvLyBFTlRFUlxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcbiAgICAzODogZmFsc2UsIC8vIFVQXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxuICAgIDg3OiBmYWxzZSwgLy8gV1xuICAgIDY1OiBmYWxzZSwgLy8gQVxuICAgIDgzOiBmYWxzZSwgLy8gU1xuICAgIDY4OiBmYWxzZSwgLy8gRFxuICAgIDQ5OiBmYWxzZSwgLy8gMVxuICAgIDUwOiBmYWxzZSAvLyAyXG59O1xuXG5jb25zdCBncm91bmRDYXRlZ29yeSA9IDB4MDAwMTtcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xuY29uc3QgYmFzaWNGaXJlQ2F0ZWdvcnkgPSAweDAwMDQ7XG5jb25zdCBidWxsZXRDb2xsaXNpb25MYXllciA9IDB4MDAwODtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XG4gICAgd29ybGQgPSBlbmdpbmUud29ybGQ7XG5cbiAgICBNYXR0ZXIuRXZlbnRzLm9uKGVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgY29sbGlzaW9uRXZlbnQpO1xuXG4gICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCB3aWR0aDsgaSArPSB3aWR0aCkge1xuICAgIC8vICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oMTAwLCAzMDApO1xuICAgIC8vICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAvIDIsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgd2lkdGgsIHJhbmRvbVZhbHVlLCB3b3JsZCkpO1xuICAgIC8vIH1cblxuICAgIGZvciAobGV0IGkgPSAyNTsgaSA8IHdpZHRoOyBpICs9IDI1MCkge1xuICAgICAgICBsZXQgcmFuZG9tVmFsdWUgPSByYW5kb20oMTAwLCAzMDApO1xuICAgICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgNTAsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMjAwLCByYW5kb21WYWx1ZSwgd29ybGQpKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICBpZiAoIWdyb3VuZHNbaV0pXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBwbGF5ZXJzLnB1c2gobmV3IFBsYXllcihncm91bmRzW2ldLmJvZHkucG9zaXRpb24ueCwgMCwgd29ybGQpKTtcbiAgICAgICAgcGxheWVyc1tpXS5zZXRDb250cm9sS2V5cyhwbGF5ZXJLZXlzW2ldKTtcbiAgICB9XG5cbiAgICByZWN0TW9kZShDRU5URVIpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcblxuICAgIGdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgfSk7XG5cbiAgICBwbGF5ZXJzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICBlbGVtZW50LnVwZGF0ZShrZXlTdGF0ZXMsIGdyb3VuZHMpO1xuICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBsb3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGxvc2lvbnNbaV0uc2hvdygpO1xuICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChleHBsb3Npb25zW2ldLmlzQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaWxsKDI1NSk7XG4gICAgdGV4dFNpemUoMzApO1xuICAgIHRleHQoYCR7cm91bmQoZnJhbWVSYXRlKCkpfWAsIHdpZHRoIC0gNzUsIDUwKVxufVxuXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZGFtYWdlUGxheWVyQmFzaWMocGxheWVyLCBiYXNpY0ZpcmUpIHtcbiAgICBwbGF5ZXIuZGFtYWdlTGV2ZWwgKz0gYmFzaWNGaXJlLmRhbWFnZUFtb3VudDtcblxuICAgIGJhc2ljRmlyZS5kYW1hZ2VkUGxheWVyID0gdHJ1ZTtcbiAgICBiYXNpY0ZpcmUuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XG4gICAgfTtcblxuICAgIGxldCBidWxsZXRQb3MgPSBjcmVhdGVWZWN0b3IoYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55KTtcbiAgICBsZXQgcGxheWVyUG9zID0gY3JlYXRlVmVjdG9yKHBsYXllci5wb3NpdGlvbi54LCBwbGF5ZXIucG9zaXRpb24ueSk7XG5cbiAgICBsZXQgZGlyZWN0aW9uVmVjdG9yID0gcDUuVmVjdG9yLnN1YihwbGF5ZXJQb3MsIGJ1bGxldFBvcyk7XG4gICAgZGlyZWN0aW9uVmVjdG9yLnNldE1hZyhtaW5Gb3JjZU1hZ25pdHVkZSAqIHBsYXllci5kYW1hZ2VMZXZlbCk7XG5cbiAgICBNYXR0ZXIuQm9keS5hcHBseUZvcmNlKHBsYXllciwgcGxheWVyLnBvc2l0aW9uLCB7XG4gICAgICAgIHg6IGRpcmVjdGlvblZlY3Rvci54LFxuICAgICAgICB5OiBkaXJlY3Rpb25WZWN0b3IueVxuICAgIH0pO1xuXG4gICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oYmFzaWNGaXJlLnBvc2l0aW9uLngsIGJhc2ljRmlyZS5wb3NpdGlvbi55LCAxMCkpO1xufVxuXG5mdW5jdGlvbiBjb2xsaXNpb25FdmVudChldmVudCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnQucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xuICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XG5cbiAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8ZmFrZUJvdHRvbVBhcnQpJC8pKSkge1xuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY29sbGlzaW9uRmlsdGVyID0ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIChsYWJlbEEubWF0Y2goL14oc3RhdGljR3JvdW5kfGZha2VCb3R0b21QYXJ0KSQvKSkpIHtcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmNvbGxpc2lvbkZpbHRlciA9IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFiZWxBID09PSAncGxheWVyJyAmJiBsYWJlbEIgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XG4gICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XG4gICAgICAgICAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAncGxheWVyJyAmJiBsYWJlbEEgPT09ICdiYXNpY0ZpcmUnKSB7XG4gICAgICAgICAgICBsZXQgYmFzaWNGaXJlID0gZXZlbnQucGFpcnNbaV0uYm9keUE7XG4gICAgICAgICAgICBsZXQgcGxheWVyID0gZXZlbnQucGFpcnNbaV0uYm9keUI7XG4gICAgICAgICAgICBkYW1hZ2VQbGF5ZXJCYXNpYyhwbGF5ZXIsIGJhc2ljRmlyZSk7XG4gICAgICAgIH1cbiAgICB9XG59Il19
