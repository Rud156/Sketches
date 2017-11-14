'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

        this.radius = radius;
        this.speedScale = 4;
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
            stroke(255);
            line(0, 0, this.radius, 0);
            pop();
        }
    }, {
        key: 'update',
        value: function update(activeKeys) {
            var yVelocity = this.body.velocity.y;
            var xVelocity = this.body.velocity.x;

            if (keyStates[37]) {
                Matter.Body.setVelocity(this.body, {
                    x: -this.speedScale,
                    y: yVelocity
                });
            } else if (keyStates[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: this.speedScale,
                    y: yVelocity
                });
            }

            if (!keyStates[37] && !keyStates[39] || keyStates[37] && keyStates[39]) Matter.Body.setVelocity(this.body, {
                x: 0,
                y: yVelocity
            });
        }
    }]);

    return Player;
}();

var engine = void 0;
var world = void 0;

var ground = void 0;
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
    68: false };

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    engine = Matter.Engine.create();
    world = engine.world;

    ground = new Ground(width / 2, height - 10, width, 20, world);

    for (var i = 0; i < 1; i++) {
        players.push(new Player(width / 2, height / 2, 20, world));
    }

    rectMode(CENTER);
}

function draw() {
    background(0);
    Matter.Engine.update(engine);

    ground.show();
    players.forEach(function (element) {
        element.show();
        element.update(keyStates);
    });
}

function keyPressed() {
    if (keyCode in keyStates) keyStates[keyCode] = true;
}

