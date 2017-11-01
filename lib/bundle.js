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
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: Make something like golem from clash of clans. Where the ship breaks into two more
/// <reference path="./bullet.js" />

var Enemy = function () {
    function Enemy(xPosition, positionToReachX, positionToReachY, enemyBaseWidth) {
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
        this.mainBase = enemyBaseWidth;
        this.generalDimension = this.mainBase / 5;
        this.shooterHeight = this.mainBase * 3 / 20;
        this.shapePoints = [];

        this.magnitudeLimit = 50;
        this.bullets = [];
        this.constBulletTime = 14;
        this.currentBulletTime = this.constBulletTime;

        this.health = 100;
        this.fullHealthColor = color('hsl(120, 100%, 50%)');
        this.halfHealthColor = color('hsl(60, 100%, 50%)');
        this.zeroHealthColor = color('hsl(0, 100%, 50%)');
    }

    _createClass(Enemy, [{
        key: 'show',
        value: function show() {
            noStroke();
            var currentColor = null;
            if (this.health < 50) {
                currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, this.health / 50);
            } else {
                currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (this.health - 50) / 50);
            }
            fill(currentColor);

            var x = this.position.x;
            var y = this.position.y;
            this.shapePoints = [[x - this.mainBase / 2, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension * 1.5], [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension / 2], [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y - this.generalDimension * 1.5], [x + this.mainBase / 2, y + this.generalDimension / 2], [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension / 2], [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5], [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension * 1.5], [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension / 2], [x - this.mainBase / 2, y + this.generalDimension / 2]];

            beginShape();
            for (var i = 0; i < this.shapePoints.length; i++) {
                vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
            }endShape(CLOSE);
        }
    }, {
        key: 'checkArrival',
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
        key: 'shootBullets',
        value: function shootBullets() {
            if (this.currentBulletTime === this.constBulletTime) {
                var randomValue = random();
                if (randomValue < 0.5) this.bullets.push(new Bullet(this.prevX, this.position.y + this.generalDimension * 5, this.mainBase / 5, false));
            }
        }
    }, {
        key: 'checkPlayerDistance',
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
        key: 'takeDamageAndCheckDeath',
        value: function takeDamageAndCheckDeath() {
            this.health -= 20;
            if (this.health < 0) return true;else return false;
        }
    }, {
        key: 'update',
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
    for (var i = 0; i < 1; i++) {
        enemies.push(new Enemy(random(0, width), random(0, width), random(0, height / 2), 45));
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
                var enemyDead = enemies[j].takeDamageAndCheckDeath();
                if (enemyDead) {
                    enemies.splice(j, 1);
                    j -= 1;
                }
                bullets.splice(_i, 1);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bGxldC5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCdWxsZXQoeFBvc2l0aW9uLCB5UG9zaXRpb24sIHNpemUsIGdvVXApIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJ1bGxldCk7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IGdvVXAgPyAxMCA6IC0xMDtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gc2l6ZSAqIDI7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gc2l6ZTtcblxuICAgICAgICB0aGlzLnggPSB4UG9zaXRpb247XG4gICAgICAgIHRoaXMueSA9IHlQb3NpdGlvbjtcblxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCdWxsZXQsIFt7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHJlY3QodGhpcy54LCB0aGlzLnkgLSB0aGlzLmJhc2VIZWlnaHQsIHRoaXMuYmFzZVdpZHRoLCB0aGlzLmJhc2VIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5zcGVlZCAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCdWxsZXQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgU3BhY2VTaGlwID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwYWNlU2hpcChib2R5Q29sb3IpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNwYWNlU2hpcCk7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IGJvZHlDb2xvcjtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSA3MDtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gdGhpcy5iYXNlV2lkdGggLyA1O1xuICAgICAgICB0aGlzLnNob290ZXJXaWR0aCA9IHRoaXMuYmFzZVdpZHRoIC8gMTA7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHdpZHRoIC8gMiwgaGVpZ2h0IC0gdGhpcy5iYXNlSGVpZ2h0IC0gMTApO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgIHRoaXMuc3BlZWQgPSAxNTtcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XG5cbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU3BhY2VTaGlwLCBbe1xuICAgICAgICBrZXk6ICdzaG93JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbW3ggLSB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAyXSwgW3ggKyB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAyXSwgW3ggKyB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggLSB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcblxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuaGVhbHRoIC8gNTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAodGhpcy5oZWFsdGggLSA1MCkgLyA1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG4gICAgICAgICAgICByZWN0KHdpZHRoIC8gMiwgaGVpZ2h0IC0gNywgd2lkdGggKiB0aGlzLmhlYWx0aCAvIDEwMCwgMTApO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtb3ZlU2hpcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlU2hpcChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPCB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmJhc2VXaWR0aCAvIDIgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA+IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIgLSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKHdpZHRoLCAwKTtcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdMRUZUJykgdGhpcy52ZWxvY2l0eS5zZXRNYWcoLXRoaXMuc3BlZWQpO2Vsc2UgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWNyZWFzZUhlYWx0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWNyZWFzZUhlYWx0aCgpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IDI7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1lvdSBMb3N0Jyk7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3BhY2VTaGlwO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8gVE9ETzogTWFrZSBzb21ldGhpbmcgbGlrZSBnb2xlbSBmcm9tIGNsYXNoIG9mIGNsYW5zLiBXaGVyZSB0aGUgc2hpcCBicmVha3MgaW50byB0d28gbW9yZVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIEVuZW15ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZW15KHhQb3NpdGlvbiwgcG9zaXRpb25Ub1JlYWNoWCwgcG9zaXRpb25Ub1JlYWNoWSwgZW5lbXlCYXNlV2lkdGgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVuZW15KTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgLTMwKTtcbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3Rvcihwb3NpdGlvblRvUmVhY2hYLCBwb3NpdGlvblRvUmVhY2hZKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5tYXhTcGVlZCA9IDU7XG4gICAgICAgIC8vIEFiaWxpdHkgdG8gdHVyblxuICAgICAgICB0aGlzLm1heEZvcmNlID0gNTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xuICAgICAgICB0aGlzLm1haW5CYXNlID0gZW5lbXlCYXNlV2lkdGg7XG4gICAgICAgIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiA9IHRoaXMubWFpbkJhc2UgLyA1O1xuICAgICAgICB0aGlzLnNob290ZXJIZWlnaHQgPSB0aGlzLm1haW5CYXNlICogMyAvIDIwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5tYWduaXR1ZGVMaW1pdCA9IDUwO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25zdEJ1bGxldFRpbWUgPSAxNDtcbiAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTAwO1xuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFbmVteSwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMubWFpbkJhc2UgLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5tYWluQmFzZSAvIDIgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMubWFpbkJhc2UgLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIgLSB0aGlzLm1haW5CYXNlIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5tYWluQmFzZSAvIDIgLSB0aGlzLm1haW5CYXNlIC8gNSAtIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLm1haW5CYXNlIC8gMiAtIHRoaXMubWFpbkJhc2UgLyA1IC0gdGhpcy5tYWluQmFzZSAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMubWFpbkJhc2UgLyAyICsgdGhpcy5tYWluQmFzZSAvIDUgKyB0aGlzLm1haW5CYXNlIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5tYWluQmFzZSAvIDIgKyB0aGlzLm1haW5CYXNlIC8gNSArIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLm1haW5CYXNlIC8gMiArIHRoaXMubWFpbkJhc2UgLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4IC0gdGhpcy5tYWluQmFzZSAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrQXJyaXZhbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0Fycml2YWwoKSB7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZCA9IHA1LlZlY3Rvci5zdWIodGhpcy5wb3NpdGlvblRvUmVhY2gsIHRoaXMucG9zaXRpb24pO1xuICAgICAgICAgICAgdmFyIGRlc2lyZWRNYWcgPSBkZXNpcmVkLm1hZygpO1xuICAgICAgICAgICAgaWYgKGRlc2lyZWRNYWcgPCB0aGlzLm1hZ25pdHVkZUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNwZWVkID0gbWFwKGRlc2lyZWRNYWcsIDAsIDUwLCAwLCB0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyhtYXBwZWRTcGVlZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3RlZXJpbmcgPSBwNS5WZWN0b3Iuc3ViKGRlc2lyZWQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgc3RlZXJpbmcubGltaXQodGhpcy5tYXhGb3JjZSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoc3RlZXJpbmcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzaG9vdEJ1bGxldHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvb3RCdWxsZXRzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPT09IHRoaXMuY29uc3RCdWxsZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB0aGlzLmJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHRoaXMucHJldlgsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDUsIHRoaXMubWFpbkJhc2UgLyA1LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja1BsYXllckRpc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGxheWVyRGlzdGFuY2UocGxheWVyUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIDwgMCkgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgICAgICB2YXIgeFBvc2l0aW9uRGlzdGFuY2UgPSBhYnMocGxheWVyUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCk7XG4gICAgICAgICAgICBpZiAoeFBvc2l0aW9uRGlzdGFuY2UgPCAyMDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob290QnVsbGV0cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndGFrZURhbWFnZUFuZENoZWNrRGVhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSAyMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDApIHJldHVybiB0cnVlO2Vsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5saW1pdCh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gY29udGludW91cyBhY2NlbGVyYXRpb24gaXRzIG9ubHkgaW5zdGFudGFuZW91c1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5tYWcoKSA8PSAxKSB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnNob3coKTtcbiAgICAgICAgICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS55IDwgLXRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW5lbXk7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3BhY2Utc2hpcC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9lbmVteS5qc1wiIC8+XG5cbnZhciBzcGFjZVNoaXAgPSB2b2lkIDA7XG52YXIgYnVsbGV0cyA9IFtdO1xudmFyIGVuZW1pZXMgPSBbXTtcbnZhciBtaW5GcmFtZVdhaXRDb3VudCA9IDc7XG52YXIgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuXG4gICAgc3BhY2VTaGlwID0gbmV3IFNwYWNlU2hpcCgyNTUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTsgaSsrKSB7XG4gICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpLCA0NSkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgaWYgKCFrZXlJc0Rvd24oMzIpKSB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgc3BhY2VTaGlwLnNob3coKTtcbiAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpICYmIGtleUlzRG93bihSSUdIVF9BUlJPVykpIHsvKiBEbyBub3RoaW5nICovfSBlbHNlIHtcbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdSSUdIVCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGtleUlzRG93bigzMikpIHtcbiAgICAgICAgaWYgKHdhaXRGcmFtZUNvdW50ID09PSBtaW5GcmFtZVdhaXRDb3VudCkgYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQoc3BhY2VTaGlwLnByZXZYLCBoZWlnaHQgLSAyICogc3BhY2VTaGlwLmJhc2VIZWlnaHQgLSAxNSwgc3BhY2VTaGlwLmJhc2VXaWR0aCAvIDEwLCB0cnVlKSk7XG4gICAgICAgIHdhaXRGcmFtZUNvdW50IC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgfVxuICAgIGlmICh3YWl0RnJhbWVDb3VudCA8IDApIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBidWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgfSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChidWxsZXRzW2ldLnkgPCAtYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICBidWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgZWxlbWVudC5jaGVja0Fycml2YWwoKTtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICAgICAgZWxlbWVudC5jaGVja1BsYXllckRpc3RhbmNlKHNwYWNlU2hpcC5wb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYnVsbGV0cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmVtaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoZW5lbWllc1tqXS5wb2ludElzSW5zaWRlKFtidWxsZXRzW19pXS54LCBidWxsZXRzW19pXS55XSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW5lbXlEZWFkID0gZW5lbWllc1tqXS50YWtlRGFtYWdlQW5kQ2hlY2tEZWF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChlbmVteURlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGogLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnVsbGV0cy5zcGxpY2UoX2ksIDEpO1xuICAgICAgICAgICAgICAgIF9pID0gX2kgPT09IDAgPyAwIDogX2kgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgZW5lbWllcy5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIGZvciAodmFyIF9qID0gMDsgX2ogPCBlbmVtaWVzW19pMl0uYnVsbGV0cy5sZW5ndGg7IF9qKyspIHtcbiAgICAgICAgICAgIGlmIChzcGFjZVNoaXAucG9pbnRJc0luc2lkZShbZW5lbWllc1tfaTJdLmJ1bGxldHNbX2pdLngsIGVuZW1pZXNbX2kyXS5idWxsZXRzW19qXS55XSkpIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzW19pMl0uYnVsbGV0cy5zcGxpY2UoX2osIDEpO1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5kZWNyZWFzZUhlYWx0aCgpO1xuXG4gICAgICAgICAgICAgICAgX2ogLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iXX0=
