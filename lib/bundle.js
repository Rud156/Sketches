'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpaceShip = function () {
    function SpaceShip(color) {
        _classCallCheck(this, SpaceShip);

        this.color = color;
        this.baseWidth = 100;
        this.baseHeight = 20;
        this.shooterWidth = 10;

        this.x = width / 2;
        this.prevX = this.x;
        this.speed = 10;
    }

    _createClass(SpaceShip, [{
        key: 'show',
        value: function show() {
            noStroke();
            fill(this.color);

            rectMode(CENTER);

            rect(this.x, height - this.baseHeight - 10, this.baseWidth, this.baseHeight);
            rect(this.x, height - 2 * this.baseHeight - 10, this.baseWidth / 2, this.baseHeight);

            rect(this.x, height - 2 * this.baseHeight - 15 - this.baseHeight / 2, this.shooterWidth, this.baseHeight / 2);

            this.prevX = this.x;
        }
    }, {
        key: 'moveShip',
        value: function moveShip(direction) {
            this.prevX = this.x;

            if (this.x < this.baseWidth / 2) {
                this.x = this.baseWidth / 2 + 1;
            }
            if (this.x > width - this.baseWidth / 2) {
                this.x = width - this.baseWidth / 2 - 1;
            }

            if (direction === 'LEFT') {
                this.x -= this.speed * (60 / frameRate());
            } else {
                this.x += this.speed * (60 / frameRate());
            }
        }
    }]);

    return SpaceShip;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bullet = function () {
    function Bullet(xPosition, yPosition, goUp) {
        _classCallCheck(this, Bullet);

        this.speed = goUp ? 10 : -10;
        this.baseHeight = 20;
        this.baseWidth = 10;

        this.x = xPosition;
        this.y = yPosition;

        this.color = 255;
    }

    _createClass(Bullet, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            rectMode(CENTER);
            rect(this.x, this.y - this.baseHeight, this.baseWidth, this.baseHeight);
        }
    }, {
        key: "update",
        value: function update() {
            this.y -= this.speed * (60 / frameRate());
        }
    }]);

    return Bullet;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Enemy = function () {
    function Enemy(xPosition) {
        _classCallCheck(this, Enemy);

        this.x = xPosition;
        this.y = -30;

        this.initialMovementSpeed = 5;
        this.positionReached = false;
        this.color = 255;
    }

    _createClass(Enemy, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            // TODO: Think out and implement and enemy type
        }
    }, {
        key: "update",
        value: function update() {}
    }]);

    return Enemy;
}();
'use strict';

/// <reference path="./space-ship.js" />
/// <reference path="./bullet.js" />
/// <reference path="./enemy.js" />

var spaceShip = void 0;
var bullets = [];
var enemies = [];
var minFrameWaitCount = 5;
var waitFrameCount = minFrameWaitCount;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    spaceShip = new SpaceShip(255);
}

