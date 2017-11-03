"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Particle = function () {
    function Particle(x, y, colorNumber, maxStrokeWeight) {
        _classCallCheck(this, Particle);

        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(0, 70));
        this.acceleration = createVector(0, 0);

        this.alpha = 1;
        this.colorNumber = colorNumber;
        this.maxStrokeWeight = maxStrokeWeight;
    }

    _createClass(Particle, [{
        key: "applyForce",
        value: function applyForce(force) {
            this.acceleration.add(force);
        }
    }, {
        key: "show",
        value: function show() {
            var colorValue = color("hsla(" + this.colorNumber + ", 100%, 50%, " + this.alpha + ")");
            var mappedStrokeWeight = map(this.alpha, 0, 1, 0, this.maxStrokeWeight);

            strokeWeight(mappedStrokeWeight);
            stroke(colorValue);
            point(this.position.x, this.position.y);

            this.alpha -= 0.05;
        }
    }, {
        key: "update",
        value: function update() {
            this.velocity.mult(0.5);

            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }
    }, {
        key: "isVisible",
        value: function isVisible() {
            return this.alpha > 0;
        }
    }]);

    return Particle;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bullet = function () {
    function Bullet(xPosition, yPosition, size, goUp, colorValue, rotation) {
        _classCallCheck(this, Bullet);

        this.goUp = goUp;
        this.speed = goUp ? -10 : 10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.position = createVector(xPosition, yPosition);
        this.velocity = createVector(0, 0);

        this.color = colorValue !== undefined ? color("hsl(" + colorValue + ", 100%, 50%)") : 255;
        this.rotation = rotation;
    }

    _createClass(Bullet, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;

            push();
            translate(x, y);
            rotate(this.rotation);

            rect(0, -this.baseHeight, this.baseWidth, this.baseHeight);
            if (this.goUp) {
                triangle(-this.baseWidth / 2, -this.baseHeight, 0, -this.baseHeight * 2, this.baseWidth / 2, -this.baseHeight);
            }
            pop();
        }
    }, {
        key: "update",
        value: function update() {
            if (this.rotation === undefined) this.velocity = createVector(0, 45);else {
                var rotation = 45 - this.rotation;
                this.velocity = createVector(-45 + rotation, 45);
            }
            this.velocity.setMag(this.speed);
            this.position.add(this.velocity);
        }
    }]);

    return Bullet;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/// <reference path="./particle.js" />

