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
        this.angularVelocity = 0.2;

        this.jumpHeight = 10;
        this.jumpBreathingSpace = 3;

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
            ellipse(0, 0, this.radius);
            rect(0 - this.radius / 2, 0, 30, 10);

            strokeWeight(1);
            stroke(0);
            line(0, 0, -this.radius * 1.25, 0);

            pop();
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
            } else if (activeKeys[38]) {
                Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
            } else if (activeKeys[40]) {
                Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
            }

            if (!keyStates[37] && !keyStates[39] || keyStates[37] && keyStates[39]) {
                Matter.Body.setVelocity(this.body, {
                    x: 0,
                    y: yVelocity
                });
            }
            if (!keyStates[38] && !keyStates[40] || keyStates[38] && keyStates[40]) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHcm91bmQiLCJ4IiwieSIsImdyb3VuZFdpZHRoIiwiZ3JvdW5kSGVpZ2h0Iiwid29ybGQiLCJhbmdsZSIsImJvZHkiLCJNYXR0ZXIiLCJCb2RpZXMiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsImZyaWN0aW9uIiwicmVzdGl0dXRpb24iLCJsYWJlbCIsIldvcmxkIiwiYWRkIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJyb3RhdGUiLCJyZWN0IiwicG9wIiwiUGxheWVyIiwicmFkaXVzIiwiY2lyY2xlIiwibW92ZW1lbnRTcGVlZCIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImVsbGlwc2UiLCJzdHJva2VXZWlnaHQiLCJzdHJva2UiLCJsaW5lIiwiYWN0aXZlS2V5cyIsInlWZWxvY2l0eSIsInZlbG9jaXR5IiwiQm9keSIsInNldFZlbG9jaXR5Iiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwiZ3JvdW5kIiwieFZlbG9jaXR5IiwiY29sbGlzaW9ucyIsIlF1ZXJ5IiwicmF5IiwibWluRGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaSIsImxlbmd0aCIsImRpc3RhbmNlIiwiZGlzdCIsImJvZHlBIiwibW92ZUhvcml6b250YWwiLCJtb3ZlVmVydGljYWwiLCJlbmdpbmUiLCJncm91bmRzIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwicmVjdE1vZGUiLCJDRU5URVIiLCJkcmF3IiwiYmFja2dyb3VuZCIsInVwZGF0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QUFSLENBQWdCLG1CQUFXO0FBQ3ZCQyxnQkFBUUMsSUFBUjtBQUNILEtBRkQ7QUFHQWpCLFlBQVFlLE9BQVIsQ0FBZ0IsbUJBQVc7QUFDdkJDLGdCQUFRQyxJQUFSO0FBQ0FELGdCQUFRRixNQUFSLENBQWVoQyxTQUFmLEVBQTBCaUIsUUFBUSxDQUFSLENBQTFCO0FBQ0gsS0FIRDtBQUlIOztBQUVELFNBQVNtQixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVdyQyxTQUFmLEVBQ0lBLFVBQVVxQyxPQUFWLElBQXFCLElBQXJCO0FBQ1A7O0FBRUQsU0FBU0MsV0FBVCxHQUF1QjtBQUNuQixRQUFJRCxXQUFXckMsU0FBZixFQUNJQSxVQUFVcUMsT0FBVixJQUFxQixLQUFyQjtBQUNQIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR3JvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHdvcmxkLCBhbmdsZSA9IDApIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLnJlY3RhbmdsZSh4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIGlzU3RhdGljOiB0cnVlLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXHJcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZSxcclxuICAgICAgICAgICAgbGFiZWw6ICdzdGF0aWNHcm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGdyb3VuZFdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZ3JvdW5kSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuICAgICAgICByZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBwb3AoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywge1xyXG4gICAgICAgICAgICBsYWJlbDogJ3BsYXllcicsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLjMsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjNcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDAuMjtcclxuXHJcbiAgICAgICAgdGhpcy5qdW1wSGVpZ2h0ID0gMTA7XHJcbiAgICAgICAgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UgPSAzO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1heEp1bXBOdW1iZXIgPSAzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwIC0gdGhpcy5yYWRpdXMgLyAyLCAwLCAzMCwgMTApO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgLXRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM3XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IC10aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOF0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgLXRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUtleXNbNDBdKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIHRoaXMuYW5ndWxhclZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1szN10gJiYgIWtleVN0YXRlc1szOV0pIHx8IChrZXlTdGF0ZXNbMzddICYmIGtleVN0YXRlc1szOV0pKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM4XSAmJiAha2V5U3RhdGVzWzQwXSkgfHwgKGtleVN0YXRlc1szOF0gJiYga2V5U3RhdGVzWzQwXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvblxyXG5cclxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IE1hdHRlci5RdWVyeS5yYXkoW2dyb3VuZC5ib2R5XSwgcG9zLCB7XHJcbiAgICAgICAgICAgIHg6IHBvcy54LFxyXG4gICAgICAgICAgICB5OiBoZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxpc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZGlzdChwb3MueCwgcG9zLnksXHJcbiAgICAgICAgICAgICAgICBwb3MueCwgY29sbGlzaW9uc1tpXS5ib2R5QS5wb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZSA8IG1pbkRpc3RhbmNlID8gZGlzdGFuY2UgOiBtaW5EaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtaW5EaXN0YW5jZSA8PSB0aGlzLnJhZGl1cyArIGdyb3VuZC5oZWlnaHQgLyAyICsgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzMyXSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JvdW5kZWQgJiYgdGhpcy5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWN0aXZlS2V5c1szMl0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlSG9yaXpvbnRhbChhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGxheWVyLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ3JvdW5kLmpzXCIgLz5cclxuXHJcbmxldCBlbmdpbmU7XHJcbmxldCB3b3JsZDtcclxuXHJcbmxldCBncm91bmRzID0gW107XHJcbmxldCBwbGF5ZXJzID0gW107XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlIC8vIERcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XHJcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XHJcbiAgICBlbmdpbmUgPSBNYXR0ZXIuRW5naW5lLmNyZWF0ZSgpO1xyXG4gICAgd29ybGQgPSBlbmdpbmUud29ybGQ7XHJcblxyXG4gICAgZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQod2lkdGggLyAyLCBoZWlnaHQgLSAxMCwgd2lkdGgsIDIwLCB3b3JsZCkpO1xyXG4gICAgZ3JvdW5kcy5wdXNoKG5ldyBHcm91bmQoMTAsIGhlaWdodCAtIDE3MCwgMjAsIDMwMCwgd29ybGQpKTtcclxuICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC0gMTAsIGhlaWdodCAtIDE3MCwgMjAsIDMwMCwgd29ybGQpKTtcclxuXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxOyBpKyspIHtcclxuICAgICAgICBwbGF5ZXJzLnB1c2gobmV3IFBsYXllcih3aWR0aCAvIDIsIGhlaWdodCAvIDIsIDIwLCB3b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcclxuXHJcbiAgICBncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICB9KTtcclxuICAgIHBsYXllcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICBlbGVtZW50LnVwZGF0ZShrZXlTdGF0ZXMsIGdyb3VuZHNbMF0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgICBpZiAoa2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2tleUNvZGVdID0gZmFsc2U7XHJcbn0iXX0=
