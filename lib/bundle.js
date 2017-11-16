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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsImFuZ2xlIiwid29ybGQiLCJyYWRpdXMiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwiY2lyY2xlIiwibGFiZWwiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwiV29ybGQiLCJhZGQiLCJtb3ZlbWVudFNwZWVkIiwic2V0VmVsb2NpdHkiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJlbGxpcHNlIiwicG9wIiwiQm9keSIsImNvcyIsInNpbiIsInJlbW92ZSIsInZlbG9jaXR5Iiwic3FydCIsInNxIiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsIndpZHRoIiwiaGVpZ2h0Iiwicm90YXRlIiwicmVjdCIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJzdHJva2VXZWlnaHQiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImtleVN0YXRlcyIsInlWZWxvY2l0eSIsImdyb3VuZCIsInhWZWxvY2l0eSIsImNvbGxpc2lvbnMiLCJRdWVyeSIsInJheSIsIm1pbkRpc3RhbmNlIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsImkiLCJsZW5ndGgiLCJkaXN0YW5jZSIsImRpc3QiLCJib2R5QSIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsInNob290Iiwic2hvdyIsImNoZWNrVmVsb2NpdHlaZXJvIiwicmVtb3ZlRnJvbVdvcmxkIiwic3BsaWNlIiwiZW5naW5lIiwiZ3JvdW5kcyIsInBsYXllcnMiLCJzZXR1cCIsImNhbnZhcyIsImNyZWF0ZUNhbnZhcyIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInBhcmVudCIsIkVuZ2luZSIsImNyZWF0ZSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ1cGRhdGUiLCJmb3JFYWNoIiwiZWxlbWVudCIsImtleVByZXNzZWQiLCJrZXlDb2RlIiwia2V5UmVsZWFzZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVNQSxTO0FBQ0YsdUJBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsS0FBbEIsRUFBeUJDLEtBQXpCLEVBQWdDO0FBQUE7O0FBQzVCLGFBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsYUFBS0MsSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNDLE1BQWQsQ0FBcUJSLENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQixLQUFLRyxNQUFoQyxFQUF3QztBQUNoREssbUJBQU8sV0FEeUM7QUFFaERDLHNCQUFVLEdBRnNDO0FBR2hEQyx5QkFBYTtBQUhtQyxTQUF4QyxDQUFaO0FBS0FMLGVBQU9NLEtBQVAsQ0FBYUMsR0FBYixDQUFpQlYsS0FBakIsRUFBd0IsS0FBS0UsSUFBN0I7O0FBRUEsYUFBS1MsYUFBTCxHQUFxQixDQUFyQjtBQUNBLGFBQUtaLEtBQUwsR0FBYUEsS0FBYjtBQUNBLGFBQUtDLEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxhQUFLWSxXQUFMO0FBQ0g7Ozs7K0JBRU07QUFDSEMsaUJBQUssR0FBTDtBQUNBQzs7QUFFQSxnQkFBSUMsTUFBTSxLQUFLYixJQUFMLENBQVVjLFFBQXBCOztBQUVBQztBQUNBQyxzQkFBVUgsSUFBSWxCLENBQWQsRUFBaUJrQixJQUFJakIsQ0FBckI7QUFDQXFCLG9CQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsS0FBS2xCLE1BQUwsR0FBYyxDQUE1QjtBQUNBbUI7QUFDSDs7O3NDQUVhO0FBQ1ZqQixtQkFBT2tCLElBQVAsQ0FBWVQsV0FBWixDQUF3QixLQUFLVixJQUE3QixFQUFtQztBQUMv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QyxDQUFiOztBQUdBLFNBQUssSUFBSTRELElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFDeEJlLGdCQUFRMUQsSUFBUixDQUFhLElBQUlvQixNQUFKLENBQVdKLFFBQVEsQ0FBbkIsRUFBc0JDLFNBQVMsQ0FBL0IsRUFBa0MsRUFBbEMsRUFBc0NsQyxLQUF0QyxDQUFiO0FBQ0g7O0FBRURxRixhQUFTQyxNQUFUO0FBQ0g7O0FBRUQsU0FBU0MsSUFBVCxHQUFnQjtBQUNaQyxlQUFXLENBQVg7QUFDQXJGLFdBQU9nRixNQUFQLENBQWNNLE1BQWQsQ0FBcUJoQixNQUFyQjs7QUFFQUMsWUFBUWdCLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRdEIsSUFBUjtBQUNILEtBRkQ7QUFHQU0sWUFBUWUsT0FBUixDQUFnQixtQkFBVztBQUN2QkMsZ0JBQVF0QixJQUFSO0FBQ0FzQixnQkFBUUYsTUFBUixDQUFldkMsU0FBZixFQUEwQndCLFFBQVEsQ0FBUixDQUExQjtBQUNILEtBSEQ7QUFJSDs7QUFFRCxTQUFTa0IsVUFBVCxHQUFzQjtBQUNsQixRQUFJQyxXQUFXM0MsU0FBZixFQUNJQSxVQUFVMkMsT0FBVixJQUFxQixJQUFyQjtBQUNQOztBQUVELFNBQVNDLFdBQVQsR0FBdUI7QUFDbkIsUUFBSUQsV0FBVzNDLFNBQWYsRUFDSUEsVUFBVTJDLE9BQVYsSUFBcUIsS0FBckI7QUFDUCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cblxuY2xhc3MgQmFzaWNGaXJlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBhbmdsZSwgd29ybGQpIHtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSA1O1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCB0aGlzLnJhZGl1cywge1xuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjhcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gNztcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XG5cbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgbm9TdHJva2UoKTtcblxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xuXG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcbiAgICAgICAgcG9wKCk7XG4gICAgfVxuXG4gICAgc2V0VmVsb2NpdHkoKSB7XG4gICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgeDogdGhpcy5tb3ZlbWVudFNwZWVkICogY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUZyb21Xb3JsZCgpIHtcbiAgICAgICAgTWF0dGVyLldvcmxkLnJlbW92ZSh0aGlzLndvcmxkLCB0aGlzLmJvZHkpO1xuICAgIH1cblxuICAgIGNoZWNrVmVsb2NpdHlaZXJvKCkge1xuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XG4gICAgICAgIHJldHVybiBzcXJ0KHNxKHZlbG9jaXR5LngpICsgc3EodmVsb2NpdHkueSkpIDw9IDAuMDc7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XG5cbmNsYXNzIEdyb3VuZCB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGFuZ2xlID0gMCkge1xuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB7XG4gICAgICAgICAgICBpc1N0YXRpYzogdHJ1ZSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAxLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBhbmdsZTogYW5nbGUsXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCdcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGdyb3VuZEhlaWdodDtcbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG5cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xuXG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBwb3AoKTtcbiAgICB9XG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2Jhc2ljLWZpcmUuanNcIiAvPmltcG9ydCB7IHBvcnQgfSBmcm9tIFwiX2RlYnVnZ2VyXCI7XG5cblxuXG5jbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgd29ybGQpIHtcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgcmFkaXVzLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4zLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuM1xuICAgICAgICB9KTtcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcbiAgICAgICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwLjI7XG5cbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XG4gICAgICAgIHRoaXMuanVtcEJyZWF0aGluZ1NwYWNlID0gMztcblxuICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcbiAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlciA9IDA7XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xuICAgICAgICBub1N0cm9rZSgpO1xuXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICBwdXNoKCk7XG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xuICAgICAgICByb3RhdGUoYW5nbGUpO1xuXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcblxuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xuICAgICAgICByZWN0KDAgKyB0aGlzLnJhZGl1cyAvIDIsIDAsIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnJhZGl1cyAvIDIpO1xuXG4gICAgICAgIC8vIGVsbGlwc2UoLXRoaXMucmFkaXVzICogMS41LCAwLCA1KTtcblxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XG4gICAgICAgIHN0cm9rZSgwKTtcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDEuMjUsIDApO1xuXG4gICAgICAgIHBvcCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xuICAgICAgICBpZiAoYWN0aXZlS2V5c1szOF0pIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1s0MF0pIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1szOF0gJiYgIWtleVN0YXRlc1s0MF0pIHx8IChrZXlTdGF0ZXNbMzhdICYmIGtleVN0YXRlc1s0MF0pKSB7XG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcbiAgICAgICAgbGV0IHlWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS55O1xuXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM3XSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgeDogLXRoaXMubW92ZW1lbnRTcGVlZCxcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOV0pIHtcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCxcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzddICYmICFrZXlTdGF0ZXNbMzldKSB8fCAoa2V5U3RhdGVzWzM3XSAmJiBrZXlTdGF0ZXNbMzldKSkge1xuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XG4gICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZCkge1xuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb25cblxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IE1hdHRlci5RdWVyeS5yYXkoW2dyb3VuZC5ib2R5XSwgcG9zLCB7XG4gICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgIHk6IGhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG1pbkRpc3RhbmNlID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sbGlzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZGlzdChwb3MueCwgcG9zLnksXG4gICAgICAgICAgICAgICAgcG9zLngsIGNvbGxpc2lvbnNbaV0uYm9keUEucG9zaXRpb24ueSk7XG4gICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlIDwgbWluRGlzdGFuY2UgPyBkaXN0YW5jZSA6IG1pbkRpc3RhbmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1pbkRpc3RhbmNlIDw9IHRoaXMucmFkaXVzICsgZ3JvdW5kLmhlaWdodCAvIDIgKyB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzJdKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JvdW5kZWQgJiYgdGhpcy5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JvdW5kZWQpIHtcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlS2V5c1szMl0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzaG9vdChhY3RpdmVLZXlzKSB7XG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzEzXSkge1xuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcblxuICAgICAgICAgICAgbGV0IHggPSB0aGlzLnJhZGl1cyAqIGNvcyhhbmdsZSkgKiAxLjUgKyBwb3MueDtcbiAgICAgICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIGFuZ2xlLCB0aGlzLndvcmxkKSk7XG5cbiAgICAgICAgICAgIGFjdGl2ZUtleXNbMTNdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XG4gICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcbiAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKTtcblxuICAgICAgICB0aGlzLnNob290KGFjdGl2ZUtleXMpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLmNoZWNrVmVsb2NpdHlaZXJvKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0ucmVtb3ZlRnJvbVdvcmxkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxuXG5sZXQgZW5naW5lO1xubGV0IHdvcmxkO1xuXG5sZXQgZ3JvdW5kcyA9IFtdO1xubGV0IHBsYXllcnMgPSBbXTtcblxuY29uc3Qga2V5U3RhdGVzID0ge1xuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcbiAgICAzODogZmFsc2UsIC8vIFVQXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxuICAgIDg3OiBmYWxzZSwgLy8gV1xuICAgIDY1OiBmYWxzZSwgLy8gQVxuICAgIDgzOiBmYWxzZSwgLy8gU1xuICAgIDY4OiBmYWxzZSwgLy8gRFxuICAgIDEzOiBmYWxzZVxufTtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XG4gICAgd29ybGQgPSBlbmdpbmUud29ybGQ7XG5cbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAvIDIsIGhlaWdodCAtIDEwLCB3aWR0aCwgMjAsIHdvcmxkKSk7XG4gICAgZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoMTAsIGhlaWdodCAtIDE3MCwgMjAsIDMwMCwgd29ybGQpKTtcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAtIDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XG5cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSsrKSB7XG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMjAsIHdvcmxkKSk7XG4gICAgfVxuXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKGVuZ2luZSk7XG5cbiAgICBncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgIH0pO1xuICAgIHBsYXllcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcywgZ3JvdW5kc1swXSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xufSJdfQ==
