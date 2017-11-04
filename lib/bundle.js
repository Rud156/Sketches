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

        this.color = colorValue !== undefined ? color("hsl(" + colorValue + ", 100%, 50%)") : 255;
        this.rotation = rotation;

        this.position = createVector(xPosition, yPosition);
        if (this.rotation === undefined) this.velocity = createVector(0, 45);else {
            var _rotation = 45 - this.rotation;
            this.velocity = createVector(-45 + _rotation, 45);
        }
        this.velocity.setMag(this.speed);
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
        this.velocity = createVector(0, height);

        this.speed = 2;
        this.velocity.setMag(this.speed);
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
            if (this.waitFrameCount === this.minFrameWaitCount) {
                var _bullets;

                (_bullets = this.bullets).push.apply(_bullets, _toConsumableArray(this.getBulletType()));
            }
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
            this.health = 100;
            this.GodMode = false;
            this.bulletColor = 0;
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
var maxLevelCount = 9;
var timeoutCalled = false;
var button = void 0;
var buttonDisplayed = false;

var gameStarted = false;

var explosionSound = void 0;
var backgroundSound = void 0;
var powerUpSound = void 0;

function preload() {
    explosionSound = new Howl({
        src: ['https://freesound.org/data/previews/386/386862_6891102-lq.mp3'],
        autoplay: false,
        loop: false,
        preload: true
    });

    backgroundSound = new Howl({
        src: ['https://freesound.org/data/previews/321/321002_5123851-lq.mp3'],
        autoplay: true,
        loop: true,
        preload: true,
        volume: 0.05
    });

    powerUpSound = new Howl({
        src: ['https://freesound.org/data/previews/344/344307_6199418-lq.mp3'],
        autoplay: false,
        loop: false,
        preload: true
    });
}

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
            explosionSound.play();
            spaceShipDestroyed = true;
        }

        for (var i = 0; i < enemies.length; i++) {
            explosions.push(new Explosion(enemies[i].position.x, enemies[i].position.y, enemies[i].baseWidth * 7 / 45));
            explosionSound.play();
            enemies.splice(i, 1);
            i -= 1;
        }

        textSize(27);
        noStroke();
        fill(255, 0, 0);
        text('You Are Dead', width / 2, height / 2);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Replay';
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
                    explosionSound.play();
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
            powerUpSound.play();

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

    if (enemies.length === 0 && !spaceShipDestroyed && gameStarted) {
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
            if (_randomValue < 0.1) {
                explosions.push(new Explosion(random(0, width), random(0, height), random(0, 10)));
                explosionSound.play();
            }

            if (!buttonDisplayed) {
                button.elt.style.display = 'block';
                button.elt.innerText = 'Replay';
                buttonDisplayed = true;
            }
        }
    }
    if (!gameStarted) {
        textStyle(BOLD);
        textSize(30);
        noStroke();
        fill(color('hsl(' + int(random(359)) + ', 100%, 50%)'));
        text('SPACE INVADERS', width / 2 + 10, height / 4);
        fill(255);
        text('ARROW KEYS to move and SPACE to fire', width / 2, height / 3);
        if (!buttonDisplayed) {
            button.elt.style.display = 'block';
            button.elt.innerText = 'Play Game';
            buttonDisplayed = true;
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
        case 8:
            for (i = 0; i < 20; i++) {
                enemies.push(new Enemy(random(0, width), -30, random(20, 170)));
            }
            break;
        case 9:
            for (i = 0; i < 20; i++) {
                enemies.push(new Enemy(random(0, width), -30, random(70, 120)));
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
    timeoutCalled = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';

    gameStarted = true;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwicGlja3Vwcy5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQYXJ0aWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQYXJ0aWNsZSh4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJ0aWNsZSk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDcwKSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYXJ0aWNsZSwgW3tcbiAgICAgICAga2V5OiBcImFwcGx5Rm9yY2VcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yVmFsdWUgPSBjb2xvcihcImhzbGEoXCIgKyB0aGlzLmNvbG9yTnVtYmVyICsgXCIsIDEwMCUsIDUwJSwgXCIgKyB0aGlzLmFscGhhICsgXCIpXCIpO1xuICAgICAgICAgICAgdmFyIG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG5cbiAgICAgICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xuICAgICAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xuICAgICAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJpc1Zpc2libGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzVmlzaWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYXJ0aWNsZTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCdWxsZXQoeFBvc2l0aW9uLCB5UG9zaXRpb24sIHNpemUsIGdvVXAsIGNvbG9yVmFsdWUsIHJvdGF0aW9uKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCdWxsZXQpO1xuXG4gICAgICAgIHRoaXMuZ29VcCA9IGdvVXA7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBnb1VwID8gLTEwIDogMTA7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gc2l6ZTtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gc2l6ZSAqIDI7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yVmFsdWUgIT09IHVuZGVmaW5lZCA/IGNvbG9yKFwiaHNsKFwiICsgY29sb3JWYWx1ZSArIFwiLCAxMDAlLCA1MCUpXCIpIDogMjU1O1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbik7XG4gICAgICAgIGlmICh0aGlzLnJvdGF0aW9uID09PSB1bmRlZmluZWQpIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgNDUpO2Vsc2Uge1xuICAgICAgICAgICAgdmFyIF9yb3RhdGlvbiA9IDQ1IC0gdGhpcy5yb3RhdGlvbjtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoLTQ1ICsgX3JvdGF0aW9uLCA0NSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEJ1bGxldCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICAgICAgcm90YXRlKHRoaXMucm90YXRpb24pO1xuICAgICAgICAgICAgcmVjdCgwLCAtdGhpcy5iYXNlSGVpZ2h0LCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdvVXApIHtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZSgtdGhpcy5iYXNlV2lkdGggLyAyLCAtdGhpcy5iYXNlSGVpZ2h0LCAwLCAtdGhpcy5iYXNlSGVpZ2h0ICogMiwgdGhpcy5iYXNlV2lkdGggLyAyLCAtdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCdWxsZXQ7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cblxudmFyIEV4cGxvc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFeHBsb3Npb24oc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXhwbG9zaW9uKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuXG4gICAgICAgIHZhciByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRXhwbG9zaW9uLCBbe1xuICAgICAgICBrZXk6IFwiZXhwbG9kZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXhwbG9kZSgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJleHBsb3Npb25Db21wbGV0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXhwbG9zaW9uQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEV4cGxvc2lvbjtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFBpY2t1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQaWNrdXAoeFBvc2l0aW9uLCB5UG9zaXRpb24sIGNvbG9yVmFsdWUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBpY2t1cCk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbik7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMjtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbMCwgMCwgMCwgMF07XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gMTU7XG5cbiAgICAgICAgdGhpcy5jb2xvclZhbHVlID0gY29sb3JWYWx1ZTtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yKFwiaHNsKFwiICsgY29sb3JWYWx1ZSArIFwiLCAxMDAlLCA1MCUpXCIpO1xuICAgICAgICB0aGlzLmFuZ2xlID0gMDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGlja3VwLCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICBwdXNoKCk7XG4gICAgICAgICAgICB0cmFuc2xhdGUoeCwgeSk7XG4gICAgICAgICAgICByb3RhdGUodGhpcy5hbmdsZSk7XG4gICAgICAgICAgICByZWN0KDAsIDAsIHRoaXMuYmFzZVdpZHRoLCB0aGlzLmJhc2VXaWR0aCk7XG4gICAgICAgICAgICBwb3AoKTtcblxuICAgICAgICAgICAgdGhpcy5hbmdsZSA9IGZyYW1lUmF0ZSgpID4gMCA/IHRoaXMuYW5nbGUgKyAyICogKDYwIC8gZnJhbWVSYXRlKCkpIDogdGhpcy5hbmdsZSArIDI7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gdGhpcy5hbmdsZSA+IDM2MCA/IDAgOiB0aGlzLmFuZ2xlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzT3V0T2ZTY3JlZW5cIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ID4gaGVpZ2h0ICsgdGhpcy5iYXNlV2lkdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJwb2ludElzSW5zaWRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQaWNrdXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gNzA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMubWluRnJhbWVXYWl0Q291bnQgPSA3O1xuICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHdpZHRoIC8gMiwgaGVpZ2h0IC0gdGhpcy5iYXNlSGVpZ2h0IC0gMTApO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAxNTtcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XG5cbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5zcGFjZVNoaXBDb2xvciA9IGNvbG9yKCdoc2woMTc1LCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgdGhpcy5Hb2RNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSAwO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICB2YXIgYm9keUNvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLnNwYWNlU2hpcENvbG9yLCB0aGlzLmhlYWx0aCAvIDEwMCk7XG4gICAgICAgICAgICBmaWxsKGJvZHlDb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICgha2V5SXNEb3duKDMyKSkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLndhaXRGcmFtZUNvdW50IDwgMCkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnkgPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPiB3aWR0aCArIHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0QnVsbGV0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRCdWxsZXRUeXBlKGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSBjb2xvclZhbHVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRCdWxsZXRUeXBlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEJ1bGxldFR5cGUoKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuYnVsbGV0Q29sb3IpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvcildO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpLCBuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODA7IGkgKz0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2gobmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvciwgLTQwICsgaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy53YWl0RnJhbWVDb3VudCA9PT0gdGhpcy5taW5GcmFtZVdhaXRDb3VudCkge1xuICAgICAgICAgICAgICAgIHZhciBfYnVsbGV0cztcblxuICAgICAgICAgICAgICAgIChfYnVsbGV0cyA9IHRoaXMuYnVsbGV0cykucHVzaC5hcHBseShfYnVsbGV0cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZ2V0QnVsbGV0VHlwZSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50IC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlY3JlYXNlSGVhbHRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlY3JlYXNlSGVhbHRoKGFtb3VudCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLkdvZE1vZGUpIHRoaXMuaGVhbHRoIC09IGFtb3VudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWN0aXZhdGVHb2RNb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFjdGl2YXRlR29kTW9kZSgpIHtcbiAgICAgICAgICAgIHRoaXMuR29kTW9kZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRGVzdHJveWVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRGVzdHJveWVkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWx0aCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzZXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMud2FpdEZyYW1lQ291bnQgPSB0aGlzLm1pbkZyYW1lV2FpdENvdW50O1xuICAgICAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XG4gICAgICAgICAgICB0aGlzLkdvZE1vZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSAwO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XG5cbnZhciBFbmVteSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbmVteSh4UG9zaXRpb24sIHlQb3NpdGlvbiwgZW5lbXlCYXNlV2lkdGgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVuZW15KTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLm1heFNwZWVkID0gNTtcbiAgICAgICAgLy8gQWJpbGl0eSB0byB0dXJuXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gZW5lbXlCYXNlV2lkdGg7XG4gICAgICAgIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVySGVpZ2h0ID0gdGhpcy5iYXNlV2lkdGggKiAzIC8gMjA7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLm1hZ25pdHVkZUxpbWl0ID0gNTA7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbnN0QnVsbGV0VGltZSA9IDc7XG4gICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMCAqIGVuZW15QmFzZVdpZHRoIC8gNDU7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVuZW15LCBbe1xuICAgICAgICBrZXk6ICdzaG93JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgICAgICB2YXIgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcbiAgICAgICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1ICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tBcnJpdmFsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrQXJyaXZhbCgpIHtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkID0gcDUuVmVjdG9yLnN1Yih0aGlzLnBvc2l0aW9uVG9SZWFjaCwgdGhpcy5wb3NpdGlvbik7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZE1hZyA9IGRlc2lyZWQubWFnKCk7XG4gICAgICAgICAgICBpZiAoZGVzaXJlZE1hZyA8IHRoaXMubWFnbml0dWRlTGltaXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWFwcGVkU3BlZWQgPSBtYXAoZGVzaXJlZE1hZywgMCwgNTAsIDAsIHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKG1hcHBlZFNwZWVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcodGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdGVlcmluZyA9IHA1LlZlY3Rvci5zdWIoZGVzaXJlZCwgdGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICBzdGVlcmluZy5saW1pdCh0aGlzLm1heEZvcmNlKTtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChzdGVlcmluZyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QnVsbGV0VGltZSA9PT0gdGhpcy5jb25zdEJ1bGxldFRpbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQodGhpcy5wcmV2WCwgdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogNSwgdGhpcy5iYXNlV2lkdGggLyA1LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja1BsYXllckRpc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGxheWVyRGlzdGFuY2UocGxheWVyUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIDwgMCkgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgICAgICB2YXIgeFBvc2l0aW9uRGlzdGFuY2UgPSBhYnMocGxheWVyUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCk7XG4gICAgICAgICAgICBpZiAoeFBvc2l0aW9uRGlzdGFuY2UgPCAyMDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob290QnVsbGV0cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndGFrZURhbWFnZUFuZENoZWNrRGVhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSAyMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDApIHJldHVybiB0cnVlO2Vsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5saW1pdCh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gY29udGludW91cyBhY2NlbGVyYXRpb24gaXRzIG9ubHkgaW5zdGFudGFuZW91c1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmVsb2NpdHkubWFnKCkgPD0gMSkgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpKTtcblxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0ucG9zaXRpb24ueSA+IHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0ICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW5lbXk7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BpY2t1cHMuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3BhY2Utc2hpcC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9lbmVteS5qc1wiIC8+XG5cbnZhciBwaWNrdXBDb2xvcnMgPSBbMCwgMTIwLCAxNzVdO1xuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xudmFyIHBpY2t1cHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgZXhwbG9zaW9ucyA9IFtdO1xuXG52YXIgY3VycmVudExldmVsQ291bnQgPSAxO1xudmFyIG1heExldmVsQ291bnQgPSA5O1xudmFyIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcbnZhciBidXR0b24gPSB2b2lkIDA7XG52YXIgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG5cbnZhciBnYW1lU3RhcnRlZCA9IGZhbHNlO1xuXG52YXIgZXhwbG9zaW9uU291bmQgPSB2b2lkIDA7XG52YXIgYmFja2dyb3VuZFNvdW5kID0gdm9pZCAwO1xudmFyIHBvd2VyVXBTb3VuZCA9IHZvaWQgMDtcblxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcbiAgICBleHBsb3Npb25Tb3VuZCA9IG5ldyBIb3dsKHtcbiAgICAgICAgc3JjOiBbJ2h0dHBzOi8vZnJlZXNvdW5kLm9yZy9kYXRhL3ByZXZpZXdzLzM4Ni8zODY4NjJfNjg5MTEwMi1scS5tcDMnXSxcbiAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgcHJlbG9hZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgYmFja2dyb3VuZFNvdW5kID0gbmV3IEhvd2woe1xuICAgICAgICBzcmM6IFsnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzIxLzMyMTAwMl81MTIzODUxLWxxLm1wMyddLFxuICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgcHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgdm9sdW1lOiAwLjA1XG4gICAgfSk7XG5cbiAgICBwb3dlclVwU291bmQgPSBuZXcgSG93bCh7XG4gICAgICAgIHNyYzogWydodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8zNDQvMzQ0MzA3XzYxOTk0MTgtbHEubXAzJ10sXG4gICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgbG9vcDogZmFsc2UsXG4gICAgICAgIHByZWxvYWQ6IHRydWVcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUmVwbGF5IScpO1xuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMiArIDMwKTtcbiAgICBidXR0b24uZWx0LmNsYXNzTmFtZSA9ICdwdWxzZSc7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGJ1dHRvbi5tb3VzZVByZXNzZWQocmVzZXRHYW1lKTtcblxuICAgIHNwYWNlU2hpcCA9IG5ldyBTcGFjZVNoaXAoKTtcblxuICAgIHRleHRBbGlnbihDRU5URVIpO1xuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgYW5nbGVNb2RlKERFR1JFRVMpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG5cbiAgICBpZiAoa2V5SXNEb3duKDcxKSAmJiBrZXlJc0Rvd24oNzkpICYmIGtleUlzRG93big2OCkpIHNwYWNlU2hpcC5hY3RpdmF0ZUdvZE1vZGUoKTtcblxuICAgIGlmIChzcGFjZVNoaXAuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgICBpZiAoIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oc3BhY2VTaGlwLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5wb3NpdGlvbi55LCBzcGFjZVNoaXAuYmFzZVdpZHRoKSk7XG4gICAgICAgICAgICBleHBsb3Npb25Tb3VuZC5wbGF5KCk7XG4gICAgICAgICAgICBzcGFjZVNoaXBEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihlbmVtaWVzW2ldLnBvc2l0aW9uLngsIGVuZW1pZXNbaV0ucG9zaXRpb24ueSwgZW5lbWllc1tpXS5iYXNlV2lkdGggKiA3IC8gNDUpKTtcbiAgICAgICAgICAgIGV4cGxvc2lvblNvdW5kLnBsYXkoKTtcbiAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIHRleHQoJ1lvdSBBcmUgRGVhZCcsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUmVwbGF5JztcbiAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZVNoaXAuc2hvdygpO1xuICAgICAgICBzcGFjZVNoaXAudXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSAmJiBrZXlJc0Rvd24oUklHSFRfQVJST1cpKSB7LyogRG8gbm90aGluZyAqL30gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleUlzRG93bihSSUdIVF9BUlJPVykpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAubW92ZVNoaXAoJ1JJR0hUJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5SXNEb3duKDMyKSkge1xuICAgICAgICAgICAgc3BhY2VTaGlwLnNob290QnVsbGV0cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICBlbGVtZW50LmNoZWNrQXJyaXZhbCgpO1xuICAgICAgICBlbGVtZW50LnVwZGF0ZSgpO1xuICAgICAgICBlbGVtZW50LmNoZWNrUGxheWVyRGlzdGFuY2Uoc3BhY2VTaGlwLnBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBleHBsb3Npb25zLmxlbmd0aDsgX2krKykge1xuICAgICAgICBleHBsb3Npb25zW19pXS5zaG93KCk7XG4gICAgICAgIGV4cGxvc2lvbnNbX2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChleHBsb3Npb25zW19pXS5leHBsb3Npb25Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnNwbGljZShfaSwgMSk7XG4gICAgICAgICAgICBfaSAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgcGlja3Vwcy5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIHBpY2t1cHNbX2kyXS5zaG93KCk7XG4gICAgICAgIHBpY2t1cHNbX2kyXS51cGRhdGUoKTtcblxuICAgICAgICBpZiAocGlja3Vwc1tfaTJdLmlzT3V0T2ZTY3JlZW4oKSkge1xuICAgICAgICAgICAgcGlja3Vwcy5zcGxpY2UoX2kyLCAxKTtcbiAgICAgICAgICAgIF9pMiAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgc3BhY2VTaGlwLmJ1bGxldHMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVuZW1pZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXG4gICAgICAgICAgICBpZiAoc3BhY2VTaGlwLmJ1bGxldHNbX2kzXSkgaWYgKGVuZW1pZXNbal0ucG9pbnRJc0luc2lkZShbc3BhY2VTaGlwLmJ1bGxldHNbX2kzXS5wb3NpdGlvbi54LCBzcGFjZVNoaXAuYnVsbGV0c1tfaTNdLnBvc2l0aW9uLnldKSkge1xuICAgICAgICAgICAgICAgIHZhciBlbmVteURlYWQgPSBlbmVtaWVzW2pdLnRha2VEYW1hZ2VBbmRDaGVja0RlYXRoKCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZW15RGVhZCkge1xuICAgICAgICAgICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggKiA3IC8gNDUpKTtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9zaW9uU291bmQucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllc1tqXS5iYXNlV2lkdGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkoZW5lbWllc1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2pdLnBvc2l0aW9uLnksIGVuZW1pZXNbal0uYmFzZVdpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaWNrdXBzLnB1c2gobmV3IFBpY2t1cChlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgcGlja3VwQ29sb3JzW2Zsb29yKHJhbmRvbSgpICogcGlja3VwQ29sb3JzLmxlbmd0aCldKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAuYnVsbGV0cy5zcGxpY2UoX2kzLCAxKTtcbiAgICAgICAgICAgICAgICBfaTMgPSBfaTMgPT09IDAgPyAwIDogX2kzIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pNCA9IDA7IF9pNCA8IHBpY2t1cHMubGVuZ3RoOyBfaTQrKykge1xuICAgICAgICBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW3BpY2t1cHNbX2k0XS5wb3NpdGlvbi54LCBwaWNrdXBzW19pNF0ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICB2YXIgY29sb3JWYWx1ZSA9IHBpY2t1cHNbX2k0XS5jb2xvclZhbHVlO1xuICAgICAgICAgICAgc3BhY2VTaGlwLnNldEJ1bGxldFR5cGUoY29sb3JWYWx1ZSk7XG4gICAgICAgICAgICBwb3dlclVwU291bmQucGxheSgpO1xuXG4gICAgICAgICAgICBwaWNrdXBzLnNwbGljZShfaTQsIDEpO1xuICAgICAgICAgICAgX2k0IC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTUgPSAwOyBfaTUgPCBlbmVtaWVzLmxlbmd0aDsgX2k1KyspIHtcbiAgICAgICAgZm9yICh2YXIgX2ogPSAwOyBfaiA8IGVuZW1pZXNbX2k1XS5idWxsZXRzLmxlbmd0aDsgX2orKykge1xuICAgICAgICAgICAgLy8gRml4TWU6IENoZWNrIGJ1bGxldCB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmIChlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0pIGlmIChzcGFjZVNoaXAucG9pbnRJc0luc2lkZShbZW5lbWllc1tfaTVdLmJ1bGxldHNbX2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbX2k1XS5idWxsZXRzW19qXS5wb3NpdGlvbi55XSkpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAuZGVjcmVhc2VIZWFsdGgoMiAqIGVuZW1pZXNbX2k1XS5idWxsZXRzW19qXS5iYXNlV2lkdGggLyAxMCk7XG4gICAgICAgICAgICAgICAgZW5lbWllc1tfaTVdLmJ1bGxldHMuc3BsaWNlKF9qLCAxKTtcblxuICAgICAgICAgICAgICAgIF9qIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3BhY2VTaGlwLkdvZE1vZGUpIHtcbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIHRleHQoJ0dvZCBNb2RlJywgd2lkdGggLSA4MCwgaGVpZ2h0IC0gMzApO1xuICAgIH1cblxuICAgIGlmIChlbmVtaWVzLmxlbmd0aCA9PT0gMCAmJiAhc3BhY2VTaGlwRGVzdHJveWVkICYmIGdhbWVTdGFydGVkKSB7XG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICBpZiAoY3VycmVudExldmVsQ291bnQgPD0gbWF4TGV2ZWxDb3VudCkge1xuICAgICAgICAgICAgdGV4dCgnTG9hZGluZyBMZXZlbCAnICsgY3VycmVudExldmVsQ291bnQsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICBpZiAoIXRpbWVvdXRDYWxsZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChpbmNyZW1lbnRMZXZlbCwgMzAwMCk7XG4gICAgICAgICAgICAgICAgdGltZW91dENhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xuICAgICAgICAgICAgdGV4dCgnQ29uZ3JhdHVsYXRpb25zIHlvdSB3b24gdGhlIGdhbWUhISEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgdmFyIF9yYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgaWYgKF9yYW5kb21WYWx1ZSA8IDAuMSkge1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQpLCByYW5kb20oMCwgMTApKSk7XG4gICAgICAgICAgICAgICAgZXhwbG9zaW9uU291bmQucGxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJ1dHRvbkRpc3BsYXllZCkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUmVwbGF5JztcbiAgICAgICAgICAgICAgICBidXR0b25EaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghZ2FtZVN0YXJ0ZWQpIHtcbiAgICAgICAgdGV4dFN0eWxlKEJPTEQpO1xuICAgICAgICB0ZXh0U2l6ZSgzMCk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoY29sb3IoJ2hzbCgnICsgaW50KHJhbmRvbSgzNTkpKSArICcsIDEwMCUsIDUwJSknKSk7XG4gICAgICAgIHRleHQoJ1NQQUNFIElOVkFERVJTJywgd2lkdGggLyAyICsgMTAsIGhlaWdodCAvIDQpO1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIHRleHQoJ0FSUk9XIEtFWVMgdG8gbW92ZSBhbmQgU1BBQ0UgdG8gZmlyZScsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMyk7XG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUGxheSBHYW1lJztcbiAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluY3JlbWVudExldmVsKCkge1xuICAgIHZhciBpID0gdm9pZCAwO1xuICAgIHN3aXRjaCAoY3VycmVudExldmVsQ291bnQpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSgxNTAsIDE3MCkpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSgxNTAsIDE3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIDIwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDUwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgMjApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oMjAsIDE3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNzAsIDEyMCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50TGV2ZWxDb3VudCA8PSBtYXhMZXZlbENvdW50KSB7XG4gICAgICAgIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudExldmVsQ291bnQrKztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0R2FtZSgpIHtcbiAgICBzcGFjZVNoaXBEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICBlbmVtaWVzID0gW107XG4gICAgZXhwbG9zaW9ucyA9IFtdO1xuICAgIHNwYWNlU2hpcC5yZXNldCgpO1xuXG4gICAgY3VycmVudExldmVsQ291bnQgPSAxO1xuICAgIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcblxuICAgIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIGdhbWVTdGFydGVkID0gdHJ1ZTtcbn0iXX0=
