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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsImFuZ2xlIiwid29ybGQiLCJyYWRpdXMiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwiY2lyY2xlIiwibGFiZWwiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwiV29ybGQiLCJhZGQiLCJtb3ZlbWVudFNwZWVkIiwic2V0VmVsb2NpdHkiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJlbGxpcHNlIiwicG9wIiwiQm9keSIsImNvcyIsInNpbiIsInJlbW92ZSIsInZlbG9jaXR5Iiwic3FydCIsInNxIiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsIndpZHRoIiwiaGVpZ2h0Iiwicm90YXRlIiwicmVjdCIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJzdHJva2VXZWlnaHQiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImtleVN0YXRlcyIsInlWZWxvY2l0eSIsImdyb3VuZCIsInhWZWxvY2l0eSIsImNvbGxpc2lvbnMiLCJRdWVyeSIsInJheSIsIm1pbkRpc3RhbmNlIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsImkiLCJsZW5ndGgiLCJkaXN0YW5jZSIsImRpc3QiLCJib2R5QSIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsInNob290Iiwic2hvdyIsImNoZWNrVmVsb2NpdHlaZXJvIiwicmVtb3ZlRnJvbVdvcmxkIiwic3BsaWNlIiwiZW5naW5lIiwiZ3JvdW5kcyIsInBsYXllcnMiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsIkVuZ2luZSIsImNyZWF0ZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ1cGRhdGUiLCJmb3JFYWNoIiwiZWxlbWVudCIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVNQSxTO0FBQ0YsdUJBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsS0FBbEIsRUFBeUJDLEtBQXpCLEVBQWdDO0FBQUE7O0FBQzVCLGFBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsYUFBS0MsSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNDLE1BQWQsQ0FBcUJSLENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQixLQUFLRyxNQUFoQyxFQUF3QztBQUNoREssbUJBQU8sV0FEeUM7QUFFaERDLHNCQUFVLEdBRnNDO0FBR2hEQyx5QkFBYTtBQUhtQyxTQUF4QyxDQUFaO0FBS0FMLGVBQU9NLEtBQVAsQ0FBYUMsR0FBYixDQUFpQlYsS0FBakIsRUFBd0IsS0FBS0UsSUFBN0I7O0FBRUEsYUFBS1MsYUFBTCxHQUFxQixDQUFyQjtBQUNBLGFBQUtaLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtDLEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxhQUFLWSxXQUFMO0FBQ0g7Ozs7K0JBRU07QUFDSEMsaUJBQUssR0FBTDtBQUNBQzs7QUFFQSxnQkFBSUMsTUFBTSxLQUFLYixJQUFMLENBQVVjLFFBQXBCOztBQUVBQztBQUNBQyxzQkFBVUgsSUFBSWxCLENBQWQsRUFBaUJrQixJQUFJakIsQ0FBckI7QUFDQXFCLG9CQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsS0FBS2xCLE1BQUwsR0FBYyxDQUE1QjtBQUNBbUI7QUFDSDs7O3NDQUVhO0FBQ1ZqQixtQkFBT2tCLElBQVAsQ0FBWVQsV0FBWixDQUF3QixLQUFLVixJQUE3QixFQUFtQztBQUMv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QyxDQUFiOztBQUdBLFNBQUssSUFBSTRELElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFDeEJlLGdCQUFRMUQsSUFBUixDQUFhLElBQUlvQixNQUFKLENBQVdKLFFBQVEsQ0FBbkIsRUFBc0JDLFNBQVMsQ0FBL0IsRUFBa0MsRUFBbEMsRUFBc0NsQyxLQUF0QyxDQUFiO0FBQ0g7O0FBRURxRixhQUFTQyxNQUFUO0FBQ0g7O0FBRUQsU0FBU0MsSUFBVCxHQUFnQjtBQUNaQyxlQUFXLENBQVg7QUFDQXJGLFdBQU9nRixNQUFQLENBQWNNLE1BQWQsQ0FBcUJoQixNQUFyQjs7QUFFQUMsWUFBUWdCLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRdEIsSUFBUjtBQUNILEtBRkQ7QUFHQU0sWUFBUWUsT0FBUixDQUFnQixtQkFBVztBQUN2QkMsZ0JBQVF0QixJQUFSO0FBQ0FzQixnQkFBUUYsTUFBUixDQUFldkMsU0FBZixFQUEwQndCLFFBQVEsQ0FBUixDQUExQjtBQUNILEtBSEQ7QUFJSDs7QUFFRCxTQUFTa0IsVUFBVCxHQUFzQjtBQUNsQixRQUFJQyxXQUFXM0MsU0FBZixFQUNJQSxVQUFVMkMsT0FBVixJQUFxQixJQUFyQjtBQUNQOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBVzNDLFNBQWYsRUFDSUEsVUFBVTJDLE9BQVYsSUFBcUIsS0FBckI7QUFDUCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBhbmdsZSwgd29ybGQpIHtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IDU7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC44XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gNztcclxuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRWZWxvY2l0eSgpIHtcclxuICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLm1vdmVtZW50U3BlZWQgKiBzaW4odGhpcy5hbmdsZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVGcm9tV29ybGQoKSB7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrVmVsb2NpdHlaZXJvKCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eTtcclxuICAgICAgICByZXR1cm4gc3FydChzcSh2ZWxvY2l0eS54KSArIHNxKHZlbG9jaXR5LnkpKSA8PSAwLjA3O1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgYW5nbGUgPSAwKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5yZWN0YW5nbGUoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwge1xyXG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDEsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxyXG4gICAgICAgICAgICBhbmdsZTogYW5nbGUsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnc3RhdGljR3JvdW5kJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGdyb3VuZEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5pbXBvcnQgeyBwb3J0IH0gZnJvbSBcIl9kZWJ1Z2dlclwiO1xyXG5cclxuXHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjNcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XHJcblxyXG4gICAgICAgIHRoaXMuanVtcEhlaWdodCA9IDEwO1xyXG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG5cclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcblxyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzKTtcclxuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICAvLyBlbGxpcHNlKC10aGlzLnJhZGl1cyAqIDEuNSwgMCwgNSk7XHJcblxyXG4gICAgICAgIHN0cm9rZVdlaWdodCgxKTtcclxuICAgICAgICBzdHJva2UoMCk7XHJcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xyXG5cclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICByb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1szOF0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbNDBdKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1szOF0gJiYgIWtleVN0YXRlc1s0MF0pIHx8IChrZXlTdGF0ZXNbMzhdICYmIGtleVN0YXRlc1s0MF0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xyXG5cclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1szN10pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtdGhpcy5tb3ZlbWVudFNwZWVkLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbMzldKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1szN10gJiYgIWtleVN0YXRlc1szOV0pIHx8IChrZXlTdGF0ZXNbMzddICYmIGtleVN0YXRlc1szOV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZCkge1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uXHJcblxyXG4gICAgICAgIGxldCBjb2xsaXNpb25zID0gTWF0dGVyLlF1ZXJ5LnJheShbZ3JvdW5kLmJvZHldLCBwb3MsIHtcclxuICAgICAgICAgICAgeDogcG9zLngsXHJcbiAgICAgICAgICAgIHk6IGhlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBtaW5EaXN0YW5jZSA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sbGlzaW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBkaXN0KHBvcy54LCBwb3MueSxcclxuICAgICAgICAgICAgICAgIHBvcy54LCBjb2xsaXNpb25zW2ldLmJvZHlBLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlIDwgbWluRGlzdGFuY2UgPyBkaXN0YW5jZSA6IG1pbkRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1pbkRpc3RhbmNlIDw9IHRoaXMucmFkaXVzICsgZ3JvdW5kLmhlaWdodCAvIDIgKyB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSkge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzJdKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ncm91bmRlZCAmJiB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ncm91bmRlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzWzMyXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNob290KGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBpZiAoYWN0aXZlS2V5c1sxM10pIHtcclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcclxuICAgICAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCBhbmdsZSwgdGhpcy53b3JsZCkpO1xyXG5cclxuICAgICAgICAgICAgYWN0aXZlS2V5c1sxM10gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMsIGdyb3VuZCkge1xyXG4gICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvb3QoYWN0aXZlS2V5cyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmNoZWNrVmVsb2NpdHlaZXJvKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG5cclxubGV0IGVuZ2luZTtcclxubGV0IHdvcmxkO1xyXG5cclxubGV0IGdyb3VuZHMgPSBbXTtcclxubGV0IHBsYXllcnMgPSBbXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UsIC8vIERcclxuICAgIDEzOiBmYWxzZVxyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcclxuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcclxuICAgIGVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICB3b3JsZCA9IGVuZ2luZS53b3JsZDtcclxuXHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAvIDIsIGhlaWdodCAtIDEwLCB3aWR0aCwgMjAsIHdvcmxkKSk7XHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCgxMCwgaGVpZ2h0IC0gMTcwLCAyMCwgMzAwLCB3b3JsZCkpO1xyXG4gICAgZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQod2lkdGggLSAxMCwgaGVpZ2h0IC0gMTcwLCAyMCwgMzAwLCB3b3JsZCkpO1xyXG5cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE7IGkrKykge1xyXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMjAsIHdvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZShlbmdpbmUpO1xyXG5cclxuICAgIGdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgIH0pO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcywgZ3JvdW5kc1swXSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxufSJdfQ==
