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
var normalGameMode = true;

var explosionSound = void 0;
var backgroundSound = void 0;

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
            if (_randomValue < 0.1) {
                explosions.push(new Explosion(random(0, width), random(0, height), random(0, 10)));
                explosionSound.play();
            }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwicGlja3Vwcy5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUGFydGljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFydGljbGUoeCwgeSwgY29sb3JOdW1iZXIsIG1heFN0cm9rZVdlaWdodCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFydGljbGUpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCA3MCkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFydGljbGUsIFt7XG4gICAgICAgIGtleTogXCJhcHBseUZvcmNlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhcHBseUZvcmNlKGZvcmNlKSB7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIHZhciBjb2xvclZhbHVlID0gY29sb3IoXCJoc2xhKFwiICsgdGhpcy5jb2xvck51bWJlciArIFwiLCAxMDAlLCA1MCUsIFwiICsgdGhpcy5hbHBoYSArIFwiKVwiKTtcbiAgICAgICAgICAgIHZhciBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xuXG4gICAgICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcbiAgICAgICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcbiAgICAgICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcblxuICAgICAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiaXNWaXNpYmxlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1Zpc2libGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFydGljbGU7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnVsbGV0KHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBzaXplLCBnb1VwLCBjb2xvclZhbHVlLCByb3RhdGlvbikge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQnVsbGV0KTtcblxuICAgICAgICB0aGlzLmdvVXAgPSBnb1VwO1xuICAgICAgICB0aGlzLnNwZWVkID0gZ29VcCA/IC0xMCA6IDEwO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IHNpemU7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHNpemUgKiAyO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvclZhbHVlICE9PSB1bmRlZmluZWQgPyBjb2xvcihcImhzbChcIiArIGNvbG9yVmFsdWUgKyBcIiwgMTAwJSwgNTAlKVwiKSA6IDI1NTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCdWxsZXQsIFt7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgICAgIHRyYW5zbGF0ZSh4LCB5KTtcbiAgICAgICAgICAgIHJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcbiAgICAgICAgICAgIHJlY3QoMCwgLXRoaXMuYmFzZUhlaWdodCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICBpZiAodGhpcy5nb1VwKSB7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGUoLXRoaXMuYmFzZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUhlaWdodCwgMCwgLXRoaXMuYmFzZUhlaWdodCAqIDIsIHRoaXMuYmFzZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3AoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucm90YXRpb24gPT09IHVuZGVmaW5lZCkgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCA0NSk7ZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gNDUgLSB0aGlzLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoLTQ1ICsgcm90YXRpb24sIDQ1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQnVsbGV0O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XG5cbnZhciBFeHBsb3Npb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXhwbG9zaW9uKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV4cGxvc2lvbik7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcblxuICAgICAgICB2YXIgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEV4cGxvc2lvbiwgW3tcbiAgICAgICAga2V5OiBcImV4cGxvZGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvZGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbiAocGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiZXhwbG9zaW9uQ29tcGxldGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvc2lvbkNvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFeHBsb3Npb247XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQaWNrdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGlja3VwKHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBjb2xvclZhbHVlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQaWNrdXApO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAyO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gWzAsIDAsIDAsIDBdO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDE1O1xuXG4gICAgICAgIHRoaXMuY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWU7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcihcImhzbChcIiArIGNvbG9yVmFsdWUgKyBcIiwgMTAwJSwgNTAlKVwiKTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IDA7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBpY2t1cCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICAgICAgcm90YXRlKHRoaXMuYW5nbGUpO1xuICAgICAgICAgICAgcmVjdCgwLCAwLCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlV2lkdGgpO1xuICAgICAgICAgICAgcG9wKCk7XG5cbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSBmcmFtZVJhdGUoKSA+IDAgPyB0aGlzLmFuZ2xlICsgMiAqICg2MCAvIGZyYW1lUmF0ZSgpKSA6IHRoaXMuYW5nbGUgKyAyO1xuICAgICAgICAgICAgdGhpcy5hbmdsZSA9IHRoaXMuYW5nbGUgPiAzNjAgPyAwIDogdGhpcy5hbmdsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCBoZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzT3V0T2ZTY3JlZW5cIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ID4gaGVpZ2h0ICsgdGhpcy5iYXNlV2lkdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJwb2ludElzSW5zaWRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQaWNrdXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gNzA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMubWluRnJhbWVXYWl0Q291bnQgPSA3O1xuICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHdpZHRoIC8gMiwgaGVpZ2h0IC0gdGhpcy5iYXNlSGVpZ2h0IC0gMTApO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAxNTtcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XG5cbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5zcGFjZVNoaXBDb2xvciA9IGNvbG9yKCdoc2woMTc1LCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgdGhpcy5Hb2RNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSAwO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICB2YXIgYm9keUNvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLnNwYWNlU2hpcENvbG9yLCB0aGlzLmhlYWx0aCAvIDEwMCk7XG4gICAgICAgICAgICBmaWxsKGJvZHlDb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICgha2V5SXNEb3duKDMyKSkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLndhaXRGcmFtZUNvdW50IDwgMCkgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnkgPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHwgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPiB3aWR0aCArIHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0QnVsbGV0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRCdWxsZXRUeXBlKGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSBjb2xvclZhbHVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRCdWxsZXRUeXBlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEJ1bGxldFR5cGUoKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuYnVsbGV0Q29sb3IpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvcildO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpLCBuZXcgQnVsbGV0KHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2hvb3RlcldpZHRoLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODA7IGkgKz0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2gobmV3IEJ1bGxldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSwgdGhpcy5iYXNlV2lkdGggLyAxMCwgdHJ1ZSwgdGhpcy5idWxsZXRDb2xvciwgLTQwICsgaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy53YWl0RnJhbWVDb3VudCA9PT0gdGhpcy5taW5GcmFtZVdhaXRDb3VudCkge1xuICAgICAgICAgICAgICAgIHZhciBfYnVsbGV0cztcblxuICAgICAgICAgICAgICAgIChfYnVsbGV0cyA9IHRoaXMuYnVsbGV0cykucHVzaC5hcHBseShfYnVsbGV0cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZ2V0QnVsbGV0VHlwZSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50IC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlY3JlYXNlSGVhbHRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlY3JlYXNlSGVhbHRoKGFtb3VudCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLkdvZE1vZGUpIHRoaXMuaGVhbHRoIC09IGFtb3VudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWN0aXZhdGVHb2RNb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFjdGl2YXRlR29kTW9kZSgpIHtcbiAgICAgICAgICAgIHRoaXMuR29kTW9kZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRGVzdHJveWVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRGVzdHJveWVkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWx0aCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzZXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMud2FpdEZyYW1lQ291bnQgPSB0aGlzLm1pbkZyYW1lV2FpdENvdW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XG5cbnZhciBFbmVteSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbmVteSh4UG9zaXRpb24sIHlQb3NpdGlvbiwgZW5lbXlCYXNlV2lkdGgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVuZW15KTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLm1heFNwZWVkID0gNTtcbiAgICAgICAgLy8gQWJpbGl0eSB0byB0dXJuXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gZW5lbXlCYXNlV2lkdGg7XG4gICAgICAgIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVySGVpZ2h0ID0gdGhpcy5iYXNlV2lkdGggKiAzIC8gMjA7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLm1hZ25pdHVkZUxpbWl0ID0gNTA7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbnN0QnVsbGV0VGltZSA9IDc7XG4gICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMCAqIGVuZW15QmFzZVdpZHRoIC8gNDU7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVuZW15LCBbe1xuICAgICAgICBrZXk6ICdzaG93JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgICAgICB2YXIgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcbiAgICAgICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1ICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tBcnJpdmFsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrQXJyaXZhbCgpIHtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkID0gcDUuVmVjdG9yLnN1Yih0aGlzLnBvc2l0aW9uVG9SZWFjaCwgdGhpcy5wb3NpdGlvbik7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZE1hZyA9IGRlc2lyZWQubWFnKCk7XG4gICAgICAgICAgICBpZiAoZGVzaXJlZE1hZyA8IHRoaXMubWFnbml0dWRlTGltaXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWFwcGVkU3BlZWQgPSBtYXAoZGVzaXJlZE1hZywgMCwgNTAsIDAsIHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKG1hcHBlZFNwZWVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcodGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdGVlcmluZyA9IHA1LlZlY3Rvci5zdWIoZGVzaXJlZCwgdGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICBzdGVlcmluZy5saW1pdCh0aGlzLm1heEZvcmNlKTtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChzdGVlcmluZyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QnVsbGV0VGltZSA9PT0gdGhpcy5jb25zdEJ1bGxldFRpbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQodGhpcy5wcmV2WCwgdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogNSwgdGhpcy5iYXNlV2lkdGggLyA1LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja1BsYXllckRpc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGxheWVyRGlzdGFuY2UocGxheWVyUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIDwgMCkgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgICAgICB2YXIgeFBvc2l0aW9uRGlzdGFuY2UgPSBhYnMocGxheWVyUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCk7XG4gICAgICAgICAgICBpZiAoeFBvc2l0aW9uRGlzdGFuY2UgPCAyMDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob290QnVsbGV0cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndGFrZURhbWFnZUFuZENoZWNrRGVhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSAyMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDApIHJldHVybiB0cnVlO2Vsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5saW1pdCh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gY29udGludW91cyBhY2NlbGVyYXRpb24gaXRzIG9ubHkgaW5zdGFudGFuZW91c1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmVsb2NpdHkubWFnKCkgPD0gMSkgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpKTtcblxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0ucG9zaXRpb24ueSA+IHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0ICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW5lbXk7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BpY2t1cHMuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3BhY2Utc2hpcC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9lbmVteS5qc1wiIC8+XG5cbnZhciBwaWNrdXBDb2xvcnMgPSBbMCwgMTIwLCAxNzVdO1xuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xudmFyIHBpY2t1cHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgZXhwbG9zaW9ucyA9IFtdO1xuXG52YXIgY3VycmVudExldmVsQ291bnQgPSAxO1xudmFyIG1heExldmVsQ291bnQgPSA3O1xudmFyIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcbnZhciBidXR0b24gPSB2b2lkIDA7XG52YXIgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG52YXIgbm9ybWFsR2FtZU1vZGUgPSB0cnVlO1xuXG52YXIgZXhwbG9zaW9uU291bmQgPSB2b2lkIDA7XG52YXIgYmFja2dyb3VuZFNvdW5kID0gdm9pZCAwO1xuXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xuICAgIGV4cGxvc2lvblNvdW5kID0gbmV3IEhvd2woe1xuICAgICAgICBzcmM6IFsnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzg2LzM4Njg2Ml82ODkxMTAyLWxxLm1wMyddLFxuICAgICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgICBwcmVsb2FkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBiYWNrZ3JvdW5kU291bmQgPSBuZXcgSG93bCh7XG4gICAgICAgIHNyYzogWydodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8zMjEvMzIxMDAyXzUxMjM4NTEtbHEubXAzJ10sXG4gICAgICAgIGF1dG9wbGF5OiB0cnVlLFxuICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICBwcmVsb2FkOiB0cnVlLFxuICAgICAgICB2b2x1bWU6IDAuMDVcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUmVwbGF5IScpO1xuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMiArIDMwKTtcbiAgICBidXR0b24uZWx0LmNsYXNzTmFtZSA9ICdwdWxzZSc7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGJ1dHRvbi5tb3VzZVByZXNzZWQocmVzZXRHYW1lKTtcblxuICAgIHNwYWNlU2hpcCA9IG5ldyBTcGFjZVNoaXAoKTtcblxuICAgIHRleHRBbGlnbihDRU5URVIpO1xuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgYW5nbGVNb2RlKERFR1JFRVMpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG5cbiAgICBpZiAoa2V5SXNEb3duKDcxKSAmJiBrZXlJc0Rvd24oNzkpICYmIGtleUlzRG93big2OCkpIHNwYWNlU2hpcC5hY3RpdmF0ZUdvZE1vZGUoKTtcblxuICAgIGlmIChzcGFjZVNoaXAuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgICBpZiAoIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oc3BhY2VTaGlwLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5wb3NpdGlvbi55LCBzcGFjZVNoaXAuYmFzZVdpZHRoKSk7XG4gICAgICAgICAgICBleHBsb3Npb25Tb3VuZC5wbGF5KCk7XG4gICAgICAgICAgICBzcGFjZVNoaXBEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihlbmVtaWVzW2ldLnBvc2l0aW9uLngsIGVuZW1pZXNbaV0ucG9zaXRpb24ueSwgZW5lbWllc1tpXS5iYXNlV2lkdGggKiA3IC8gNDUpKTtcbiAgICAgICAgICAgIGV4cGxvc2lvblNvdW5kLnBsYXkoKTtcbiAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIHRleHQoJ1lvdSBBcmUgRGVhZCcsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlU2hpcC5zaG93KCk7XG4gICAgICAgIHNwYWNlU2hpcC51cGRhdGUoKTtcblxuICAgICAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpICYmIGtleUlzRG93bihSSUdIVF9BUlJPVykpIHsvKiBEbyBub3RoaW5nICovfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAubW92ZVNoaXAoJ0xFRlQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnUklHSFQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXlJc0Rvd24oMzIpKSB7XG4gICAgICAgICAgICBzcGFjZVNoaXAuc2hvb3RCdWxsZXRzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tBcnJpdmFsKCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tQbGF5ZXJEaXN0YW5jZShzcGFjZVNoaXAucG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGV4cGxvc2lvbnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGV4cGxvc2lvbnNbX2ldLnNob3coKTtcbiAgICAgICAgZXhwbG9zaW9uc1tfaV0udXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKGV4cGxvc2lvbnNbX2ldLmV4cGxvc2lvbkNvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKF9pLCAxKTtcbiAgICAgICAgICAgIF9pIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBwaWNrdXBzLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgcGlja3Vwc1tfaTJdLnNob3coKTtcbiAgICAgICAgcGlja3Vwc1tfaTJdLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChwaWNrdXBzW19pMl0uaXNPdXRPZlNjcmVlbigpKSB7XG4gICAgICAgICAgICBwaWNrdXBzLnNwbGljZShfaTIsIDEpO1xuICAgICAgICAgICAgX2kyIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBzcGFjZVNoaXAuYnVsbGV0cy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5lbWllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gRml4TWU6IENoZWNrIGJ1bGxldCB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmIChzcGFjZVNoaXAuYnVsbGV0c1tfaTNdKSBpZiAoZW5lbWllc1tqXS5wb2ludElzSW5zaWRlKFtzcGFjZVNoaXAuYnVsbGV0c1tfaTNdLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5idWxsZXRzW19pM10ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuZW15RGVhZCA9IGVuZW1pZXNbal0udGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5lbXlEZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAqIDcgLyA0NSkpO1xuICAgICAgICAgICAgICAgICAgICBleHBsb3Npb25Tb3VuZC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLmJhc2VXaWR0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAvIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpY2t1cHMucHVzaChuZXcgUGlja3VwKGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBwaWNrdXBDb2xvcnNbZmxvb3IocmFuZG9tKCkgKiBwaWNrdXBDb2xvcnMubGVuZ3RoKV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5idWxsZXRzLnNwbGljZShfaTMsIDEpO1xuICAgICAgICAgICAgICAgIF9pMyA9IF9pMyA9PT0gMCA/IDAgOiBfaTMgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2k0ID0gMDsgX2k0IDwgcGlja3Vwcy5sZW5ndGg7IF9pNCsrKSB7XG4gICAgICAgIGlmIChzcGFjZVNoaXAucG9pbnRJc0luc2lkZShbcGlja3Vwc1tfaTRdLnBvc2l0aW9uLngsIHBpY2t1cHNbX2k0XS5wb3NpdGlvbi55XSkpIHtcbiAgICAgICAgICAgIHZhciBjb2xvclZhbHVlID0gcGlja3Vwc1tfaTRdLmNvbG9yVmFsdWU7XG4gICAgICAgICAgICBzcGFjZVNoaXAuc2V0QnVsbGV0VHlwZShjb2xvclZhbHVlKTtcblxuICAgICAgICAgICAgcGlja3Vwcy5zcGxpY2UoX2k0LCAxKTtcbiAgICAgICAgICAgIF9pNCAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2k1ID0gMDsgX2k1IDwgZW5lbWllcy5sZW5ndGg7IF9pNSsrKSB7XG4gICAgICAgIGZvciAodmFyIF9qID0gMDsgX2ogPCBlbmVtaWVzW19pNV0uYnVsbGV0cy5sZW5ndGg7IF9qKyspIHtcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXG4gICAgICAgICAgICBpZiAoZW5lbWllc1tfaTVdLmJ1bGxldHNbX2pdKSBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW2VuZW1pZXNbX2k1XS5idWxsZXRzW19qXS5wb3NpdGlvbi54LCBlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLmRlY3JlYXNlSGVhbHRoKDIgKiBlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0uYmFzZVdpZHRoIC8gMTApO1xuICAgICAgICAgICAgICAgIGVuZW1pZXNbX2k1XS5idWxsZXRzLnNwbGljZShfaiwgMSk7XG5cbiAgICAgICAgICAgICAgICBfaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNwYWNlU2hpcC5Hb2RNb2RlKSB7XG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICB0ZXh0KCdHb2QgTW9kZScsIHdpZHRoIC0gODAsIGhlaWdodCAtIDMwKTtcbiAgICB9XG5cbiAgICBpZiAoZW5lbWllcy5sZW5ndGggPT09IDAgJiYgIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgaWYgKGN1cnJlbnRMZXZlbENvdW50IDw9IG1heExldmVsQ291bnQpIHtcbiAgICAgICAgICAgIHRleHQoJ0xvYWRpbmcgTGV2ZWwgJyArIGN1cnJlbnRMZXZlbENvdW50LCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0Q2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoaW5jcmVtZW50TGV2ZWwsIDMwMDApO1xuICAgICAgICAgICAgICAgIHRpbWVvdXRDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcbiAgICAgICAgICAgIHRleHQoJ0NvbmdyYXR1bGF0aW9ucyB5b3Ugd29uIHRoZSBnYW1lISEhJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIHZhciBfcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgIGlmIChfcmFuZG9tVmFsdWUgPCAwLjEpIHtcbiAgICAgICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0KSwgcmFuZG9tKDAsIDEwKSkpO1xuICAgICAgICAgICAgICAgIGV4cGxvc2lvblNvdW5kLnBsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluY3JlbWVudExldmVsKCkge1xuICAgIHZhciBpID0gdm9pZCAwO1xuICAgIHN3aXRjaCAoY3VycmVudExldmVsQ291bnQpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSgxNTAsIDE3MCkpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSgxNTAsIDE3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIDIwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDUwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgMjApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50TGV2ZWxDb3VudCA8PSBtYXhMZXZlbENvdW50KSB7XG4gICAgICAgIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudExldmVsQ291bnQrKztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0R2FtZSgpIHtcbiAgICBzcGFjZVNoaXBEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICBlbmVtaWVzID0gW107XG4gICAgZXhwbG9zaW9ucyA9IFtdO1xuICAgIHNwYWNlU2hpcC5yZXNldCgpO1xuXG4gICAgY3VycmVudExldmVsQ291bnQgPSAxO1xuICAgIG1heExldmVsQ291bnQgPSA3O1xuICAgIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcblxuICAgIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBzcGFjZVNoaXAuR29kTW9kZSA9IGZhbHNlO1xufSJdfQ==
