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

        this.position = createVector(width / 2, this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.prevX = this.position.x;
        this.speed = 15;
    }

    _createClass(SpaceShip, [{
        key: 'show',
        value: function show() {
            noStroke();
            fill(this.color);

            rectMode(CENTER);

            rect(this.position.x, height - this.baseHeight - 10, this.baseWidth, this.baseHeight);
            rect(this.position.x, height - 2 * this.baseHeight - 10, this.baseWidth / 2, this.baseHeight);

            rect(this.position.x, height - 2 * this.baseHeight - 15 - this.baseHeight / 2, this.shooterWidth, this.baseHeight / 2);

            this.prevX = this.position.x;
        }
    }, {
        key: 'moveShip',
        value: function moveShip(direction) {
            this.prevX = this.position.x;

            if (this.position.x < this.baseWidth / 2) {
                this.position.x = this.baseWidth / 2 + 1;
            }
            if (this.position.x > width - this.baseWidth / 2) {
                this.position.x = width - this.baseWidth / 2 - 1;
            }

            this.velocity = createVector(width, this.baseHeight - 10);
            if (direction === 'LEFT') this.velocity.setMag(-this.speed);else this.velocity.setMag(this.speed);

            this.position.add(this.velocity);
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
    function Enemy(xPosition, positionToReachX, positionToReachY) {
        _classCallCheck(this, Enemy);

        this.position = createVector(xPosition, -30);

        this.positionToReach = createVector(positionToReachX, positionToReachY);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.maxSpeed = 5;
        // Ability to turn
        this.maxForce = 5;

        this.color = 255;
        this.side = 20;

        this.magnitudeLimit = 50;
    }

    _createClass(Enemy, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            // TODO: Think out and implement and enemy shape
            rect(this.position.x, this.position.y, this.side, this.side);
        }
    }, {
        key: "checkArrival",
        value: function checkArrival() {
            var desired = p5.Vector.sub(this.positionToReach, this.position);
            var desiredMag = desired.mag();
            if (desiredMag < this.magnitudeLimit) {
                var mappedSpeed = map(desiredMag, 0, 50, 0, this.maxSpeed);
                desired.setMag(mappedSpeed);
            } else {
                desired.setMag(this.maxSpeed);
            }

            var steering = p5.Vector.sub(desired, this.velocity);
            steering.limit(this.maxForce);
            this.acceleration.add(steering);
        }
    }, {
        key: "update",
        value: function update() {
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            this.position.add(this.velocity);
            // There is no continuous acceleration its only instantaneous
            this.acceleration.set(0, 0);

            if (this.velocity.mag() <= 1) this.positionToReach = createVector(random(0 + this.side, width - this.side), random(0 + this.side, height / 2));
        }
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
var minFrameWaitCount = 7;
var waitFrameCount = minFrameWaitCount;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');

    spaceShip = new SpaceShip(255);
    for (var i = 0; i < 20; i++) {
        enemies.push(new Enemy(random(0, width), random(0, width), random(0, height / 2)));
    }
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

    enemies.forEach(function (element) {
        element.show();
        element.checkArrival();
        element.update();
    });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNwYWNlLXNoaXAuanMiLCJidWxsZXQuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoY29sb3IpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNwYWNlU2hpcCk7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDEwMDtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gMjA7XG4gICAgICAgIHRoaXMuc2hvb3RlcldpZHRoID0gMTA7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih3aWR0aCAvIDIsIHRoaXMuYmFzZUhlaWdodCAtIDEwKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnNwZWVkID0gMTU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNwYWNlU2hpcCwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHJlY3RNb2RlKENFTlRFUik7XG5cbiAgICAgICAgICAgIHJlY3QodGhpcy5wb3NpdGlvbi54LCBoZWlnaHQgLSB0aGlzLmJhc2VIZWlnaHQgLSAxMCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICByZWN0KHRoaXMucG9zaXRpb24ueCwgaGVpZ2h0IC0gMiAqIHRoaXMuYmFzZUhlaWdodCAtIDEwLCB0aGlzLmJhc2VXaWR0aCAvIDIsIHRoaXMuYmFzZUhlaWdodCk7XG5cbiAgICAgICAgICAgIHJlY3QodGhpcy5wb3NpdGlvbi54LCBoZWlnaHQgLSAyICogdGhpcy5iYXNlSGVpZ2h0IC0gMTUgLSB0aGlzLmJhc2VIZWlnaHQgLyAyLCB0aGlzLnNob290ZXJXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA8IHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuYmFzZVdpZHRoIC8gMiArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54ID4gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMiAtIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3Iod2lkdGgsIHRoaXMuYmFzZUhlaWdodCAtIDEwKTtcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdMRUZUJykgdGhpcy52ZWxvY2l0eS5zZXRNYWcoLXRoaXMuc3BlZWQpO2Vsc2UgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCdWxsZXQoeFBvc2l0aW9uLCB5UG9zaXRpb24sIGdvVXApIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJ1bGxldCk7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IGdvVXAgPyAxMCA6IC0xMDtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gMjA7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gMTA7XG5cbiAgICAgICAgdGhpcy54ID0geFBvc2l0aW9uO1xuICAgICAgICB0aGlzLnkgPSB5UG9zaXRpb247XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IDI1NTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQnVsbGV0LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICByZWN0TW9kZShDRU5URVIpO1xuICAgICAgICAgICAgcmVjdCh0aGlzLngsIHRoaXMueSAtIHRoaXMuYmFzZUhlaWdodCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMueSAtPSB0aGlzLnNwZWVkICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEJ1bGxldDtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEVuZW15ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZW15KHhQb3NpdGlvbiwgcG9zaXRpb25Ub1JlYWNoWCwgcG9zaXRpb25Ub1JlYWNoWSkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW5lbXkpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCAtMzApO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHBvc2l0aW9uVG9SZWFjaFgsIHBvc2l0aW9uVG9SZWFjaFkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLm1heFNwZWVkID0gNTtcbiAgICAgICAgLy8gQWJpbGl0eSB0byB0dXJuXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgICAgIHRoaXMuc2lkZSA9IDIwO1xuXG4gICAgICAgIHRoaXMubWFnbml0dWRlTGltaXQgPSA1MDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW5lbXksIFt7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IFRoaW5rIG91dCBhbmQgaW1wbGVtZW50IGFuZCBlbmVteSBzaGFwZVxuICAgICAgICAgICAgcmVjdCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5zaWRlLCB0aGlzLnNpZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2hlY2tBcnJpdmFsXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0Fycml2YWwoKSB7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZCA9IHA1LlZlY3Rvci5zdWIodGhpcy5wb3NpdGlvblRvUmVhY2gsIHRoaXMucG9zaXRpb24pO1xuICAgICAgICAgICAgdmFyIGRlc2lyZWRNYWcgPSBkZXNpcmVkLm1hZygpO1xuICAgICAgICAgICAgaWYgKGRlc2lyZWRNYWcgPCB0aGlzLm1hZ25pdHVkZUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNwZWVkID0gbWFwKGRlc2lyZWRNYWcsIDAsIDUwLCAwLCB0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyhtYXBwZWRTcGVlZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3RlZXJpbmcgPSBwNS5WZWN0b3Iuc3ViKGRlc2lyZWQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgc3RlZXJpbmcubGltaXQodGhpcy5tYXhGb3JjZSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoc3RlZXJpbmcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmxpbWl0KHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBjb250aW51b3VzIGFjY2VsZXJhdGlvbiBpdHMgb25seSBpbnN0YW50YW5lb3VzXG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZlbG9jaXR5Lm1hZygpIDw9IDEpIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHJhbmRvbSgwICsgdGhpcy5zaWRlLCB3aWR0aCAtIHRoaXMuc2lkZSksIHJhbmRvbSgwICsgdGhpcy5zaWRlLCBoZWlnaHQgLyAyKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW5lbXk7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zcGFjZS1zaGlwLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9lbmVteS5qc1wiIC8+XG5cbnZhciBzcGFjZVNoaXAgPSB2b2lkIDA7XG52YXIgYnVsbGV0cyA9IFtdO1xudmFyIGVuZW1pZXMgPSBbXTtcbnZhciBtaW5GcmFtZVdhaXRDb3VudCA9IDc7XG52YXIgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuXG4gICAgc3BhY2VTaGlwID0gbmV3IFNwYWNlU2hpcCgyNTUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQgLyAyKSkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIGlmICgha2V5SXNEb3duKDMyKSkgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIHNwYWNlU2hpcC5zaG93KCk7XG4gICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSAmJiBrZXlJc0Rvd24oUklHSFRfQVJST1cpKSB7LyogRG8gbm90aGluZyovfSBlbHNlIHtcbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdSSUdIVCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGtleUlzRG93bigzMikpIHtcbiAgICAgICAgaWYgKHdhaXRGcmFtZUNvdW50ID09PSBtaW5GcmFtZVdhaXRDb3VudCkgYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQoc3BhY2VTaGlwLnByZXZYLCBoZWlnaHQgLSAyICogc3BhY2VTaGlwLmJhc2VIZWlnaHQgLSAxNSwgdHJ1ZSkpO1xuICAgICAgICB3YWl0RnJhbWVDb3VudCAtPSAxICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgIH1cbiAgICBpZiAod2FpdEZyYW1lQ291bnQgPCAwKSB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgYnVsbGV0LnNob3coKTtcbiAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xuICAgIH0pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVsbGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYnVsbGV0c1tpXS55IDwgLWJ1bGxldHNbaV0uYmFzZUhlaWdodCkge1xuICAgICAgICAgICAgYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tBcnJpdmFsKCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgfSk7XG59Il19