function keyReleased() {
    if (keyCode in keyStates) keyStates[keyCode] = false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHcm91bmQiLCJ4IiwieSIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0Iiwid29ybGQiLCJhbmdsZSIsImJvZHkiLCJNYXR0ZXIiLCJCb2RpZXMiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsImZyaWN0aW9uIiwicmVzdGl0dXRpb24iLCJsYWJlbCIsIldvcmxkIiwiYWRkIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJyb3RhdGUiLCJyZWN0IiwicG9wIiwiUGxheWVyIiwicmFkaXVzIiwiY2lyY2xlIiwic3BlZWRTY2FsZSIsImVsbGlwc2UiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInlWZWxvY2l0eSIsInZlbG9jaXR5IiwieFZlbG9jaXR5Iiwia2V5U3RhdGVzIiwiQm9keSIsInNldFZlbG9jaXR5IiwiZW5naW5lIiwiZ3JvdW5kIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwiaSIsInJlY3RNb2RlIiwiQ0VOVEVSIiwiZHJhdyIsImJhY2tncm91bmQiLCJ1cGRhdGUiLCJzaG93IiwiZm9yRWFjaCIsImVsZW1lbnQiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFTUEsTTtBQUNGLG9CQUFZQyxDQUFaLEVBQWVDLENBQWYsRUFBa0JDLFdBQWxCLEVBQStCQyxZQUEvQixFQUE2Q0MsS0FBN0MsRUFBK0Q7QUFBQSxZQUFYQyxLQUFXLHVFQUFILENBQUc7O0FBQUE7O0FBQzNELGFBQUtDLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjQyxTQUFkLENBQXdCVCxDQUF4QixFQUEyQkMsQ0FBM0IsRUFBOEJDLFdBQTlCLEVBQTJDQyxZQUEzQyxFQUF5RDtBQUNqRU8sc0JBQVUsSUFEdUQ7QUFFakVDLHNCQUFVLENBRnVEO0FBR2pFQyx5QkFBYSxDQUhvRDtBQUlqRVAsbUJBQU9BLEtBSjBEO0FBS2pFUSxtQkFBTztBQUwwRCxTQUF6RCxDQUFaO0FBT0FOLGVBQU9PLEtBQVAsQ0FBYUMsR0FBYixDQUFpQlgsS0FBakIsRUFBd0IsS0FBS0UsSUFBN0I7O0FBRUEsYUFBS1UsS0FBTCxHQUFhZCxXQUFiO0FBQ0EsYUFBS2UsTUFBTCxHQUFjZCxZQUFkO0FBQ0g7Ozs7K0JBRU07QUFDSGUsaUJBQUssR0FBTCxFQUFVLENBQVYsRUFBYSxDQUFiO0FBQ0FDOztBQUVBLGdCQUFJQyxNQUFNLEtBQUtkLElBQUwsQ0FBVWUsUUFBcEI7QUFDQSxnQkFBSWhCLFFBQVEsS0FBS0MsSUFBTCxDQUFVRCxLQUF0Qjs7QUFFQWlCO0FBQ0FDLHNCQUFVSCxJQUFJcEIsQ0FBZCxFQUFpQm9CLElBQUluQixDQUFyQjtBQUNBdUIsbUJBQU9uQixLQUFQO0FBQ0FvQixpQkFBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLEtBQUtULEtBQWhCLEVBQXVCLEtBQUtDLE1BQTVCO0FBQ0FTO0FBQ0g7Ozs7OztJQUlDQyxNO0FBQ0Ysb0JBQVkzQixDQUFaLEVBQWVDLENBQWYsRUFBa0IyQixNQUFsQixFQUEwQnhCLEtBQTFCLEVBQWlDO0FBQUE7O0FBQzdCLGFBQUtFLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjcUIsTUFBZCxDQUFxQjdCLENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQjJCLE1BQTNCLEVBQW1DO0FBQzNDZixtQkFBTyxRQURvQztBQUUzQ0Ysc0JBQVUsR0FGaUM7QUFHM0NDLHlCQUFhO0FBSDhCLFNBQW5DLENBQVo7QUFLQUwsZUFBT08sS0FBUCxDQUFhQyxHQUFiLENBQWlCWCxLQUFqQixFQUF3QixLQUFLRSxJQUE3Qjs7QUFFQSxhQUFLc0IsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsYUFBS0UsVUFBTCxHQUFrQixDQUFsQjtBQUNIOzs7OytCQUVNO0FBQ0haLGlCQUFLLENBQUwsRUFBUSxHQUFSLEVBQWEsQ0FBYjtBQUNBQzs7QUFFQSxnQkFBSUMsTUFBTSxLQUFLZCxJQUFMLENBQVVlLFFBQXBCO0FBQ0EsZ0JBQUloQixRQUFRLEtBQUtDLElBQUwsQ0FBVUQsS0FBdEI7O0FBRUFpQjtBQUNBQyxzQkFBVUgsSUFBSXBCLENBQWQsRUFBaUJvQixJQUFJbkIsQ0FBckI7QUFDQXVCLG1CQUFPbkIsS0FBUDtBQUNBMEIsb0JBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxLQUFLSCxNQUFMLEdBQWMsQ0FBNUI7QUFDQUksbUJBQU8sR0FBUDtBQUNBQyxpQkFBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLEtBQUtMLE1BQWhCLEVBQXdCLENBQXhCO0FBQ0FGO0FBQ0g7OzsrQkFFTVEsVSxFQUFZO0FBQ2YsZ0JBQUlDLFlBQVksS0FBSzdCLElBQUwsQ0FBVThCLFFBQVYsQ0FBbUJuQyxDQUFuQztBQUNBLGdCQUFJb0MsWUFBWSxLQUFLL0IsSUFBTCxDQUFVOEIsUUFBVixDQUFtQnBDLENBQW5DOztBQUVBLGdCQUFJc0MsVUFBVSxFQUFWLENBQUosRUFBbUI7QUFDZi9CLHVCQUFPZ0MsSUFBUCxDQUFZQyxXQUFaLENBQXdCLEtBQUtsQyxJQUE3QixFQUFtQztBQUMvQk4sdUJBQUcsQ0FBQyxLQUFLOEIsVUFEc0I7QUFFL0I3Qix1QkFBR2tDO0FBRjRCLGlCQUFuQztBQUlILGFBTEQsTUFLTyxJQUFJRyxVQUFVLEVBQVYsQ0FBSixFQUFtQjtBQUN0Qi9CLHVCQUFPZ0MsSUFBUCxDQUFZQyxXQUFaLENBQXdCLEtBQUtsQyxJQUE3QixFQUFtQztBQUMvQk4sdUJBQUcsS0FBSzhCLFVBRHVCO0FBRS9CN0IsdUJBQUdrQztBQUY0QixpQkFBbkM7QUFJSDs7QUFFRCxnQkFBSyxDQUFDRyxVQUFVLEVBQVYsQ0FBRCxJQUFrQixDQUFDQSxVQUFVLEVBQVYsQ0FBcEIsSUFBdUNBLFVBQVUsRUFBVixLQUFpQkEsVUFBVSxFQUFWLENBQTVELEVBQ0kvQixPQUFPZ0MsSUFBUCxDQUFZQyxXQUFaLENBQXdCLEtBQUtsQyxJQUE3QixFQUFtQztBQUMvQk4sbUJBQUcsQ0FENEI7QUFFL0JDLG1CQUFHa0M7QUFGNEIsYUFBbkM7QUFJUDs7Ozs7O0FBTUwsSUFBSU0sZUFBSjtBQUNBLElBQUlyQyxjQUFKOztBQUVBLElBQUlzQyxlQUFKO0FBQ0EsSUFBSUMsVUFBVSxFQUFkOztBQUVBLElBQU1MLFlBQVk7QUFDZCxRQUFJLEtBRFU7QUFFZCxRQUFJLEtBRlU7QUFHZCxRQUFJLEtBSFU7QUFJZCxRQUFJLEtBSlU7QUFLZCxRQUFJLEtBTFU7QUFNZCxRQUFJLEtBTlU7QUFPZCxRQUFJLEtBUFU7QUFRZCxRQUFJLEtBUlU7QUFTZCxRQUFJLEtBVFUsRUFBbEI7O0FBWUEsU0FBU00sS0FBVCxHQUFpQjtBQUNiLFFBQUlDLFNBQVNDLGFBQWFDLE9BQU9DLFVBQVAsR0FBb0IsRUFBakMsRUFBcUNELE9BQU9FLFdBQVAsR0FBcUIsRUFBMUQsQ0FBYjtBQUNBSixXQUFPSyxNQUFQLENBQWMsZUFBZDtBQUNBVCxhQUFTbEMsT0FBTzRDLE1BQVAsQ0FBY0MsTUFBZCxFQUFUO0FBQ0FoRCxZQUFRcUMsT0FBT3JDLEtBQWY7O0FBRUFzQyxhQUFTLElBQUkzQyxNQUFKLENBQVdpQixRQUFRLENBQW5CLEVBQXNCQyxTQUFTLEVBQS9CLEVBQW1DRCxLQUFuQyxFQUEwQyxFQUExQyxFQUE4Q1osS0FBOUMsQ0FBVDs7QUFFQSxTQUFLLElBQUlpRCxJQUFJLENBQWIsRUFBZ0JBLElBQUksQ0FBcEIsRUFBdUJBLEdBQXZCLEVBQTRCO0FBQ3hCVixnQkFBUXJCLElBQVIsQ0FBYSxJQUFJSyxNQUFKLENBQVdYLFFBQVEsQ0FBbkIsRUFBc0JDLFNBQVMsQ0FBL0IsRUFBa0MsRUFBbEMsRUFBc0NiLEtBQXRDLENBQWI7QUFDSDs7QUFFRGtELGFBQVNDLE1BQVQ7QUFDSDs7QUFFRCxTQUFTQyxJQUFULEdBQWdCO0FBQ1pDLGVBQVcsQ0FBWDtBQUNBbEQsV0FBTzRDLE1BQVAsQ0FBY08sTUFBZCxDQUFxQmpCLE1BQXJCOztBQUVBQyxXQUFPaUIsSUFBUDtBQUNBaEIsWUFBUWlCLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRRixJQUFSO0FBQ0FFLGdCQUFRSCxNQUFSLENBQWVwQixTQUFmO0FBQ0gsS0FIRDtBQUlIOztBQUVELFNBQVN3QixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVd6QixTQUFmLEVBQ0lBLFVBQVV5QixPQUFWLElBQXFCLElBQXJCO0FBQ1A7O0FBRUQsU0FBU0MsV0FBVCxHQUF1QjtBQUNuQixRQUFJRCxXQUFXekIsU0FBZixFQUNJQSxVQUFVeUIsT0FBVixJQUFxQixLQUFyQjtBQUNQIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBhbmdsZSA9IDApIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZSxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjNcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLnNwZWVkU2NhbGUgPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgc3Ryb2tlKDI1NSk7XHJcbiAgICAgICAgbGluZSgwLCAwLCB0aGlzLnJhZGl1cywgMCk7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgbGV0IHhWZWxvY2l0eSA9IHRoaXMuYm9keS52ZWxvY2l0eS54O1xyXG5cclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzM3XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IC10aGlzLnNwZWVkU2NhbGUsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXlTdGF0ZXNbMzldKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5zcGVlZFNjYWxlLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM3XSAmJiAha2V5U3RhdGVzWzM5XSkgfHwgKGtleVN0YXRlc1szN10gJiYga2V5U3RhdGVzWzM5XSkpXHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcblxyXG5sZXQgZW5naW5lO1xyXG5sZXQgd29ybGQ7XHJcblxyXG5sZXQgZ3JvdW5kO1xyXG5sZXQgcGxheWVycyA9IFtdO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSAvLyBEXHJcbn07XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIGdyb3VuZCA9IG5ldyBHcm91bmQod2lkdGggLyAyLCBoZWlnaHQgLSAxMCwgd2lkdGgsIDIwLCB3b3JsZCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxOyBpKyspIHtcclxuICAgICAgICBwbGF5ZXJzLnB1c2gobmV3IFBsYXllcih3aWR0aCAvIDIsIGhlaWdodCAvIDIsIDIwLCB3b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcclxuXHJcbiAgICBncm91bmQuc2hvdygpO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxufSJdfQ==
