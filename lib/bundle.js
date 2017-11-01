"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bullet = function () {
    function Bullet(xPosition, yPosition, size, goUp) {
        _classCallCheck(this, Bullet);

        this.speed = goUp ? 10 : -10;
        this.baseHeight = size * 2;
        this.baseWidth = size;

        this.x = xPosition;
        this.y = yPosition;

        this.color = 255;
    }

    _createClass(Bullet, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

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
    function SpaceShip(bodyColor) {
        _classCallCheck(this, SpaceShip);

        this.color = bodyColor;
        this.baseWidth = 70;
        this.baseHeight = this.baseWidth / 5;
        this.shooterWidth = this.baseWidth / 10;
        this.shapePoints = [];

        this.position = createVector(width / 2, height - this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.prevX = this.position.x;
        this.speed = 15;
        this.health = 100;

        this.fullHealthColor = color('hsl(120, 100%, 50%)');
        this.halfHealthColor = color('hsl(60, 100%, 50%)');
        this.zeroHealthColor = color('hsl(0, 100%, 50%)');
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

            var currentColor = null;
            if (this.health < 50) {
                currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, this.health / 50);
            } else {
                currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (this.health - 50) / 50);
            }
            fill(currentColor);
            rect(width / 2, height - 7, width * this.health / 100, 10);

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
    }, {
        key: 'decreaseHealth',
        value: function decreaseHealth() {
            this.health -= 2;
            if (this.health === 0) {
                window.alert('You Lost');
                window.location = window.location.href;
            }
        }
    }, {
        key: 'pointIsInside',
        value: function pointIsInside(point) {
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

            var x = point[0],
                y = point[1];

            var inside = false;
            for (var i = 0, j = this.shapePoints.length - 1; i < this.shapePoints.length; j = i++) {
                var xi = this.shapePoints[i][0],
                    yi = this.shapePoints[i][1];
                var xj = this.shapePoints[j][0],
                    yj = this.shapePoints[j][1];

                var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
                if (intersect) inside = !inside;
            }

            return inside;
        }
    }]);

    return SpaceShip;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: Make something like golem from clash of clans. Where the ship breaks into two more
/// <reference path="./bullet.js" />

var Enemy = function () {
    function Enemy(xPosition, positionToReachX, positionToReachY, spawnWidth) {
        _classCallCheck(this, Enemy);

        this.position = createVector(xPosition, -30);
        this.prevX = this.position.x;

        this.positionToReach = createVector(positionToReachX, positionToReachY);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.maxSpeed = 5;
        // Ability to turn
        this.maxForce = 5;

        this.color = 255;
        this.mainBase = spawnWidth;
        this.generalDimension = this.mainBase / 5;
        this.shooterHeight = this.mainBase * 3 / 20;
        this.shapePoints = [];

        this.magnitudeLimit = 50;
        this.bullets = [];
        this.constBulletTime = 14;
        this.currentBulletTime = this.constBulletTime;
    }

    _createClass(Enemy, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;
            this.shapePoints = [[x - this.mainBase / 2, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y + this.generalDimension / 2], [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension / 2], [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension / 2], [x - this.mainBase / 2, y + this.generalDimension / 2]];

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
        key: "shootBullets",
        value: function shootBullets() {
            if (this.currentBulletTime === this.constBulletTime) {
                var randomValue = random();
                if (randomValue < 0.5) this.bullets.push(new Bullet(this.prevX, this.position.y + this.generalDimension * 5, this.mainBase / 5, false));
            }
        }
    }, {
        key: "checkPlayerDistance",
        value: function checkPlayerDistance(playerPosition) {
            if (this.currentBulletTime < 0) this.currentBulletTime = this.constBulletTime;

            var xPositionDistance = abs(playerPosition.x - this.position.x);
            if (xPositionDistance < 200) {
                this.shootBullets();
            } else {
                this.currentBulletTime = this.constBulletTime;
            }

            this.currentBulletTime -= 1 * (60 / frameRate());
        }
    }, {
        key: "update",
        value: function update() {
            this.prevX = this.position.x;

            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            this.position.add(this.velocity);
            // There is no continuous acceleration its only instantaneous
            this.acceleration.set(0, 0);

            if (this.velocity.mag() <= 1) this.positionToReach = createVector(random(0, width), random(0, height / 2));

            this.bullets.forEach(function (bullet) {
                bullet.show();
                bullet.update();
            });
            for (var i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].y < -this.bullets[i].baseHeight) {
                    this.bullets.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }, {
        key: "pointIsInside",
        value: function pointIsInside(point) {
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

            var x = point[0],
                y = point[1];

            var inside = false;
            for (var i = 0, j = this.shapePoints.length - 1; i < this.shapePoints.length; j = i++) {
                var xi = this.shapePoints[i][0],
                    yi = this.shapePoints[i][1];
                var xj = this.shapePoints[j][0],
                    yj = this.shapePoints[j][1];

                var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
                if (intersect) inside = !inside;
            }

            return inside;
        }
    }]);

    return Enemy;
}();
'use strict';

