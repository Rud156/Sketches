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
    function Ground(x, y, groundWidth, groundHeight, world, catAndMask) {
        var angle = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;

        _classCallCheck(this, Ground);

        this.body = Matter.Bodies.rectangle(x, y, groundWidth, groundHeight, {
            isStatic: true,
            friction: 1,
            restitution: 0,
            angle: angle,
            label: 'staticGround',
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);

        this.width = groundWidth;
        this.height = groundHeight;
    }

    _createClass(Ground, [{
        key: 'show',
        value: function show() {
            fill(255, 0, 0);
            noStroke();

            var pos = this.body.position;
            var angle = this.body.angle;

            push();
            translate(pos.x, pos.y);
            rotate(angle);
            rect(0, 0, this.width, this.height);
            pop();
        }
    }]);

    return Ground;
}();

var Player = function () {
    function Player(x, y, radius, world, catAndMask) {
        _classCallCheck(this, Player);

        this.body = Matter.Bodies.circle(x, y, radius, {
            label: 'player',
            friction: 0.3,
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

        this.grounded = true;
        this.maxJumpNumber = 3;
        this.currentJumpNumber = 0;

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
        value: function moveVertical(activeKeys, ground) {
            var xVelocity = this.body.velocity.x;
            var pos = this.body.position;

            var collisions = Matter.Query.ray([ground.body], pos, {
                x: pos.x,
                y: height
            });
            var minDistance = Number.MAX_SAFE_INTEGER;
            for (var i = 0; i < collisions.length; i++) {
                var distance = dist(pos.x, pos.y, pos.x, collisions[i].bodyA.position.y);
                minDistance = distance < minDistance ? distance : minDistance;
            }

            if (minDistance <= this.radius + ground.height / 2 + this.jumpBreathingSpace) {
                this.grounded = true;
                this.currentJumpNumber = 0;
            } else this.grounded = false;

            if (activeKeys[32]) {
                if (!this.grounded && this.currentJumpNumber < this.maxJumpNumber) {
                    Matter.Body.setVelocity(this.body, {
                        x: xVelocity,
                        y: -this.jumpHeight
                    });
                    this.currentJumpNumber++;
                } else if (this.grounded) {
                    Matter.Body.setVelocity(this.body, {
                        x: xVelocity,
                        y: -this.jumpHeight
                    });
                    this.currentJumpNumber++;
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
        value: function update(activeKeys, ground) {
            this.rotateBlaster(activeKeys);
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys, ground);

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
    32: false,
    37: false,
    38: false,
    39: false,
    40: false,
    87: false,
    65: false,
    83: false,
    68: false,
    13: false
};

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
        var randomValue = random(10, 300);
        grounds.push(new Ground(i + 50, height - randomValue / 2, 100, randomValue, world, {
            category: groundCategory,
            mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
        }));
    }


    for (var _i = 0; _i < 1; _i++) {
        players.push(new Player(width / 2, height / 2, 20, world, {
            category: playerCategory,
            mask: groundCategory | playerCategory | basicFireCategory
        }));
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
        element.update(keyStates, grounds[0]);
    });

    fill(255);
    textSize(30);
    text('' + round(frameRate()), width - 75, 50);
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;
}

function collisionEvent(event) {
    for (var i = 0; i < event.pairs.length; i++) {
        var labelA = event.pairs[i].bodyA.label;
        var labelB = event.pairs[i].bodyB.label;

        if (labelA === 'basicFire' && labelB === 'staticGround') {
            event.pairs[i].bodyA.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        } else if (labelB === 'basicFire' && labelA === 'staticGround') {
            event.pairs[i].bodyB.collisionFilter = {
                category: bulletCollisionLayer,
                mask: groundCategory
            };
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwiYWRkIiwibW92ZW1lbnRTcGVlZCIsInNldFZlbG9jaXR5IiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwicG9zaXRpb24iLCJwdXNoIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJjb3MiLCJzaW4iLCJyZW1vdmUiLCJ2ZWxvY2l0eSIsInNxcnQiLCJzcSIsIndpZHRoIiwiaGVpZ2h0IiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsInJvdGF0ZSIsInJlY3QiLCJQbGF5ZXIiLCJhbmd1bGFyVmVsb2NpdHkiLCJqdW1wSGVpZ2h0IiwianVtcEJyZWF0aGluZ1NwYWNlIiwiZ3JvdW5kZWQiLCJtYXhKdW1wTnVtYmVyIiwiY3VycmVudEp1bXBOdW1iZXIiLCJidWxsZXRzIiwiaW5pdGlhbENoYXJnZVZhbHVlIiwibWF4Q2hhcmdlVmFsdWUiLCJjdXJyZW50Q2hhcmdlVmFsdWUiLCJjaGFyZ2VJbmNyZW1lbnRWYWx1ZSIsImNoYXJnZVN0YXJ0ZWQiLCJzdHJva2VXZWlnaHQiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImtleVN0YXRlcyIsInlWZWxvY2l0eSIsImdyb3VuZCIsInhWZWxvY2l0eSIsImNvbGxpc2lvbnMiLCJRdWVyeSIsInJheSIsIm1pbkRpc3RhbmNlIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsImkiLCJsZW5ndGgiLCJkaXN0YW5jZSIsImRpc3QiLCJib2R5QSIsImRyYXdDaGFyZ2VkU2hvdCIsImJhc2ljRmlyZUNhdGVnb3J5IiwiZ3JvdW5kQ2F0ZWdvcnkiLCJwbGF5ZXJDYXRlZ29yeSIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290Iiwic2hvdyIsImNoZWNrVmVsb2NpdHlaZXJvIiwiY2hlY2tPdXRPZlNjcmVlbiIsInJlbW92ZUZyb21Xb3JsZCIsInNwbGljZSIsImVuZ2luZSIsImdyb3VuZHMiLCJwbGF5ZXJzIiwiYnVsbGV0Q29sbGlzaW9uTGF5ZXIiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsIkVuZ2luZSIsImNyZWF0ZSIsIkV2ZW50cyIsIm9uIiwiY29sbGlzaW9uRXZlbnQiLCJyYW5kb21WYWx1ZSIsInJhbmRvbSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ1cGRhdGUiLCJmb3JFYWNoIiwiZWxlbWVudCIsInRleHRTaXplIiwidGV4dCIsInJvdW5kIiwiZnJhbWVSYXRlIiwia2V5UHJlc3NlZCIsImtleUNvZGUiLCJrZXlSZWxlYXNlZCIsImV2ZW50IiwicGFpcnMiLCJsYWJlbEEiLCJsYWJlbEIiLCJib2R5QiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFM7QUFDRix1QkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUNDLEtBQWpDLEVBQXdDQyxVQUF4QyxFQUFvRDtBQUFBOztBQUNoRCxhQUFLSCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxhQUFLSSxJQUFMLEdBQVlDLE9BQU9DLE1BQVAsQ0FBY0MsTUFBZCxDQUFxQlQsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCLEtBQUtDLE1BQWhDLEVBQXdDO0FBQ2hEUSxtQkFBTyxXQUR5QztBQUVoREMsc0JBQVUsR0FGc0M7QUFHaERDLHlCQUFhLEdBSG1DO0FBSWhE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LFNBQVNGLE1BQU1DLEtBQU4sQ0FBWW5ELENBQVosRUFBZUksS0FBZixDQUFxQmxFLEtBQWxDO0FBQ0EsWUFBSW1ILFNBQVNILE1BQU1DLEtBQU4sQ0FBWW5ELENBQVosRUFBZXNELEtBQWYsQ0FBcUJwSCxLQUFsQzs7QUFFQSxZQUFJa0gsV0FBVyxXQUFYLElBQTBCQyxXQUFXLGNBQXpDLEVBQXlEO0FBQ3JESCxrQkFBTUMsS0FBTixDQUFZbkQsQ0FBWixFQUFlSSxLQUFmLENBQXFCL0QsZUFBckIsR0FBdUM7QUFDbkNDLDBCQUFVK0Usb0JBRHlCO0FBRW5DOUUsc0JBQU1nRTtBQUY2QixhQUF2QztBQUlILFNBTEQsTUFLTyxJQUFJOEMsV0FBVyxXQUFYLElBQTBCRCxXQUFXLGNBQXpDLEVBQXlEO0FBQzVERixrQkFBTUMsS0FBTixDQUFZbkQsQ0FBWixFQUFlc0QsS0FBZixDQUFxQmpILGVBQXJCLEdBQXVDO0FBQ25DQywwQkFBVStFLG9CQUR5QjtBQUVuQzlFLHNCQUFNZ0U7QUFGNkIsYUFBdkM7QUFJSDtBQUNKO0FBQ0oiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYXNpY0ZpcmUge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCBhbmdsZSwgd29ybGQsIGNhdEFuZE1hc2spIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2Jhc2ljRmlyZScsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjgsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMS40O1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGNhdEFuZE1hc2ssIGFuZ2xlID0gMCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAxLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGdyb3VuZEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIC8vIGVsbGlwc2UoLXRoaXMucmFkaXVzICogMS41LCAwLCA1KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM4XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1s0MF0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM4XSAmJiAha2V5U3RhdGVzWzQwXSkgfHwgKGtleVN0YXRlc1szOF0gJiYga2V5U3RhdGVzWzQwXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM3XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IC10aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM3XSAmJiAha2V5U3RhdGVzWzM5XSkgfHwgKGtleVN0YXRlc1szN10gJiYga2V5U3RhdGVzWzM5XSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb25cclxuXHJcbiAgICAgICAgbGV0IGNvbGxpc2lvbnMgPSBNYXR0ZXIuUXVlcnkucmF5KFtncm91bmQuYm9keV0sIHBvcywge1xyXG4gICAgICAgICAgICB4OiBwb3MueCxcclxuICAgICAgICAgICAgeTogaGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IG1pbkRpc3RhbmNlID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xsaXNpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGRpc3QocG9zLngsIHBvcy55LFxyXG4gICAgICAgICAgICAgICAgcG9zLngsIGNvbGxpc2lvbnNbaV0uYm9keUEucG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2UgPCBtaW5EaXN0YW5jZSA/IGRpc3RhbmNlIDogbWluRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWluRGlzdGFuY2UgPD0gdGhpcy5yYWRpdXMgKyBncm91bmQuaGVpZ2h0IC8gMiArIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1szMl0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmdyb3VuZGVkICYmIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPCB0aGlzLm1heEp1bXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbMzJdID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0NoYXJnZWRTaG90KHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKHgsIHksIHJhZGl1cyAqIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1sxM10pIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgKz0gdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPiB0aGlzLm1heENoYXJnZVZhbHVlID9cclxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2hhcmdlVmFsdWUgOiB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0NoYXJnZWRTaG90KHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICghYWN0aXZlS2V5c1sxM10gJiYgdGhpcy5jaGFyZ2VTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCYXNpY0ZpcmUoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUsIGFuZ2xlLCB0aGlzLndvcmxkLCB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYmFzaWNGaXJlQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGFyZ2VTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICB0aGlzLnJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpO1xyXG5cclxuICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5jaGVja1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5jaGVja091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG5cclxubGV0IGVuZ2luZTtcclxubGV0IHdvcmxkO1xyXG5cclxubGV0IGdyb3VuZHMgPSBbXTtcclxubGV0IHBsYXllcnMgPSBbXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UsIC8vIERcclxuICAgIDEzOiBmYWxzZVxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIE1hdHRlci5FdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBjb2xsaXNpb25FdmVudCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDI1OyBpIDwgd2lkdGg7IGkgKz0gMjAwKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKDEwLCAzMDApO1xyXG4gICAgICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKGkgKyA1MCwgaGVpZ2h0IC0gcmFuZG9tVmFsdWUgLyAyLCAxMDAsIHJhbmRvbVZhbHVlLCB3b3JsZCwge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5IHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgLy8gZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQod2lkdGggLyAyLCBoZWlnaHQgLSAxMCwgd2lkdGgsIDIwLCB3b3JsZCwge1xyXG4gICAgLy8gICAgIGNhdGVnb3J5OiBncm91bmRDYXRlZ29yeSxcclxuICAgIC8vICAgICBtYXNrOiBncm91bmRDYXRlZ29yeSB8IGJ1bGxldENvbGxpc2lvbkxheWVyIHwgcGxheWVyQ2F0ZWdvcnkgfCBiYXNpY0ZpcmVDYXRlZ29yeVxyXG4gICAgLy8gfSkpO1xyXG4gICAgLy8gZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoMTAsIGhlaWdodCAtIDE3MCwgMjAsIDMwMCwgd29ybGQsIHtcclxuICAgIC8vICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAvLyAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllciB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgIC8vIH0pKTtcclxuICAgIC8vIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC0gMTAsIGhlaWdodCAtIDE3MCwgMjAsIDMwMCwgd29ybGQsIHtcclxuICAgIC8vICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAvLyAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBidWxsZXRDb2xsaXNpb25MYXllciB8IHBsYXllckNhdGVnb3J5IHwgYmFzaWNGaXJlQ2F0ZWdvcnlcclxuICAgIC8vIH0pKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE7IGkrKykge1xyXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMjAsIHdvcmxkLCB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBwbGF5ZXJDYXRlZ29yeSxcclxuICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcclxuXHJcbiAgICBncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICB9KTtcclxuICAgIHBsYXllcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICBlbGVtZW50LnVwZGF0ZShrZXlTdGF0ZXMsIGdyb3VuZHNbMF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZmlsbCgyNTUpO1xyXG4gICAgdGV4dFNpemUoMzApO1xyXG4gICAgdGV4dChgJHtyb3VuZChmcmFtZVJhdGUoKSl9YCwgd2lkdGggLSA3NSwgNTApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbGxpc2lvbkV2ZW50KGV2ZW50KSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGxhYmVsQSA9IGV2ZW50LnBhaXJzW2ldLmJvZHlBLmxhYmVsO1xyXG4gICAgICAgIGxldCBsYWJlbEIgPSBldmVudC5wYWlyc1tpXS5ib2R5Qi5sYWJlbDtcclxuXHJcbiAgICAgICAgaWYgKGxhYmVsQSA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5jb2xsaXNpb25GaWx0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogYnVsbGV0Q29sbGlzaW9uTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBncm91bmRDYXRlZ29yeVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChsYWJlbEIgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQSA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUIuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
