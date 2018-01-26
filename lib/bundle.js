(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Ball = function () {
    function Ball(x, y, socket) {
        var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
        classCallCheck(this, Ball);

        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 5;
        this.maxSpeed = 7;
        this.ballLaunched = false;

        this.socket = socket;
    }

    createClass(Ball, [{
        key: 'launchBall',
        value: function launchBall() {
            this.velocity = p5.Vector.random2D();
            this.velocity.setMag(this.minSpeed);
        }
    }, {
        key: 'clampBallSpeed',
        value: function clampBallSpeed() {
            var _velocity = this.velocity,
                x = _velocity.x,
                y = _velocity.y;

            var signX = x < 0 ? -1 : x == 0 ? 0 : 1;
            var signY = y < 0 ? -1 : y == 0 ? 0 : 1;

            x = abs(x);
            y = abs(y);

            if (x < this.minSpeed) x = this.minSpeed;else if (x > this.maxSpeed) x = this.maxSpeed;

            if (y < this.minSpeed) y = this.minSpeed;else if (y > this.maxSpeed) y = this.maxSpeed;

            this.velocity = createVector(x * signX, y * signY);
        }
    }, {
        key: 'draw',
        value: function draw() {
            fill(255);
            var _position = this.position,
                x = _position.x,
                y = _position.y;

            ellipse(x, y, this.radius * 2);
        }
    }, {
        key: 'update',
        value: function update(keys) {
            this.position.add(this.velocity);

            var _position2 = this.position,
                posX = _position2.x,
                posY = _position2.y;
            var _velocity2 = this.velocity,
                velX = _velocity2.x,
                velY = _velocity2.y;

            var radius = this.radius;

            if (posY < radius / 2 || posY > height - radius / 2) {
                this.velocity.y = -1 * velY;
            }

            if (keys[32] && !this.ballLaunched) {
                this.ballLaunched = true;
                this.launchBall();
            }

            this.checkOutOfScreen();
            this.clampBallSpeed();
            this.emitEvents();
        }
    }, {
        key: 'emitEvents',
        value: function emitEvents() {
            this.socket.emit('ballPosition', {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                velocity: {
                    x: this.velocity.x,
                    y: this.velocity.y
                }
            });
        }
    }, {
        key: 'checkOutOfScreen',
        value: function checkOutOfScreen() {
            var x = this.position.x;

            if (x < 0 - this.radius || x > width + this.radius) {
                this.position = createVector(this.initialPosition.x, this.initialPosition.y);
                this.ballLaunched = false;
                this.velocity = createVector(0, 0);
                console.log('Out Of Screen');
            }
        }
    }]);
    return Ball;
}();

var Paddle = function () {
    function Paddle(x, y, upKey, downKey, socket, id) {
        var width = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 10;
        var height = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 100;
        classCallCheck(this, Paddle);

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;

        this.moveSpeed = 5;
        this.keys = {
            up: upKey,
            down: downKey
        };

        this.socket = socket;
        this.id = id;
    }

    createClass(Paddle, [{
        key: 'movePaddle',
        value: function movePaddle(direction) {
            var y = this.position.y;

            if (y < this.height / 2) this.position.y = this.height / 2 + 1;
            if (y > height - this.height / 2) this.position.y = height - this.height / 2 - 1;

            this.velocity = createVector(0, direction * height);
            this.velocity.setMag(this.moveSpeed);
            this.position.add(this.velocity);
        }
    }, {
        key: 'collideWithBall',
        value: function collideWithBall(ball) {
            var _ball$position = ball.position,
                ballX = _ball$position.x,
                ballY = _ball$position.y;

            var radius = ball.radius;

            var _position = this.position,
                x = _position.x,
                y = _position.y;

            var halfWidth = this.width / 2;
            var halfHeight = this.height / 2;

            if (ballY - radius > y - halfHeight && ballY + radius < y + halfHeight) {
                if (x < width / 2 && ballX - radius <= x + halfWidth || x > width / 2 && ballX + radius >= x - halfWidth) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            fill(255);

            var _position2 = this.position,
                x = _position2.x,
                y = _position2.y;

            rect(x, y, this.width, this.height);
        }
    }, {
        key: 'update',
        value: function update(keys, ball) {
            var _keys = this.keys,
                up = _keys.up,
                down = _keys.down;


            if (keys[up] && keys[down] || !keys[up] && !keys[down]) {
                this.movePaddle(0);
            } else if (keys[up]) {
                this.movePaddle(-1);
            } else if (keys[down]) {
                this.movePaddle(1);
            }

            if (this.collideWithBall(ball)) {
                ball.setPaddleId(this.id);
                var x = ball.velocity.x;

                ball.velocity.x = -1 * x;
                ball.velocity.add(this.velocity);
            }
            this.emitEvents();
        }
    }, {
        key: 'emitEvents',
        value: function emitEvents() {
            this.socket.emit('paddlePosition', {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                velocity: {
                    x: this.velocity.x,
                    y: this.velocity.y
                },
                id: this.id
            });
        }
    }]);
    return Paddle;
}();

var BASE_URL = 'http://localhost:5000';

var paddles = [];
var ball = void 0;
var keys = {
    87: false, // W
    83: false, // S
    38: false, // Up,
    40: false, // Down
    32: false // Space
};

var socket = io(BASE_URL);

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    rectMode(CENTER);
    ellipseMode(CENTER);

    paddles.push(new Paddle(7, height / 2, 87, 83, socket, 1));
    paddles.push(new Paddle(width - 7, height / 2, 38, 40, socket, 2));
    ball = new Ball(width / 2, height / 2, socket);
}

function draw() {
    background(0);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = paddles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var paddle = _step.value;

            paddle.draw();
            paddle.update(keys, ball);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    ball.draw();
    ball.update(keys);
}

function keyPressed(fxn) {
    var keyCode = fxn.keyCode;

    if (keyCode in keys) keys[keyCode] = true;
    return false;
}

function keyReleased(fxn) {
    var keyCode = fxn.keyCode;

    if (keyCode in keys) keys[keyCode] = false;
    return false;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.keyReleased = keyReleased;

})));
//# sourceMappingURL=bundle.js.map