/// <reference path="./bullet.js" />
/// <reference path="./space-ship.js" />
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
    for (var i = 0; i < 100; i++) {
        enemies.push(new Enemy(random(0, width), random(0, width), random(0, height / 2), 20));
    }
}

function draw() {
    background(0);
    rectMode(CENTER);
    if (!keyIsDown(32)) waitFrameCount = minFrameWaitCount;

    spaceShip.show();
    if (keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW)) {/* Do nothing */} else {
        if (keyIsDown(LEFT_ARROW)) {
            spaceShip.moveShip('LEFT');
        } else if (keyIsDown(RIGHT_ARROW)) {
            spaceShip.moveShip('RIGHT');
        }
    }

    if (keyIsDown(32)) {
        if (waitFrameCount === minFrameWaitCount) bullets.push(new Bullet(spaceShip.prevX, height - 2 * spaceShip.baseHeight - 15, spaceShip.baseWidth / 10, true));
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
        element.checkPlayerDistance(spaceShip.position);
    });

    for (var _i = 0; _i < bullets.length; _i++) {
        for (var j = 0; j < enemies.length; j++) {
            if (enemies[j].pointIsInside([bullets[_i].x, bullets[_i].y])) {
                enemies.splice(j, 1);
                bullets.splice(_i, 1);

                j -= 1;
                _i = _i === 0 ? 0 : _i - 1;
            }
        }
    }

    for (var _i2 = 0; _i2 < enemies.length; _i2++) {
        for (var _j = 0; _j < enemies[_i2].bullets.length; _j++) {
            if (spaceShip.pointIsInside([enemies[_i2].bullets[_j].x, enemies[_i2].bullets[_j].y])) {
                enemies[_i2].bullets.splice(_j, 1);
                spaceShip.decreaseHealth();

                _j -= 1;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bGxldC5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnVsbGV0KHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBzaXplLCBnb1VwKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCdWxsZXQpO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSBnb1VwID8gMTAgOiAtMTA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHNpemUgKiAyO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IHNpemU7XG5cbiAgICAgICAgdGhpcy54ID0geFBvc2l0aW9uO1xuICAgICAgICB0aGlzLnkgPSB5UG9zaXRpb247XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IDI1NTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQnVsbGV0LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICByZWN0KHRoaXMueCwgdGhpcy55IC0gdGhpcy5iYXNlSGVpZ2h0LCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy55IC09IHRoaXMuc3BlZWQgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQnVsbGV0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoYm9keUNvbG9yKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBib2R5Q29sb3I7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gNzA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih3aWR0aCAvIDIsIGhlaWdodCAtIHRoaXMuYmFzZUhlaWdodCAtIDEwKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnNwZWVkID0gMTU7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTAwO1xuXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNwYWNlU2hpcCwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcblxuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbW92ZVNoaXAnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVNoaXAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVjcmVhc2VIZWFsdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVjcmVhc2VIZWFsdGgoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSAyO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdZb3UgTG9zdCcpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8gVE9ETzogTWFrZSBzb21ldGhpbmcgbGlrZSBnb2xlbSBmcm9tIGNsYXNoIG9mIGNsYW5zLiBXaGVyZSB0aGUgc2hpcCBicmVha3MgaW50byB0d28gbW9yZVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIEVuZW15ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZW15KHhQb3NpdGlvbiwgcG9zaXRpb25Ub1JlYWNoWCwgcG9zaXRpb25Ub1JlYWNoWSwgc3Bhd25XaWR0aCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW5lbXkpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCAtMzApO1xuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHBvc2l0aW9uVG9SZWFjaFgsIHBvc2l0aW9uVG9SZWFjaFkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLm1heFNwZWVkID0gNTtcbiAgICAgICAgLy8gQWJpbGl0eSB0byB0dXJuXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgICAgIHRoaXMubWFpbkJhc2UgPSBzcGF3bldpZHRoO1xuICAgICAgICB0aGlzLmdlbmVyYWxEaW1lbnNpb24gPSB0aGlzLm1haW5CYXNlIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVySGVpZ2h0ID0gdGhpcy5tYWluQmFzZSAqIDMgLyAyMDtcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtdO1xuXG4gICAgICAgIHRoaXMubWFnbml0dWRlTGltaXQgPSA1MDtcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMuY29uc3RCdWxsZXRUaW1lID0gMTQ7XG4gICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW5lbXksIFt7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5tYWluQmFzZSAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMubWFpbkJhc2UgLyA1IC0gdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gdGhpcy5tYWluQmFzZSAvIDUgLSB0aGlzLm1haW5CYXNlIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5tYWluQmFzZSAvIDIgKyB0aGlzLm1haW5CYXNlIC8gNSArIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41ICsgdGhpcy5zaG9vdGVySGVpZ2h0XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMubWFpbkJhc2UgLyA1ICsgdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImNoZWNrQXJyaXZhbFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tBcnJpdmFsKCkge1xuICAgICAgICAgICAgdmFyIGRlc2lyZWQgPSBwNS5WZWN0b3Iuc3ViKHRoaXMucG9zaXRpb25Ub1JlYWNoLCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkTWFnID0gZGVzaXJlZC5tYWcoKTtcbiAgICAgICAgICAgIGlmIChkZXNpcmVkTWFnIDwgdGhpcy5tYWduaXR1ZGVMaW1pdCkge1xuICAgICAgICAgICAgICAgIHZhciBtYXBwZWRTcGVlZCA9IG1hcChkZXNpcmVkTWFnLCAwLCA1MCwgMCwgdGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcobWFwcGVkU3BlZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN0ZWVyaW5nID0gcDUuVmVjdG9yLnN1YihkZXNpcmVkLCB0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHN0ZWVyaW5nLmxpbWl0KHRoaXMubWF4Rm9yY2UpO1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHN0ZWVyaW5nKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob290QnVsbGV0c1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvb3RCdWxsZXRzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPT09IHRoaXMuY29uc3RCdWxsZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB0aGlzLmJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHRoaXMucHJldlgsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDUsIHRoaXMubWFpbkJhc2UgLyA1LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2hlY2tQbGF5ZXJEaXN0YW5jZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tQbGF5ZXJEaXN0YW5jZShwbGF5ZXJQb3NpdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPCAwKSB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG5cbiAgICAgICAgICAgIHZhciB4UG9zaXRpb25EaXN0YW5jZSA9IGFicyhwbGF5ZXJQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54KTtcbiAgICAgICAgICAgIGlmICh4UG9zaXRpb25EaXN0YW5jZSA8IDIwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RCdWxsZXRzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSAtPSAxICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmxpbWl0KHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBjb250aW51b3VzIGFjY2VsZXJhdGlvbiBpdHMgb25seSBpbnN0YW50YW5lb3VzXG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZlbG9jaXR5Lm1hZygpIDw9IDEpIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQgLyAyKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnkgPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInBvaW50SXNJbnNpZGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVuZW15O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NwYWNlLXNoaXAuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZW5lbXkuanNcIiAvPlxuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIGJ1bGxldHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgbWluRnJhbWVXYWl0Q291bnQgPSA3O1xudmFyIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAgIHZhciBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcblxuICAgIHNwYWNlU2hpcCA9IG5ldyBTcGFjZVNoaXAoMjU1KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpLCAyMCkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgaWYgKCFrZXlJc0Rvd24oMzIpKSB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgc3BhY2VTaGlwLnNob3coKTtcbiAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpICYmIGtleUlzRG93bihSSUdIVF9BUlJPVykpIHsvKiBEbyBub3RoaW5nICovfSBlbHNlIHtcbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdSSUdIVCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGtleUlzRG93bigzMikpIHtcbiAgICAgICAgaWYgKHdhaXRGcmFtZUNvdW50ID09PSBtaW5GcmFtZVdhaXRDb3VudCkgYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQoc3BhY2VTaGlwLnByZXZYLCBoZWlnaHQgLSAyICogc3BhY2VTaGlwLmJhc2VIZWlnaHQgLSAxNSwgc3BhY2VTaGlwLmJhc2VXaWR0aCAvIDEwLCB0cnVlKSk7XG4gICAgICAgIHdhaXRGcmFtZUNvdW50IC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgfVxuICAgIGlmICh3YWl0RnJhbWVDb3VudCA8IDApIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBidWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgfSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChidWxsZXRzW2ldLnkgPCAtYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICBidWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgZWxlbWVudC5jaGVja0Fycml2YWwoKTtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICAgICAgZWxlbWVudC5jaGVja1BsYXllckRpc3RhbmNlKHNwYWNlU2hpcC5wb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYnVsbGV0cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmVtaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoZW5lbWllc1tqXS5wb2ludElzSW5zaWRlKFtidWxsZXRzW19pXS54LCBidWxsZXRzW19pXS55XSkpIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICBidWxsZXRzLnNwbGljZShfaSwgMSk7XG5cbiAgICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICAgICAgX2kgPSBfaSA9PT0gMCA/IDAgOiBfaSAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBlbmVtaWVzLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgZm9yICh2YXIgX2ogPSAwOyBfaiA8IGVuZW1pZXNbX2kyXS5idWxsZXRzLmxlbmd0aDsgX2orKykge1xuICAgICAgICAgICAgaWYgKHNwYWNlU2hpcC5wb2ludElzSW5zaWRlKFtlbmVtaWVzW19pMl0uYnVsbGV0c1tfal0ueCwgZW5lbWllc1tfaTJdLmJ1bGxldHNbX2pdLnldKSkge1xuICAgICAgICAgICAgICAgIGVuZW1pZXNbX2kyXS5idWxsZXRzLnNwbGljZShfaiwgMSk7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLmRlY3JlYXNlSGVhbHRoKCk7XG5cbiAgICAgICAgICAgICAgICBfaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSJdfQ==
