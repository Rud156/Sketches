"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ball = function () {
    function Ball(x, y, radius) {
        _classCallCheck(this, Ball);

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;
    }

    _createClass(Ball, [{
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
        _classCallCheck(this, Paddle);

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;
    }

    _createClass(Paddle, [{
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
    ball = new Ball(0, 0, 0);
}

function draw() {
    background(0);
    ball.draw();
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhbGwuanMiLCJwYWRkbGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6WyJCYWxsIiwieCIsInkiLCJyYWRpdXMiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwiZmlsbCIsImVsbGlwc2UiLCJ3aWR0aCIsImhlaWdodCIsIlBhZGRsZSIsInJlY3QiLCJhZGQiLCJiYWxsIiwic2V0dXAiLCJkcmF3IiwiYmFja2dyb3VuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUFBLEk7QUFDQSxrQkFBQUMsQ0FBQSxFQUFBQyxDQUFBLEVBQUFDLE1BQUEsRUFBQTtBQUFBOztBQUNBLGFBQUFDLFFBQUEsR0FBQUMsYUFBQUosQ0FBQSxFQUFBQyxDQUFBLENBQUE7QUFDQSxhQUFBSSxRQUFBLEdBQUFELGFBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUFGLE1BQUEsR0FBQUEsTUFBQTtBQUNBOzs7OytCQUVBO0FBQ0FJLGlCQUFBLEdBQUE7QUFDQUMsb0JBQUFDLFFBQUEsQ0FBQSxFQUFBQyxTQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0E7OztpQ0FFQSxDQUFBOzs7Ozs7SUNaQUMsTTtBQUNBLG9CQUFBVixDQUFBLEVBQUFDLENBQUEsRUFBQU8sS0FBQSxFQUFBQyxNQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBTixRQUFBLEdBQUFDLGFBQUFKLENBQUEsRUFBQUMsQ0FBQSxDQUFBO0FBQ0EsYUFBQUksUUFBQSxHQUFBRCxhQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxhQUFBSSxLQUFBLEdBQUFBLEtBQUE7QUFDQSxhQUFBQyxNQUFBLEdBQUFBLE1BQUE7QUFDQTs7OztxQ0FFQSxDQUVBOzs7K0JBRUE7QUFBQSw0QkFDQSxLQUFBTixRQURBO0FBQUEsZ0JBQ0FILENBREEsYUFDQUEsQ0FEQTtBQUFBLGdCQUNBQyxDQURBLGFBQ0FBLENBREE7O0FBRUFVLGlCQUFBWCxDQUFBLEVBQUFDLENBQUEsRUFBQSxLQUFBTyxLQUFBLEVBQUEsS0FBQUMsTUFBQTtBQUNBOzs7aUNBRUE7QUFDQSxpQkFBQU4sUUFBQSxDQUFBUyxHQUFBLENBQUEsS0FBQVAsUUFBQTtBQUNBOzs7Ozs7QUNoQkEsSUFBQVEsYUFBQTtBQUNBLFNBQUFDLEtBQUEsR0FBQTtBQUNBRCxXQUFBLElBQUFkLElBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBOztBQUVBLFNBQUFnQixJQUFBLEdBQUE7QUFDQUMsZUFBQSxDQUFBO0FBQ0FILFNBQUFFLElBQUE7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBCYWxsIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGZpbGwoMjU1KTtcclxuICAgICAgICBlbGxpcHNlKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMzApO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHt9XHJcbn1cclxuIiwiY2xhc3MgUGFkZGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVQYWRkbGUoKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBsZXQgeyB4LCB5IH0gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgICAgIHJlY3QoeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYWRkbGUuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYWxsLmpzXCIgLz5cclxuXHJcbmxldCBiYWxsO1xyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGJhbGwgPSBuZXcgQmFsbCgwLCAwLCAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICBiYWxsLmRyYXcoKTtcclxufVxyXG4iXX0=
