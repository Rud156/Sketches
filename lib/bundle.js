'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasicFire = function () {
    function BasicFire(x, y, angle, world) {
        _classCallCheck(this, BasicFire);

        this.radius = 5;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
            label: 'basicFire',
            friction: 0.1,
            restitution: 0.8
        });
        Matter.World.add(world, this.body);

        this.movementSpeed = 7;
        this.angle = angle;
    }

    _createClass(BasicFire, [{
        key: 'show',
        value: function show() {
            var xVelocity = this.body.velocity.x;

            var alphaValue = 255;
            if (xVelocity <= 0.3) alphaValue = map(xVelocity, 0, 0.3, 0, 255);

            fill(255, 255, 255, alphaValue);
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
        key: 'checkVelocityZero',
        value: function checkVelocityZero() {
            return Math.abs(this.body.velocity.x) <= 0;
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
        key: 'shoot',
        value: function shoot(activeKeys) {
            if (activeKeys[13]) {
                var pos = this.body.position;
                var angle = this.body.angle;

                var x = this.radius * cos(angle) * 1.5 + pos.x;
                var y = this.radius * sin(angle) * 1.5 + pos.y;
                this.bullets.push(new BasicFire(x, y, angle, this.world));

                var length = this.bullets.length;
                this.bullets[length - 1].setVelocity();

                activeKeys[13] = false;
            }
        }
    }, {
        key: 'update',
        value: function update(activeKeys, ground) {
            this.rotateBlaster(activeKeys);
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys, ground);

            this.shoot(activeKeys);

            for (var i = 0; i < this.bullets.length; i++) {
                this.bullets[i].show();

                if (this.bullets[i].checkVelocityZero()) {
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

    grounds.push(new Ground(width / 2, height - 10, width, 20, world));
    grounds.push(new Ground(10, height - 170, 20, 300, world));
    grounds.push(new Ground(width - 10, height - 170, 20, 300, world));

    for (var i = 0; i < 1; i++) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsImFuZ2xlIiwid29ybGQiLCJyYWRpdXMiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwiY2lyY2xlIiwibGFiZWwiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwiV29ybGQiLCJhZGQiLCJtb3ZlbWVudFNwZWVkIiwieFZlbG9jaXR5IiwidmVsb2NpdHkiLCJhbHBoYVZhbHVlIiwibWFwIiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwicG9zaXRpb24iLCJwdXNoIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJzZXRWZWxvY2l0eSIsImNvcyIsInNpbiIsIk1hdGgiLCJhYnMiLCJHcm91bmQiLCJncm91bmRXaWR0aCIsImdyb3VuZEhlaWdodCIsInJlY3RhbmdsZSIsImlzU3RhdGljIiwid2lkdGgiLCJoZWlnaHQiLCJyb3RhdGUiLCJyZWN0IiwiUGxheWVyIiwiYW5ndWxhclZlbG9jaXR5IiwianVtcEhlaWdodCIsImp1bXBCcmVhdGhpbmdTcGFjZSIsImdyb3VuZGVkIiwibWF4SnVtcE51bWJlciIsImN1cnJlbnRKdW1wTnVtYmVyIiwiYnVsbGV0cyIsInN0cm9rZVdlaWdodCIsInN0cm9rZSIsImxpbmUiLCJhY3RpdmVLZXlzIiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwiZ3JvdW5kIiwiY29sbGlzaW9ucyIsIlF1ZXJ5IiwicmF5IiwibWluRGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaSIsImxlbmd0aCIsImRpc3RhbmNlIiwiZGlzdCIsImJvZHlBIiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwic2hvb3QiLCJzaG93IiwiY2hlY2tWZWxvY2l0eVplcm8iLCJzcGxpY2UiLCJlbmdpbmUiLCJncm91bmRzIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwicmVjdE1vZGUiLCJDRU5URVIiLCJkcmF3IiwiYmFja2dyb3VuZCIsInVwZGF0ZSIsImZvckVhY2giLCJlbGVtZW50Iiwia2V5UHJlc3NlZCIsImtleUNvZGUiLCJrZXlSZWxlYXNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFM7QUFDRix1QkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxLQUFsQixFQUF5QkMsS0FBekIsRUFBZ0M7QUFBQTs7QUFDNUIsYUFBS0MsTUFBTCxHQUFjLENBQWQ7QUFDQSxhQUFLQyxJQUFMLEdBQVlDLE9BQU9DLE1BQVAsQ0FBY0MsTUFBZCxDQUFxQlIsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCLEtBQUtHLE1BQWhDLEVBQXdDO0FBQ2hESyxtQkFBTyxXQUR5QztBQUVoREMsc0JBQVUsR0FGc0M7QUFHaERDLHlCQUFhO0FBSG1DLFNBQXhDLENBQVo7QUFLQUwsZUFBT00sS0FBUCxDQUFhQyxHQUFiLENBQWlCVixLQUFqQixFQUF3QixLQUFLRSxJQUE3Qjs7QUFFQSxhQUFLUyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsYUFBS1osS0FBTCxHQUFhQSxLQUFiO0FBQ0g7Ozs7K0JBRU07QUFDSCxnQkFBSWEsWUFBWSxLQUFLVixJQUFMLENBQVVXLFFBQVYsQ0FBbUJoQixDQUFuQzs7QUFFQSxnQkFBSWlCLGFBQWEsR0FBakI7QUFDQSxnQkFBSUYsYUFBYSxHQUFqQixFQUNJRSxhQUFhQyxJQUFJSCxTQUFKLEVBQWUsQ0FBZixFQUFrQixHQUFsQixFQUF1QixDQUF2QixFQUEwQixHQUExQixDQUFiOztBQUVKSSxpQkFBSyxHQUFMLEVBQVUsR0FBVixFQUFlLEdBQWYsRUFBb0JGLFVBQXBCO0FBQ0FHOztBQUVBLGdCQUFJQyxNQUFNLEtBQUtoQixJQUFMLENBQVVpQixRQUFwQjs7QUFFQUM7QUFDQUMsc0JBQVVILElBQUlyQixD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QVIsQ0FBYSxJQUFJVSxNQUFKLENBQVdLLFFBQVEsRUFBbkIsRUFBdUJDLFNBQVMsR0FBaEMsRUFBcUMsRUFBckMsRUFBeUMsR0FBekMsRUFBOENwQyxLQUE5QyxDQUFiOztBQUdBLFNBQUssSUFBSTZELElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFDeEJjLGdCQUFRdkQsSUFBUixDQUFhLElBQUltQixNQUFKLENBQVdKLFFBQVEsQ0FBbkIsRUFBc0JDLFNBQVMsQ0FBL0IsRUFBa0MsRUFBbEMsRUFBc0NwQyxLQUF0QyxDQUFiO0FBQ0g7O0FBRURxRixhQUFTQyxNQUFUO0FBQ0g7O0FBRUQsU0FBU0MsSUFBVCxHQUFnQjtBQUNaQyxlQUFXLENBQVg7QUFDQXJGLFdBQU9nRixNQUFQLENBQWNNLE1BQWQsQ0FBcUJoQixNQUFyQjs7QUFFQUMsWUFBUWdCLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRckIsSUFBUjtBQUNILEtBRkQ7QUFHQUssWUFBUWUsT0FBUixDQUFnQixtQkFBVztBQUN2QkMsZ0JBQVFyQixJQUFSO0FBQ0FxQixnQkFBUUYsTUFBUixDQUFlckMsU0FBZixFQUEwQnNCLFFBQVEsQ0FBUixDQUExQjtBQUNILEtBSEQ7QUFJSDs7QUFFRCxTQUFTa0IsVUFBVCxHQUFzQjtBQUNsQixRQUFJQyxXQUFXekMsU0FBZixFQUNJQSxVQUFVeUMsT0FBVixJQUFxQixJQUFyQjtBQUNQOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBV3pDLFNBQWYsRUFDSUEsVUFBVXlDLE9BQVYsSUFBcUIsS0FBckI7QUFDUCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBhbmdsZSwgd29ybGQpIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDU7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC44XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gNztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGFscGhhVmFsdWUgPSAyNTU7XHJcbiAgICAgICAgaWYgKHhWZWxvY2l0eSA8PSAwLjMpXHJcbiAgICAgICAgICAgIGFscGhhVmFsdWUgPSBtYXAoeFZlbG9jaXR5LCAwLCAwLjMsIDAsIDI1NSk7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1LCAyNTUsIDI1NSwgYWxwaGFWYWx1ZSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy5ib2R5LnZlbG9jaXR5LngpIDw9IDA7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBhbmdsZSA9IDApIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZSxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPmltcG9ydCB7IHBvcnQgfSBmcm9tIFwiX2RlYnVnZ2VyXCI7XHJcblxyXG5cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIHdvcmxkKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgcmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMyxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuM1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIC8vIGVsbGlwc2UoLXRoaXMucmFkaXVzICogMS41LCAwLCA1KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM4XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1s0MF0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM4XSAmJiAha2V5U3RhdGVzWzQwXSkgfHwgKGtleVN0YXRlc1szOF0gJiYga2V5U3RhdGVzWzQwXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM3XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IC10aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM3XSAmJiAha2V5U3RhdGVzWzM5XSkgfHwgKGtleVN0YXRlc1szN10gJiYga2V5U3RhdGVzWzM5XSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb25cclxuXHJcbiAgICAgICAgbGV0IGNvbGxpc2lvbnMgPSBNYXR0ZXIuUXVlcnkucmF5KFtncm91bmQuYm9keV0sIHBvcywge1xyXG4gICAgICAgICAgICB4OiBwb3MueCxcclxuICAgICAgICAgICAgeTogaGVpZ2h0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IG1pbkRpc3RhbmNlID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xsaXNpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGRpc3QocG9zLngsIHBvcy55LFxyXG4gICAgICAgICAgICAgICAgcG9zLngsIGNvbGxpc2lvbnNbaV0uYm9keUEucG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2UgPCBtaW5EaXN0YW5jZSA/IGRpc3RhbmNlIDogbWluRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWluRGlzdGFuY2UgPD0gdGhpcy5yYWRpdXMgKyBncm91bmQuaGVpZ2h0IC8gMiArIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1szMl0pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmdyb3VuZGVkICYmIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPCB0aGlzLm1heEp1bXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjdGl2ZUtleXNbMzJdID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzEzXSkge1xyXG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzICogc2luKGFuZ2xlKSAqIDEuNSArIHBvcy55O1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIGFuZ2xlLCB0aGlzLndvcmxkKSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5idWxsZXRzLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2xlbmd0aCAtIDFdLnNldFZlbG9jaXR5KCk7XHJcblxyXG4gICAgICAgICAgICBhY3RpdmVLZXlzWzEzXSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG9vdChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uY2hlY2tWZWxvY2l0eVplcm8oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcblxyXG5sZXQgZW5naW5lO1xyXG5sZXQgd29ybGQ7XHJcblxyXG5sZXQgZ3JvdW5kcyA9IFtdO1xyXG5sZXQgcGxheWVycyA9IFtdO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG4gICAgMTM6IGZhbHNlXHJcbn07XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gMTAsIHdpZHRoLCAyMCwgd29ybGQpKTtcclxuICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAtIDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcblxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSsrKSB7XHJcbiAgICAgICAgcGxheWVycy5wdXNoKG5ldyBQbGF5ZXIod2lkdGggLyAyLCBoZWlnaHQgLyAyLCAyMCwgd29ybGQpKTtcclxuICAgIH1cclxuXHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKGVuZ2luZSk7XHJcblxyXG4gICAgZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgfSk7XHJcbiAgICBwbGF5ZXJzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgZWxlbWVudC51cGRhdGUoa2V5U3RhdGVzLCBncm91bmRzWzBdKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG59Il19
