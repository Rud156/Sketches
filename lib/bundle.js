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
    function Bullet(xPosition, yPosition, size, goUp, colorValue) {
        _classCallCheck(this, Bullet);

        this.goUp = goUp;
        this.speed = goUp ? -10 : 10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.position = createVector(xPosition, yPosition);
        this.velocity = createVector(0, 0);

        this.color = colorValue !== undefined ? color("hsl(" + colorValue + ", 100%, 50%)") : 255;
    }

    _createClass(Bullet, [{
        key: "show",
        value: function show() {
            noStroke();
            fill(this.color);

            var x = this.position.x;
            var y = this.position.y;

            rect(x, y - this.baseHeight, this.baseWidth, this.baseHeight);
            if (this.goUp) {
                triangle(x - this.baseWidth / 2, y - this.baseHeight, x, y - this.baseHeight * 2, x + this.baseWidth / 2, y - this.baseHeight);
            }
        }
    }, {
        key: "update",
        value: function update() {
            this.velocity = createVector(0, height);
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/// <reference path="./bullet.js" />

var SpaceShip = function () {
    function SpaceShip(bodyColor) {
        _classCallCheck(this, SpaceShip);

        this.color = bodyColor;
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

        this.GodMode = true;
        this.bulletColor = 0;
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
                if (this.bullets[i].position.y < -this.bullets[i].baseHeight) {
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
        key: 'shootBullets',
        value: function shootBullets() {
            if (this.waitFrameCount === this.minFrameWaitCount) this.bullets.push(new Bullet(this.position.x, this.position.y - this.baseHeight * 1.5, this.baseWidth / 10, true, this.bulletColor));
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

var minFrameWaitCount = 7;
var pickupColors = [0, 175, 120];

var spaceShip = void 0;
var spaceShipDestroyed = false;
var pickups = [];
var enemies = [];
var explosions = [];
var waitFrameCount = minFrameWaitCount;

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

    spaceShip = new SpaceShip(255);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwicGlja3Vwcy5qcyIsInNwYWNlLXNoaXAuanMiLCJlbmVteS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQYXJ0aWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQYXJ0aWNsZSh4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJ0aWNsZSk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHA1LlZlY3Rvci5yYW5kb20yRCgpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQocmFuZG9tKDAsIDcwKSk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYXJ0aWNsZSwgW3tcbiAgICAgICAga2V5OiBcImFwcGx5Rm9yY2VcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFwcGx5Rm9yY2UoZm9yY2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yVmFsdWUgPSBjb2xvcihcImhzbGEoXCIgKyB0aGlzLmNvbG9yTnVtYmVyICsgXCIsIDEwMCUsIDUwJSwgXCIgKyB0aGlzLmFscGhhICsgXCIpXCIpO1xuICAgICAgICAgICAgdmFyIG1hcHBlZFN0cm9rZVdlaWdodCA9IG1hcCh0aGlzLmFscGhhLCAwLCAxLCAwLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG5cbiAgICAgICAgICAgIHN0cm9rZVdlaWdodChtYXBwZWRTdHJva2VXZWlnaHQpO1xuICAgICAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xuICAgICAgICAgICAgcG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgICAgICB0aGlzLmFscGhhIC09IDAuMDU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkubXVsdCgwLjUpO1xuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJpc1Zpc2libGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzVmlzaWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYXJ0aWNsZTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCdWxsZXQoeFBvc2l0aW9uLCB5UG9zaXRpb24sIHNpemUsIGdvVXAsIGNvbG9yVmFsdWUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJ1bGxldCk7XG5cbiAgICAgICAgdGhpcy5nb1VwID0gZ29VcDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IGdvVXAgPyAtMTAgOiAxMDtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSBzaXplO1xuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSBzaXplICogMjtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3JWYWx1ZSAhPT0gdW5kZWZpbmVkID8gY29sb3IoXCJoc2woXCIgKyBjb2xvclZhbHVlICsgXCIsIDEwMCUsIDUwJSlcIikgOiAyNTU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEJ1bGxldCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgcmVjdCh4LCB5IC0gdGhpcy5iYXNlSGVpZ2h0LCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdvVXApIHtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZSh4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0LCB4LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMiwgeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQnVsbGV0O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYXJ0aWNsZS5qc1wiIC8+XG5cbnZhciBFeHBsb3Npb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRXhwbG9zaW9uKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV4cGxvc2lvbik7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3RvcihzcGF3blgsIHNwYXduWSk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IGNyZWF0ZVZlY3RvcigwLCAwLjIpO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcblxuICAgICAgICB2YXIgcmFuZG9tQ29sb3IgPSBpbnQocmFuZG9tKDAsIDM1OSkpO1xuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEV4cGxvc2lvbiwgW3tcbiAgICAgICAga2V5OiBcImV4cGxvZGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvZGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwMDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbG9yLCB0aGlzLm1heFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbiAocGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS5zaG93KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXJ0aWNsZXNbaV0uaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiZXhwbG9zaW9uQ29tcGxldGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxvc2lvbkNvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFeHBsb3Npb247XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBQaWNrdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGlja3VwKHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBjb2xvclZhbHVlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQaWNrdXApO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAyO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gWzAsIDAsIDAsIDBdO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDE1O1xuXG4gICAgICAgIHRoaXMuY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWU7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcihcImhzbChcIiArIGNvbG9yVmFsdWUgKyBcIiwgMTAwJSwgNTAlKVwiKTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IDA7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBpY2t1cCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICAgICAgcm90YXRlKHRoaXMuYW5nbGUpO1xuICAgICAgICAgICAgcmVjdCgwLCAwLCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlV2lkdGgpO1xuICAgICAgICAgICAgcG9wKCk7XG5cbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSBmcmFtZVJhdGUoKSA+IDAgPyB0aGlzLmFuZ2xlICsgMiAqICg2MCAvIGZyYW1lUmF0ZSgpKSA6IHRoaXMuYW5nbGUgKyAyO1xuICAgICAgICAgICAgdGhpcy5hbmdsZSA9IHRoaXMuYW5nbGUgPiAzNjAgPyAwIDogdGhpcy5hbmdsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCBoZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzT3V0T2ZTY3JlZW5cIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzT3V0T2ZTY3JlZW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ID4gaGVpZ2h0ICsgdGhpcy5iYXNlV2lkdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJwb2ludElzSW5zaWRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQaWNrdXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuXG52YXIgU3BhY2VTaGlwID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwYWNlU2hpcChib2R5Q29sb3IpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNwYWNlU2hpcCk7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IGJvZHlDb2xvcjtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSA3MDtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gdGhpcy5iYXNlV2lkdGggLyA1O1xuICAgICAgICB0aGlzLnNob290ZXJXaWR0aCA9IHRoaXMuYmFzZVdpZHRoIC8gMTA7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5taW5GcmFtZVdhaXRDb3VudCA9IDc7XG4gICAgICAgIHRoaXMud2FpdEZyYW1lQ291bnQgPSB0aGlzLm1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Iod2lkdGggLyAyLCBoZWlnaHQgLSB0aGlzLmJhc2VIZWlnaHQgLSAxMCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IDE1O1xuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwMDtcblxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuXG4gICAgICAgIHRoaXMuR29kTW9kZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSAwO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV1dO1xuXG4gICAgICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgodGhpcy5zaGFwZVBvaW50c1tpXVswXSwgdGhpcy5zaGFwZVBvaW50c1tpXVsxXSk7XG4gICAgICAgICAgICB9ZW5kU2hhcGUoQ0xPU0UpO1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudENvbG9yID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDUwKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5oZWFsdGggLyA1MCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsICh0aGlzLmhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcbiAgICAgICAgICAgIHJlY3Qod2lkdGggLyAyLCBoZWlnaHQgLSA3LCB3aWR0aCAqIHRoaXMuaGVhbHRoIC8gMTAwLCAxMCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICBpZiAoIWtleUlzRG93bigzMikpIHRoaXMud2FpdEZyYW1lQ291bnQgPSB0aGlzLm1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgICAgICAgICBpZiAodGhpcy53YWl0RnJhbWVDb3VudCA8IDApIHRoaXMud2FpdEZyYW1lQ291bnQgPSB0aGlzLm1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnNob3coKTtcbiAgICAgICAgICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5wb3NpdGlvbi55IDwgLXRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0QnVsbGV0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRCdWxsZXRUeXBlKGNvbG9yVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSBjb2xvclZhbHVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzaG9vdEJ1bGxldHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvb3RCdWxsZXRzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMud2FpdEZyYW1lQ291bnQgPT09IHRoaXMubWluRnJhbWVXYWl0Q291bnQpIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsIHRoaXMuYmFzZVdpZHRoIC8gMTAsIHRydWUsIHRoaXMuYnVsbGV0Q29sb3IpKTtcbiAgICAgICAgICAgIHRoaXMud2FpdEZyYW1lQ291bnQgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVjcmVhc2VIZWFsdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVjcmVhc2VIZWFsdGgoYW1vdW50KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuR29kTW9kZSkgdGhpcy5oZWFsdGggLT0gYW1vdW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhY3RpdmF0ZUdvZE1vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWN0aXZhdGVHb2RNb2RlKCkge1xuICAgICAgICAgICAgdGhpcy5Hb2RNb2RlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEZXN0cm95ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNEZXN0cm95ZWQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGVhbHRoID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xuICAgICAgICAgICAgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3BhY2VTaGlwO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cblxudmFyIEVuZW15ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVuZW15KHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBlbmVteUJhc2VXaWR0aCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW5lbXkpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQgLyAyKSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSA1O1xuICAgICAgICAvLyBBYmlsaXR5IHRvIHR1cm5cbiAgICAgICAgdGhpcy5tYXhGb3JjZSA9IDU7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IDI1NTtcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSBlbmVteUJhc2VXaWR0aDtcbiAgICAgICAgdGhpcy5nZW5lcmFsRGltZW5zaW9uID0gdGhpcy5iYXNlV2lkdGggLyA1O1xuICAgICAgICB0aGlzLnNob290ZXJIZWlnaHQgPSB0aGlzLmJhc2VXaWR0aCAqIDMgLyAyMDtcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtdO1xuXG4gICAgICAgIHRoaXMubWFnbml0dWRlTGltaXQgPSA1MDtcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XG4gICAgICAgIHRoaXMuY29uc3RCdWxsZXRUaW1lID0gNztcbiAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwICogZW5lbXlCYXNlV2lkdGggLyA0NTtcbiAgICAgICAgdGhpcy5oZWFsdGggPSB0aGlzLm1heEhlYWx0aDtcbiAgICAgICAgdGhpcy5mdWxsSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDEyMCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy56ZXJvSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDAsIDEwMCUsIDUwJSknKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW5lbXksIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudENvbG9yID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBtYXBwZWRIZWFsdGggPSBtYXAodGhpcy5oZWFsdGgsIDAsIHRoaXMubWF4SGVhbHRoLCAwLCAxMDApO1xuICAgICAgICAgICAgaWYgKG1hcHBlZEhlYWx0aCA8IDUwKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy5oYWxmSGVhbHRoQ29sb3IsIHRoaXMuZnVsbEhlYWx0aENvbG9yLCAobWFwcGVkSGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1ICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41ICsgdGhpcy5zaG9vdGVySGVpZ2h0XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl1dO1xuXG4gICAgICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgodGhpcy5zaGFwZVBvaW50c1tpXVswXSwgdGhpcy5zaGFwZVBvaW50c1tpXVsxXSk7XG4gICAgICAgICAgICB9ZW5kU2hhcGUoQ0xPU0UpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja0Fycml2YWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tBcnJpdmFsKCkge1xuICAgICAgICAgICAgdmFyIGRlc2lyZWQgPSBwNS5WZWN0b3Iuc3ViKHRoaXMucG9zaXRpb25Ub1JlYWNoLCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkTWFnID0gZGVzaXJlZC5tYWcoKTtcbiAgICAgICAgICAgIGlmIChkZXNpcmVkTWFnIDwgdGhpcy5tYWduaXR1ZGVMaW1pdCkge1xuICAgICAgICAgICAgICAgIHZhciBtYXBwZWRTcGVlZCA9IG1hcChkZXNpcmVkTWFnLCAwLCA1MCwgMCwgdGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcobWFwcGVkU3BlZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN0ZWVyaW5nID0gcDUuVmVjdG9yLnN1YihkZXNpcmVkLCB0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIHN0ZWVyaW5nLmxpbWl0KHRoaXMubWF4Rm9yY2UpO1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHN0ZWVyaW5nKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2hvb3RCdWxsZXRzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob290QnVsbGV0cygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID09PSB0aGlzLmNvbnN0QnVsbGV0VGltZSkge1xuICAgICAgICAgICAgICAgIHZhciByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuNSkgdGhpcy5idWxsZXRzLnB1c2gobmV3IEJ1bGxldCh0aGlzLnByZXZYLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiA1LCB0aGlzLmJhc2VXaWR0aCAvIDUsIGZhbHNlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrUGxheWVyRGlzdGFuY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tQbGF5ZXJEaXN0YW5jZShwbGF5ZXJQb3NpdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPCAwKSB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG5cbiAgICAgICAgICAgIHZhciB4UG9zaXRpb25EaXN0YW5jZSA9IGFicyhwbGF5ZXJQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54KTtcbiAgICAgICAgICAgIGlmICh4UG9zaXRpb25EaXN0YW5jZSA8IDIwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RCdWxsZXRzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSAtPSAxICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0YWtlRGFtYWdlQW5kQ2hlY2tEZWF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0YWtlRGFtYWdlQW5kQ2hlY2tEZWF0aCgpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IDIwO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgMCkgcmV0dXJuIHRydWU7ZWxzZSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LmxpbWl0KHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBjb250aW51b3VzIGFjY2VsZXJhdGlvbiBpdHMgb25seSBpbnN0YW50YW5lb3VzXG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5tYWcoKSA8PSAxKSB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuXG4gICAgICAgICAgICB0aGlzLmJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnNob3coKTtcbiAgICAgICAgICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0c1tpXS5wb3NpdGlvbi55ID4gdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgKyBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9pbnRJc0luc2lkZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFbmVteTtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHBsb3Npb24uanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGlja3Vwcy5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zcGFjZS1zaGlwLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2VuZW15LmpzXCIgLz5cblxudmFyIG1pbkZyYW1lV2FpdENvdW50ID0gNztcbnZhciBwaWNrdXBDb2xvcnMgPSBbMCwgMTc1LCAxMjBdO1xuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xudmFyIHBpY2t1cHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgZXhwbG9zaW9ucyA9IFtdO1xudmFyIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbnZhciBjdXJyZW50TGV2ZWxDb3VudCA9IDE7XG52YXIgbWF4TGV2ZWxDb3VudCA9IDc7XG52YXIgdGltZW91dENhbGxlZCA9IGZhbHNlO1xudmFyIGJ1dHRvbiA9IHZvaWQgMDtcbnZhciBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGJ1dHRvbiA9IGNyZWF0ZUJ1dHRvbignUmVwbGF5IScpO1xuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMiArIDMwKTtcbiAgICBidXR0b24uZWx0LmNsYXNzTmFtZSA9ICdwdWxzZSc7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGJ1dHRvbi5tb3VzZVByZXNzZWQocmVzZXRHYW1lKTtcblxuICAgIHNwYWNlU2hpcCA9IG5ldyBTcGFjZVNoaXAoMjU1KTtcblxuICAgIHRleHRBbGlnbihDRU5URVIpO1xuICAgIHJlY3RNb2RlKENFTlRFUik7XG4gICAgYW5nbGVNb2RlKERFR1JFRVMpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG5cbiAgICBpZiAoa2V5SXNEb3duKDcxKSAmJiBrZXlJc0Rvd24oNzkpICYmIGtleUlzRG93big2OCkpIHNwYWNlU2hpcC5hY3RpdmF0ZUdvZE1vZGUoKTtcblxuICAgIGlmIChzcGFjZVNoaXAuaXNEZXN0cm95ZWQoKSkge1xuICAgICAgICBpZiAoIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oc3BhY2VTaGlwLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5wb3NpdGlvbi55LCBzcGFjZVNoaXAuYmFzZVdpZHRoKSk7XG4gICAgICAgICAgICBzcGFjZVNoaXBEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihlbmVtaWVzW2ldLnBvc2l0aW9uLngsIGVuZW1pZXNbaV0ucG9zaXRpb24ueSwgZW5lbWllc1tpXS5iYXNlV2lkdGggKiA3IC8gNDUpKTtcbiAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSwgMCwgMCk7XG4gICAgICAgIHRleHQoJ1lvdSBBcmUgRGVhZCcsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlU2hpcC5zaG93KCk7XG4gICAgICAgIHNwYWNlU2hpcC51cGRhdGUoKTtcblxuICAgICAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpICYmIGtleUlzRG93bihSSUdIVF9BUlJPVykpIHsvKiBEbyBub3RoaW5nICovfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAubW92ZVNoaXAoJ0xFRlQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnUklHSFQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXlJc0Rvd24oMzIpKSB7XG4gICAgICAgICAgICBzcGFjZVNoaXAuc2hvb3RCdWxsZXRzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tBcnJpdmFsKCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tQbGF5ZXJEaXN0YW5jZShzcGFjZVNoaXAucG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGV4cGxvc2lvbnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGV4cGxvc2lvbnNbX2ldLnNob3coKTtcbiAgICAgICAgZXhwbG9zaW9uc1tfaV0udXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKGV4cGxvc2lvbnNbX2ldLmV4cGxvc2lvbkNvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKF9pLCAxKTtcbiAgICAgICAgICAgIF9pIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBwaWNrdXBzLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgcGlja3Vwc1tfaTJdLnNob3coKTtcbiAgICAgICAgcGlja3Vwc1tfaTJdLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChwaWNrdXBzW19pMl0uaXNPdXRPZlNjcmVlbigpKSB7XG4gICAgICAgICAgICBwaWNrdXBzLnNwbGljZShfaTIsIDEpO1xuICAgICAgICAgICAgX2kyIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBzcGFjZVNoaXAuYnVsbGV0cy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5lbWllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gRml4TWU6IENoZWNrIGJ1bGxldCB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmIChzcGFjZVNoaXAuYnVsbGV0c1tfaTNdKSBpZiAoZW5lbWllc1tqXS5wb2ludElzSW5zaWRlKFtzcGFjZVNoaXAuYnVsbGV0c1tfaTNdLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5idWxsZXRzW19pM10ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuZW15RGVhZCA9IGVuZW1pZXNbal0udGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5lbXlEZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAqIDcgLyA0NSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllc1tqXS5iYXNlV2lkdGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkoZW5lbWllc1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2pdLnBvc2l0aW9uLnksIGVuZW1pZXNbal0uYmFzZVdpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaWNrdXBzLnB1c2gobmV3IFBpY2t1cChlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgcGlja3VwQ29sb3JzW2Zsb29yKHJhbmRvbSgpICogcGlja3VwQ29sb3JzLmxlbmd0aCldKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAuYnVsbGV0cy5zcGxpY2UoX2kzLCAxKTtcbiAgICAgICAgICAgICAgICBfaTMgPSBfaTMgPT09IDAgPyAwIDogX2kzIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pNCA9IDA7IF9pNCA8IHBpY2t1cHMubGVuZ3RoOyBfaTQrKykge1xuICAgICAgICBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW3BpY2t1cHNbX2k0XS5wb3NpdGlvbi54LCBwaWNrdXBzW19pNF0ucG9zaXRpb24ueV0pKSB7XG4gICAgICAgICAgICB2YXIgY29sb3JWYWx1ZSA9IHBpY2t1cHNbX2k0XS5jb2xvclZhbHVlO1xuICAgICAgICAgICAgc3BhY2VTaGlwLnNldEJ1bGxldFR5cGUoY29sb3JWYWx1ZSk7XG5cbiAgICAgICAgICAgIHBpY2t1cHMuc3BsaWNlKF9pNCwgMSk7XG4gICAgICAgICAgICBfaTQgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pNSA9IDA7IF9pNSA8IGVuZW1pZXMubGVuZ3RoOyBfaTUrKykge1xuICAgICAgICBmb3IgKHZhciBfaiA9IDA7IF9qIDwgZW5lbWllc1tfaTVdLmJ1bGxldHMubGVuZ3RoOyBfaisrKSB7XG4gICAgICAgICAgICAvLyBGaXhNZTogQ2hlY2sgYnVsbGV0IHVuZGVmaW5lZFxuICAgICAgICAgICAgaWYgKGVuZW1pZXNbX2k1XS5idWxsZXRzW19qXSkgaWYgKHNwYWNlU2hpcC5wb2ludElzSW5zaWRlKFtlbmVtaWVzW19pNV0uYnVsbGV0c1tfal0ucG9zaXRpb24ueCwgZW5lbWllc1tfaTVdLmJ1bGxldHNbX2pdLnBvc2l0aW9uLnldKSkge1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5kZWNyZWFzZUhlYWx0aCgyICogZW5lbWllc1tfaTVdLmJ1bGxldHNbX2pdLmJhc2VXaWR0aCAvIDEwKTtcbiAgICAgICAgICAgICAgICBlbmVtaWVzW19pNV0uYnVsbGV0cy5zcGxpY2UoX2osIDEpO1xuXG4gICAgICAgICAgICAgICAgX2ogLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzcGFjZVNoaXAuR29kTW9kZSkge1xuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgdGV4dCgnR29kIE1vZGUnLCB3aWR0aCAtIDgwLCBoZWlnaHQgLSAzMCk7XG4gICAgfVxuXG4gICAgaWYgKGVuZW1pZXMubGVuZ3RoID09PSAwICYmICFzcGFjZVNoaXBEZXN0cm95ZWQpIHtcbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIGlmIChjdXJyZW50TGV2ZWxDb3VudCA8PSBtYXhMZXZlbENvdW50KSB7XG4gICAgICAgICAgICB0ZXh0KCdMb2FkaW5nIExldmVsICcgKyBjdXJyZW50TGV2ZWxDb3VudCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIGlmICghdGltZW91dENhbGxlZCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGluY3JlbWVudExldmVsLCAzMDAwKTtcbiAgICAgICAgICAgICAgICB0aW1lb3V0Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XG4gICAgICAgICAgICB0ZXh0KCdDb25ncmF0dWxhdGlvbnMgeW91IHdvbiB0aGUgZ2FtZSEhIScsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICB2YXIgX3JhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICBpZiAoX3JhbmRvbVZhbHVlIDwgMC4xKSBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0KSwgcmFuZG9tKDAsIDEwKSkpO1xuXG4gICAgICAgICAgICBpZiAoIWJ1dHRvbkRpc3BsYXllZCkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5jcmVtZW50TGV2ZWwoKSB7XG4gICAgdmFyIGkgPSB2b2lkIDA7XG4gICAgc3dpdGNoIChjdXJyZW50TGV2ZWxDb3VudCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDE1MCwgMTcwKSkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDE1MCwgMTcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgMjApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNTA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCAyMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRMZXZlbENvdW50IDw9IG1heExldmVsQ291bnQpIHtcbiAgICAgICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50TGV2ZWxDb3VudCsrO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVzZXRHYW1lKCkge1xuICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xuICAgIGVuZW1pZXMgPSBbXTtcbiAgICBleHBsb3Npb25zID0gW107XG4gICAgc3BhY2VTaGlwLnJlc2V0KCk7XG5cbiAgICBjdXJyZW50TGV2ZWxDb3VudCA9IDE7XG4gICAgbWF4TGV2ZWxDb3VudCA9IDc7XG4gICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xuXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHNwYWNlU2hpcC5Hb2RNb2RlID0gZmFsc2U7XG59Il19
