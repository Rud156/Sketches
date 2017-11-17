'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

        this.setVelocity();
    }

    _createClass(BasicFire, [{
        key: 'show',
        value: function show() {
            fill(255);
            noStroke();

            var pos = this.body.position;

            push();
            translate(pos.x, pos.y);
            ellipse(0, 0, this.radius * 2);
            pop();
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
            friction: 1,
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
            friction: 0.1,
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
    function Player(x, y, radius, world) {
        var catAndMask = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
            category: playerCategory,
            mask: groundCategory | playerCategory | basicFireCategory
        };

        _classCallCheck(this, Player);

        this.body = Matter.Bodies.circle(x, y, radius, {
            label: 'player',
            friction: 0,
            restitution: 0.3,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);
        this.world = world;

        this.radius = radius;
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
    }

    _createClass(Player, [{
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
            if (activeKeys[38]) {
                Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
            } else if (activeKeys[40]) {
                Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
            }

            if (!keyStates[38] && !keyStates[40] || keyStates[38] && keyStates[40]) {
                Matter.Body.setAngularVelocity(this.body, 0);
            }
        }
    }, {
        key: 'moveHorizontal',
        value: function moveHorizontal(activeKeys) {
            var yVelocity = this.body.velocity.y;

            if (activeKeys[37]) {
                Matter.Body.setVelocity(this.body, {
                    x: -this.movementSpeed,
                    y: yVelocity
                });
                Matter.Body.setAngularVelocity(this.body, 0);
            } else if (activeKeys[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: this.movementSpeed,
                    y: yVelocity
                });
                Matter.Body.setAngularVelocity(this.body, 0);
            }

            if (!keyStates[37] && !keyStates[39] || keyStates[37] && keyStates[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: 0,
                    y: yVelocity
                });
            }
        }
    }, {
        key: 'moveVertical',
        value: function moveVertical(activeKeys, groundObjects) {
            var xVelocity = this.body.velocity.x;

            if (activeKeys[32]) {
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

            activeKeys[32] = false;
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

            if (activeKeys[13]) {
                this.chargeStarted = true;
                this.currentChargeValue += this.chargeIncrementValue;

                this.currentChargeValue = this.currentChargeValue > this.maxChargeValue ? this.maxChargeValue : this.currentChargeValue;

                this.drawChargedShot(x, y, this.currentChargeValue);
            } else if (!activeKeys[13] && this.chargeStarted) {
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
    68: false };

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

    for (var i = 25; i < width; i += 200) {
        var randomValue = random(100, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 100, randomValue, world));
    }


    for (var _i = 0; _i < 1; _i++) {
        players.push(new Player(width / 2, height / 2, 20, world));
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
        } else if (labelA === 'player' && labelB === 'staticGround') {
            event.pairs[i].bodyA.grounded = true;
            event.pairs[i].bodyA.currentJumpNumber = 0;
        } else if (labelB === 'player' && labelA === 'staticGround') {
            event.pairs[i].bodyB.grounded = true;
            event.pairs[i].bodyB.currentJumpNumber = 0;
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwiYWRkIiwibW92ZW1lbnRTcGVlZCIsInNldFZlbG9jaXR5IiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwicG9zaXRpb24iLCJwdXNoIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJjb3MiLCJzaW4iLCJyZW1vdmUiLCJ2ZWxvY2l0eSIsInNxcnQiLCJzcSIsIndpZHRoIiwiaGVpZ2h0IiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJncm91bmRDYXRlZ29yeSIsInBsYXllckNhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsIm1vZGlmaWVkWSIsInJlY3RhbmdsZSIsImlzU3RhdGljIiwibW9kaWZpZWRIZWlnaHQiLCJmYWtlQm90dG9tUGFydCIsImJvZHlWZXJ0aWNlcyIsInZlcnRpY2VzIiwiZmFrZUJvdHRvbVZlcnRpY2VzIiwiYmVnaW5TaGFwZSIsImkiLCJsZW5ndGgiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsInJvdGF0ZSIsInJlY3QiLCJzdHJva2VXZWlnaHQiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImtleVN0YXRlcyIsInlWZWxvY2l0eSIsImdyb3VuZE9iamVjdHMiLCJ4VmVsb2NpdHkiLCJkcmF3Q2hhcmdlZFNob3QiLCJyb3RhdGVCbGFzdGVyIiwibW92ZUhvcml6b250YWwiLCJtb3ZlVmVydGljYWwiLCJjaGFyZ2VBbmRTaG9vdCIsInNob3ciLCJjaGVja1ZlbG9jaXR5WmVybyIsImNoZWNrT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJzcGxpY2UiLCJlbmdpbmUiLCJncm91bmRzIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwiRXZlbnRzIiwib24iLCJjb2xsaXNpb25FdmVudCIsInJhbmRvbVZhbHVlIiwicmFuZG9tIiwicmVjdE1vZGUiLCJDRU5URVIiLCJkcmF3IiwiYmFja2dyb3VuZCIsInVwZGF0ZSIsImZvckVhY2giLCJlbGVtZW50IiwidGV4dFNpemUiLCJ0ZXh0Iiwicm91bmQiLCJmcmFtZVJhdGUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIiwiZXZlbnQiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiLCJtYXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFM7QUFDRix1QkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUNDLEtBQWpDLEVBQXdDQyxVQUF4QyxFQUFvRDtBQUFBOztBQUNoRCxhQUFLSCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxhQUFLSSxJQUFMLEdBQVlDLE9BQU9DLE1BQVAsQ0FBY0MsTUFBZCxDQUFxQlQsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCLEtBQUtDLE1BQWhDLEVBQXdDO0FBQ2hEUSxt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Q0FBcUJoRSxpQkFBckIsR0FBeUMsQ0FBekM7QUFDSDtBQUNKO0FBQ0oiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjgsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMS40O1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IGdyb3VuZENhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICB9KSB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVkWSA9IHkgLSBncm91bmRIZWlnaHQgLyAyICsgMTA7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIG1vZGlmaWVkWSwgZ3JvdW5kV2lkdGgsIDIwLCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBtb2RpZmllZEhlaWdodCA9IGdyb3VuZEhlaWdodCAtIDIwO1xyXG4gICAgICAgIHRoaXMuZmFrZUJvdHRvbVBhcnQgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5ICsgMTAsIGdyb3VuZFdpZHRoLCBtb2RpZmllZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnZmFrZUJvdHRvbVBhcnQnLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmZha2VCb3R0b21QYXJ0KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyMDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkSGVpZ2h0ID0gbW9kaWZpZWRIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlWZXJ0aWNlcyA9IHRoaXMuYm9keS52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgZmFrZUJvdHRvbVZlcnRpY2VzID0gdGhpcy5mYWtlQm90dG9tUGFydC52ZXJ0aWNlcztcclxuICAgICAgICBsZXQgdmVydGljZXMgPSBbYm9keVZlcnRpY2VzWzBdLCBib2R5VmVydGljZXNbMV0sIGZha2VCb3R0b21WZXJ0aWNlc1syXSwgZmFrZUJvdHRvbVZlcnRpY2VzWzNdXTtcclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHZlcnRleCh2ZXJ0aWNlc1tpXS54LCB2ZXJ0aWNlc1tpXS55KTtcclxuICAgICAgICBlbmRTaGFwZSgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+XHJcblxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgd29ybGQsIGNhdEFuZE1hc2sgPSB7XHJcbiAgICAgICAgY2F0ZWdvcnk6IHBsYXllckNhdGVnb3J5LFxyXG4gICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRBbmRNYXNrLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogY2F0QW5kTWFzay5tYXNrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgLy8gZWxsaXBzZSgtdGhpcy5yYWRpdXMgKiAxLjUsIDAsIDUpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzhdKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzQwXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzhdICYmICFrZXlTdGF0ZXNbNDBdKSB8fCAoa2V5U3RhdGVzWzM4XSAmJiBrZXlTdGF0ZXNbNDBdKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzddKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogLXRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzM5XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzddICYmICFrZXlTdGF0ZXNbMzldKSB8fCAoa2V5U3RhdGVzWzM3XSAmJiBrZXlTdGF0ZXNbMzldKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmRPYmplY3RzKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1szMl0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmJvZHkuZ3JvdW5kZWQgJiYgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJvZHkuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5Lmdyb3VuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbMzJdID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1sxM10pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1sxM10gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzLCBncm91bmRPYmplY3RzKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kT2JqZWN0cyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmNoZWNrVmVsb2NpdHlaZXJvKCkgfHwgdGhpcy5idWxsZXRzW2ldLmNoZWNrT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcblxyXG5sZXQgZW5naW5lO1xyXG5sZXQgd29ybGQ7XHJcblxyXG5sZXQgZ3JvdW5kcyA9IFtdO1xyXG5sZXQgcGxheWVycyA9IFtdO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMTM6IGZhbHNlLCAvLyBFTlRFUlxyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIE1hdHRlci5FdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBjb2xsaXNpb25FdmVudCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDI1OyBpIDwgd2lkdGg7IGkgKz0gMjAwKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKDEwMCwgMzAwKTtcclxuICAgICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgNTAsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMTAwLCByYW5kb21WYWx1ZSwgd29ybGQpKTtcclxuICAgIH1cclxuICAgIC8vIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gMTAsIHdpZHRoLCAyMCwgd29ybGQpKTtcclxuICAgIC8vIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcbiAgICAvLyBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAtIDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxOyBpKyspIHtcclxuICAgICAgICBwbGF5ZXJzLnB1c2gobmV3IFBsYXllcih3aWR0aCAvIDIsIGhlaWdodCAvIDIsIDIwLCB3b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcclxuXHJcbiAgICBncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBwbGF5ZXJzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgZWxlbWVudC51cGRhdGUoa2V5U3RhdGVzLCBncm91bmRzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZpbGwoMjU1KTtcclxuICAgIHRleHRTaXplKDMwKTtcclxuICAgIHRleHQoYCR7cm91bmQoZnJhbWVSYXRlKCkpfWAsIHdpZHRoIC0gNzUsIDUwKVxyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbGxpc2lvbkV2ZW50KGV2ZW50KSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xyXG4gICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgKGxhYmVsQi5tYXRjaCgvXihzdGF0aWNHcm91bmR8ZmFrZUJvdHRvbVBhcnQpJC8pKSkge1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiAobGFiZWxBLm1hdGNoKC9eKHN0YXRpY0dyb3VuZHxmYWtlQm90dG9tUGFydCkkLykpKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEEgPT09ICdwbGF5ZXInICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdwbGF5ZXInICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
