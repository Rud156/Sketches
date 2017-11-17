'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasicFire = function () {
    function BasicFire(x, y, radius, angle, world) {
        _classCallCheck(this, BasicFire);

        this.radius = radius;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
            label: 'basicFire',
            friction: 0.1,
            restitution: 0.8
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
        var angle = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

        _classCallCheck(this, Ground);

        this.body = Matter.Bodies.rectangle(x, y, groundWidth, groundHeight, {
            isStatic: true,
            friction: 1,
            restitution: 0,
            angle: angle,
            label: 'staticGround'
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
    function Player(x, y, radius, world) {
        _classCallCheck(this, Player);

        this.body = Matter.Bodies.circle(x, y, radius, {
            label: 'player',
            friction: 0.3,
            restitution: 0.3
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
                this.bullets.push(new BasicFire(x, y, this.currentChargeValue, angle, this.world));

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

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    engine = Matter.Engine.create();
    world = engine.world;

    Matter.Events.on(engine, 'collisionStart', function (event) {
        event.pairs.forEach(function (element) {
            var labelA = element.bodyA.label;
            var labelB = element.bodyB.label;

            if (labelA === 'basicFire' && labelB === 'staticGround') {} else if (labelB === 'basicFire' && labelA === 'staticGround') {}
        });
    });

    for (var i = 25; i < width; i += 200) {
        var randomValue = random(10, 300);
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
        element.update(keyStates, grounds[0]);
    });
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwiY2lyY2xlIiwibGFiZWwiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwiV29ybGQiLCJhZGQiLCJtb3ZlbWVudFNwZWVkIiwic2V0VmVsb2NpdHkiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJlbGxpcHNlIiwicG9wIiwiQm9keSIsImNvcyIsInNpbiIsInJlbW92ZSIsInZlbG9jaXR5Iiwic3FydCIsInNxIiwid2lkdGgiLCJoZWlnaHQiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsInJlY3RhbmdsZSIsImlzU3RhdGljIiwicm90YXRlIiwicmVjdCIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsInN0cm9rZVdlaWdodCIsInN0cm9rZSIsImxpbmUiLCJhY3RpdmVLZXlzIiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwiZ3JvdW5kIiwieFZlbG9jaXR5IiwiY29sbGlzaW9ucyIsIlF1ZXJ5IiwicmF5IiwibWluRGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaSIsImxlbmd0aCIsImRpc3RhbmNlIiwiZGlzdCIsImJvZHlBIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJzaG93IiwiY2hlY2tWZWxvY2l0eVplcm8iLCJjaGVja091dE9mU2NyZWVuIiwicmVtb3ZlRnJvbVdvcmxkIiwic3BsaWNlIiwiZW5naW5lIiwiZ3JvdW5kcyIsInBsYXllcnMiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsIkVuZ2luZSIsImNyZWF0ZSIsIkV2ZW50cyIsIm9uIiwiZXZlbnQiLCJwYWlycyIsImZvckVhY2giLCJsYWJlbEEiLCJlbGVtZW50IiwibGFiZWxCIiwiYm9keUIiLCJyYW5kb21WYWx1ZSIsInJhbmRvbSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ1cGRhdGUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFTUEsUztBQUNGLHVCQUFZQyxDQUFaLEVBQWVDLENBQWYsRUFBa0JDLE1BQWxCLEVBQTBCQyxLQUExQixFQUFpQ0MsS0FBakMsRUFBd0M7QUFBQTs7QUFDcEMsYUFBS0YsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsYUFBS0csSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNDLE1BQWQsQ0FBcUJSLENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQixLQUFLQyxNQUFoQyxFQUF3QztBQUNoRE8sbUJBQU8sV0FEeUM7QUFFaERDLHNCQUFVLEdBRnNDO0FBR2hEQyx5QkFBYTtBQUhtQyxTQUF4QyxDQUFaO0FBS0FMLGVBQU9NLEtBQVAsQ0FBYUMsR0FBYixDQUFpQlQsS0FBakIsRUFBd0IsS0FBS0MsSUFBN0I7O0FBRUEsYUFBS1MsYUFBTCxHQUFxQixLQUFLWixNQUFMLEdBQWMsR0FBbkM7QUFDQSxhQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLQyxLQUFMLEdBQWFBLEtBQWI7O0FBRUEsYUFBS1csV0FBTDtBQUNIOzs7OytCQUVN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QUFJQyxXQUFXdEQsU0FBZixFQUNJQSxVQUFVc0QsT0FBVixJQUFxQixJQUFyQjtBQUNQOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBV3RELFNBQWYsRUFDSUEsVUFBVXNELE9BQVYsSUFBcUIsS0FBckI7QUFDUCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHRoaXMucmFkaXVzICogMS40O1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFZlbG9jaXR5KCkge1xyXG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBjb3ModGhpcy5hbmdsZSksXHJcbiAgICAgICAgICAgIHk6IHRoaXMubW92ZW1lbnRTcGVlZCAqIHNpbih0aGlzLmFuZ2xlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcclxuICAgICAgICBNYXR0ZXIuV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tWZWxvY2l0eVplcm8oKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xyXG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBvcy54ID4gd2lkdGggfHwgcG9zLnggPCAwIHx8IHBvcy55ID4gaGVpZ2h0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGFuZ2xlID0gMCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAxLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCdcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBncm91bmRIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+aW1wb3J0IHsgcG9ydCB9IGZyb20gXCJfZGVidWdnZXJcIjtcclxuXHJcblxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgd29ybGQpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCByYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4zLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgLy8gZWxsaXBzZSgtdGhpcy5yYWRpdXMgKiAxLjUsIDAsIDUpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzhdKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzQwXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzhdICYmICFrZXlTdGF0ZXNbNDBdKSB8fCAoa2V5U3RhdGVzWzM4XSAmJiBrZXlTdGF0ZXNbNDBdKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzddKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogLXRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzM5XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzddICYmICFrZXlTdGF0ZXNbMzldKSB8fCAoa2V5U3RhdGVzWzM3XSAmJiBrZXlTdGF0ZXNbMzldKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvblxyXG5cclxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IE1hdHRlci5RdWVyeS5yYXkoW2dyb3VuZC5ib2R5XSwgcG9zLCB7XHJcbiAgICAgICAgICAgIHg6IHBvcy54LFxyXG4gICAgICAgICAgICB5OiBoZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxpc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZGlzdChwb3MueCwgcG9zLnksXHJcbiAgICAgICAgICAgICAgICBwb3MueCwgY29sbGlzaW9uc1tpXS5ib2R5QS5wb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZSA8IG1pbkRpc3RhbmNlID8gZGlzdGFuY2UgOiBtaW5EaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtaW5EaXN0YW5jZSA8PSB0aGlzLnJhZGl1cyArIGdyb3VuZC5oZWlnaHQgLyAyICsgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzMyXSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JvdW5kZWQgJiYgdGhpcy5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWN0aXZlS2V5c1szMl0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzEzXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzWzEzXSAmJiB0aGlzLmNoYXJnZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uY2hlY2tWZWxvY2l0eVplcm8oKSB8fCB0aGlzLmJ1bGxldHNbaV0uY2hlY2tPdXRPZlNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuXHJcbmxldCBlbmdpbmU7XHJcbmxldCB3b3JsZDtcclxuXHJcbmxldCBncm91bmRzID0gW107XHJcbmxldCBwbGF5ZXJzID0gW107XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlLCAvLyBEXHJcbiAgICAxMzogZmFsc2VcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XHJcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XHJcbiAgICBlbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgd29ybGQgPSBlbmdpbmUud29ybGQ7XHJcblxyXG4gICAgTWF0dGVyLkV2ZW50cy5vbihlbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBldmVudC5wYWlycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbGFiZWxBID0gZWxlbWVudC5ib2R5QS5sYWJlbDtcclxuICAgICAgICAgICAgbGV0IGxhYmVsQiA9IGVsZW1lbnQuYm9keUIubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZiAobGFiZWxBID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEIgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ2Jhc2ljRmlyZScgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIGZvciAobGV0IGkgPSAyNTsgaSA8IHdpZHRoOyBpICs9IDIwMCkge1xyXG4gICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgxMCwgMzAwKTtcclxuICAgICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgNTAsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMTAwLCByYW5kb21WYWx1ZSwgd29ybGQpKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE7IGkrKykge1xyXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMjAsIHdvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZShlbmdpbmUpO1xyXG5cclxuICAgIGdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgIH0pO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcywgZ3JvdW5kc1swXSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxufSJdfQ==