function draw() {
    background(0);
    if (!keyIsDown(32)) waitFrameCount = minFrameWaitCount;

    spaceShip.show();
    if (keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW)) {/* Do nothing*/} else {
        if (keyIsDown(LEFT_ARROW)) {
            spaceShip.moveShip('LEFT');
        } else if (keyIsDown(RIGHT_ARROW)) {
            spaceShip.moveShip('RIGHT');
        }
    }

    if (keyIsDown(32)) {
        if (waitFrameCount === minFrameWaitCount) bullets.push(new Bullet(spaceShip.prevX, height - 2 * spaceShip.baseHeight - 15, true));
        waitFrameCount -= 1 * (60 / frameRate());
    }
    if (waitFrameCount < 0) waitFrameCount = minFrameWaitCount;

    bullets.forEach(function (bullet) {
        bullet.show();
        bullet.update();
    });
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].y < -bullets[i].baseHeight) {
            bullets.splice(i, 1);
            i -= 1;
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNwYWNlLXNoaXAuanMiLCJidWxsZXQuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTcGFjZVNoaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3BhY2VTaGlwKGNvbG9yKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSAxMDA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IDIwO1xuICAgICAgICB0aGlzLnNob290ZXJXaWR0aCA9IDEwO1xuXG4gICAgICAgIHRoaXMueCA9IHdpZHRoIC8gMjtcbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMueDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IDEwO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICByZWN0TW9kZShDRU5URVIpO1xuXG4gICAgICAgICAgICByZWN0KHRoaXMueCwgaGVpZ2h0IC0gdGhpcy5iYXNlSGVpZ2h0IC0gMTAsIHRoaXMuYmFzZVdpZHRoLCB0aGlzLmJhc2VIZWlnaHQpO1xuICAgICAgICAgICAgcmVjdCh0aGlzLngsIGhlaWdodCAtIDIgKiB0aGlzLmJhc2VIZWlnaHQgLSAxMCwgdGhpcy5iYXNlV2lkdGggLyAyLCB0aGlzLmJhc2VIZWlnaHQpO1xuXG4gICAgICAgICAgICByZWN0KHRoaXMueCwgaGVpZ2h0IC0gMiAqIHRoaXMuYmFzZUhlaWdodCAtIDE1IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMiwgdGhpcy5zaG9vdGVyV2lkdGgsIHRoaXMuYmFzZUhlaWdodCAvIDIpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy54O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtb3ZlU2hpcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlU2hpcChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLng7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnggPCB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSB0aGlzLmJhc2VXaWR0aCAvIDIgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMueCA+IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54ID0gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIgLSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggLT0gdGhpcy5zcGVlZCAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMuc3BlZWQgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3BhY2VTaGlwO1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJ1bGxldCh4UG9zaXRpb24sIHlQb3NpdGlvbiwgZ29VcCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQnVsbGV0KTtcblxuICAgICAgICB0aGlzLnNwZWVkID0gZ29VcCA/IDEwIDogLTEwO1xuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSAyMDtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSAxMDtcblxuICAgICAgICB0aGlzLnggPSB4UG9zaXRpb247XG4gICAgICAgIHRoaXMueSA9IHlQb3NpdGlvbjtcblxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCdWxsZXQsIFt7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgICAgICAgICByZWN0KHRoaXMueCwgdGhpcy55IC0gdGhpcy5iYXNlSGVpZ2h0LCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy55IC09IHRoaXMuc3BlZWQgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQnVsbGV0O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgRW5lbXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5lbXkoeFBvc2l0aW9uKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbmVteSk7XG5cbiAgICAgICAgdGhpcy54ID0geFBvc2l0aW9uO1xuICAgICAgICB0aGlzLnkgPSAtMzA7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsTW92ZW1lbnRTcGVlZCA9IDU7XG4gICAgICAgIHRoaXMucG9zaXRpb25SZWFjaGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVuZW15LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBUaGluayBvdXQgYW5kIGltcGxlbWVudCBhbmQgZW5lbXkgdHlwZVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFbmVteTtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NwYWNlLXNoaXAuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2VuZW15LmpzXCIgLz5cblxudmFyIHNwYWNlU2hpcCA9IHZvaWQgMDtcbnZhciBidWxsZXRzID0gW107XG52YXIgZW5lbWllcyA9IFtdO1xudmFyIG1pbkZyYW1lV2FpdENvdW50ID0gNTtcbnZhciB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB2YXIgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG5cbiAgICBzcGFjZVNoaXAgPSBuZXcgU3BhY2VTaGlwKDI1NSk7XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcbiAgICBpZiAoIWtleUlzRG93bigzMikpIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBzcGFjZVNoaXAuc2hvdygpO1xuICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykgJiYga2V5SXNEb3duKFJJR0hUX0FSUk9XKSkgey8qIERvIG5vdGhpbmcqL30gZWxzZSB7XG4gICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykpIHtcbiAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnTEVGVCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleUlzRG93bihSSUdIVF9BUlJPVykpIHtcbiAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnUklHSFQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChrZXlJc0Rvd24oMzIpKSB7XG4gICAgICAgIGlmICh3YWl0RnJhbWVDb3VudCA9PT0gbWluRnJhbWVXYWl0Q291bnQpIGJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHNwYWNlU2hpcC5wcmV2WCwgaGVpZ2h0IC0gMiAqIHNwYWNlU2hpcC5iYXNlSGVpZ2h0IC0gMTUsIHRydWUpKTtcbiAgICAgICAgd2FpdEZyYW1lQ291bnQgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICB9XG4gICAgaWYgKHdhaXRGcmFtZUNvdW50IDwgMCkgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIGJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICB9KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGJ1bGxldHNbaV0ueSA8IC1idWxsZXRzW2ldLmJhc2VIZWlnaHQpIHtcbiAgICAgICAgICAgIGJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==
