'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Star = function () {
    function Star(x, y, z, speed) {
        _classCallCheck(this, Star);

        this.x = x;
        this.y = y;
        this.z = z;

        this.size = 0;
        this.speed = speed;

        this.alpha = 0;
        this.previousZ = this.z;

        this.color = null;
    }

    _createClass(Star, [{
        key: 'show',
        value: function show() {
            this.color = parseInt(map(this.z, 0, width / 2, 0, 359));
            var fillColor = color('hsl(' + this.color + ', 100%, 50%)');
            fill(fillColor);

            var positionX = map(this.x / this.z, 0, 1, 0, width / 2);
            var positionY = map(this.y / this.z, 0, 1, 0, height / 2);

            this.size = map(this.z, 0, width / 2, 16, 0);
            noStroke();
            ellipse(positionX, positionY, this.size);

            var previousX = map(this.x / this.previousZ, 0, 1, 0, width / 2);
            var previousY = map(this.y / this.previousZ, 0, 1, 0, height / 2);
            stroke(fillColor);
            line(previousX, previousY, positionX, positionY);
        }
    }, {
        key: 'update',
        value: function update() {
            this.previousZ = this.z;
            this.z -= this.speed;
        }
    }, {
        key: 'reset',
        value: function reset() {
            if (this.z < 1) {
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.z = random(0, width / 2);
                this.size = 0;
                this.previousZ = this.z;
            } else if (this.z >= width / 2) {
                this.z = 2;
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.previousZ = this.z;
                this.size = 16;
            }
        }
    }, {
        key: 'setSpeed',
        value: function setSpeed() {
            this.speed = map(mouseX, 0, width, -60, 60);
        }
    }]);

    return Star;
}();
/// <reference path="./star.js" />

