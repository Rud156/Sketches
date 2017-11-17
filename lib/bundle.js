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
    function Player(x, y, radius, world) {
        var catAndMask = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
            category: playerCategory,
            mask: groundCategory | playerCategory | basicFireCategory
        };

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
        } else if (labelA === 'player' && labelB === 'staticGround') {
            event.pairs[i].bodyA.grounded = true;
            event.pairs[i].bodyA.currentJumpNumber = 0;
        } else if (labelB === 'player' && labelA === 'staticGround') {
            event.pairs[i].bodyB.currentJumpNumber = 0;
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJCYXNpY0ZpcmUiLCJ4IiwieSIsInJhZGl1cyIsImFuZ2xlIiwid29ybGQiLCJjYXRBbmRNYXNrIiwiYm9keSIsIk1hdHRlciIsIkJvZGllcyIsImNpcmNsZSIsImxhYmVsIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImNvbGxpc2lvbkZpbHRlciIsImNhdGVnb3J5IiwibWFzayIsIldvcmxkIiwiYWRkIiwibW92ZW1lbnRTcGVlZCIsInNldFZlbG9jaXR5IiwiZmlsbCIsIm5vU3Ryb2tlIiwicG9zIiwicG9zaXRpb24iLCJwdXNoIiwidHJhbnNsYXRlIiwiZWxsaXBzZSIsInBvcCIsIkJvZHkiLCJjb3MiLCJzaW4iLCJyZW1vdmUiLCJ2ZWxvY2l0eSIsInNxcnQiLCJzcSIsIndpZHRoIiwiaGVpZ2h0IiwiR3JvdW5kIiwiZ3JvdW5kV2lkdGgiLCJncm91bmRIZWlnaHQiLCJncm91bmRDYXRlZ29yeSIsInBsYXllckNhdGVnb3J5IiwiYmFzaWNGaXJlQ2F0ZWdvcnkiLCJidWxsZXRDb2xsaXNpb25MYXllciIsInJlY3RhbmdsZSIsImlzU3RhdGljIiwicm90YXRlIiwicmVjdCIsIlBsYXllciIsImFuZ3VsYXJWZWxvY2l0eSIsImp1bXBIZWlnaHQiLCJqdW1wQnJlYXRoaW5nU3BhY2UiLCJncm91bmRlZCIsIm1heEp1bXBOdW1iZXIiLCJjdXJyZW50SnVtcE51bWJlciIsImJ1bGxldHMiLCJpbml0aWFsQ2hhcmdlVmFsdWUiLCJtYXhDaGFyZ2VWYWx1ZSIsImN1cnJlbnRDaGFyZ2VWYWx1ZSIsImNoYXJnZUluY3JlbWVudFZhbHVlIiwiY2hhcmdlU3RhcnRlZCIsInN0cm9rZVdlaWdodCIsInN0cm9rZSIsImxpbmUiLCJhY3RpdmVLZXlzIiwic2V0QW5ndWxhclZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieVZlbG9jaXR5IiwiZ3JvdW5kT2JqZWN0cyIsInhWZWxvY2l0eSIsImRyYXdDaGFyZ2VkU2hvdCIsInJvdGF0ZUJsYXN0ZXIiLCJtb3ZlSG9yaXpvbnRhbCIsIm1vdmVWZXJ0aWNhbCIsImNoYXJnZUFuZFNob290IiwiaSIsImxlbmd0aCIsInNob3ciLCJjaGVja1ZlbG9jaXR5WmVybyIsImNoZWNrT3V0T2ZTY3JlZW4iLCJyZW1vdmVGcm9tV29ybGQiLCJzcGxpY2UiLCJlbmdpbmUiLCJncm91bmRzIiwicGxheWVycyIsInNldHVwIiwiY2FudmFzIiwiY3JlYXRlQ2FudmFzIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicGFyZW50IiwiRW5naW5lIiwiY3JlYXRlIiwiRXZlbnRzIiwib24iLCJjb2xsaXNpb25FdmVudCIsInJhbmRvbVZhbHVlIiwicmFuZG9tIiwicmVjdE1vZGUiLCJDRU5URVIiLCJkcmF3IiwiYmFja2dyb3VuZCIsInVwZGF0ZSIsImZvckVhY2giLCJlbGVtZW50IiwidGV4dFNpemUiLCJ0ZXh0Iiwicm91bmQiLCJmcmFtZVJhdGUiLCJrZXlQcmVzc2VkIiwia2V5Q29kZSIsImtleVJlbGVhc2VkIiwiZXZlbnQiLCJwYWlycyIsImxhYmVsQSIsImJvZHlBIiwibGFiZWxCIiwiYm9keUIiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVNQSxTO0FBQ0YsdUJBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsTUFBbEIsRUFBMEJDLEtBQTFCLEVBQWlDQyxLQUFqQyxFQUF3Q0MsVUFBeEMsRUFBb0Q7QUFBQTs7QUFDaEQsYUFBS0gsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsYUFBS0ksSUFBTCxHQUFZQyxPQUFPQyxNQUFQLENBQWNDLE1BQWQsQ0FBcUJULENBQXJCLEVBQXdCQyxDQUF4QixFQUEyQixLQUFLQyxNQUFoQyxFQUF3QztBQUNoRFEsbUJBQU8sV0FEeUM7QUFFaERDLHNCQUFVLEdBRnNDO0FBR2hEQyx5QkFBYSxHQUhtQztBQUloREMsNkJBQWlCO0FBQ2JDLDBCQUFVVCxXQUFXUyxRQURSO0FBRWJDLHNCQUFNVixXQUFXVTtBQUZKO0FBSitCLFNBQXhDLENBQVo7QUFTQVIs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QyxDQUF6QztBQUNILFNBSE0sTUFHQSxJQUFJK0QsV0FBVyxRQUFYLElBQXVCRixXQUFXLGNBQXRDLEVBQXNEO0FBQ3pERixrQkFBTUMsS0FBTixDQUFZdkMsQ0FBWixFQUFlMkMsS0FBZixDQUFxQmhFLGlCQUFyQixHQUF5QyxDQUF6QztBQUNIO0FBQ0o7QUFDSiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhc2ljRmlyZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCByYWRpdXMsIGFuZ2xlLCB3b3JsZCwgY2F0QW5kTWFzaykge1xyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMuY2lyY2xlKHgsIHksIHRoaXMucmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnYmFzaWNGaXJlJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMSxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOCxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gdGhpcy5yYWRpdXMgKiAxLjQ7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWZWxvY2l0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUocG9zLngsIHBvcy55KTtcclxuICAgICAgICBlbGxpcHNlKDAsIDAsIHRoaXMucmFkaXVzICogMik7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmVsb2NpdHkoKSB7XHJcbiAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMubW92ZW1lbnRTcGVlZCAqIGNvcyh0aGlzLmFuZ2xlKSxcclxuICAgICAgICAgICAgeTogdGhpcy5tb3ZlbWVudFNwZWVkICogc2luKHRoaXMuYW5nbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRnJvbVdvcmxkKCkge1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1ZlbG9jaXR5WmVybygpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHk7XHJcbiAgICAgICAgcmV0dXJuIHNxcnQoc3EodmVsb2NpdHkueCkgKyBzcSh2ZWxvY2l0eS55KSkgPD0gMC4wNztcclxuICAgIH1cclxuXHJcbiAgICBjaGVja091dE9mU2NyZWVuKCkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmJvZHkucG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcG9zLnggPiB3aWR0aCB8fCBwb3MueCA8IDAgfHwgcG9zLnkgPiBoZWlnaHRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL21hdHRlci5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdyb3VuZCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBncm91bmRXaWR0aCwgZ3JvdW5kSGVpZ2h0LCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogZ3JvdW5kQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5IHwgYnVsbGV0Q29sbGlzaW9uTGF5ZXJcclxuICAgIH0sIGFuZ2xlID0gMCkge1xyXG4gICAgICAgIHRoaXMuYm9keSA9IE1hdHRlci5Cb2RpZXMucmVjdGFuZ2xlKHgsIHksIGdyb3VuZFdpZHRoLCBncm91bmRIZWlnaHQsIHtcclxuICAgICAgICAgICAgaXNTdGF0aWM6IHRydWUsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAxLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcclxuICAgICAgICAgICAgYW5nbGU6IGFuZ2xlLFxyXG4gICAgICAgICAgICBsYWJlbDogJ3N0YXRpY0dyb3VuZCcsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdEFuZE1hc2suY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBtYXNrOiBjYXRBbmRNYXNrLm1hc2tcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE1hdHRlci5Xb3JsZC5hZGQod29ybGQsIHRoaXMuYm9keSk7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBncm91bmRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGdyb3VuZEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcbiAgICAgICAgcmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgcG9wKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYXNpYy1maXJlLmpzXCIgLz5cclxuXHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgcmFkaXVzLCB3b3JsZCwgY2F0QW5kTWFzayA9IHtcclxuICAgICAgICBjYXRlZ29yeTogcGxheWVyQ2F0ZWdvcnksXHJcbiAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICB9KSB7XHJcbiAgICAgICAgdGhpcy5ib2R5ID0gTWF0dGVyLkJvZGllcy5jaXJjbGUoeCwgeSwgcmFkaXVzLCB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAuMyxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0QW5kTWFzay5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIG1hc2s6IGNhdEFuZE1hc2subWFza1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTWF0dGVyLldvcmxkLmFkZCh3b3JsZCwgdGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMC4yO1xyXG5cclxuICAgICAgICB0aGlzLmp1bXBIZWlnaHQgPSAxMDtcclxuICAgICAgICB0aGlzLmp1bXBCcmVhdGhpbmdTcGFjZSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXhKdW1wTnVtYmVyID0gMztcclxuICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLmluaXRpYWxDaGFyZ2VWYWx1ZSA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhDaGFyZ2VWYWx1ZSA9IDEyO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlID0gdGhpcy5pbml0aWFsQ2hhcmdlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VJbmNyZW1lbnRWYWx1ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmNoYXJnZVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5ib2R5LnBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuYm9keS5hbmdsZTtcclxuXHJcbiAgICAgICAgcHVzaCgpO1xyXG4gICAgICAgIHRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIHJvdGF0ZShhbmdsZSk7XHJcblxyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMgKiAyKTtcclxuXHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGVsbGlwc2UoMCwgMCwgdGhpcy5yYWRpdXMpO1xyXG4gICAgICAgIHJlY3QoMCArIHRoaXMucmFkaXVzIC8gMiwgMCwgdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucmFkaXVzIC8gMik7XHJcblxyXG4gICAgICAgIC8vIGVsbGlwc2UoLXRoaXMucmFkaXVzICogMS41LCAwLCA1KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgICAgIHN0cm9rZSgwKTtcclxuICAgICAgICBsaW5lKDAsIDAsIHRoaXMucmFkaXVzICogMS4yNSwgMCk7XHJcblxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZUJsYXN0ZXIoYWN0aXZlS2V5cykge1xyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM4XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkodGhpcy5ib2R5LCAtdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1s0MF0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgdGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM4XSAmJiAha2V5U3RhdGVzWzQwXSkgfHwgKGtleVN0YXRlc1szOF0gJiYga2V5U3RhdGVzWzQwXSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0QW5ndWxhclZlbG9jaXR5KHRoaXMuYm9keSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpIHtcclxuICAgICAgICBsZXQgeVZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgIGlmIChhY3RpdmVLZXlzWzM3XSkge1xyXG4gICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgIHg6IC10aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlS2V5c1szOV0pIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdmVtZW50U3BlZWQsXHJcbiAgICAgICAgICAgICAgICB5OiB5VmVsb2NpdHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE1hdHRlci5Cb2R5LnNldEFuZ3VsYXJWZWxvY2l0eSh0aGlzLmJvZHksIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM3XSAmJiAha2V5U3RhdGVzWzM5XSkgfHwgKGtleVN0YXRlc1szN10gJiYga2V5U3RhdGVzWzM5XSkpIHtcclxuICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICAgICAgeTogeVZlbG9jaXR5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVmVydGljYWwoYWN0aXZlS2V5cywgZ3JvdW5kT2JqZWN0cykge1xyXG4gICAgICAgIGxldCB4VmVsb2NpdHkgPSB0aGlzLmJvZHkudmVsb2NpdHkueDtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMzJdKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ib2R5Lmdyb3VuZGVkICYmIHRoaXMuYm9keS5jdXJyZW50SnVtcE51bWJlciA8IHRoaXMubWF4SnVtcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgTWF0dGVyLkJvZHkuc2V0VmVsb2NpdHkodGhpcy5ib2R5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeFZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLmp1bXBIZWlnaHRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmN1cnJlbnRKdW1wTnVtYmVyKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5ib2R5Lmdyb3VuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBNYXR0ZXIuQm9keS5zZXRWZWxvY2l0eSh0aGlzLmJvZHksIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4VmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMuanVtcEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuY3VycmVudEp1bXBOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5ncm91bmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhY3RpdmVLZXlzWzMyXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdDaGFyZ2VkU2hvdCh4LCB5LCByYWRpdXMpIHtcclxuICAgICAgICBmaWxsKDI1NSk7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuXHJcbiAgICAgICAgZWxsaXBzZSh4LCB5LCByYWRpdXMgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFyZ2VBbmRTaG9vdChhY3RpdmVLZXlzKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuYm9keS5wb3NpdGlvbjtcclxuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLmJvZHkuYW5nbGU7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgKiBjb3MoYW5nbGUpICogMS41ICsgcG9zLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnJhZGl1cyAqIHNpbihhbmdsZSkgKiAxLjUgKyBwb3MueTtcclxuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUtleXNbMTNdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoYXJnZVZhbHVlICs9IHRoaXMuY2hhcmdlSW5jcmVtZW50VmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuY3VycmVudENoYXJnZVZhbHVlID4gdGhpcy5tYXhDaGFyZ2VWYWx1ZSA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heENoYXJnZVZhbHVlIDogdGhpcy5jdXJyZW50Q2hhcmdlVmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRyYXdDaGFyZ2VkU2hvdCh4LCB5LCB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWFjdGl2ZUtleXNbMTNdICYmIHRoaXMuY2hhcmdlU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChuZXcgQmFzaWNGaXJlKHgsIHksIHRoaXMuY3VycmVudENoYXJnZVZhbHVlLCBhbmdsZSwgdGhpcy53b3JsZCwge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJhc2ljRmlyZUNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnkgfCBwbGF5ZXJDYXRlZ29yeSB8IGJhc2ljRmlyZUNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmdlU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGFyZ2VWYWx1ZSA9IHRoaXMuaW5pdGlhbENoYXJnZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoYWN0aXZlS2V5cywgZ3JvdW5kT2JqZWN0cykge1xyXG4gICAgICAgIHRoaXMucm90YXRlQmxhc3RlcihhY3RpdmVLZXlzKTtcclxuICAgICAgICB0aGlzLm1vdmVIb3Jpem9udGFsKGFjdGl2ZUtleXMpO1xyXG4gICAgICAgIHRoaXMubW92ZVZlcnRpY2FsKGFjdGl2ZUtleXMsIGdyb3VuZE9iamVjdHMpO1xyXG5cclxuICAgICAgICB0aGlzLmNoYXJnZUFuZFNob290KGFjdGl2ZUtleXMpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHNbaV0uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5jaGVja1ZlbG9jaXR5WmVybygpIHx8IHRoaXMuYnVsbGV0c1tpXS5jaGVja091dE9mU2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5yZW1vdmVGcm9tV29ybGQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvbWF0dGVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wbGF5ZXIuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9ncm91bmQuanNcIiAvPlxyXG5cclxubGV0IGVuZ2luZTtcclxubGV0IHdvcmxkO1xyXG5cclxubGV0IGdyb3VuZHMgPSBbXTtcclxubGV0IHBsYXllcnMgPSBbXTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UsIC8vIERcclxuICAgIDEzOiBmYWxzZVxyXG59O1xyXG5cclxuY29uc3QgZ3JvdW5kQ2F0ZWdvcnkgPSAweDAwMDE7XHJcbmNvbnN0IHBsYXllckNhdGVnb3J5ID0gMHgwMDAyO1xyXG5jb25zdCBiYXNpY0ZpcmVDYXRlZ29yeSA9IDB4MDAwNDtcclxuY29uc3QgYnVsbGV0Q29sbGlzaW9uTGF5ZXIgPSAweDAwMDg7XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZW5naW5lID0gTWF0dGVyLkVuZ2luZS5jcmVhdGUoKTtcclxuICAgIHdvcmxkID0gZW5naW5lLndvcmxkO1xyXG5cclxuICAgIE1hdHRlci5FdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBjb2xsaXNpb25FdmVudCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDI1OyBpIDwgd2lkdGg7IGkgKz0gMjAwKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKDEwMCwgMzAwKTtcclxuICAgICAgICBncm91bmRzLnB1c2gobmV3IEdyb3VuZChpICsgNTAsIGhlaWdodCAtIHJhbmRvbVZhbHVlIC8gMiwgMTAwLCByYW5kb21WYWx1ZSwgd29ybGQpKTtcclxuICAgIH1cclxuICAgIC8vIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKHdpZHRoIC8gMiwgaGVpZ2h0IC0gMTAsIHdpZHRoLCAyMCwgd29ybGQpKTtcclxuICAgIC8vIGdyb3VuZHMucHVzaChuZXcgR3JvdW5kKDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcbiAgICAvLyBncm91bmRzLnB1c2gobmV3IEdyb3VuZCh3aWR0aCAtIDEwLCBoZWlnaHQgLSAxNzAsIDIwLCAzMDAsIHdvcmxkKSk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxOyBpKyspIHtcclxuICAgICAgICBwbGF5ZXJzLnB1c2gobmV3IFBsYXllcih3aWR0aCAvIDIsIGhlaWdodCAvIDIsIDIwLCB3b3JsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3RNb2RlKENFTlRFUik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgICBiYWNrZ3JvdW5kKDApO1xyXG4gICAgTWF0dGVyLkVuZ2luZS51cGRhdGUoZW5naW5lKTtcclxuXHJcbiAgICBncm91bmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBwbGF5ZXJzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgZWxlbWVudC51cGRhdGUoa2V5U3RhdGVzLCBncm91bmRzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZpbGwoMjU1KTtcclxuICAgIHRleHRTaXplKDMwKTtcclxuICAgIHRleHQoYCR7cm91bmQoZnJhbWVSYXRlKCkpfWAsIHdpZHRoIC0gNzUsIDUwKVxyXG59XHJcblxyXG5mdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xyXG4gICAgaWYgKGtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1trZXlDb2RlXSA9IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsaXNpb25FdmVudChldmVudCkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudC5wYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBsYWJlbEEgPSBldmVudC5wYWlyc1tpXS5ib2R5QS5sYWJlbDtcclxuICAgICAgICBsZXQgbGFiZWxCID0gZXZlbnQucGFpcnNbaV0uYm9keUIubGFiZWw7XHJcblxyXG4gICAgICAgIGlmIChsYWJlbEEgPT09ICdiYXNpY0ZpcmUnICYmIGxhYmVsQiA9PT0gJ3N0YXRpY0dyb3VuZCcpIHtcclxuICAgICAgICAgICAgZXZlbnQucGFpcnNbaV0uYm9keUEuY29sbGlzaW9uRmlsdGVyID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGJ1bGxldENvbGxpc2lvbkxheWVyLFxyXG4gICAgICAgICAgICAgICAgbWFzazogZ3JvdW5kQ2F0ZWdvcnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAobGFiZWxCID09PSAnYmFzaWNGaXJlJyAmJiBsYWJlbEEgPT09ICdzdGF0aWNHcm91bmQnKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlCLmNvbGxpc2lvbkZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBidWxsZXRDb2xsaXNpb25MYXllcixcclxuICAgICAgICAgICAgICAgIG1hc2s6IGdyb3VuZENhdGVnb3J5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQSA9PT0gJ3BsYXllcicgJiYgbGFiZWxCID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5QS5ncm91bmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGV2ZW50LnBhaXJzW2ldLmJvZHlBLmN1cnJlbnRKdW1wTnVtYmVyID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGxhYmVsQiA9PT0gJ3BsYXllcicgJiYgbGFiZWxBID09PSAnc3RhdGljR3JvdW5kJykge1xyXG4gICAgICAgICAgICBldmVudC5wYWlyc1tpXS5ib2R5Qi5jdXJyZW50SnVtcE51bWJlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
