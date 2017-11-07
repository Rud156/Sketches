'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        key: 'applyForce',
        value: function applyForce(force) {
            this.acceleration.add(force);
        }
    }, {
        key: 'show',
        value: function show() {
            var colorValue = color('hsla(' + this.colorNumber + ', 100%, 50%, ' + this.alpha + ')');
            var mappedStrokeWeight = map(this.alpha, 0, 1, 0, this.maxStrokeWeight);

            strokeWeight(mappedStrokeWeight);
            stroke(colorValue);
            point(this.position.x, this.position.y);

            this.alpha -= 0.05;
        }
    }, {
        key: 'update',
        value: function update() {
            this.velocity.mult(0.5);

            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }
    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this.alpha > 0;
        }
    }]);

    return Particle;
}();

var Bullet = function () {
    function Bullet(xPosition, yPosition, size, goUp, colorValue, rotation) {
        _classCallCheck(this, Bullet);

        this.goUp = goUp;
        this.speed = goUp ? -10 : 10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.color = colorValue !== undefined ? color('hsl(' + colorValue + ', 100%, 50%)') : 255;
        this.rotation = rotation;

        this.position = createVector(xPosition, yPosition);
        if (this.rotation === undefined) this.velocity = createVector(0, 45);else {
            var _rotation = 45 - this.rotation;
            this.velocity = createVector(-45 + _rotation, 45);
        }
        this.velocity.setMag(this.speed);
    }

    _createClass(Bullet, [{
        key: 'show',
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
        key: 'update',
        value: function update() {
            this.position.add(this.velocity);
        }
    }]);

    return Bullet;
}();
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
        key: 'explode',
        value: function explode() {
            for (var i = 0; i < 200; i++) {
                var particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight);
                this.particles.push(particle);
            }
        }
    }, {
        key: 'show',
        value: function show() {
            this.particles.forEach(function (particle) {
                particle.show();
            });
        }
    }, {
        key: 'update',
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
        key: 'explosionComplete',
        value: function explosionComplete() {
            return this.particles.length === 0;
        }
    }]);

    return Explosion;
}();

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
        this.color = color('hsl(' + colorValue + ', 100%, 50%)');
        this.angle = 0;
    }

    _createClass(Pickup, [{
        key: 'show',
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
        key: 'update',
        value: function update() {
            this.position.add(this.velocity);
        }
    }, {
        key: 'isOutOfScreen',
        value: function isOutOfScreen() {
            return this.position.y > height + this.baseWidth;
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

    return Pickup;
}();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJQYXJ0aWNsZSIsIngiLCJ5IiwiY29sb3JOdW1iZXIiLCJtYXhTdHJva2VXZWlnaHQiLCJwb3NpdGlvbiIsImNyZWF0ZVZlY3RvciIsInZlbG9jaXR5IiwicDUiLCJWZWN0b3IiLCJyYW5kb20yRCIsIm11bHQiLCJyYW5kb20iLCJhY2NlbGVyYXRpb24iLCJhbHBoYSIsImZvcmNlIiwiYWRkIiwiY29sb3JWYWx1ZSIsImNvbG9yIiwibWFwcGVkU3Ryb2tlV2VpZ2h0IiwibWFwIiwic3Ryb2tlV2VpZ2h0Iiwic3Ryb2tlIiwicG9pbnQiLCJCdWxsZXQiLCJ4UG9zaXRpb24iLCJ5UG9zaXRpb24iLCJzaXplIiwiZ29VcCIsInJvdGF0aW9uIiwic3BlZWQiLCJiYXNlV2lkdGgiLCJiYXNlSGVpZ2h0IiwidW5kZWZpbmVkIiwic2V0TWFnIiwibm9TdHJva2UiLCJmaWxsIiwicHVzaCIsInRyYW5zbGF0ZSIsInJvdGF0ZSIsInJlY3QiLCJ0cmlhbmdsZSIsInBvcCIsIkV4cGxvc2lvbiIsInNwYXduWCIsInNwYXduWSIsImdyYXZpdHkiLCJyYW5kb21Db2xvciIsImludCIsInBhcnRpY2xlcyIsImV4cGxvZGUiLCJpIiwicGFydGljbGUiLCJmb3JFYWNoIiwic2hvdyIsImxlbmd0aCIsImFwcGx5Rm9yY2UiLCJ1cGRhdGUiLCJpc1Zpc2libGUiLCJzcGxpY2UiLCJQaWNrdXAiLCJoZWlnaHQiLCJzaGFwZVBvaW50cyIsImFuZ2xlIiwiZnJhbWVSYXRlIiwiaW5zaWRlIiwiaiIsInhpIiwieWkiLCJ4aiIsInlqIiwiaW50ZXJzZWN0IiwiU3BhY2VTaGlwIiwic2hvb3RlcldpZHRoIiwiYnVsbGV0cyIsIm1pbkZyYW1lV2FpdENvdW50Iiwid2FpdEZyYW1lQ291bnQiLCJ3aWR0aCIsImhlYWx0aCIsImZ1bGxIZWFsdGhDb2xvciIsImhhbGZIZWFsdGhDb2xvciIsInplcm9IZWFsdGhDb2xvciIsInNwYWNlU2hpcENvbG9yIiwiR29kTW9kZSIsImJ1bGxldENvbG9yIiwiYm9keUNvbG9yIiwibGVycENvbG9yIiwiYmVnaW5TaGFwZSIsInZlcnRleCIsImVuZFNoYXBlIiwiQ0xPU0UiLCJjdXJyZW50Q29sb3IiLCJrZXlJc0Rvd24iLCJidWxsZXQiLCJkaXJlY3Rpb24iLCJhcnJheSIsImdldEJ1bGxldFR5cGUiLCJhbW91bnQiLCJFbmVteSIsImVuZW15QmFzZVdpZHRoIiwicHJldlgiLCJwb3NpdGlvblRvUmVhY2giLCJtYXhTcGVlZCIsIm1heEZvcmNlIiwiZ2VuZXJhbERpbWVuc2lvbiIsInNob290ZXJIZWlnaHQiLCJtYWduaXR1ZGVMaW1pdCIsImNvbnN0QnVsbGV0VGltZSIsImN1cnJlbnRCdWxsZXRUaW1lIiwibWF4SGVhbHRoIiwibWFwcGVkSGVhbHRoIiwiZGVzaXJlZCIsInN1YiIsImRlc2lyZWRNYWciLCJtYWciLCJtYXBwZWRTcGVlZCIsInN0ZWVyaW5nIiwibGltaXQiLCJyYW5kb21WYWx1ZSIsInBsYXllclBvc2l0aW9uIiwieFBvc2l0aW9uRGlzdGFuY2UiLCJhYnMiLCJzaG9vdEJ1bGxldHMiLCJwaWNrdXBDb2xvcnMiLCJzcGFjZVNoaXAiLCJzcGFjZVNoaXBEZXN0cm95ZWQiLCJwaWNrdXBzIiwiZW5lbWllcyIsImV4cGxvc2lvbnMiLCJjdXJyZW50TGV2ZWxDb3VudCIsIm1heExldmVsQ291bnQiLCJ0aW1lb3V0Q2FsbGVkIiwiYnV0dG9uIiwiYnV0dG9uRGlzcGxheWVkIiwiZ2FtZVN0YXJ0ZWQiLCJleHBsb3Npb25Tb3VuZCIsImJhY2tncm91bmRTb3VuZCIsInBvd2VyVXBTb3VuZCIsInByZWxvYWQiLCJIb3dsIiwic3JjIiwiYXV0b3BsYXkiLCJsb29wIiwidm9sdW1lIiwic2V0dXAiLCJjYW52YXMiLCJjcmVhdGVDYW52YXMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJwYXJlbnQiLCJjcmVhdGVCdXR0b24iLCJlbHQiLCJjbGFzc05hbWUiLCJzdHlsZSIsImRpc3BsYXkiLCJtb3VzZVByZXNzZWQiLCJyZXNldEdhbWUiLCJ0ZXh0QWxpZ24iLCJDRU5URVIiLCJyZWN0TW9kZSIsImFuZ2xlTW9kZSIsIkRFR1JFRVMiLCJkcmF3IiwiYmFja2dyb3VuZCIsImFjdGl2YXRlR29kTW9kZSIsImlzRGVzdHJveWVkIiwicGxheSIsInRleHRTaXplIiwidGV4dCIsImlubmVyVGV4dCIsIkxFRlRfQVJST1ciLCJSSUdIVF9BUlJPVyIsIm1vdmVTaGlwIiwiZWxlbWVudCIsImNoZWNrQXJyaXZhbCIsImNoZWNrUGxheWVyRGlzdGFuY2UiLCJleHBsb3Npb25Db21wbGV0ZSIsImlzT3V0T2ZTY3JlZW4iLCJwb2ludElzSW5zaWRlIiwiZW5lbXlEZWFkIiwidGFrZURhbWFnZUFuZENoZWNrRGVhdGgiLCJmbG9vciIsInNldEJ1bGxldFR5cGUiLCJkZWNyZWFzZUhlYWx0aCIsInNldFRpbWVvdXQiLCJpbmNyZW1lbnRMZXZlbCIsInRleHRTdHlsZSIsIkJPTEQiLCJyZXNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFBTUEsUTtBQUNGLHNCQUFZQyxDQUFaLEVBQWVDLENBQWYsRUFBa0JDLFdBQWxCLEVBQStCQyxlQUEvQixFQUFnRDtBQUFBOztBQUM1QyxhQUFLQyxRQUFMLEdBQWdCQyxhQUFhTCxDQUFiLEVBQWdCQyxDQUFoQixDQUFoQjtBQUNBLGFBQUtLLFFBQUwsR0FBZ0JDLEdBQUdDLE1BQUgsQ0FBVUMsUUFBVixFQUFoQjtBQUNBLGFBQUtILFFBQUwsQ0FBY0ksSUFBZCxDQUFtQkMsT0FBTyxDQUFQLEVBQVUsRUFBVixDQUFuQjtBQUNBLGFBQUtDLFlBQUwsR0FBb0JQLGFBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFwQjs7QUFFQSxhQUFLUSxLQUFMLEdBQWEsQ0FBYjtBQUNBLGFBQUtYLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsYUFBS0MsZUFBTCxHQUF1QkEsZUFBdkI7QUFDSDs7OzttQ0FFVVcsSyxFQUFPO0FBQ2QsaUJBQUtGLFlBQUwsQ0FBa0JHLEdBQWxCLENBQXNCRCxL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cyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvck51bWJlciwgbWF4U3Ryb2tlV2VpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4LCB5KTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCA3MCkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gMTtcclxuICAgICAgICB0aGlzLmNvbG9yTnVtYmVyID0gY29sb3JOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlGb3JjZShmb3JjZSkge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBsZXQgY29sb3JWYWx1ZSA9IGNvbG9yKGBoc2xhKCR7dGhpcy5jb2xvck51bWJlcn0sIDEwMCUsIDUwJSwgJHt0aGlzLmFscGhhfSlgKTtcclxuICAgICAgICBsZXQgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcclxuXHJcbiAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XHJcbiAgICAgICAgc3Ryb2tlKGNvbG9yVmFsdWUpO1xyXG4gICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWaXNpYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhID4gMDtcclxuICAgIH1cclxufVxuY2xhc3MgQnVsbGV0IHtcclxuICAgIGNvbnN0cnVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBzaXplLCBnb1VwLCBjb2xvclZhbHVlLCByb3RhdGlvbikge1xyXG4gICAgICAgIHRoaXMuZ29VcCA9IGdvVXA7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IGdvVXAgPyAtMTAgOiAxMDtcclxuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gc2l6ZSAqIDI7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvclZhbHVlICE9PSB1bmRlZmluZWQgPyBjb2xvcihgaHNsKCR7Y29sb3JWYWx1ZX0sIDEwMCUsIDUwJSlgKSA6IDI1NTtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcm90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeFBvc2l0aW9uLCB5UG9zaXRpb24pO1xyXG4gICAgICAgIGlmICh0aGlzLnJvdGF0aW9uID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgNDUpO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgcm90YXRpb24gPSA0NSAtIHRoaXMucm90YXRpb247XHJcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoLTQ1ICsgcm90YXRpb24sIDQ1KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5zZXRNYWcodGhpcy5zcGVlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgIGZpbGwodGhpcy5jb2xvcik7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5wb3NpdGlvbi55O1xyXG5cclxuICAgICAgICBwdXNoKCk7XHJcbiAgICAgICAgdHJhbnNsYXRlKHgsIHkpO1xyXG4gICAgICAgIHJvdGF0ZSh0aGlzLnJvdGF0aW9uKTtcclxuICAgICAgICByZWN0KDAsIC10aGlzLmJhc2VIZWlnaHQsIHRoaXMuYmFzZVdpZHRoLCB0aGlzLmJhc2VIZWlnaHQpO1xyXG4gICAgICAgIGlmICh0aGlzLmdvVXApIHtcclxuICAgICAgICAgICAgdHJpYW5nbGUoLXRoaXMuYmFzZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUhlaWdodCxcclxuICAgICAgICAgICAgICAgIDAsIC10aGlzLmJhc2VIZWlnaHQgKiAyLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5iYXNlV2lkdGggLyAyLCAtdGhpcy5iYXNlSGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxyXG5cclxuY2xhc3MgRXhwbG9zaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHNwYXduWCwgc3Bhd25ZLCBtYXhTdHJva2VXZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcclxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcclxuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gcmFuZG9tQ29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9kZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwMDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvciwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLmFwcGx5Rm9yY2UodGhpcy5ncmF2aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwbG9zaW9uQ29tcGxldGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxufVxuY2xhc3MgUGlja3VwIHtcclxuICAgIGNvbnN0cnVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBjb2xvclZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCBoZWlnaHQpO1xyXG5cclxuICAgICAgICB0aGlzLnNwZWVkID0gMjtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5LnNldE1hZyh0aGlzLnNwZWVkKTtcclxuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gWzAsIDAsIDAsIDBdO1xyXG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gMTU7XHJcblxyXG4gICAgICAgIHRoaXMuY29sb3JWYWx1ZSA9IGNvbG9yVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yKGBoc2woJHtjb2xvclZhbHVlfSwgMTAwJSwgNTAlKWApO1xyXG4gICAgICAgIHRoaXMuYW5nbGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucG9zaXRpb24ueTtcclxuXHJcblxyXG4gICAgICAgIHB1c2goKTtcclxuICAgICAgICB0cmFuc2xhdGUoeCwgeSk7XHJcbiAgICAgICAgcm90YXRlKHRoaXMuYW5nbGUpO1xyXG4gICAgICAgIHJlY3QoMCwgMCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZVdpZHRoKTtcclxuICAgICAgICBwb3AoKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IGZyYW1lUmF0ZSgpID4gMCA/IHRoaXMuYW5nbGUgKyAyICogKDYwIC8gZnJhbWVSYXRlKCkpIDogdGhpcy5hbmdsZSArIDI7XHJcbiAgICAgICAgdGhpcy5hbmdsZSA9IHRoaXMuYW5nbGUgPiAzNjAgPyAwIDogdGhpcy5hbmdsZTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPdXRPZlNjcmVlbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ID4gKGhlaWdodCArIHRoaXMuYmFzZVdpZHRoKTtcclxuICAgIH1cclxuXHJcbiAgICBwb2ludElzSW5zaWRlKHBvaW50KSB7XHJcbiAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXHJcbiAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxyXG5cclxuICAgICAgICBsZXQgeCA9IHBvaW50WzBdLFxyXG4gICAgICAgICAgICB5ID0gcG9pbnRbMV07XHJcblxyXG4gICAgICAgIGxldCBpbnNpZGUgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXHJcbiAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XHJcbiAgICAgICAgICAgIGxldCB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXHJcbiAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0ID0gKCh5aSA+IHkpICE9ICh5aiA+IHkpKSAmJlxyXG4gICAgICAgICAgICAgICAgKHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpKTtcclxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbnNpZGU7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XHJcblxyXG5jbGFzcyBTcGFjZVNoaXAge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5iYXNlV2lkdGggPSA3MDtcclxuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSB0aGlzLmJhc2VXaWR0aCAvIDU7XHJcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xyXG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICAgICAgdGhpcy5taW5GcmFtZVdhaXRDb3VudCA9IDc7XHJcbiAgICAgICAgdGhpcy53YWl0RnJhbWVDb3VudCA9IHRoaXMubWluRnJhbWVXYWl0Q291bnRcclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih3aWR0aCAvIDIsIGhlaWdodCAtIHRoaXMuYmFzZUhlaWdodCAtIDEwKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLnNwZWVkID0gMTU7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgICAgIHRoaXMuc3BhY2VTaGlwQ29sb3IgPSBjb2xvcignaHNsKDE3NSwgMTAwJSwgNTAlKScpO1xyXG5cclxuICAgICAgICB0aGlzLkdvZE1vZGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ1bGxldENvbG9yID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgbGV0IGJvZHlDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5zcGFjZVNoaXBDb2xvciwgdGhpcy5oZWFsdGggLyAxMDApO1xyXG4gICAgICAgIGZpbGwoYm9keUNvbG9yKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtcclxuICAgICAgICAgICAgW3ggLSB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAyXSxcclxuICAgICAgICAgICAgW3ggKyB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAyXSxcclxuICAgICAgICAgICAgW3ggKyB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLFxyXG4gICAgICAgICAgICBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5ICsgdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0IC8gMl0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSxcclxuICAgICAgICAgICAgW3ggLSB0aGlzLnNob290ZXJXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xyXG4gICAgICAgIGVuZFNoYXBlKENMT1NFKTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb2xvciA9IG51bGw7XHJcbiAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5oZWFsdGggLyA1MCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XHJcbiAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgaWYgKCFrZXlJc0Rvd24oMzIpKVxyXG4gICAgICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2FpdEZyYW1lQ291bnQgPCAwKVxyXG4gICAgICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzLmZvckVhY2goYnVsbGV0ID0+IHtcclxuICAgICAgICAgICAgYnVsbGV0LnNob3coKTtcclxuICAgICAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0ucG9zaXRpb24ueSA8IC10aGlzLmJ1bGxldHNbaV0uYmFzZUhlaWdodCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzW2ldLnBvc2l0aW9uLnggPCAtdGhpcy5idWxsZXRzW2ldLmJhc2VIZWlnaHQgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0c1tpXS5wb3NpdGlvbi54ID4gd2lkdGggKyB0aGlzLmJ1bGxldHNbaV0uYmFzZUhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGkgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2hpcChkaXJlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA8IHRoaXMuYmFzZVdpZHRoIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmJhc2VXaWR0aCAvIDIgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54ID4gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIgLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ0xFRlQnKVxyXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnNldE1hZygtdGhpcy5zcGVlZCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnNldE1hZyh0aGlzLnNwZWVkKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEJ1bGxldFR5cGUoY29sb3JWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMuYnVsbGV0Q29sb3IgPSBjb2xvclZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEJ1bGxldFR5cGUoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmJ1bGxldENvbG9yKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEJ1bGxldChcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFzZVdpZHRoIC8gMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29sb3JcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTIwOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQnVsbGV0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNob290ZXJXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhc2VXaWR0aCAvIDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldENvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQnVsbGV0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNob290ZXJXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhc2VXaWR0aCAvIDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldENvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgbGV0IGFycmF5ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDgwOyBpICs9IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEJ1bGxldChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFzZVdpZHRoIC8gMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idWxsZXRDb2xvciwgLTQwICsgaVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG9vdEJ1bGxldHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2FpdEZyYW1lQ291bnQgPT09IHRoaXMubWluRnJhbWVXYWl0Q291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLnB1c2goLi4udGhpcy5nZXRCdWxsZXRUeXBlKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50IC09ICgxICogKDYwIC8gZnJhbWVSYXRlKCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZUhlYWx0aChhbW91bnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuR29kTW9kZSlcclxuICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gYW1vdW50O1xyXG4gICAgfVxyXG5cclxuICAgIGFjdGl2YXRlR29kTW9kZSgpIHtcclxuICAgICAgICB0aGlzLkdvZE1vZGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGVzdHJveWVkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhbHRoID0gMDtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLndhaXRGcmFtZUNvdW50ID0gdGhpcy5taW5GcmFtZVdhaXRDb3VudDtcclxuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLkdvZE1vZGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ1bGxldENvbG9yID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwb2ludElzSW5zaWRlKHBvaW50KSB7XHJcbiAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXHJcbiAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxyXG5cclxuICAgICAgICBsZXQgeCA9IHBvaW50WzBdLFxyXG4gICAgICAgICAgICB5ID0gcG9pbnRbMV07XHJcblxyXG4gICAgICAgIGxldCBpbnNpZGUgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXHJcbiAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XHJcbiAgICAgICAgICAgIGxldCB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXHJcbiAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0ID0gKCh5aSA+IHkpICE9ICh5aiA+IHkpKSAmJlxyXG4gICAgICAgICAgICAgICAgKHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpKTtcclxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbnNpZGU7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XHJcblxyXG5jbGFzcyBFbmVteSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbiwgZW5lbXlCYXNlV2lkdGgpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSA1O1xyXG4gICAgICAgIC8vIEFiaWxpdHkgdG8gdHVyblxyXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xyXG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gZW5lbXlCYXNlV2lkdGg7XHJcbiAgICAgICAgdGhpcy5nZW5lcmFsRGltZW5zaW9uID0gdGhpcy5iYXNlV2lkdGggLyA1O1xyXG4gICAgICAgIHRoaXMuc2hvb3RlckhlaWdodCA9IHRoaXMuYmFzZVdpZHRoICogMyAvIDIwO1xyXG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5tYWduaXR1ZGVMaW1pdCA9IDUwO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY29uc3RCdWxsZXRUaW1lID0gNztcclxuICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SGVhbHRoID0gMTAwICogZW5lbXlCYXNlV2lkdGggLyA0NTtcclxuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xyXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLmhhbGZIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woNjAsIDEwMCUsIDUwJSknKTtcclxuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgbm9TdHJva2UoKTtcclxuICAgICAgICBsZXQgY3VycmVudENvbG9yID0gbnVsbDtcclxuICAgICAgICBsZXQgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcclxuICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgbWFwcGVkSGVhbHRoIC8gNTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtcclxuICAgICAgICAgICAgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLFxyXG4gICAgICAgICAgICBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSxcclxuICAgICAgICAgICAgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLFxyXG4gICAgICAgICAgICBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLFxyXG4gICAgICAgICAgICBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLFxyXG4gICAgICAgICAgICBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sXHJcbiAgICAgICAgICAgIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSxcclxuICAgICAgICAgICAgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLFxyXG4gICAgICAgICAgICBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sXHJcbiAgICAgICAgICAgIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1ICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSxcclxuICAgICAgICAgICAgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLFxyXG4gICAgICAgICAgICBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLFxyXG4gICAgICAgICAgICBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgYmVnaW5TaGFwZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xyXG4gICAgICAgIGVuZFNoYXBlKENMT1NFKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja0Fycml2YWwoKSB7XHJcbiAgICAgICAgbGV0IGRlc2lyZWQgPSBwNS5WZWN0b3Iuc3ViKHRoaXMucG9zaXRpb25Ub1JlYWNoLCB0aGlzLnBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgZGVzaXJlZE1hZyA9IGRlc2lyZWQubWFnKCk7XHJcbiAgICAgICAgaWYgKGRlc2lyZWRNYWcgPCB0aGlzLm1hZ25pdHVkZUxpbWl0KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXBwZWRTcGVlZCA9IG1hcChkZXNpcmVkTWFnLCAwLCA1MCwgMCwgdGhpcy5tYXhTcGVlZCk7XHJcbiAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKG1hcHBlZFNwZWVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXNpcmVkLnNldE1hZyh0aGlzLm1heFNwZWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdGVlcmluZyA9IHA1LlZlY3Rvci5zdWIoZGVzaXJlZCwgdGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgc3RlZXJpbmcubGltaXQodGhpcy5tYXhGb3JjZSk7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHN0ZWVyaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG9vdEJ1bGxldHMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPT09IHRoaXMuY29uc3RCdWxsZXRUaW1lKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xyXG4gICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQnVsbGV0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZYLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiA1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhc2VXaWR0aCAvIDUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEaXN0YW5jZShwbGF5ZXJQb3NpdGlvbikge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIDwgMClcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xyXG5cclxuICAgICAgICBsZXQgeFBvc2l0aW9uRGlzdGFuY2UgPSBhYnMocGxheWVyUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCk7XHJcbiAgICAgICAgaWYgKHhQb3NpdGlvbkRpc3RhbmNlIDwgMjAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvb3RCdWxsZXRzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSAtPSAoMSAqICg2MCAvIGZyYW1lUmF0ZSgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKSB7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggLT0gMjA7XHJcbiAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgMClcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XHJcblxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5LmxpbWl0KHRoaXMubWF4U3BlZWQpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIGNvbnRpbnVvdXMgYWNjZWxlcmF0aW9uIGl0cyBvbmx5IGluc3RhbnRhbmVvdXNcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5tYWcoKSA8PSAxKVxyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihcclxuICAgICAgICAgICAgICAgIHJhbmRvbSgwLCB3aWR0aCksXHJcbiAgICAgICAgICAgICAgICByYW5kb20oMCwgaGVpZ2h0IC8gMilcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWxsZXRzLmZvckVhY2goYnVsbGV0ID0+IHtcclxuICAgICAgICAgICAgYnVsbGV0LnNob3coKTtcclxuICAgICAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0ucG9zaXRpb24ueSA+IHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0ICsgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcclxuICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cclxuICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXHJcblxyXG4gICAgICAgIGxldCB4ID0gcG9pbnRbMF0sXHJcbiAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcclxuXHJcbiAgICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcclxuICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcclxuICAgICAgICAgICAgbGV0IHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcclxuICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbnRlcnNlY3QgPSAoKHlpID4geSkgIT0gKHlqID4geSkpICYmXHJcbiAgICAgICAgICAgICAgICAoeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGkpO1xyXG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGluc2lkZTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGlja3Vwcy5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NwYWNlLXNoaXAuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9lbmVteS5qc1wiIC8+XHJcblxyXG5jb25zdCBwaWNrdXBDb2xvcnMgPSBbMCwgMTIwLCAxNzVdO1xyXG5cclxubGV0IHNwYWNlU2hpcDtcclxubGV0IHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xyXG5sZXQgcGlja3VwcyA9IFtdO1xyXG5sZXQgZW5lbWllcyA9IFtdO1xyXG5sZXQgZXhwbG9zaW9ucyA9IFtdO1xyXG5cclxubGV0IGN1cnJlbnRMZXZlbENvdW50ID0gMTtcclxuY29uc3QgbWF4TGV2ZWxDb3VudCA9IDk7XHJcbmxldCB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XHJcbmxldCBidXR0b247XHJcbmxldCBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcclxuXHJcbmxldCBnYW1lU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxubGV0IGV4cGxvc2lvblNvdW5kO1xyXG5sZXQgYmFja2dyb3VuZFNvdW5kO1xyXG5sZXQgcG93ZXJVcFNvdW5kO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGV4cGxvc2lvblNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICAgIHNyYzogWydodHRwczovL2ZyZWVzb3VuZC5vcmcvZGF0YS9wcmV2aWV3cy8zODYvMzg2ODYyXzY4OTExMDItbHEubXAzJ10sXHJcbiAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgIHByZWxvYWQ6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIGJhY2tncm91bmRTb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICBzcmM6IFsnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzIxLzMyMTAwMl81MTIzODUxLWxxLm1wMyddLFxyXG4gICAgICAgIGF1dG9wbGF5OiB0cnVlLFxyXG4gICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgcHJlbG9hZDogdHJ1ZSxcclxuICAgICAgICB2b2x1bWU6IDAuMDVcclxuICAgIH0pO1xyXG5cclxuICAgIHBvd2VyVXBTb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICBzcmM6IFsnaHR0cHM6Ly9mcmVlc291bmQub3JnL2RhdGEvcHJldmlld3MvMzQ0LzM0NDMwN182MTk5NDE4LWxxLm1wMyddLFxyXG4gICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICBwcmVsb2FkOiB0cnVlXHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHNldHVwKCkge1xyXG4gICAgbGV0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMCk7XHJcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XHJcbiAgICBidXR0b24gPSBjcmVhdGVCdXR0b24oJ1JlcGxheSEnKTtcclxuICAgIGJ1dHRvbi5wb3NpdGlvbih3aWR0aCAvIDIgLSA2MiwgaGVpZ2h0IC8gMiArIDMwKTtcclxuICAgIGJ1dHRvbi5lbHQuY2xhc3NOYW1lID0gJ3B1bHNlJztcclxuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGJ1dHRvbi5tb3VzZVByZXNzZWQocmVzZXRHYW1lKTtcclxuXHJcbiAgICBzcGFjZVNoaXAgPSBuZXcgU3BhY2VTaGlwKCk7XHJcblxyXG4gICAgdGV4dEFsaWduKENFTlRFUik7XHJcbiAgICByZWN0TW9kZShDRU5URVIpO1xyXG4gICAgYW5nbGVNb2RlKERFR1JFRVMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgYmFja2dyb3VuZCgwKTtcclxuXHJcbiAgICBpZiAoa2V5SXNEb3duKDcxKSAmJiBrZXlJc0Rvd24oNzkpICYmIGtleUlzRG93big2OCkpXHJcbiAgICAgICAgc3BhY2VTaGlwLmFjdGl2YXRlR29kTW9kZSgpO1xyXG5cclxuICAgIGlmIChzcGFjZVNoaXAuaXNEZXN0cm95ZWQoKSkge1xyXG4gICAgICAgIGlmICghc3BhY2VTaGlwRGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChcclxuICAgICAgICAgICAgICAgIG5ldyBFeHBsb3Npb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VTaGlwLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VTaGlwLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VTaGlwLmJhc2VXaWR0aFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBleHBsb3Npb25Tb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZW1pZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgbmV3IEV4cGxvc2lvbihcclxuICAgICAgICAgICAgICAgICAgICBlbmVtaWVzW2ldLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5lbWllc1tpXS5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgICAgICAgICAgIChlbmVtaWVzW2ldLmJhc2VXaWR0aCAqIDcpIC8gNDVcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgZXhwbG9zaW9uU291bmQucGxheSgpO1xyXG4gICAgICAgICAgICBlbmVtaWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGV4dFNpemUoMjcpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xyXG4gICAgICAgIHRleHQoJ1lvdSBBcmUgRGVhZCcsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUmVwbGF5JztcclxuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzcGFjZVNoaXAuc2hvdygpO1xyXG4gICAgICAgIHNwYWNlU2hpcC51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSAmJiBrZXlJc0Rvd24oUklHSFRfQVJST1cpKSB7IC8qIERvIG5vdGhpbmcgKi8gfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSkge1xyXG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xyXG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdSSUdIVCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoa2V5SXNEb3duKDMyKSkge1xyXG4gICAgICAgICAgICBzcGFjZVNoaXAuc2hvb3RCdWxsZXRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVuZW1pZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBlbGVtZW50LnNob3coKTtcclxuICAgICAgICBlbGVtZW50LmNoZWNrQXJyaXZhbCgpO1xyXG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XHJcbiAgICAgICAgZWxlbWVudC5jaGVja1BsYXllckRpc3RhbmNlKHNwYWNlU2hpcC5wb3NpdGlvbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGxvc2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBleHBsb3Npb25zW2ldLnNob3coKTtcclxuICAgICAgICBleHBsb3Npb25zW2ldLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAoZXhwbG9zaW9uc1tpXS5leHBsb3Npb25Db21wbGV0ZSgpKSB7XHJcbiAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGlja3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBpY2t1cHNbaV0uc2hvdygpO1xyXG4gICAgICAgIHBpY2t1cHNbaV0udXBkYXRlKCk7XHJcblxyXG4gICAgICAgIGlmIChwaWNrdXBzW2ldLmlzT3V0T2ZTY3JlZW4oKSkge1xyXG4gICAgICAgICAgICBwaWNrdXBzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgaSAtPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwYWNlU2hpcC5idWxsZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBlbmVtaWVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIGlmIChzcGFjZVNoaXAuYnVsbGV0c1tpXSlcclxuICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLnBvaW50SXNJbnNpZGUoW3NwYWNlU2hpcC5idWxsZXRzW2ldLnBvc2l0aW9uLngsIHNwYWNlU2hpcC5idWxsZXRzW2ldLnBvc2l0aW9uLnldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmVteURlYWQgPSBlbmVtaWVzW2pdLnRha2VEYW1hZ2VBbmRDaGVja0RlYXRoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZW15RGVhZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb3Npb25zLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXhwbG9zaW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXNbal0ucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzW2pdLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVuZW1pZXNbal0uYmFzZVdpZHRoICogNykgLyA0NVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb3Npb25Tb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLmJhc2VXaWR0aCA+IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbmVteShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllc1tqXS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzW2pdLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXNbal0uYmFzZVdpZHRoIC8gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVuZW15KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzW2pdLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXNbal0ucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpY2t1cHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGlja3VwKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzW2pdLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXNbal0ucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlja3VwQ29sb3JzW2Zsb29yKHJhbmRvbSgpICogcGlja3VwQ29sb3JzLmxlbmd0aCldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGosIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5idWxsZXRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpID0gaSA9PT0gMCA/IDAgOiBpIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaWNrdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHNwYWNlU2hpcC5wb2ludElzSW5zaWRlKFtwaWNrdXBzW2ldLnBvc2l0aW9uLngsIHBpY2t1cHNbaV0ucG9zaXRpb24ueV0pKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xvclZhbHVlID0gcGlja3Vwc1tpXS5jb2xvclZhbHVlO1xyXG4gICAgICAgICAgICBzcGFjZVNoaXAuc2V0QnVsbGV0VHlwZShjb2xvclZhbHVlKTtcclxuICAgICAgICAgICAgcG93ZXJVcFNvdW5kLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICAgIHBpY2t1cHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5lbWllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZW5lbWllc1tpXS5idWxsZXRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIGlmIChlbmVtaWVzW2ldLmJ1bGxldHNbal0pXHJcbiAgICAgICAgICAgICAgICBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW2VuZW1pZXNbaV0uYnVsbGV0c1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2ldLmJ1bGxldHNbal0ucG9zaXRpb24ueV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VTaGlwLmRlY3JlYXNlSGVhbHRoKDIgKiBlbmVtaWVzW2ldLmJ1bGxldHNbal0uYmFzZVdpZHRoIC8gMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZW1pZXNbaV0uYnVsbGV0cy5zcGxpY2UoaiwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGogLT0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNwYWNlU2hpcC5Hb2RNb2RlKSB7XHJcbiAgICAgICAgdGV4dFNpemUoMjcpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHQoJ0dvZCBNb2RlJywgd2lkdGggLSA4MCwgaGVpZ2h0IC0gMzApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmVtaWVzLmxlbmd0aCA9PT0gMCAmJiAhc3BhY2VTaGlwRGVzdHJveWVkICYmIGdhbWVTdGFydGVkKSB7XHJcbiAgICAgICAgdGV4dFNpemUoMjcpO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIGlmIChjdXJyZW50TGV2ZWxDb3VudCA8PSBtYXhMZXZlbENvdW50KSB7XHJcbiAgICAgICAgICAgIHRleHQoYExvYWRpbmcgTGV2ZWwgJHtjdXJyZW50TGV2ZWxDb3VudH1gLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICBpZiAoIXRpbWVvdXRDYWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGluY3JlbWVudExldmVsLCAzMDAwKTtcclxuICAgICAgICAgICAgICAgIHRpbWVvdXRDYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGV4dFNpemUoMjcpO1xyXG4gICAgICAgICAgICBub1N0cm9rZSgpO1xyXG4gICAgICAgICAgICBmaWxsKDAsIDI1NSwgMCk7XHJcbiAgICAgICAgICAgIHRleHQoJ0NvbmdyYXR1bGF0aW9ucyB5b3Ugd29uIHRoZSBnYW1lISEhJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuMSkge1xyXG4gICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFeHBsb3Npb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgwLCB3aWR0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgwLCBoZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgMTApXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGV4cGxvc2lvblNvdW5kLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICBidXR0b24uZWx0LmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghZ2FtZVN0YXJ0ZWQpIHtcclxuICAgICAgICB0ZXh0U3R5bGUoQk9MRCk7XHJcbiAgICAgICAgdGV4dFNpemUoMzApO1xyXG4gICAgICAgIG5vU3Ryb2tlKCk7XHJcbiAgICAgICAgZmlsbChjb2xvcihgaHNsKCR7aW50KHJhbmRvbSgzNTkpKX0sIDEwMCUsIDUwJSlgKSk7XHJcbiAgICAgICAgdGV4dCgnU1BBQ0UgSU5WQURFUlMnLCB3aWR0aCAvIDIgKyAxMCwgaGVpZ2h0IC8gNCk7XHJcbiAgICAgICAgZmlsbCgyNTUpO1xyXG4gICAgICAgIHRleHQoJ0FSUk9XIEtFWVMgdG8gbW92ZSBhbmQgU1BBQ0UgdG8gZmlyZScsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMyk7XHJcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgYnV0dG9uLmVsdC5pbm5lclRleHQgPSAnUGxheSBHYW1lJztcclxuICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluY3JlbWVudExldmVsKCkge1xyXG4gICAgbGV0IGk7XHJcbiAgICBzd2l0Y2ggKGN1cnJlbnRMZXZlbENvdW50KSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBuZXcgRW5lbXkoXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSwgLTMwLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbSg0NSwgNzApXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDI7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFbmVteShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSwgLTMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oNDUsIDcwKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFbmVteShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSwgLTMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oNDUsIDcwKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBuZXcgRW5lbXkoXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSwgLTMwLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbSgxNTAsIDE3MClcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVuZW15KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLCAtMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgxNTAsIDE3MClcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVuZW15KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLCAtMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA1MDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVuZW15KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLCAtMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVuZW15KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oMCwgd2lkdGgpLCAtMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmRvbSgyMCwgMTcwKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFbmVteShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZG9tKDAsIHdpZHRoKSwgLTMwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5kb20oNzAsIDEyMClcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50TGV2ZWxDb3VudCA8PSBtYXhMZXZlbENvdW50KSB7XHJcbiAgICAgICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRMZXZlbENvdW50Kys7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0R2FtZSgpIHtcclxuICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICAgZW5lbWllcyA9IFtdO1xyXG4gICAgZXhwbG9zaW9ucyA9IFtdO1xyXG4gICAgc3BhY2VTaGlwLnJlc2V0KCk7XHJcblxyXG4gICAgY3VycmVudExldmVsQ291bnQgPSAxO1xyXG4gICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xyXG5cclxuICAgIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xyXG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgIGdhbWVTdGFydGVkID0gdHJ1ZTtcclxufSJdfQ==