var Explosion = function () {
    function Explosion(spawnX, spawnY, maxStrokeWeight) {
        _classCallCheck(this, Explosion);

        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        var randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.explode();
    }

    _createClass(Explosion, [{
        key: "explode",
        value: function explode() {
            for (var i = 0; i < 200; i++) {
                var particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight);
                this.particles.push(particle);
            }
        }
    }, {
        key: "show",
        value: function show() {
            this.particles.forEach(function (particle) {
                particle.show();
            });
        }
    }, {
        key: "update",
        value: function update() {
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].applyForce(this.gravity);
                this.particles[i].update();

                if (!this.particles[i].isVisible()) {
                    this.particles.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }, {
        key: "explosionComplete",
        value: function explosionComplete() {
            return this.particles.length === 0;
        }
    }]);

    return Explosion;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pickup = function () {
    function Pickup(xPosition, yPosition, colorValue) {
        _classCallCheck(this, Pickup);

        this.position = createVector(xPosition, yPosition);
        this.velocity = createVector(0, 0);

        this.speed = 2;
        this.shapePoints = [0, 0, 0, 0];
        this.baseWidth = 15;

        this.colorValue = colorValue;
        this.color = color("hsl(" + colorValue + ", 100%, 50%)");
        this.angle = 0;
    }

    _createClass(Pickup, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;

            push();
            translate(x, y);
            rotate(this.angle);
            rect(0, 0, this.baseWidth, this.baseWidth);
            pop();

            this.angle = frameRate() > 0 ? this.angle + 2 * (60 / frameRate()) : this.angle + 2;
            this.angle = this.angle > 360 ? 0 : this.angle;
        }
    }, {
        key: "update",
        value: function update() {
            this.velocity = createVector(0, height);
            this.velocity.setMag(this.speed);
            this.position.add(this.velocity);
        }
    }, {
        key: "isOutOfScreen",
        value: function isOutOfScreen() {
            return this.position.y > height + this.baseWidth;
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

    return Pickup;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/// <reference path="./bullet.js" />

var SpaceShip = function () {
    function SpaceShip() {
        _classCallCheck(this, SpaceShip);

        this.baseWidth = 70;
        this.baseHeight = this.baseWidth / 5;
        this.shooterWidth = this.baseWidth / 10;
        this.shapePoints = [];

        this.bullets = [];
        this.minFrameWaitCount = 7;
        this.waitFrameCount = this.minFrameWaitCount;

        this.position = createVector(width / 2, height - this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.speed = 15;
        this.health = 100;

        this.fullHealthColor = color('hsl(120, 100%, 50%)');
        this.halfHealthColor = color('hsl(60, 100%, 50%)');
        this.zeroHealthColor = color('hsl(0, 100%, 50%)');
        this.spaceShipColor = color('hsl(175, 100%, 50%)');

        this.GodMode = false;
        this.bulletColor = 0;
    }

    _createClass(SpaceShip, [{
        key: 'show',
        value: function show() {
            noStroke();
            var bodyColor = lerpColor(this.zeroHealthColor, this.spaceShipColor, this.health / 100);
            fill(bodyColor);

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
        }
    }, {
        key: 'update',
        value: function update() {
            if (!keyIsDown(32)) this.waitFrameCount = this.minFrameWaitCount;

            if (this.waitFrameCount < 0) this.waitFrameCount = this.minFrameWaitCount;

            this.bullets.forEach(function (bullet) {
                bullet.show();
                bullet.update();
            });
            for (var i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].position.y < -this.bullets[i].baseHeight || this.bullets[i].position.x < -this.bullets[i].baseHeight || this.bullets[i].position.x > width + this.bullets[i].baseHeight) {
                    this.bullets.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }, {
        key: 'moveShip',
        value: function moveShip(direction) {

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
        key: 'setBulletType',
        value: function setBulletType(colorValue) {
            this.bulletColor = colorValue;
        }
    }, {
        key: 'getBulletType',
        value: function getBulletType() {
            switch (this.bulletColor) {
                case 0:
                    return [new Bullet(this.position.x, this.position.y - this.baseHeight * 1.5, this.baseWidth / 10, true, this.bulletColor)];
                    break;
                case 120:
                    return [new Bullet(this.position.x - this.shooterWidth, this.position.y - this.baseHeight * 1.5, this.baseWidth / 10, true, this.bulletColor), new Bullet(this.position.x + this.shooterWidth, this.position.y - this.baseHeight * 1.5, this.baseWidth / 10, true, this.bulletColor)];
                    break;
                default:
                    var array = [];
                    for (var i = 0; i < 80; i += 10) {
                        array.push(new Bullet(this.position.x, this.position.y - this.baseHeight * 1.5, this.baseWidth / 10, true, this.bulletColor, -40 + i));
                    }
                    return array;
                    break;
            }
        }
    }, {
        key: 'shootBullets',
        value: function shootBullets() {
            var _bullets;

            if (this.waitFrameCount === this.minFrameWaitCount) (_bullets = this.bullets).push.apply(_bullets, _toConsumableArray(this.getBulletType()));
            this.waitFrameCount -= 1 * (60 / frameRate());
        }
    }, {
        key: 'decreaseHealth',
        value: function decreaseHealth(amount) {
            if (!this.GodMode) this.health -= amount;
        }
    }, {
        key: 'activateGodMode',
        value: function activateGodMode() {
            this.GodMode = true;
        }
    }, {
        key: 'isDestroyed',
        value: function isDestroyed() {
            if (this.health <= 0) {
                this.health = 0;
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.bullets = [];
            this.waitFrameCount = this.minFrameWaitCount;
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

/// <reference path="./bullet.js" />

var Enemy = function () {
    function Enemy(xPosition, yPosition, enemyBaseWidth) {
        _classCallCheck(this, Enemy);

        this.position = createVector(xPosition, yPosition);
        this.prevX = this.position.x;

        this.positionToReach = createVector(random(0, width), random(0, height / 2));
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.maxSpeed = 5;
        // Ability to turn
        this.maxForce = 5;

        this.color = 255;
        this.baseWidth = enemyBaseWidth;
        this.generalDimension = this.baseWidth / 5;
        this.shooterHeight = this.baseWidth * 3 / 20;
        this.shapePoints = [];

        this.magnitudeLimit = 50;
        this.bullets = [];
        this.constBulletTime = 7;
        this.currentBulletTime = this.constBulletTime;

        this.maxHealth = 100 * enemyBaseWidth / 45;
        this.health = this.maxHealth;
        this.fullHealthColor = color('hsl(120, 100%, 50%)');
        this.halfHealthColor = color('hsl(60, 100%, 50%)');
        this.zeroHealthColor = color('hsl(0, 100%, 50%)');
    }

    _createClass(Enemy, [{
        key: 'show',
        value: function show() {
            noStroke();
            var currentColor = null;
            var mappedHealth = map(this.health, 0, this.maxHealth, 0, 100);
            if (mappedHealth < 50) {
                currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, mappedHealth / 50);
            } else {
                currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (mappedHealth - 50) / 50);
            }
            fill(currentColor);

            var x = this.position.x;
            var y = this.position.y;
            this.shapePoints = [[x - this.baseWidth / 2, y - this.generalDimension * 1.5], [x - this.baseWidth / 2 + this.generalDimension, y - this.generalDimension * 1.5], [x - this.baseWidth / 2 + this.generalDimension, y - this.generalDimension / 2], [x + this.baseWidth / 2 - this.generalDimension, y - this.generalDimension / 2], [x + this.baseWidth / 2 - this.generalDimension, y - this.generalDimension * 1.5], [x + this.baseWidth / 2, y - this.generalDimension * 1.5], [x + this.baseWidth / 2, y + this.generalDimension / 2], [x + this.baseWidth / 2 - this.baseWidth / 5, y + this.generalDimension / 2], [x + this.baseWidth / 2 - this.baseWidth / 5, y + this.generalDimension * 1.5], [x + this.baseWidth / 2 - this.baseWidth / 5 - this.baseWidth / 5, y + this.generalDimension * 1.5], [x + this.baseWidth / 2 - this.baseWidth / 5 - this.baseWidth / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.baseWidth / 2 + this.baseWidth / 5 + this.baseWidth / 5, y + this.generalDimension * 1.5 + this.shooterHeight], [x - this.baseWidth / 2 + this.baseWidth / 5 + this.baseWidth / 5, y + this.generalDimension * 1.5], [x - this.baseWidth / 2 + this.baseWidth / 5, y + this.generalDimension * 1.5], [x - this.baseWidth / 2 + this.baseWidth / 5, y + this.generalDimension / 2], [x - this.baseWidth / 2, y + this.generalDimension / 2]];

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
                if (randomValue < 0.5) this.bullets.push(new Bullet(this.prevX, this.position.y + this.generalDimension * 5, this.baseWidth / 5, false));
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
            this.acceleration.mult(0);

            if (this.velocity.mag() <= 1) this.positionToReach = createVector(random(0, width), random(0, height / 2));

            this.bullets.forEach(function (bullet) {
                bullet.show();
                bullet.update();
            });
            for (var i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].position.y > this.bullets[i].baseHeight + height) {
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
/// <reference path="./explosion.js" />
/// <reference path="./pickups.js" />
/// <reference path="./space-ship.js" />
/// <reference path="./enemy.js" />

var pickupColors = [0, 120, 175];

var spaceShip = void 0;
var spaceShipDestroyed = false;
var pickups = [];
var enemies = [];
var explosions = [];

var currentLevelCount = 1;
var maxLevelCount = 7;
var timeoutCalled = false;
var button = void 0;
var buttonDisplayed = false;

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    button = createButton('Replay!');
    button.position(width / 2 - 62, height / 2 + 30);
    button.elt.className = 'pulse';
    button.elt.style.display = 'none';
    button.mousePressed(resetGame);

    spaceShip = new SpaceShip();

    textAlign(CENTER);
    rectMode(CENTER);
    angleMode(DEGREES);
}

function draw() {
    background(0);

    if (keyIsDown(71) && keyIsDown(79) && keyIsDown(68)) spaceShip.activateGodMode();

    if (spaceShip.isDestroyed()) {
        if (!spaceShipDestroyed) {
            explosions.push(new Explosion(spaceShip.position.x, spaceShip.position.y, spaceShip.baseWidth));
            spaceShipDestroyed = true;
        }

        for (var i = 0; i < enemies.length; i++) {
            explosions.push(new Explosion(enemies[i].position.x, enemies[i].position.y, enemies[i].baseWidth * 7 / 45));
            enemies.splice(i, 1);
            i -= 1;
        }

        textSize(27);
        noStroke();
        fill(255, 0, 0);
        text('You Are Dead', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            buttonDisplayed = true;
        }
    } else {
        spaceShip.show();
        spaceShip.update();

        if (keyIsDown(LEFT_ARROW) && keyIsDown(RIGHT_ARROW)) {/* Do nothing */} else {
            if (keyIsDown(LEFT_ARROW)) {
                spaceShip.moveShip('LEFT');
            } else if (keyIsDown(RIGHT_ARROW)) {
                spaceShip.moveShip('RIGHT');
            }
        }

        if (keyIsDown(32)) {
            spaceShip.shootBullets();
        }
    }

    enemies.forEach(function (element) {
        element.show();
        element.checkArrival();
        element.update();
        element.checkPlayerDistance(spaceShip.position);
    });

    for (var _i = 0; _i < explosions.length; _i++) {
        explosions[_i].show();
        explosions[_i].update();

        if (explosions[_i].explosionComplete()) {
            explosions.splice(_i, 1);
            _i -= 1;
        }
    }

    for (var _i2 = 0; _i2 < pickups.length; _i2++) {
        pickups[_i2].show();
        pickups[_i2].update();

        if (pickups[_i2].isOutOfScreen()) {
            pickups.splice(_i2, 1);
            _i2 -= 1;
        }
    }

    for (var _i3 = 0; _i3 < spaceShip.bullets.length; _i3++) {
        for (var j = 0; j < enemies.length; j++) {
            // FixMe: Check bullet undefined
            if (spaceShip.bullets[_i3]) if (enemies[j].pointIsInside([spaceShip.bullets[_i3].position.x, spaceShip.bullets[_i3].position.y])) {
                var enemyDead = enemies[j].takeDamageAndCheckDeath();
                if (enemyDead) {
                    explosions.push(new Explosion(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth * 7 / 45));
                    if (enemies[j].baseWidth > 100) {
                        enemies.push(new Enemy(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth / 2));
                        enemies.push(new Enemy(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth / 2));
                    }

                    var randomValue = random();
                    if (randomValue < 0.5) {
                        pickups.push(new Pickup(enemies[j].position.x, enemies[j].position.y, pickupColors[floor(random() * pickupColors.length)]));
                    }

                    enemies.splice(j, 1);
                    j -= 1;
                }
                spaceShip.bullets.splice(_i3, 1);
                _i3 = _i3 === 0 ? 0 : _i3 - 1;
            }
        }
    }

    for (var _i4 = 0; _i4 < pickups.length; _i4++) {
        if (spaceShip.pointIsInside([pickups[_i4].position.x, pickups[_i4].position.y])) {
            var colorValue = pickups[_i4].colorValue;
            spaceShip.setBulletType(colorValue);

            pickups.splice(_i4, 1);
            _i4 -= 1;
        }
    }

    for (var _i5 = 0; _i5 < enemies.length; _i5++) {
        for (var _j = 0; _j < enemies[_i5].bullets.length; _j++) {
            // FixMe: Check bullet undefined
            if (enemies[_i5].bullets[_j]) if (spaceShip.pointIsInside([enemies[_i5].bullets[_j].position.x, enemies[_i5].bullets[_j].position.y])) {
                spaceShip.decreaseHealth(2 * enemies[_i5].bullets[_j].baseWidth / 10);
                enemies[_i5].bullets.splice(_j, 1);

                _j -= 1;
            }
        }
    }

    if (spaceShip.GodMode) {
        textSize(27);
        noStroke();
        fill(255);
        text('God Mode', width - 80, height - 30);
    }

    if (enemies.length === 0 && !spaceShipDestroyed) {
        textSize(27);
        noStroke();
        fill(255);
        if (currentLevelCount <= maxLevelCount) {
            text('Loading Level ' + currentLevelCount, width / 2, height / 2);
            if (!timeoutCalled) {
                window.setTimeout(incrementLevel, 3000);
                timeoutCalled = true;
            }
        } else {
            textSize(27);
            noStroke();
            fill(0, 255, 0);
            text('Congratulations you won the game!!!', width / 2, height / 2);
            var _randomValue = random();
            if (_randomValue < 0.1) explosions.push(new Explosion(random(0, width), random(0, height), random(0, 10)));

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                buttonDisplayed = true;
            }
        }
    }
}

function incrementLevel() {
    var i = void 0;
    switch (currentLevelCount) {
        case 1:
            enemies.push(new Enemy(random(0, width), -30, random(45, 70)));
            break;
        case 2:
            for (i = 0; i < 2; i++) {
                enemies.push(new Enemy(random(0, width), -30, random(45, 70)));
            }
            break;
        case 3:
            for (i = 0; i < 15; i++) {
                enemies.push(new Enemy(random(0, width), -30, random(45, 70)));
            }
            break;
        case 4:
            enemies.push(new Enemy(random(0, width), -30, random(150, 170)));
            break;
        case 5:
            for (i = 0; i < 2; i++) {
                enemies.push(new Enemy(random(0, width), -30, random(150, 170)));
            }
            break;

        case 6:
            for (i = 0; i < 20; i++) {
                enemies.push(new Enemy(random(0, width), -30, 20));
            }
            break;
        case 7:
            for (i = 0; i < 50; i++) {
                enemies.push(new Enemy(random(0, width), -30, 20));
            }
            break;
    }

    if (currentLevelCount <= maxLevelCount) {
        timeoutCalled = false;
        currentLevelCount++;
    }
}

function resetGame() {
    spaceShipDestroyed = false;
    enemies = [];
    explosions = [];
    spaceShip.reset();

    currentLevelCount = 1;
    maxLevelCount = 7;
    timeoutCalled = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';
    spaceShip.GodMode = false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwicGlja3Vwcy5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFBhcnRpY2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnRpY2xlKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcnRpY2xlKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdChyYW5kb20oMCwgNzApKTtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBhcnRpY2xlLCBbe1xuICAgICAgICBrZXk6IFwiYXBwbHlGb3JjZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYXBwbHlGb3JjZShmb3JjZSkge1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICB2YXIgY29sb3JWYWx1ZSA9IGNvbG9yKFwiaHNsYShcIiArIHRoaXMuY29sb3JOdW1iZXIgKyBcIiwgMTAwJSwgNTAlLCBcIiArIHRoaXMuYWxwaGEgKyBcIilcIik7XG4gICAgICAgICAgICB2YXIgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcblxuICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XG4gICAgICAgICAgICBwb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDAuNSk7XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzVmlzaWJsZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNWaXNpYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBhcnRpY2xlO1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJ1bGxldCh4UG9zaXRpb24sIHlQb3NpdGlvbiwgc2l6ZSwgZ29VcCwgY29sb3JWYWx1ZSwgcm90YXRpb24pIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJ1bGxldCk7XG5cbiAgICAgICAgdGhpcy5nb1VwID0gZ29VcDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IGdvVXAgPyAtMTAgOiAxMDtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSBzaXplO1xuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSBzaXplICogMjtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3JWYWx1ZSAhPT0gdW5kZWZpbmVkID8gY29sb3IoXCJoc2woXCIgKyBjb2xvclZhbHVlICsgXCIsIDEwMCUsIDUwJSlcIikgOiAyNTU7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSByb3RhdGlvbjtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQnVsbGV0LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICBwdXNoKCk7XG4gICAgICAgICAgICB0cmFuc2xhdGUoeCwgeSk7XG4gICAgICAgICAgICByb3RhdGUodGhpcy5yb3RhdGlvbik7XG5cbiAgICAgICAgICAgIHJlY3QoMCwgLXRoaXMuYmFzZUhlaWdodCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICBpZiAodGhpcy5nb1VwKSB7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGUoLXRoaXMuYmFzZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUhlaWdodCwgMCwgLXRoaXMuYmFzZUhlaWdodCAqIDIsIHRoaXMuYmFzZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3AoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucm90YXRpb24gPT09IHVuZGVmaW5lZCkgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCA0NSk7ZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gNDUgLSB0aGlzLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoLTQ1ICsgcm90YXRpb24sIDQ1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQnVsbGV0O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XG5cbnZhciBFeHBsb3Npb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXhwbG9zaW9uKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV4cGxvc2lvbik7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcblxuICAgICAgICB2YXIgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEV4cGxvc2lvbiwgW3tcbiAgICAgICAga2V5OiBcImV4cGxvZGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvZGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbiAocGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiZXhwbG9zaW9uQ29tcGxldGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvc2lvbkNvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFeHBsb3Npb247XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQaWNrdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGlja3VwKHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBjb2xvclZhbHVlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQaWNrdXApO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAyO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gWzAsIDAsIDAsIDBdO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDE1O1xuXG4gICAgICAgIHRoaXMuY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWU7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcihcImhzbChcIiArIGNvbG9yVmFsdWUgKyBcIiwgMTAwJSwgNTAlKVwiKTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IDA7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBpY2t1cCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICAgICAgcm90YXRlKHRoaXMuYW5nbGUpO1xuICAgICAgICAgICAgcmVjdCgwLCAwLCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlV2lkdGgpO1xuICAgICAgICAgICAgcG9wKCk7XG5cbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSBmcmFtZVJhdGUoKSA+IDAgPyB0aGlzLmFuZ2xlICsgMiAqICg2MCAvIGZyYW1lUmF0ZSgpKSA6IHRoaXMuYW5nbGUgKyAyO1xuICAgICAgICAgICAgdGhpcy5hbmdsZSA9IHRoaXMuYW5nbGUgPiAzNjAgPyAwIDogdGhpcy5hbmdsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCBoZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzT3V0T2ZTY3JlZW5cIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ID4gaGVpZ2h0ICsgdGhpcy5iYXNlV2lkdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJwb2ludElzSW5zaWRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQaWNrdXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gNzA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMubWluRnJhbWVXYWl0Q291bnQgPSA3O1xuICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHdpZHRoIC8gMiwgaGVpZ2h0IC0gdGhpcy5iYXNlSGVpZ2h0IC0gMTApO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAxNTtcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XG5cbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5zcGFjZVNoaXBDb2xvciA9IGNvbG9yKCdoc2woMTc1LCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgdGhpcy5Hb2RNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSAwO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICB2YXIgYm9keUNvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLnNwYWNlU2hpcENvbG9yLCB0aGlzLmhlYWx0aCAvIDEwMCk7XG4gICAgICAgICAgICBmaWxsKGJvZHlDb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICgha2V5SXNEb3duKDMyKSkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLndhaXRGcmFtZUNvdW50IDwgMCkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnkgPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPiB3aWR0aCArIHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0QnVsbGV0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRCdWxsZXRUeXBlKGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSBjb2xvclZhbHVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRCdWxsZXRUeXBlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEJ1bGxldFR5cGUoKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuYnVsbGV0Q29sb3IpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvcildO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpLCBuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODA7IGkgKz0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2gobmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvciwgLTQwICsgaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICB2YXIgX2J1bGxldHM7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLndhaXRGcmFtZUNvdW50ID09PSB0aGlzLm1pbkZyYW1lV2FpdENvdW50KSAoX2J1bGxldHMgPSB0aGlzLmJ1bGxldHMpLnB1c2guYXBwbHkoX2J1bGxldHMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmdldEJ1bGxldFR5cGUoKSkpO1xuICAgICAgICAgICAgdGhpcy53YWl0RnJhbWVDb3VudCAtPSAxICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWNyZWFzZUhlYWx0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWNyZWFzZUhlYWx0aChhbW91bnQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5Hb2RNb2RlKSB0aGlzLmhlYWx0aCAtPSBhbW91bnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2FjdGl2YXRlR29kTW9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhY3RpdmF0ZUdvZE1vZGUoKSB7XG4gICAgICAgICAgICB0aGlzLkdvZE1vZGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0Rlc3Ryb3llZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0Rlc3Ryb3llZCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFsdGggPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9pbnRJc0luc2lkZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTcGFjZVNoaXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuXG52YXIgRW5lbXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5lbXkoeFBvc2l0aW9uLCB5UG9zaXRpb24sIGVuZW15QmFzZVdpZHRoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbmVteSk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbik7XG4gICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5tYXhTcGVlZCA9IDU7XG4gICAgICAgIC8vIEFiaWxpdHkgdG8gdHVyblxuICAgICAgICB0aGlzLm1heEZvcmNlID0gNTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IGVuZW15QmFzZVdpZHRoO1xuICAgICAgICB0aGlzLmdlbmVyYWxEaW1lbnNpb24gPSB0aGlzLmJhc2VXaWR0aCAvIDU7XG4gICAgICAgIHRoaXMuc2hvb3RlckhlaWdodCA9IHRoaXMuYmFzZVdpZHRoICogMyAvIDIwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5tYWduaXR1ZGVMaW1pdCA9IDUwO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25zdEJ1bGxldFRpbWUgPSA3O1xuICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG5cbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDAgKiBlbmVteUJhc2VXaWR0aCAvIDQ1O1xuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFbmVteSwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgdmFyIG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XG4gICAgICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41ICsgdGhpcy5zaG9vdGVySGVpZ2h0XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrQXJyaXZhbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0Fycml2YWwoKSB7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZCA9IHA1LlZlY3Rvci5zdWIodGhpcy5wb3NpdGlvblRvUmVhY2gsIHRoaXMucG9zaXRpb24pO1xuICAgICAgICAgICAgdmFyIGRlc2lyZWRNYWcgPSBkZXNpcmVkLm1hZygpO1xuICAgICAgICAgICAgaWYgKGRlc2lyZWRNYWcgPCB0aGlzLm1hZ25pdHVkZUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNwZWVkID0gbWFwKGRlc2lyZWRNYWcsIDAsIDUwLCAwLCB0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyhtYXBwZWRTcGVlZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3RlZXJpbmcgPSBwNS5WZWN0b3Iuc3ViKGRlc2lyZWQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgc3RlZXJpbmcubGltaXQodGhpcy5tYXhGb3JjZSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoc3RlZXJpbmcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzaG9vdEJ1bGxldHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvb3RCdWxsZXRzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPT09IHRoaXMuY29uc3RCdWxsZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB0aGlzLmJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHRoaXMucHJldlgsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDUsIHRoaXMuYmFzZVdpZHRoIC8gNSwgZmFsc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tQbGF5ZXJEaXN0YW5jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja1BsYXllckRpc3RhbmNlKHBsYXllclBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QnVsbGV0VGltZSA8IDApIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcblxuICAgICAgICAgICAgdmFyIHhQb3NpdGlvbkRpc3RhbmNlID0gYWJzKHBsYXllclBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngpO1xuICAgICAgICAgICAgaWYgKHhQb3NpdGlvbkRpc3RhbmNlIDwgMjAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG9vdEJ1bGxldHMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Rha2VEYW1hZ2VBbmRDaGVja0RlYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRha2VEYW1hZ2VBbmRDaGVja0RlYXRoKCkge1xuICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gMjA7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPCAwKSByZXR1cm4gdHJ1ZTtlbHNlIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkubGltaXQodGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIGNvbnRpbnVvdXMgYWNjZWxlcmF0aW9uIGl0cyBvbmx5IGluc3RhbnRhbmVvdXNcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZlbG9jaXR5Lm1hZygpIDw9IDEpIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQgLyAyKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnkgPiB0aGlzLmJ1bGxldHNbaV0uYmFzZUhlaWdodCArIGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVuZW15O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9waWNrdXBzLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NwYWNlLXNoaXAuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZW5lbXkuanNcIiAvPlxuXG52YXIgcGlja3VwQ29sb3JzID0gWzAsIDEyMCwgMTc1XTtcblxudmFyIHNwYWNlU2hpcCA9IHZvaWQgMDtcbnZhciBzcGFjZVNoaXBEZXN0cm95ZWQgPSBmYWxzZTtcbnZhciBwaWNrdXBzID0gW107XG52YXIgZW5lbWllcyA9IFtdO1xudmFyIGV4cGxvc2lvbnMgPSBbXTtcblxudmFyIGN1cnJlbnRMZXZlbENvdW50ID0gMTtcbnZhciBtYXhMZXZlbENvdW50ID0gNztcbnZhciB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG52YXIgYnV0dG9uID0gdm9pZCAwO1xudmFyIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB2YXIgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG4gICAgYnV0dG9uID0gY3JlYXRlQnV0dG9uKCdSZXBsYXkhJyk7XG4gICAgYnV0dG9uLnBvc2l0aW9uKHdpZHRoIC8gMiAtIDYyLCBoZWlnaHQgLyAyICsgMzApO1xuICAgIGJ1dHRvbi5lbHQuY2xhc3NOYW1lID0gJ3B1bHNlJztcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgYnV0dG9uLm1vdXNlUHJlc3NlZChyZXNldEdhbWUpO1xuXG4gICAgc3BhY2VTaGlwID0gbmV3IFNwYWNlU2hpcCgpO1xuXG4gICAgdGV4dEFsaWduKENFTlRFUik7XG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcbiAgICBhbmdsZU1vZGUoREVHUkVFUyk7XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcblxuICAgIGlmIChrZXlJc0Rvd24oNzEpICYmIGtleUlzRG93big3OSkgJiYga2V5SXNEb3duKDY4KSkgc3BhY2VTaGlwLmFjdGl2YXRlR29kTW9kZSgpO1xuXG4gICAgaWYgKHNwYWNlU2hpcC5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICAgIGlmICghc3BhY2VTaGlwRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihzcGFjZVNoaXAucG9zaXRpb24ueCwgc3BhY2VTaGlwLnBvc2l0aW9uLnksIHNwYWNlU2hpcC5iYXNlV2lkdGgpKTtcbiAgICAgICAgICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGVuZW1pZXNbaV0ucG9zaXRpb24ueCwgZW5lbWllc1tpXS5wb3NpdGlvbi55LCBlbmVtaWVzW2ldLmJhc2VXaWR0aCAqIDcgLyA0NSkpO1xuICAgICAgICAgICAgZW5lbWllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcbiAgICAgICAgdGV4dCgnWW91IEFyZSBEZWFkJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBidXR0b25EaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BhY2VTaGlwLnNob3coKTtcbiAgICAgICAgc3BhY2VTaGlwLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykgJiYga2V5SXNEb3duKFJJR0hUX0FSUk9XKSkgey8qIERvIG5vdGhpbmcgKi99IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSkge1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnTEVGVCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXlJc0Rvd24oUklHSFRfQVJST1cpKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdSSUdIVCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleUlzRG93bigzMikpIHtcbiAgICAgICAgICAgIHNwYWNlU2hpcC5zaG9vdEJ1bGxldHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgZWxlbWVudC5jaGVja0Fycml2YWwoKTtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICAgICAgZWxlbWVudC5jaGVja1BsYXllckRpc3RhbmNlKHNwYWNlU2hpcC5wb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgZXhwbG9zaW9ucy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgZXhwbG9zaW9uc1tfaV0uc2hvdygpO1xuICAgICAgICBleHBsb3Npb25zW19pXS51cGRhdGUoKTtcblxuICAgICAgICBpZiAoZXhwbG9zaW9uc1tfaV0uZXhwbG9zaW9uQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5zcGxpY2UoX2ksIDEpO1xuICAgICAgICAgICAgX2kgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IHBpY2t1cHMubGVuZ3RoOyBfaTIrKykge1xuICAgICAgICBwaWNrdXBzW19pMl0uc2hvdygpO1xuICAgICAgICBwaWNrdXBzW19pMl0udXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKHBpY2t1cHNbX2kyXS5pc091dE9mU2NyZWVuKCkpIHtcbiAgICAgICAgICAgIHBpY2t1cHMuc3BsaWNlKF9pMiwgMSk7XG4gICAgICAgICAgICBfaTIgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pMyA9IDA7IF9pMyA8IHNwYWNlU2hpcC5idWxsZXRzLmxlbmd0aDsgX2kzKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmVtaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAvLyBGaXhNZTogQ2hlY2sgYnVsbGV0IHVuZGVmaW5lZFxuICAgICAgICAgICAgaWYgKHNwYWNlU2hpcC5idWxsZXRzW19pM10pIGlmIChlbmVtaWVzW2pdLnBvaW50SXNJbnNpZGUoW3NwYWNlU2hpcC5idWxsZXRzW19pM10ucG9zaXRpb24ueCwgc3BhY2VTaGlwLmJ1bGxldHNbX2kzXS5wb3NpdGlvbi55XSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW5lbXlEZWFkID0gZW5lbWllc1tqXS50YWtlRGFtYWdlQW5kQ2hlY2tEZWF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChlbmVteURlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oZW5lbWllc1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2pdLnBvc2l0aW9uLnksIGVuZW1pZXNbal0uYmFzZVdpZHRoICogNyAvIDQ1KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLmJhc2VXaWR0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAvIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpY2t1cHMucHVzaChuZXcgUGlja3VwKGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBwaWNrdXBDb2xvcnNbZmxvb3IocmFuZG9tKCkgKiBwaWNrdXBDb2xvcnMubGVuZ3RoKV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5idWxsZXRzLnNwbGljZShfaTMsIDEpO1xuICAgICAgICAgICAgICAgIF9pMyA9IF9pMyA9PT0gMCA/IDAgOiBfaTMgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2k0ID0gMDsgX2k0IDwgcGlja3Vwcy5sZW5ndGg7IF9pNCsrKSB7XG4gICAgICAgIGlmIChzcGFjZVNoaXAucG9pbnRJc0luc2lkZShbcGlja3Vwc1tfaTRdLnBvc2l0aW9uLngsIHBpY2t1cHNbX2k0XS5wb3NpdGlvbi55XSkpIHtcbiAgICAgICAgICAgIHZhciBjb2xvclZhbHVlID0gcGlja3Vwc1tfaTRdLmNvbG9yVmFsdWU7XG4gICAgICAgICAgICBzcGFjZVNoaXAuc2V0QnVsbGV0VHlwZShjb2xvclZhbHVlKTtcblxuICAgICAgICAgICAgcGlja3Vwcy5zcGxpY2UoX2k0LCAxKTtcbiAgICAgICAgICAgIF9pNCAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2k1ID0gMDsgX2k1IDwgZW5lbWllcy5sZW5ndGg7IF9pNSsrKSB7XG4gICAgICAgIGZvciAodmFyIF9qID0gMDsgX2ogPCBlbmVtaWVzW19pNV0uYnVsbGV0cy5sZW5ndGg7IF9qKyspIHtcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXG4gICAgICAgICAgICBpZiAoZW5lbWllc1tfaTVdLmJ1bGxldHNbX2pdKSBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW2VuZW1pZXNbX2k1XS5idWxsZXRzW19qXS5wb3NpdGlvbi54LCBlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLmRlY3JlYXNlSGVhbHRoKDIgKiBlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0uYmFzZVdpZHRoIC8gMTApO1xuICAgICAgICAgICAgICAgIGVuZW1pZXNbX2k1XS5idWxsZXRzLnNwbGljZShfaiwgMSk7XG5cbiAgICAgICAgICAgICAgICBfaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNwYWNlU2hpcC5Hb2RNb2RlKSB7XG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICB0ZXh0KCdHb2QgTW9kZScsIHdpZHRoIC0gODAsIGhlaWdodCAtIDMwKTtcbiAgICB9XG5cbiAgICBpZiAoZW5lbWllcy5sZW5ndGggPT09IDAgJiYgIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgaWYgKGN1cnJlbnRMZXZlbENvdW50IDw9IG1heExldmVsQ291bnQpIHtcbiAgICAgICAgICAgIHRleHQoJ0xvYWRpbmcgTGV2ZWwgJyArIGN1cnJlbnRMZXZlbENvdW50LCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0Q2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoaW5jcmVtZW50TGV2ZWwsIDMwMDApO1xuICAgICAgICAgICAgICAgIHRpbWVvdXRDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcbiAgICAgICAgICAgIHRleHQoJ0NvbmdyYXR1bGF0aW9ucyB5b3Ugd29uIHRoZSBnYW1lISEhJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIHZhciBfcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgIGlmIChfcmFuZG9tVmFsdWUgPCAwLjEpIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQpLCByYW5kb20oMCwgMTApKSk7XG5cbiAgICAgICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBidXR0b25EaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbmNyZW1lbnRMZXZlbCgpIHtcbiAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICBzd2l0Y2ggKGN1cnJlbnRMZXZlbENvdW50KSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oMTUwLCAxNzApKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oMTUwLCAxNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCAyMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA1MDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIDIwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudExldmVsQ291bnQgPD0gbWF4TGV2ZWxDb3VudCkge1xuICAgICAgICB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIGN1cnJlbnRMZXZlbENvdW50Kys7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XG4gICAgc3BhY2VTaGlwRGVzdHJveWVkID0gZmFsc2U7XG4gICAgZW5lbWllcyA9IFtdO1xuICAgIGV4cGxvc2lvbnMgPSBbXTtcbiAgICBzcGFjZVNoaXAucmVzZXQoKTtcblxuICAgIGN1cnJlbnRMZXZlbENvdW50ID0gMTtcbiAgICBtYXhMZXZlbENvdW50ID0gNztcbiAgICB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG5cbiAgICBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgc3BhY2VTaGlwLkdvZE1vZGUgPSBmYWxzZTtcbn0iXX0=
