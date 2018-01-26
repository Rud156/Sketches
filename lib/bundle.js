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
    function Ball(x, y, radius) {
        classCallCheck(this, Ball);

        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 10;
        this.maxSpeed = 20;
    }

    createClass(Ball, [{
        key: 'launchBall',
        value: function launchBall() {}
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
        value: function update() {
            this.position.add(this.velocity);

            var _position2 = this.position,
                posX = _position2.x,
                posY = _position2.y;
            var _velocity = this.velocity,
                velX = _velocity.x,
                velY = _velocity.y;

            var radius = this.radius;

            if (posY < radius / 2 || posY > height - radius / 2) {
                this.velocity.y = -1 * velY;
            }

            this.checkOutOfScreen();
        }
    }, {
        key: 'checkOutOfScreen',
        value: function checkOutOfScreen() {
            var x = this.position.x;

            if (x < 0 - this.radius || x > width + this.radius) {
                this.position = createVector(this.initialPosition.x, this.initialPosition.y);
                console.log('Out of screen');
            }
        }
    }]);
    return Ball;
}();

var Paddle = function () {
    function Paddle(x, y, width, height, upKey, downKey) {
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
    }

    createClass(Paddle, [{
        key: "movePaddle",
        value: function movePaddle(direction) {
            var y = this.position.y;

            if (y < this.height / 2) this.position.y = this.height / 2 + 1;
            if (y > height - this.height / 2) this.position.y = height - this.height / 2 - 1;

            this.velocity = createVector(0, direction * height);
            this.velocity.setMag(this.moveSpeed);
            this.position.add(this.velocity);
        }
    }, {
        key: "draw",
        value: function draw() {
            fill(255);

            var _position = this.position,
                x = _position.x,
                y = _position.y;

            rect(x, y, this.width, this.height);
        }
    }, {
        key: "update",
        value: function update(keys) {
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
        }
    }]);
    return Paddle;
}();

var paddles = [];
var ball = void 0;
var keys = {
    87: false, // W
    83: false, // S
    38: false, // Up,
    40: false // Down
};

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    rectMode(CENTER);
    ellipseMode(CENTER);

    paddles.push(new Paddle(7, height / 2, 10, 100, 87, 83));
    paddles.push(new Paddle(width - 7, height / 2, 10, 100, 38, 40));
    ball = new Ball(width / 2, height / 2, 10);
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
            paddle.update(keys);
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
    ball.update();
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
