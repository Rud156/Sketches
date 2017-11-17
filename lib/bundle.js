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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJib2R5IiwiTWF0dGVyIiwiQm9kaWVzIiwiY2lyY2xlIiwibGFiZWwiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwiV29ybGQiLCJhZGQiLCJtb3ZlbWVudFNwZWVkIiwic2V0VmVsb2NpdHkiLCJmaWxsIiwibm9TdHJva2UiLCJwb3MiLCJwb3NpdGlvbiIsInB1c2giLCJ0cmFuc2xhdGUiLCJlbGxpcHNlIiwicG9wIiwiQm9keSIsImNvcyIsInNpbiIsInJlbW92ZSIsInZlbG9jaXR5Iiwic3FydCIsInNxIiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJyZWN0YW5nbGUiLCJpc1N0YXRpYyIsIndpZHRoIiwiaGVpZ2h0Iiwicm90YXRlIiwicmVjdCIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsInN0cm9rZVdlaWdodCIsInN0cm9rZSIsImxpbmUiLCJhY3RpdmVLZXlzIiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwiZ3JvdW5kIiwieFZlbG9jaXR5IiwiY29sbGlzaW9ucyIsIlF1ZXJ5IiwicmF5IiwibWluRGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaSIsImxlbmd0aCIsImRpc3RhbmNlIiwiZGlzdCIsImJvZHlBIiwiZHJhd0NoYXJnZWRTaG90Iiwicm90YXRlQmxhc3RlciIsIm1vdmVIb3Jpem9udGFsIiwibW92ZVZlcnRpY2FsIiwiY2hhcmdlQW5kU2hvb3QiLCJzaG93IiwiY2hlY2tWZWxvY2l0eVplcm8iLCJyZW1vdmVGcm9tV29ybGQiLCJzcGxpY2UiLCJlbmdpbmUiLCJncm91bmRzIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwicmVjdE1vZGUiLCJDRU5URVIiLCJkcmF3IiwiYmFja2dyb3VuZCIsInVwZGF0ZSIsImZvckVhY2giLCJlbGVtZW50Iiwia2V5UHJlc3NlZCIsImtleUNvZGUiLCJrZXlSZWxlYXNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFM7QUFDRix1QkFBWUMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUNDLEtBQWpDLEVBQXdDO0FBQUE7O0FBQ3BDLGFBQUtGLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGFBQUtHLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjQyxNQUFkLENBQXFCUixDQUFyQixFQUF3QkMsQ0FBeEIsRUFBMkIsS0FBS0MsTUFBaEMsRUFBd0M7QUFDaERPLG1CQUFPLFdBRHlDO0FBRWhEQyxzQkFBVSxHQUZzQztBQUdoREMseUJBQWE7QUFIbUMsU0FBeEMsQ0FBWjtBQUtBTCxlQUFPTSxLQUFQLENBQWFDLEdBQWIsQ0FBaUJULEtBQWpCLEVBQXdCLEtBQUtDLElBQTdCOztBQUVBLGFBQUtTLGFBQUwsR0FBcUIsS0FBS1osTUFBTCxHQUFjLEdBQW5DO0FBQ0EsYUFBS0MsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsYUFBS0MsS0FBTCxHQUFhQSxLQUFiOztBQUVBLGFBQUtXLFdBQUw7QUFDSDs7OzsrQkFFTTtBQUNIQyxpQkFBSyxHQUFMO0FBQ0FDOztBQUVBLGdCQUFJQyxNQUFNLEtBQUtiLElBQUwsQ0FBVWMsUUFBcEI7O0FBRUFDO0FBQ0FDLHNCQUFVSCxJQUFJbEIsQ0FBZCxFQUFpQmtCLElBQUlqQixDQUFyQjtBQUNBcUIsb0JBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxLQUFLcEIsTUFBTCxHQUFjLENBQTVCO0FBQ0FxQjtBQUNIOzs7c0NBRWE7QUFDVmpCLG1CQUFPa0IsSUFBUCxDQUFZVCxXQUFaLENBQXdCLEtBQUtWLElBQTdCLEVBQW1DO0FBQy9CTCxtQkFBRyxLQUFLYyxhQUFMLEdBQXFCVyxJQUFJLEtBQUt0QixLQUFULENBRE87QUFFL0JGLG1CQUFHLEtBQUthLGFBQUwsR0FBcUJZLElBQUksS0FBS3ZCLEtBQVQ7QUFGTyxhQUFuQztBQUlIOzs7MENBRWlCO0FBQ2RHLG1CQUFPTSxLQUFQLENBQWFlLE1BQWIsQ0FBb0IsS0FBS3ZCLEtBQXpCLEVBQWdDLEtBQUtDLElBQXJDO0FBQ0g7Ozs0Q0FFbUI7QUFDaEIsZ0JBQUl1QixXQUFXLEtBQUt2QixJQUFMLENBQVV1QixRQUF6QjtBQUNBLG1CQUFPQyxLQUFLQyxHQUFHRixTQUFTNUIsQ0FBWixJQUFpQjhCLEdBQUdGLFNBQVMzQixDQUFaLENBQXRCLEtBQXlDLElBQWhEO0FBQ0g7Ozs7OztJQUlDOEIsTTtBQUNGLG9CQUFZL0IsQ0FBWixFQUFlQyxDQUFmLEVBQWtCK0IsV0FBbEIsRUFBK0JDLFlBQS9CLEVBQTZDN0IsS0FBN0MsRUFBK0Q7QUFBQSxZQUFYRCxLQUFXLHVFQUFILENBQUc7O0FBQUE7O0FBQzNELGFBQUtFLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjMkIsU0FBZCxDQUF3QmxDLENBQXhCLEVBQTJCQyxDQUEzQixFQUE4QitCLFdBQTlCLEVBQTJDQyxZQUEzQyxFQUF5RDtBQUNqRUUsc0JBQVUsSUFEdUQ7QUFFakV6QixzQkFBVSxDQUZ1RDtBQUdqRUMseUJBQWEsQ0FIb0Q7QUFJakVSLG1CQUFPQSxLQUowRDtBQUtqRU0sbUJBQU87QUFMMEQsU0FBekQsQ0FBWjtBQU9BSCxlQUFPTSxLQUFQLENBQWFDLEdBQWIsQ0FBaUJULEtBQWpCLEVBQXdCLEtBQUtDLElBQTdCOztBQUVBLGFBQUsrQixLQUFMLEdBQWFKLFdBQWI7QUFDQSxhQUFLSyxNQUFMLEdBQWNKLFlBQWQ7QUFDSDs7OzsrQkFFTTtBQUNIakIsaUJBQUssR0FBTCxFQUFVLENBQVYsRUFBYSxDQUFiO0FBQ0FDOztBQUVBLGdCQUFJQyxNQUFNLEtBQUtiLElBQUwsQ0FBVWMsUUFBcEI7QUFDQSxnQkFBSWhCLFFBQVEsS0FBS0UsSUFBTCxDQUFVRixLQUF0Qjs7QUFFQWlCO0FBQ0FDLHNCQUFVSCxJQUFJbEIsQ0FBZCxFQUFpQmtCLElBQUlqQixDQUFyQjtBQUNBcUMsbUJBQU9uQyxLQUFQO0FBQ0FvQyxpQkFBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLEtBQUtILEtBQWhCLEVBQXVCLEtBQUtDLE1BQTVCO0FBQ0FkO0FBQ0g7Ozs7OztJQU9DaUIsTTtBQUNGLG9CQUFZeEMsQ0FBWixFQUFlQyxDQUFmLEVBQWtCQyxNQUFsQixFQUEwQkUsS0FBMUIsRUFBaUM7QUFBQTs7QUFDN0IsYUFBS0MsSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNDLE1BQWQsQ0FBcUJSLENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQkMsTUFBM0IsRUFBbUM7QUFDM0NPLG1CQUFPLFFBRG9DO0FBRTNDQyxzQkFBVSxHQUZpQztBQUczQ0MseUJBQWE7QUFIOEIsU0FBbkMsQ0FBWjtBQUtBTCxlQUFPTSxLQUFQLENBQWFDLEdBQWIsQ0FBaUJULEtBQWpCLEVBQXdCLEtBQUtDLElBQTdCO0FBQ0EsYUFBS0QsS0FBTCxHQUFhQSxLQUFiOztBQUVBLGFBQUtGLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGFBQUtZLGFBQUwsR0FBcUIsRUFBckI7QUFDQSxhQUFLMkIsZUFBTCxHQUF1QixHQUF2Qjs7QUFFQSxhQUFLQyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsYUFBS0Msa0JBQUwsR0FBMEIsQ0FBMUI7O0FBRUEsYUFBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxhQUFLQyxpQkFBTCxHQUF5QixDQUF6Qjs7QUFFQSxhQUFLQyxPQUFMLEdBQWUsRUFBZjtBQUNBLGFBQUtDLGtCQUFMLEdBQTBCLENBQTFCO0FBQ0EsYUFBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLGFBQUtDLGtCQUFMLEdBQTBCLEtBQUtGLGtCQUEvQjtBQUNBLGFBQUtHLG9CQUFMLEdBQTRCLEdBQTVCO0FBQ0EsYUFBS0MsYUFBTCxHQUFxQixLQUFyQjtBQUNIOzs7OytCQUVNO0FBQ0hwQyxpQkFBSyxDQUFMLEVBQVEsR0FBUixFQUFhLENBQWI7QUFDQUM7O0FBRUEsZ0JBQUlDLE1BQU0sS0FBS2IsSUFBTCxDQUFVYyxRQUFwQjtBQUNBLGdCQUFJaEIsUUFBUSxLQUFLRSxJQUFMLENBQVVGLEtBQXRCOztBQUVBaUI7QUFDQUMsc0JBQVVILElBQUlsQixDQUFkLEVBQWlCa0IsSUFBSWpCLENBQXJCO0FBQ0FxQyxtQkFBT25DLEtBQVA7O0FBRUFtQixvQkFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLEtBQUtwQixNQUFMLEdBQWMsQ0FBNUI7O0FBRUFjLGlCQUFLLEdBQUw7QUFDQU0sb0JBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxLQUFLcEIsTUFBbkI7QUFDQXFDLGlCQUFLLElBQUksS0FBS3JDLE1BQUwsR0FBYyxDQUF2QixFQUEwQixDQUExQixFQUE2QixLQUFLQSxNQUFMLEdBQWMsR0FBM0MsRUFBZ0QsS0FBS0EsTUFBTCxHQUFjLENBQTlEOztBQUlBbUQseUJBQWEsQ0FBYjtBQUNBQyxtQkFBTyxDQUFQO0FBQ0FDLGlCQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsS0FBS3JELE1BQUwsR0FBYyxJQUF6QixFQUErQixDQUEvQjs7QUFFQXFCO0FBQ0g7OztzQ0FFYWlDLFUsRUFBWTtBQUN0QixnQkFBSUEsV0FBVyxFQUFYLENBQUosRUFBb0I7QUFDaEJsRCx1QkFBT2tCLElBQVAsQ0FBWWlDLGtCQUFaLENBQStCLEtBQUtwRCxJQUFwQyxFQUEwQyxDQUFDLEtBQUtvQyxlQUFoRDtBQUNILGFBRkQsTUFFTyxJQUFJZSxXQUFXLEVBQVgsQ0FBSixFQUFvQjtBQUN2QmxELHVCQUFPa0IsSUFBUCxDQUFZaUMsa0JBQVosQ0FBK0IsS0FBS3BELElBQXBDLEVBQTBDLEtBQUtvQyxlQUEvQztBQUNIOztBQUVELGdCQUFLLENBQUNpQixVQUFVLEVBQVYsQ0FBRCxJQUFrQixDQUFDQSxVQUFVLEVBQVYsQ0FBcEIsSUFBdUNBLFVBQVUsRUFBVixLQUFpQkEsVUFBVSxFQUFWLENBQTVELEVBQTRFO0FBQ3hFcEQsdUJBQU9rQixJQUFQLENBQVlpQyxrQkFBWixDQUErQixLQUFLcEQsSUFBcEMsRUFBMEMsQ0FBMUM7QUFDSDtBQUNKOzs7dUNBRWNtRCxVLEVBQVk7QUFDdkIsZ0JBQUlHLFlBQVksS0FBS3RELElBQUwsQ0FBVXVCLFFBQVYsQ0FBbUIzQixDQUFuQzs7QUFFQSxnQkFBSXVELFdBQVcsRUFBWCxDQUFKLEVBQW9CO0FBQ2hCbEQsdUJBQU9rQixJQUFQLENBQVlULFdBQVosQ0FBd0IsS0FBS1YsSUFBN0IsRUFBbUM7QUFDL0JMLHVCQUFHLENBQUMsS0FBS2MsYUFEc0I7QUFFL0JiLHVCQUFHMEQ7QUFGNEIsaUJBQW5DO0FBSUFyRCx1QkFBT2tCLElBQVAsQ0FBWWlDLGtCQUFaLENBQStCLEtBQUtwRCxJQUFwQyxFQUEwQyxDQUExQztBQUNILGFBTkQsTUFNTyxJQUFJbUQsV0FBVyxFQUFYLENBQUosRUFBb0I7QUFDdkJsRCx1QkFBT2tCLElBQVAsQ0FBWVQsV0FBWixDQUF3QixLQUFLVixJQUE3QixFQUFtQztBQUMvQkwsdUJBQUcsS0FBS2MsYUFEdUI7QUFFL0JiLHVCQUFHMEQ7QUFGNEIsaUJBQW5DO0FBSUFyRCx1QkFBT2tCLElBQVAsQ0FBWWlDLGtCQUFaLENBQStCLEtBQUtwRCxJQUFwQyxFQUEwQyxDQUExQztBQUNIOztBQUVELGdCQUFLLENBQUNxRCxVQUFVLEVBQVYsQ0FBRCxJQUFrQixDQUFDQSxVQUFVLEVBQVYsQ0FBcEIsSUFBdUNBLFVBQVUsRUFBVixLQUFpQkEsVUFBVSxFQUFWLENBQTVELEVBQTRFO0FBQ3hFcEQsdUJBQU9rQixJQUFQLENBQVlULFdBQVosQ0FBd0IsS0FBS1YsSUFBN0IsRUFBbUM7QUFDL0JMLHVCQUFHLENBRDRCO0FBRS9CQyx1QkFBRzBEO0FBRjRCLGlCQUFuQztBQUlIO0FBQ0o7OztxQ0FFWUgsVSxFQUFZSSxNLEVBQVE7QUFDN0IsZ0JBQUlDLFlBQVksS0FBS3hELElBQUwsQ0FBVXVCLFFBQVYsQ0FBbUI1QixDQUFuQztBQUNBLGdCQUFJa0IsTUFBTSxLQUFLYixJQUFMLENBQVVjLFFBQXBCOztBQUVBLGdCQUFJMkMsYUFBYXhELE9BQU95RCxLQUFQLENBQWFDLEdBQWIsQ0FBaUIsQ0FBQ0osT0FBT3ZELElBQVIsQ0FBakIsRUFBZ0NhLEdBQWhDLEVBQXFDO0FBQ2xEbEIsbUJBQUdrQixJQUFJbEIsQ0FEMkM7QUFFbERDLG1CQUFHb0M7QUFGK0MsYUFBckMsQ0FBakI7QUFJQSxnQkFBSTRCLGNBQWNDLE9BQU9DLGdCQUF6QjtBQUNBLGlCQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSU4sV0FBV08sTUFBL0IsRUFBdUNELEdBQXZDLEVBQTRDO0FBQ3hDLG9CQUFJRSxXQUFXQyxLQUFLckQsSUFBSWxCLENBQVQsRUFBWWtCLElBQUlqQixDQUFoQixFQUNYaUIsSUFBSWxCLENBRE8sRUFDSjhELFdBQVdNLENBQVgsRUFBY0ksS0FBZCxDQUFvQnJELFFBQXBCLENBQTZCbEIsQ0FEekIsQ0FBZjtBQUVBZ0UsOEJBQWNLLFdBQVdMLFdBQVgsR0FBeUJLLFFBQXpCLEdBQW9DTCxXQUFsRDtBQUNIOztBQUVELGdCQUFJQSxlQUFlLEtBQUsvRCxNQUFMLEdBQWMwRCxPQUFPdkIsTUFBUCxHQUFnQixDQUE5QixHQUFrQyxLQUFLTSxrQkFBMUQsRUFBOEU7QUFDMUUscUJBQUtDLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxxQkFBS0UsaUJBQUwsR0FBeUIsQ0FBekI7QUFDSCxhQUhELE1BSUksS0FBS0YsUUFBTCxHQUFnQixLQUFoQjs7QUFFSixnQkFBSVksV0FBVyxFQUFYLENBQUosRUFBb0I7QUFDaEIsb0JBQUksQ0FBQyxLQUFLWixRQUFOLElBQWtCLEtBQUtFLGlCQUFMLEdBQXlCLEtBQUtELGFBQXBELEVBQW1FO0FBQy9EdkMsMkJBQU9rQixJQUFQLENBQVlULFdBQVosQ0FBd0IsS0FBS1YsSUFBN0IsRUFBbUM7QUFDL0JMLDJCQUFHNkQsU0FENEI7QUFFL0I1RCwyQkFBRyxDQUFDLEtBQUt5QztBQUZzQixxQkFBbkM7QUFJQSx5QkFBS0ksaUJBQUw7QUFDSCxpQkFORCxNQU1PLElBQUksS0FBS0YsUUFBVCxFQUFtQjtBQUN0QnRDLDJCQUFPa0IsSUFBUCxDQUFZVCxXQUFaLENBQXdCLEtBQUtWLElBQTdCLEVBQW1DO0FBQy9CTCwyQkFBRzZELFNBRDRCO0FBRS9CNUQsMkJBQUcsQ0FBQyxLQUFLeUM7QUFGc0IscUJBQW5DO0FBSUEseUJBQUtJLGlCQUFMO0FBQ0g7QUFDSjs7QUFFRFUsdUJBQVcsRUFBWCxJQUFpQixLQUFqQjtBQUNIOzs7d0NBRWV4RCxDLEVBQUdDLEMsRUFBR0MsTSxFQUFRO0FBQzFCYyxpQkFBSyxHQUFMO0FBQ0FDOztBQUVBSyxvQkFBUXRCLENBQVIsRUFBV0MsQ0FBWCxFQUFjQyxTQUFTLENBQXZCO0FBQ0g7Ozt1Q0FFY3NELFUsRUFBWTtBQUN2QixnQkFBSXRDLE1BQU0sS0FBS2IsSUFBTCxDQUFVYyxRQUFwQjtBQUNBLGdCQUFJaEIsUUFBUSxLQUFLRSxJQUFMLENBQVVGLEtBQXRCOztBQUVBLGdCQUFJSCxJQUFJLEtBQUtFLE1BQUwsR0FBY3VCLElBQUl0QixLQUFKLENBQWQsR0FBMkIsR0FBM0IsR0FBaUNlLElBQUlsQixDQUE3QztBQUNBLGdCQUFJQyxJQUFJLEtBQUtDLE1BQUwsR0FBY3dCLElBQUl2QixLQUFKLENBQWQsR0FBMkIsR0FBM0IsR0FBaUNlLElBQUlqQixDQUE3Qzs7QUFFQSxnQkFBSXVELFdBQVcsRUFBWCxDQUFKLEVBQW9CO0FBQ2hCLHFCQUFLSixhQUFMLEdBQXFCLElBQXJCO0FBQ0EscUJBQUtGLGtCQUFMLElBQTJCLEtBQUtDLG9CQUFoQzs7QUFFQSxxQkFBS0Qsa0JBQUwsR0FBMEIsS0FBS0Esa0JBQUwsR0FBMEIsS0FBS0QsY0FBL0IsR0FDdEIsS0FBS0EsY0FEaUIsR0FDQSxLQUFLQyxrQkFEL0I7O0FBR0EscUJBQUt1QixlQUFMLENBQXFCekUsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCLEtBQUtpRCxrQkFBaEM7QUFFSCxhQVRELE1BU08sSUFBSSxDQUFDTSxXQUFXLEVBQVgsQ0FBRCxJQUFtQixLQUFLSixhQUE1QixFQUEyQztBQUM5QyxxQkFBS0wsT0FBTCxDQUFhM0IsSUFBYixDQUFrQixJQUFJckIsU0FBSixDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQixLQUFLaUQsa0JBQXpCLEVBQTZDL0MsS0FBN0MsRUFBb0QsS0FBS0MsS0FBekQsQ0FBbEI7O0FBRUEscUJBQUtnRCxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EscUJBQUtGLGtCQUFMLEdBQTBCLEtBQUtGLGtCQUEvQjtBQUNIO0FBQ0o7OzsrQkFFTVEsVSxFQUFZSSxNLEVBQVE7QUFDdkIsaUJBQUtjLGFBQUwsQ0FBbUJsQixVQUFuQjtBQUNBLGlCQUFLbUIsY0FBTCxDQUFvQm5CLFVBQXBCO0FBQ0EsaUJBQUtvQixZQUFMLENBQWtCcEIsVUFBbEIsRUFBOEJJLE1BQTlCOztBQUVBLGlCQUFLaUIsY0FBTCxDQUFvQnJCLFVBQXBCOztBQUVBLGlCQUFLLElBQUlZLElBQUksQ0FBYixFQUFnQkEsSUFBSSxLQUFLckIsT0FBTCxDQUFhc0IsTUFBakMsRUFBeUNELEdBQXpDLEVBQThDO0FBQzFDLHFCQUFLckIsT0FBTCxDQUFhcUIsQ0FBYixFQUFnQlUsSUFBaEI7O0FBRUEsb0JBQUksS0FBSy9CLE9BQUwsQ0FBYXFCLENBQWIsRUFBZ0JXLGlCQUFoQixFQUFKLEVBQXlDO0FBQ3JDLHlCQUFLaEMsT0FBTCxDQUFhcUIsQ0FBYixFQUFnQlksZUFBaEI7QUFDQSx5QkFBS2pDLE9BQUwsQ0FBYWtDLE1BQWIsQ0FBb0JiLENBQXBCLEVBQXVCLENBQXZCO0FBQ0FBLHlCQUFLLENBQUw7QUFDSDtBQUNKO0FBQ0o7Ozs7OztBQU1MLElBQUljLGVBQUo7QUFDQSxJQUFJOUUsY0FBSjs7QUFFQSxJQUFJK0UsVUFBVSxFQUFkO0FBQ0EsSUFBSUMsVUFBVSxFQUFkOztBQUVBLElBQU0xQixZQUFZO0FBQ2QsUUFBSSxLQURVO0FBRWQsUUFBSSxLQUZVO0FBR2QsUUFBSSxLQUhVO0FBSWQsUUFBSSxLQUpVO0FBS2QsUUFBSSxLQUxVO0FBTWQsUUFBSSxLQU5VO0FBT2QsUUFBSSxLQVBVO0FBUWQsUUFBSSxLQVJVO0FBU2QsUUFBSSxLQVRVO0FBVWQsUUFBSTtBQVZVLENBQWxCOztBQWFBLFNBQVMyQixLQUFULEdBQWlCO0FBQ2IsUUFBSUMsU0FBU0MsYUFBYUMsT0FBT0MsVUFBUCxHQUFvQixFQUFqQyxFQUFxQ0QsT0FBT0UsV0FBUCxHQUFxQixFQUExRCxDQUFiO0FBQ0FKLFdBQU9LLE1BQVAsQ0FBYyxlQUFkO0FBQ0FULGFBQVM1RSxPQUFPc0YsTUFBUCxDQUFjQyxNQUFkLEVBQVQ7QUFDQXpGLFlBQVE4RSxPQUFPOUUsS0FBZjs7QUFFQStFLFlBQVEvRCxJQUFSLENBQWEsSUFBSVcsTUFBSixDQUFXSyxRQUFRLENBQW5CLEVBQXNCQyxTQUFTLEVBQS9CLEVBQW1DRCxLQUFuQyxFQUEwQyxFQUExQyxFQUE4Q2hDLEtBQTlDLENBQWI7QUFDQStFLFlBQVEvRCxJQUFSLENBQWEsSUFBSVcsTUFBSixDQUFXLEVBQVgsRUFBZU0sU0FBUyxHQUF4QixFQUE2QixFQUE3QixFQUFpQyxHQUFqQyxFQUFzQ2pDLEtBQXRDLENBQWI7QUFDQStFLFlBQVEvRCxJQUFSLENBQWEsSUFBSVcsTUFBSixDQUFXSyxRQUFRLEVBQW5CLEVBQXVCQyxTQUFTLEdBQWhDLEVBQXFDLEVBQXJDLEVBQXlDLEdBQXpDLEVBQThDakMsS0FBOUMsQ0FBYjs7QUFHQSxTQUFLLElBQUlnRSxJQUFJLENBQWIsRUFBZ0JBLElBQUksQ0FBcEIsRUFBdUJBLEdBQXZCLEVBQTRCO0FBQ3hCZ0IsZ0JBQVFoRSxJQUFSLENBQWEsSUFBSW9CLE1BQUosQ0FBV0osUUFBUSxDQUFuQixFQUFzQkMsU0FBUyxDQUEvQixFQUFrQyxFQUFsQyxFQUFzQ2pDLEtBQXRDLENBQWI7QUFDSDs7QUFFRDBGLGFBQVNDLE1BQVQ7QUFDSDs7QUFFRCxTQUFTQyxJQUFULEdBQWdCO0FBQ1pDLGVBQVcsQ0FBWDtBQUNBM0YsV0FBT3NGLE1BQVAsQ0FBY00sTUFBZCxDQUFxQmhCLE1BQXJCOztBQUVBQyxZQUFRZ0IsT0FBUixDQUFnQixtQkFBVztBQUN2QkMsZ0JBQVF0QixJQUFSO0FBQ0gsS0FGRDtBQUdBTSxZQUFRZSxPQUFSLENBQWdCLG1CQUFXO0FBQ3ZCQyxnQkFBUXRCLElBQVI7QUFDQXNCLGdCQUFRRixNQUFSLENBQWV4QyxTQUFmLEVBQTBCeUIsUUFBUSxDQUFSLENBQTFCO0FBQ0gsS0FIRDtBQUlIOztBQUVELFNBQVNrQixVQUFULEdBQXNCO0FBQ2xCLFFBQUlDLFdBQVc1QyxTQUFmLEVBQ0lBLFVBQVU0QyxPQUFWLElBQXFCLElBQXJCO0FBQ1A7O0FBRUQsU0FBU0MsV0FBVCxHQUF1QjtBQUNuQixRQUFJRCxXQUFXNUMsU0FBZixFQUNJQSxVQUFVNEMsT0FBVixJQUFxQixLQUFyQjtBQUNQIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFzaWNGaXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgYW5nbGUsIHdvcmxkKSB7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgdGhpcy5yYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdiYXNpY0ZpcmUnLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC44XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAxLjQ7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHcm91bmQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZ3JvdW5kV2lkdGgsIGdyb3VuZEhlaWdodCwgd29ybGQsIGFuZ2xlID0gMCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAxLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCdcclxuICAgICAgICB9KTtcclxuICAgICAgICBNYXR0ZXIuV29ybGQuYWRkKHdvcmxkLCB0aGlzLmJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZ3JvdW5kV2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBncm91bmRIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICByb3RhdGUoYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFzaWMtZmlyZS5qc1wiIC8+aW1wb3J0IHsgcG9ydCB9IGZyb20gXCJfZGVidWdnZXJcIjtcclxuXHJcblxyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cywgd29ybGQpIHtcclxuICAgICAgICB0aGlzLmJvZHkgPSBNYXR0ZXIuQm9kaWVzLmNpcmNsZSh4LCB5LCByYWRpdXMsIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdwbGF5ZXInLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMC4zLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4zXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWF4SnVtcE51bWJlciA9IDM7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlID0gNTtcclxuICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlID0gMTI7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZTtcclxuICAgICAgICB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlID0gMC4xO1xyXG4gICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgcm90YXRlKGFuZ2xlKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG5cclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgZWxsaXBzZSgwLCAwLCB0aGlzLnJhZGl1cyk7XHJcbiAgICAgICAgcmVjdCgwICsgdGhpcy5yYWRpdXMgLyAyLCAwLCB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5yYWRpdXMgLyAyKTtcclxuXHJcbiAgICAgICAgLy8gZWxsaXBzZSgtdGhpcy5yYWRpdXMgKiAxLjUsIDAsIDUpO1xyXG5cclxuICAgICAgICBzdHJva2VXZWlnaHQoMSk7XHJcbiAgICAgICAgc3Ryb2tlKDApO1xyXG4gICAgICAgIGxpbmUoMCwgMCwgdGhpcy5yYWRpdXMgKiAxLjI1LCAwKTtcclxuXHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzhdKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIC10aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzQwXSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCB0aGlzLmFuZ3VsYXJWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzhdICYmICFrZXlTdGF0ZXNbNDBdKSB8fCAoa2V5U3RhdGVzWzM4XSAmJiBrZXlTdGF0ZXNbNDBdKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUhvcml6b250YWwoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCB5VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzddKSB7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgeDogLXRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVLZXlzWzM5XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCxcclxuICAgICAgICAgICAgICAgIHk6IHlWZWxvY2l0eVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbMzddICYmICFrZXlTdGF0ZXNbMzldKSB8fCAoa2V5U3RhdGVzWzM3XSAmJiBrZXlTdGF0ZXNbMzldKSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVWZXJ0aWNhbChhY3RpdmVLZXlzLCBncm91bmQpIHtcclxuICAgICAgICBsZXQgeFZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvblxyXG5cclxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IE1hdHRlci5RdWVyeS5yYXkoW2dyb3VuZC5ib2R5XSwgcG9zLCB7XHJcbiAgICAgICAgICAgIHg6IHBvcy54LFxyXG4gICAgICAgICAgICB5OiBoZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxpc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZGlzdChwb3MueCwgcG9zLnksXHJcbiAgICAgICAgICAgICAgICBwb3MueCwgY29sbGlzaW9uc1tpXS5ib2R5QS5wb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZSA8IG1pbkRpc3RhbmNlID8gZGlzdGFuY2UgOiBtaW5EaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtaW5EaXN0YW5jZSA8PSB0aGlzLnJhZGl1cyArIGdyb3VuZC5oZWlnaHQgLyAyICsgdGhpcy5qdW1wQnJlYXRoaW5nU3BhY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzMyXSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JvdW5kZWQgJiYgdGhpcy5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SnVtcE51bWJlcisrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JvdW5kZWQpIHtcclxuICAgICAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldFZlbG9jaXR5KHRoaXMuYm9keSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHhWZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5qdW1wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWN0aXZlS2V5c1szMl0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Q2hhcmdlZFNob3QoeCwgeSwgcmFkaXVzKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoeCwgeSwgcmFkaXVzICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgY2hhcmdlQW5kU2hvb3QoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgbGV0IGFuZ2xlID0gdGhpcy5ib2R5LmFuZ2xlO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzICogY29zKGFuZ2xlKSAqIDEuNSArIHBvcy54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgKiBzaW4oYW5nbGUpICogMS41ICsgcG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzEzXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSArPSB0aGlzLmNoYXJnZUluY3JlbWVudFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUgPSB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA+IHRoaXMubWF4Q2hhcmdlVmFsdWUgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA6IHRoaXMuY3VycmVudENoYXJnZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmF3Q2hhcmdlZFNob3QoeCwgeSwgdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKCFhY3RpdmVLZXlzWzEzXSAmJiB0aGlzLmNoYXJnZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJhc2ljRmlyZSh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSwgYW5nbGUsIHRoaXMud29ybGQpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVCbGFzdGVyKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZUhvcml6b250YWwoYWN0aXZlS2V5cyk7XHJcbiAgICAgICAgdGhpcy5tb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0uY2hlY2tWZWxvY2l0eVplcm8oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnJlbW92ZUZyb21Xb3JsZCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9tYXR0ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BsYXllci5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dyb3VuZC5qc1wiIC8+XHJcblxyXG5sZXQgZW5naW5lO1xyXG5sZXQgd29ybGQ7XHJcblxyXG5sZXQgZ3JvdW5kcyA9IFtdO1xyXG5sZXQgcGxheWVycyA9IFtdO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSwgLy8gRFxyXG4gICAgMTM6IGZhbHNlXHJcbn07XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gMTAsIHdpZHRoLCAyMCwgd29ybGQpKTtcclxuICAgIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcbiAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAtIDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcblxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSsrKSB7XHJcbiAgICAgICAgcGxheWVycy5wdXNoKG5ldyBQbGF5ZXIod2lkdGggLyAyLCBoZWlnaHQgLyAyLCAyMCwgd29ybGQpKTtcclxuICAgIH1cclxuXHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuICAgIE1hdHRlci5FbmdpbmUudXBkYXRlKGVuZ2luZSk7XHJcblxyXG4gICAgZ3JvdW5kcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xyXG4gICAgfSk7XHJcbiAgICBwbGF5ZXJzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgZWxlbWVudC51cGRhdGUoa2V5U3RhdGVzLCBncm91bmRzWzBdKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG59Il19
