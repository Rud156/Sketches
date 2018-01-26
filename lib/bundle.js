(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.library = {})));
}(this, (function (exports) { 'use strict';

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

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;
    }

    createClass(Ball, [{
        key: "draw",
        value: function draw() {
            fill(255);
            ellipse(width / 2, height / 2, 30);
        }
    }, {
        key: "update",
        value: function update() {}
    }]);
    return Ball;
}();

var Paddle = function () {
    function Paddle(x, y, width, height) {
        classCallCheck(this, Paddle);

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;
    }

    createClass(Paddle, [{
        key: "movePaddle",
        value: function movePaddle() {}
    }, {
        key: "draw",
        value: function draw() {
            var _position = this.position,
                x = _position.x,
                y = _position.y;

            rect(x, y, this.width, this.height);
        }
    }, {
        key: "update",
        value: function update() {
            this.position.add(this.velocity);
        }
    }]);
    return Paddle;
}();

var ball = void 0;
function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    ball = new Ball(0, 0, 0);
}

function draw() {
    background(0);
    ball.draw();
}

window.setup = setup;
window.draw = draw;

exports.setup = setup;
exports.draw = draw;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.js.map
