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
        this.shapePoints = [];

        this.position = createVector(width / 2, height - this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.prevX = this.position.x;
        this.speed = 15;
    }

    _createClass(SpaceShip, [{
        key: 'show',
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;
            this.shapePoints = [[x - this.shooterWidth / 2, y - this.baseHeight * 2], [x + this.shooterWidth / 2, y - this.baseHeight * 2], [x + this.shooterWidth / 2, y - this.baseHeight * 1.5], [x + this.baseWidth / 4, y - this.baseHeight * 1.5], [x + this.baseWidth / 4, y - this.baseHeight / 2], [x + this.baseWidth / 2, y - this.baseHeight / 2], [x + this.baseWidth / 2, y + this.baseHeight / 2], [x - this.baseWidth / 2, y + this.baseHeight / 2], [x - this.baseWidth / 2, y - this.baseHeight / 2], [x - this.baseWidth / 4, y - this.baseHeight / 2], [x - this.baseWidth / 4, y - this.baseHeight * 1.5], [x - this.shooterWidth / 2, y - this.baseHeight * 1.5]];

            beginShape();
            for (var i = 0; i < this.shapePoints.length; i++) {
                vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
            }endShape(CLOSE);

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

            this.velocity = createVector(width, 0);
            if (direction === 'LEFT') this.velocity.setMag(-this.speed);else this.velocity.setMag(this.speed);

            this.position.add(this.velocity);
        }
    }]);

    return SpaceShip;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: Make something like golem from clash of clans. Where the ship breaks into two more

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
        this.mainBase = 70;
        this.generalDimension = 20;
        this.shooterWidth = 10;
        this.shooterHeight = 15;
        this.shapePoints = [];

        this.magnitudeLimit = 50;
    }

    _createClass(Enemy, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;
            this.shapePoints = [[x - this.mainBase / 2, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y + this.generalDimension / 2], [x + this.mainBase / 2 - 10, y + this.generalDimension / 2], [x + this.mainBase / 2 - 10, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - 10 - 20, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - 10 - 20, y + this.generalDimension * 1.5 + this.shooterHeight], [x + this.mainBase / 2 - 10 - 20 - this.shooterWidth, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.mainBase / 2 + 10 + 20, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + 10, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + 10, y + this.generalDimension / 2], [x - this.mainBase / 2, y + this.generalDimension / 2]];

            beginShape();
            for (var i = 0; i < this.shapePoints.length; i++) {
                vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
            }endShape(CLOSE);
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

            if (this.velocity.mag() <= 1) this.positionToReach = createVector(random(0, width), random(0, height / 2));
        }
    }, {
        key: "pointIsInside",
        value: function pointIsInside(point, vs) {
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

            var x = point[0],
                y = point[1];

            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i][0],
                    yi = vs[i][1];
                var xj = vs[j][0],
                    yj = vs[j][1];

                var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
                if (intersect) inside = !inside;
            }

            return inside;
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

    for (var _i = 0; _i < bullets.length; _i++) {
        for (var j = 0; j < enemies.length; j++) {
            // TODO: Check collision with ship
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bGxldC5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnVsbGV0KHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBnb1VwKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCdWxsZXQpO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSBnb1VwID8gMTAgOiAtMTA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IDIwO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDEwO1xuXG4gICAgICAgIHRoaXMueCA9IHhQb3NpdGlvbjtcbiAgICAgICAgdGhpcy55ID0geVBvc2l0aW9uO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEJ1bGxldCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgcmVjdE1vZGUoQ0VOVEVSKTtcbiAgICAgICAgICAgIHJlY3QodGhpcy54LCB0aGlzLnkgLSB0aGlzLmJhc2VIZWlnaHQsIHRoaXMuYmFzZVdpZHRoLCB0aGlzLmJhc2VIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5zcGVlZCAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCdWxsZXQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgU3BhY2VTaGlwID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwYWNlU2hpcChjb2xvcikge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3BhY2VTaGlwKTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gMTAwO1xuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSAyMDtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSAxMDtcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtdO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Iod2lkdGggLyAyLCBoZWlnaHQgLSB0aGlzLmJhc2VIZWlnaHQgLSAxMCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IDE1O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV1dO1xuXG4gICAgICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgodGhpcy5zaGFwZVBvaW50c1tpXVswXSwgdGhpcy5zaGFwZVBvaW50c1tpXVsxXSk7XG4gICAgICAgICAgICB9ZW5kU2hhcGUoQ0xPU0UpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtb3ZlU2hpcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlU2hpcChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPCB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmJhc2VXaWR0aCAvIDIgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA+IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIgLSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKHdpZHRoLCAwKTtcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdMRUZUJykgdGhpcy52ZWxvY2l0eS5zZXRNYWcoLXRoaXMuc3BlZWQpO2Vsc2UgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8gVE9ETzogTWFrZSBzb21ldGhpbmcgbGlrZSBnb2xlbSBmcm9tIGNsYXNoIG9mIGNsYW5zLiBXaGVyZSB0aGUgc2hpcCBicmVha3MgaW50byB0d28gbW9yZVxuXG52YXIgRW5lbXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5lbXkoeFBvc2l0aW9uLCBwb3NpdGlvblRvUmVhY2hYLCBwb3NpdGlvblRvUmVhY2hZKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbmVteSk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIC0zMCk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocG9zaXRpb25Ub1JlYWNoWCwgcG9zaXRpb25Ub1JlYWNoWSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSA1O1xuICAgICAgICAvLyBBYmlsaXR5IHRvIHR1cm5cbiAgICAgICAgdGhpcy5tYXhGb3JjZSA9IDU7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IDI1NTtcbiAgICAgICAgdGhpcy5tYWluQmFzZSA9IDcwO1xuICAgICAgICB0aGlzLmdlbmVyYWxEaW1lbnNpb24gPSAyMDtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSAxMDtcbiAgICAgICAgdGhpcy5zaG9vdGVySGVpZ2h0ID0gMTU7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLm1hZ25pdHVkZUxpbWl0ID0gNTA7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVuZW15LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMubWFpbkJhc2UgLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5tYWluQmFzZSAvIDIgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIDEwLCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIgLSAxMCwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIgLSAxMCAtIDIwLCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIDEwIC0gMjAsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gMTAgLSAyMCAtIHRoaXMuc2hvb3RlcldpZHRoLCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41ICsgdGhpcy5zaG9vdGVySGVpZ2h0XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIDEwICsgMjAsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgMTAsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgMTAsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImNoZWNrQXJyaXZhbFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tBcnJpdmFsKCkge1xuICAgICAgICAgICAgdmFyIGRlc2lyZWQgPSBwNS5WZWN0b3Iuc3ViKHRoaXMucG9zaXRpb25Ub1JlYWNoLCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkTWFnID0gZGVzaXJlZC5tYWcoKTtcbiAgICAgICAgICAgIGlmIChkZXNpcmVkTWFnIDwgdGhpcy5tYWduaXR1ZGVMaW1pdCkge1xuICAgICAgICAgICAgICAgIHZhciBtYXBwZWRTcGVlZCA9IG1hcChkZXNpcmVkTWFnLCAwLCA1MCwgMCwgdGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcobWFwcGVkU3BlZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN0ZWVyaW5nID0gcDUuVmVjdG9yLnN1YihkZXNpcmVkLCB0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHN0ZWVyaW5nLmxpbWl0KHRoaXMubWF4Rm9yY2UpO1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHN0ZWVyaW5nKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5saW1pdCh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gY29udGludW91cyBhY2NlbGVyYXRpb24gaXRzIG9ubHkgaW5zdGFudGFuZW91c1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5tYWcoKSA8PSAxKSB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwicG9pbnRJc0luc2lkZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCwgdnMpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB2cy5sZW5ndGggLSAxOyBpIDwgdnMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdnNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdnNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdnNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdnNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVuZW15O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3BhY2Utc2hpcC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZW5lbXkuanNcIiAvPlxuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIGJ1bGxldHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgbWluRnJhbWVXYWl0Q291bnQgPSA3O1xudmFyIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAgIHZhciBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcblxuICAgIHNwYWNlU2hpcCA9IG5ldyBTcGFjZVNoaXAoMjU1KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcbiAgICBpZiAoIWtleUlzRG93bigzMikpIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBzcGFjZVNoaXAuc2hvdygpO1xuICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykgJiYga2V5SXNEb3duKFJJR0hUX0FSUk9XKSkgey8qIERvIG5vdGhpbmcqL30gZWxzZSB7XG4gICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykpIHtcbiAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnTEVGVCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleUlzRG93bihSSUdIVF9BUlJPVykpIHtcbiAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnUklHSFQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChrZXlJc0Rvd24oMzIpKSB7XG4gICAgICAgIGlmICh3YWl0RnJhbWVDb3VudCA9PT0gbWluRnJhbWVXYWl0Q291bnQpIGJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHNwYWNlU2hpcC5wcmV2WCwgaGVpZ2h0IC0gMiAqIHNwYWNlU2hpcC5iYXNlSGVpZ2h0IC0gMTUsIHRydWUpKTtcbiAgICAgICAgd2FpdEZyYW1lQ291bnQgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICB9XG4gICAgaWYgKHdhaXRGcmFtZUNvdW50IDwgMCkgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIGJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICB9KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGJ1bGxldHNbaV0ueSA8IC1idWxsZXRzW2ldLmJhc2VIZWlnaHQpIHtcbiAgICAgICAgICAgIGJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICBlbGVtZW50LmNoZWNrQXJyaXZhbCgpO1xuICAgICAgICBlbGVtZW50LnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGJ1bGxldHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5lbWllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gVE9ETzogQ2hlY2sgY29sbGlzaW9uIHdpdGggc2hpcFxuICAgICAgICB9XG4gICAgfVxufSJdfQ==