var stars = [];

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    for (var i = 0; i < 500; i++) {
        stars.push(new Star(random(-width / 2, width / 2), random(-height / 2, height / 2), random(0, width / 2), random(2, 20)));
    }
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    for (var i = 0; i < stars.length; i++) {
        stars[i].show();
        stars[i].update();
        stars[i].reset();
        stars[i].setSpeed();
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJTdGFyIiwieCIsInkiLCJ6Iiwic3BlZWQiLCJzaXplIiwiYWxwaGEiLCJwcmV2aW91c1oiLCJjb2xvciIsInBhcnNlSW50IiwibWFwIiwid2lkdGgiLCJmaWxsQ29sb3IiLCJmaWxsIiwicG9zaXRpb25YIiwicG9zaXRpb25ZIiwiaGVpZ2h0Iiwibm9TdHJva2UiLCJlbGxpcHNlIiwicHJldmlvdXNYIiwicHJldmlvdXNZIiwic3Ryb2tlIiwibGluZSIsInJhbmRvbSIsIm1vdXNlWCIsInN0YXJzIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJpIiwicHVzaCIsImRyYXciLCJiYWNrZ3JvdW5kIiwidHJhbnNsYXRlIiwibGVuZ3RoIiwic2hvdyIsInVwZGF0ZSIsInJlc2V0Iiwic2V0U3BlZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxJO0FBQ0Ysa0JBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQkMsQ0FBbEIsRUFBcUJDLEtBQXJCLEVBQTRCO0FBQUE7O0FBQ3hCLGFBQUtILENBQUwsR0FBU0EsQ0FBVDtBQUNBLGFBQUtDLENBQUwsR0FBU0EsQ0FBVDtBQUNBLGFBQUtDLENBQUwsR0FBU0EsQ0FBVDs7QUFFQSxhQUFLRSxJQUFMLEdBQVksQ0FBWjtBQUNBLGFBQUtELEtBQUwsR0FBYUEsS0FBYjs7QUFFQSxhQUFLRSxLQUFMLEdBQWEsQ0FBYjtBQUNBLGFBQUtDLFNBQUwsR0FBaUIsS0FBS0osQ0FBdEI7O0FBRUEsYUFBS0ssS0FBTCxHQUFhLElBQWI7QUFDSDs7OzsrQkFFTTtBQUNILGlCQUFLQSxLQUFMLEdBQWFDLFNBQVNDLElBQUksS0FBS1AsQ0FBVCxFQUFZLENBQVosRUFBZVEsUUFBUSxDQUF2QixFQUEwQixDQUExQixFQUE2QixHQUE3QixDQUFULENBQWI7QUFDQSxnQkFBSUMsWUFBWUosZUFBYSxLQUFL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LFFBQVEsQ0FBM0IsQ0FETyxFQUVQWSxPQUFPLENBQUNQLE1BQUQsR0FBVSxDQUFqQixFQUFvQkEsU0FBUyxDQUE3QixDQUZPLEVBR1BPLE9BQU8sQ0FBUCxFQUFVWixRQUFRLENBQWxCLENBSE8sRUFJUFksT0FBTyxDQUFQLEVBQVUsRUFBVixDQUpPLENBQVg7QUFESjtBQU9IOztBQUVELFNBQVNZLElBQVQsR0FBZ0I7QUFDWkMsZUFBVyxDQUFYO0FBQ0FDLGNBQVUxQixRQUFRLENBQWxCLEVBQXFCSyxTQUFTLENBQTlCOztBQUVBLFNBQUssSUFBSWlCLElBQUksQ0FBYixFQUFnQkEsSUFBSVIsTUFBTWEsTUFBMUIsRUFBa0NMLEdBQWxDLEVBQXVDO0FBQ25DUixjQUFNUSxDQUFOLEVBQVNNLElBQVQ7QUFDQWQsY0FBTVEsQ0FBTixFQUFTTyxNQUFUO0FBQ0FmLGNBQU1RLENBQU4sRUFBU1EsS0FBVDtBQUNBaEIsY0FBTVEsQ0FBTixFQUFTUyxRQUFUO0FBQ0g7QUFDSiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdGFyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHosIHNwZWVkKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcblxyXG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMDtcclxuICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcclxuXHJcbiAgICAgICAgdGhpcy5jb2xvciA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcGFyc2VJbnQobWFwKHRoaXMueiwgMCwgd2lkdGggLyAyLCAwLCAzNTkpKTtcclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gY29sb3IoYGhzbCgke3RoaXMuY29sb3J9LCAxMDAlLCA1MCUpYCk7XHJcbiAgICAgICAgZmlsbChmaWxsQ29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgcG9zaXRpb25YID0gbWFwKHRoaXMueCAvIHRoaXMueiwgMCwgMSwgMCwgd2lkdGggLyAyKTtcclxuICAgICAgICBsZXQgcG9zaXRpb25ZID0gbWFwKHRoaXMueSAvIHRoaXMueiwgMCwgMSwgMCwgaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgIHRoaXMuc2l6ZSA9IG1hcCh0aGlzLnosIDAsIHdpZHRoIC8gMiwgMTYsIDApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZWxsaXBzZShwb3NpdGlvblgsIHBvc2l0aW9uWSwgdGhpcy5zaXplKTtcclxuXHJcbiAgICAgICAgbGV0IHByZXZpb3VzWCA9IG1hcCh0aGlzLnggLyB0aGlzLnByZXZpb3VzWiwgMCwgMSwgMCwgd2lkdGggLyAyKTtcclxuICAgICAgICBsZXQgcHJldmlvdXNZID0gbWFwKHRoaXMueSAvIHRoaXMucHJldmlvdXNaLCAwLCAxLCAwLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICBzdHJva2UoZmlsbENvbG9yKTtcclxuICAgICAgICBsaW5lKHByZXZpb3VzWCwgcHJldmlvdXNZLCBwb3NpdGlvblgsIHBvc2l0aW9uWSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xyXG4gICAgICAgIHRoaXMueiAtPSB0aGlzLnNwZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnogPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IHJhbmRvbSgtd2lkdGggLyAyLCB3aWR0aCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnkgPSByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnogPSByYW5kb20oMCwgd2lkdGggLyAyKTtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnogPj0gd2lkdGggLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMueiA9IDI7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IHJhbmRvbSgtd2lkdGggLyAyLCB3aWR0aCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnkgPSByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFNwZWVkKCkge1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBtYXAobW91c2VYLCAwLCB3aWR0aCwgLTYwLCA2MCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0YXIuanNcIiAvPlxyXG5cclxubGV0IHN0YXJzID0gW107XHJcblxyXG5mdW5jdGlvbiBzZXR1cCgpIHtcclxuICAgIGxldCBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xyXG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1MDA7IGkrKylcclxuICAgICAgICBzdGFycy5wdXNoKG5ldyBTdGFyKFxyXG4gICAgICAgICAgICByYW5kb20oLXdpZHRoIC8gMiwgd2lkdGggLyAyKSxcclxuICAgICAgICAgICAgcmFuZG9tKC1oZWlnaHQgLyAyLCBoZWlnaHQgLyAyKSxcclxuICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoIC8gMiksXHJcbiAgICAgICAgICAgIHJhbmRvbSgyLCAyMClcclxuICAgICAgICApKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICAgIGJhY2tncm91bmQoMCk7XHJcbiAgICB0cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc3RhcnNbaV0uc2hvdygpO1xyXG4gICAgICAgIHN0YXJzW2ldLnVwZGF0ZSgpO1xyXG4gICAgICAgIHN0YXJzW2ldLnJlc2V0KCk7XHJcbiAgICAgICAgc3RhcnNbaV0uc2V0U3BlZWQoKTtcclxuICAgIH1cclxufSJdfQ==
