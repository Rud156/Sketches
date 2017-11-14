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
        this.movementSpeed = 10;
        this.angularVelocity = 0.4;
        this.jumpHeight = 10;

        this.grounded = true;
        this.maxJumpNumber = 3;
        this.currentJumpNumber = 0;
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
            rect(0 - this.radius / 2, 0, 30, 10);
            pop();
        }
    }, {
        key: 'moveHorizontal',
        value: function moveHorizontal(activeKeys) {
            var yVelocity = this.body.velocity.y;

            if (keyStates[37]) {
                Matter.Body.setVelocity(this.body, {
                    x: -this.movementSpeed,
                    y: yVelocity
                });
                if (!this.grounded) Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
            } else if (keyStates[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: this.movementSpeed,
                    y: yVelocity
                });
                if (!this.grounded) Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
            }

            if (!keyStates[37] && !keyStates[39] || keyStates[37] && keyStates[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: 0,
                    y: yVelocity
                });
                Matter.Body.setAngularVelocity(this.body, 0);
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

            if (minDistance <= this.radius + ground.height / 2 + 3) {
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
        key: 'update',
        value: function update(activeKeys, ground) {
            this.moveHorizontal(activeKeys);
            this.moveVertical(activeKeys, ground);
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
    68: false };

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHcm91bmQiLCJ4IiwieSIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0Iiwid29ybGQiLCJhbmdsZSIsImJvZHkiLCJNYXR0ZXIiLCJCb2RpZXMiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsImZyaWN0aW9uIiwicmVzdGl0dXRpb24iLCJsYWJlbCIsIldvcmxkIiwiYWRkIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJyb3RhdGUiLCJyZWN0IiwicG9wIiwiUGxheWVyIiwicmFkaXVzIiwiY2lyY2xlIiwibW92ZW1lbnRTcGVlZCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImVsbGlwc2UiLCJhY3RpdmVLZXlzIiwieVZlbG9jaXR5IiwidmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJCb2R5Iiwic2V0VmVsb2NpdHkiLCJzZXRBbmd1bGFyVmVsb2NpdHkiLCJncm91bmQiLCJ4VmVsb2NpdHkiLCJjb2xsaXNpb25zIiwiUXVlcnkiLCJyYXkiLCJtaW5EaXN0YW5jZSIsIk51bWJlciIsIk1BWF9TQUZFX0lOVEVHRVIiLCJpIiwibGVuZ3RoIiwiZGlzdGFuY2UiLCJkaXN0IiwiYm9keUEiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImVuZ2luZSIsImdyb3VuZHMiLCJwbGF5ZXJzIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJFbmdpbmUiLCJjcmVhdGUiLCJyZWN0TW9kZSIsIkNFTlRFUiIsImRyYXciLCJiYWNrZ3JvdW5kIiwidXBkYXRlIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJzaG93Iiwia2V5UHJlc3NlZCIsImtleUNvZGUi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QUl2QixNQUFKLENBQVdpQixRQUFRLEVBQW5CLEVBQXVCQyxTQUFTLEdBQWhDLEVBQXFDLEVBQXJDLEVBQXlDLEdBQXpDLEVBQThDYixLQUE5QyxDQUFiOztBQUdBLFNBQUssSUFBSWdELElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFDeEJTLGdCQUFRdkMsSUFBUixDQUFhLElBQUlLLE1BQUosQ0FBV1gsUUFBUSxDQUFuQixFQUFzQkMsU0FBUyxDQUEvQixFQUFrQyxFQUFsQyxFQUFzQ2IsS0FBdEMsQ0FBYjtBQUNIOztBQUVEbUUsYUFBU0MsTUFBVDtBQUNIOztBQUVELFNBQVNDLElBQVQsR0FBZ0I7QUFDWkMsZUFBVyxDQUFYO0FBQ0FuRSxXQUFPOEQsTUFBUCxDQUFjTSxNQUFkLENBQXFCaEIsTUFBckI7O0FBRUFDLFlBQVFnQixPQUFSLENBQWdCLG1CQUFXO0FBQ3ZCQyxnQkFBUUMsSUFBUjtBQUNILEtBRkQ7QUFHQWpCLFlBQVFlLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRQyxJQUFSO0FBQ0FELGdCQUFRRixNQUFSLENBQWVuQyxTQUFmLEVBQTBCb0IsUUFBUSxDQUFSLENBQTFCO0FBQ0gsS0FIRDtBQUlIOztBQUVELFNBQVNtQixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVd4QyxTQUFmLEVBQ0lBLFVBQVV3QyxPQUFWLElBQXFCLElBQXJCO0FBQ1A7O0FBRUQsU0FBU0MsV0FBVCxHQUF1QjtBQUNuQixRQUFJRCxXQUFXeEMsU0FBZixFQUNJQSxVQUFVd0MsT0FBVixJQUFxQixLQUFyQjtBQUNQIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBhbmdsZSA9IDApIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZSxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjNcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuNDtcclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICByZWN0KDAgLSB0aGlzLnJhZGl1cyAvIDIsIDAsIDMwLCAxMCk7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgaWYgKGtleVN0YXRlc1szN10pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAtdGhpcy5tb3ZlbWVudFNwZWVkLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JvdW5kZWQpXHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5U3RhdGVzWzM5XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmdyb3VuZGVkKVxyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1szN10gJiYgIWtleVN0YXRlc1szOV0pIHx8IChrZXlTdGF0ZXNbMzddICYmIGtleVN0YXRlc1szOV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvblxyXG5cclxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IE1hdHRlci5RdWVyeS5yYXkoW2dyb3VuZC5ib2R5XSwgcG9zLCB7XHJcbiAgICAgICAgICAgIHg6IHBvcy54LFxyXG4gICAgICAgICAgICB5OiBoZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxpc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZGlzdChwb3MueCwgcG9zLnksXHJcbiAgICAgICAgICAgICAgICBwb3MueCwgY29sbGlzaW9uc1tpXS5ib2R5QS5wb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZSA8IG1pbkRpc3RhbmNlID8gZGlzdGFuY2UgOiBtaW5EaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtaW5EaXN0YW5jZSA8PSB0aGlzLnJhZGl1cyArIGdyb3VuZC5oZWlnaHQgLyAyICsgMykge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzJdKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ncm91bmRlZCAmJiB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyIDwgdGhpcy5tYXhKdW1wTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ncm91bmRlZCkge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzWzMyXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG5cclxubGV0IGVuZ2luZTtcclxubGV0IHdvcmxkO1xyXG5cclxubGV0IGdyb3VuZHMgPSBbXTtcclxubGV0IHBsYXllcnMgPSBbXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UgLy8gRFxyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgICBsZXQgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcclxuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcclxuICAgIGVuZ2luZSA9IE1hdHRlci5FbmdpbmUuY3JlYXRlKCk7XHJcbiAgICB3b3JsZCA9IGVuZ2luZS53b3JsZDtcclxuXHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAvIDIsIGhlaWdodCAtIDEwLCB3aWR0aCwgMjAsIHdvcmxkKSk7XHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCgxMCwgaGVpZ2h0IC0gMTcwLCAyMCwgMzAwLCB3b3JsZCkpO1xyXG4gICAgZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQod2lkdGggLSAxMCwgaGVpZ2h0IC0gMTcwLCAyMCwgMzAwLCB3b3JsZCkpO1xyXG5cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE7IGkrKykge1xyXG4gICAgICAgIHBsYXllcnMucHVzaChuZXcgUGxheWVyKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMjAsIHdvcmxkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBNYXR0ZXIuRW5naW5lLnVwZGF0ZShlbmdpbmUpO1xyXG5cclxuICAgIGdyb3VuZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgIH0pO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgIGVsZW1lbnQudXBkYXRlKGtleVN0YXRlcywgZ3JvdW5kc1swXSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcclxuICAgIGlmIChrZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBmYWxzZTtcclxufSJdfQ==
