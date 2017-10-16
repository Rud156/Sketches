"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Star = function () {
    function Star(reset, autoColor, x, y, z, speed) {
        _classCallCheck(this, Star);

        this.x = x === undefined ? random(-width / 2, width / 2) : x;
        this.y = y === undefined ? random(-height / 2, height / 2) : y;

        this.z = z === undefined ? random(width / 2) : z;
        this.size = 0;
        this.speed = speed === undefined ? random(0, 20) : speed;
        this.alpha = 0;

        this.previousZ = this.z;
        this.reset = reset;

        this.color = autoColor ? null : random([235, 115, 0]);
        this.autoColor = autoColor;
    }

    _createClass(Star, [{
        key: "setStartPositions",
        value: function setStartPositions(x, y, z, speed) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.speed = speed;
            this.previousZ = this.z;
        }
    }, {
        key: "show",
        value: function show() {
            if (this.autoColor) this.color = parseInt(map(this.z, 0, width / 2, 0, 359));
            var fillColor = color("hsl(" + this.color + ", 100%, 50%)");

            var positionX = map(this.x / this.z, 0, 1, 0, width / 2);
            var positionY = map(this.y / this.z, 0, 1, 0, height / 2);

            this.size = map(this.z, 0, width / 2, 16, 0);
            fill(fillColor);
            noStroke();
            ellipse(positionX, positionY, this.size);

            var previousX = map(this.x / this.previousZ, 0, 1, 0, width / 2);
            var previousY = map(this.y / this.previousZ, 0, 1, 0, height / 2);

            stroke(fillColor);
            line(previousX, previousY, positionX, positionY);
        }
    }, {
        key: "update",
        value: function update() {
            this.previousZ = this.z;
            this.z -= this.speed;

            if (this.z < 1 && this.reset) {
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.z = width / 2;
                this.size = 0;
                this.previousZ = this.z;
            } else if (this.z >= width / 2 && this.reset) {
                this.z = 2;
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.previousZ = this.z;
                this.size = 16;
            }
        }
    }, {
        key: "setSpeed",
        value: function setSpeed() {
            this.speed = map(mouseX, 0, width, -60, 60);
        }
    }]);

    return Star;
}();