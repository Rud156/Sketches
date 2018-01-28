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

var Paddle = function () {
    function Paddle(x, y, upKey, downKey, socket) {
        var width = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 10;
        var height = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 100;
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
        this.gameManagerId = null;
        this.alpha = 100;

        this.socket.on('paddlePosition', this.handlePaddlePosition.bind(this));

        this.movePaddle = this.movePaddle.bind(this);
        this.increaseAlpha = this.increaseAlpha.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.emitPaddleEvents = this.emitPaddleEvents.bind(this);
    }

    createClass(Paddle, [{
        key: 'handlePaddlePosition',
        value: function handlePaddlePosition(data) {
            if (this.gameManagerId !== null) return;

            var position = data.position,
                velocity = data.velocity;

            this.position = createVector(position.x, position.y);
            this.velocity = createVector(velocity.x, velocity.y);
        }
    }, {
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
        key: 'increaseAlpha',
        value: function increaseAlpha() {
            this.alpha = 255;
        }
    }, {
        key: 'draw',
        value: function draw() {
            fill(255, this.alpha);

            var _position = this.position,
                x = _position.x,
                y = _position.y;

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

            this.emitPaddleEvents();
        }
    }, {
        key: 'emitPaddleEvents',
        value: function emitPaddleEvents() {
            this.socket.emit('paddlePosition', {
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
    }]);
    return Paddle;
}();

var Ball = function () {
        function Ball(x, y, socket) {
                var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
                classCallCheck(this, Ball);

                this.initialPosition = { x: x, y: y };

                this.position = createVector(x, y);
                this.velocity = createVector(0, 0);
                this.radius = radius;

                this.minSpeed = 3;
                this.maxSpeed = 4;

                this.socket = socket;

                this.clampBallSpeed = this.clampBallSpeed.bind(this);
                this.draw = this.draw.bind(this);
                this.update = this.update.bind(this);
        }

        createClass(Ball, [{
                key: "clampBallSpeed",
                value: function clampBallSpeed() {
                        var _velocity = this.velocity,
                            x = _velocity.x,
                            y = _velocity.y;

                        var signX = x < 0 ? -1 : 1;
                        var signY = y < 0 ? -1 : 1;

                        x = abs(x);
                        y = abs(y);

                        if (x < this.minSpeed) x = this.minSpeed;else if (x > this.maxSpeed) x = this.maxSpeed;

                        if (y < this.minSpeed) y = this.minSpeed;else if (y > this.maxSpeed) y = this.maxSpeed;

                        this.velocity = createVector(x * signX, y * signY);
                }
        }, {
                key: "draw",
                value: function draw() {
                        fill(255);
                        var _position = this.position,
                            x = _position.x,
                            y = _position.y;

                        ellipse(x, y, this.radius * 2);
                }
        }, {
                key: "update",
                value: function update() {
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

                        this.clampBallSpeed();
                }
        }]);
        return Ball;
}();

var GameManager = function () {
    function GameManager(socket) {
        classCallCheck(this, GameManager);

        this.paddles = [];

        this.socket = socket;
        this.id = null;

        this.ball = new Ball(width / 2 - 10, height / 2, socket);
        this.paddles.push(new Paddle(7, height / 2, 38, 40, socket));
        this.paddles.push(new Paddle(width - 7, height / 2, 38, 40, socket));

        this.startGame = false;
        this.ballLaunched = false;

        this.socket.emit('getPlayerId');
        this.socket.on('recievePlayerId', this.handleRecievePlayerId.bind(this));
        this.socket.on('startGame', this.handleStartGame.bind(this));
        this.socket.on('ballPosition', this.handleRecieveBallData.bind(this));
        this.socket.on('ballLaunch', this.handleRecieveBallData.bind(this));

        this.draw = this.draw.bind(this);
        this.isPaddleCollidingWithBall = this.isPaddleCollidingWithBall.bind(this);
        this.emitBallEvents = this.emitBallEvents.bind(this);
        this.launchBall = this.launchBall.bind(this);
        this.isBallOutOfScreen = this.isBallOutOfScreen.bind(this);
        this.update = this.update.bind(this);
    }

    createClass(GameManager, [{
        key: 'handleRecievePlayerId',
        value: function handleRecievePlayerId(id) {
            console.log('Recieved Player ID: ' + id);
            this.id = id;

            this.paddles[id].increaseAlpha();
            this.paddles[id].gameManagerId = id;
        }
    }, {
        key: 'handleStartGame',
        value: function handleStartGame(value) {
            console.log('Game Started');
            this.startGame = value;
        }
    }, {
        key: 'handleRecieveBallData',
        value: function handleRecieveBallData(data) {
            console.log('Recieving Ball Data', data);
            var position = data.position,
                velocity = data.velocity;

            this.ball.position = createVector(position.x, position.y);
            this.ball.velocity = createVector(velocity.x, velocity.y);
            this.ballLaunched = true;
        }
    }, {
        key: 'launchBall',
        value: function launchBall() {
            var _paddles$0$velocity = this.paddles[0].velocity,
                x = _paddles$0$velocity.x,
                y = _paddles$0$velocity.y;

            this.ball.velocity = createVector(this.ball.minSpeed, y);
            this.ball.velocity.setMag(this.ball.minSpeed);
            this.ballLaunched = true;
            this.socket.emit('ballLaunch', {
                position: {
                    x: this.ball.position.x,
                    y: this.ball.position.y
                },
                velocity: {
                    x: this.ball.velocity.x,
                    y: this.ball.velocity.y
                }
            });
        }
    }, {
        key: 'isPaddleCollidingWithBall',
        value: function isPaddleCollidingWithBall(paddle) {
            var _ball$position = this.ball.position,
                ballX = _ball$position.x,
                ballY = _ball$position.y;

            var radius = this.ball.radius;

            var _paddle$position = paddle.position,
                x = _paddle$position.x,
                y = _paddle$position.y;

            var halfWidth = paddle.width / 2;
            var halfHeight = paddle.height / 2;

            if (ballY - radius > y - halfHeight && ballY + radius < y + halfHeight) {
                if (x < width / 2 && ballX - radius <= x + halfWidth) {
                    this.ball.position = createVector(x + halfWidth + radius, ballY);
                    return true;
                } else if (x > width / 2 && ballX + radius >= x - halfWidth) {
                    this.ball.position = createVector(x - halfWidth - radius, ballY);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }, {
        key: 'isBallOutOfScreen',
        value: function isBallOutOfScreen() {
            var x = this.ball.position.x;

            if (x < 0 - this.ball.radius || x > width + this.ball.radius) {
                return true;
            }

            return false;
        }
    }, {
        key: 'emitBallEvents',
        value: function emitBallEvents() {
            var _ball = this.ball,
                position = _ball.position,
                velocity = _ball.velocity;


            this.socket.emit('ballPosition', {
                position: {
                    x: position.x,
                    y: position.y
                },
                velocity: {
                    x: velocity.x,
                    y: velocity.y
                }
            });
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.paddles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var paddle = _step.value;
                    paddle.draw();
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

            this.ball.draw();
        }
    }, {
        key: 'update',
        value: function update(keys) {
            if (!this.startGame) return;

            for (var i = 0; i < this.paddles.length; i++) {
                if (this.paddles[i].gameManagerId === this.id) {
                    this.paddles[i].update(keys);
                    if (this.isPaddleCollidingWithBall(this.paddles[i], this.ball)) {
                        var x = this.ball.velocity.x;

                        this.ball.velocity.x = -1 * x;
                        this.ball.velocity.add(this.paddles[i].velocity);

                        if (this.ballLaunched) this.emitBallEvents();
                    }
                }
            }

            if (this.isBallOutOfScreen()) {
                this.ballLaunched = false;
                this.ball.velocity = createVector(0, 0);
                console.log('Ball Is Out Of Screen');
            }

            if (!this.ballLaunched) {
                var _paddles$0$position = this.paddles[0].position,
                    _x = _paddles$0$position.x,
                    y = _paddles$0$position.y;

                var paddleWidth = this.paddles[0].width;
                var radius = this.ball.radius;
                this.ball.position = createVector(_x + radius + paddleWidth, y);
            }

            if (keys[32] && !this.ballLaunched) {
                this.launchBall();
            }

            if (this.ballLaunched) this.ball.update();
        }
    }]);
    return GameManager;
}();

var BASE_URL = 'http://192.168.43.108:5000';

var keys = {
    87: false,
    83: false,
    38: false,
    40: false,
    32: false };

var gameManager = void 0;
var socket = io(BASE_URL);

function setup() {
    var canvas = createCanvas(600, 400);
    canvas.parent('canvas-holder');

    rectMode(CENTER);
    ellipseMode(CENTER);

    gameManager = new GameManager(socket);
}

function draw() {
    background(0);

    gameManager.draw();
    gameManager.update(keys);
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
