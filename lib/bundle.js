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
    function Bullet(xPosition, yPosition, size, goUp) {
        _classCallCheck(this, Bullet);

        this.goUp = goUp;
        this.speed = goUp ? 10 : -10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

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
            if (this.goUp) {
                triangle(this.x - this.baseWidth / 2, this.y - this.baseHeight, this.x, this.y - this.baseHeight * 2, this.x + this.baseWidth / 2, this.y - this.baseHeight);
            }
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

        this.GodMode = false;
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
                if (this.bullets[i].y > this.bullets[i].baseHeight + height) {
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
/// <reference path="./space-ship.js" />
/// <reference path="./enemy.js" />

var spaceShip = void 0;
var spaceShipDestroyed = false;
var bullets = [];
var enemies = [];
var explosions = [];
var minFrameWaitCount = 7;
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
}

function draw() {
    background(0);
    if (!keyIsDown(32)) waitFrameCount = minFrameWaitCount;

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
    }
    if (waitFrameCount < 0) waitFrameCount = minFrameWaitCount;

    bullets.forEach(function (bullet) {
        bullet.show();
        bullet.update();
    });
    for (var _i = 0; _i < bullets.length; _i++) {
        if (bullets[_i].y < -bullets[_i].baseHeight) {
            bullets.splice(_i, 1);
            _i -= 1;
        }
    }

    enemies.forEach(function (element) {
        element.show();
        element.checkArrival();
        element.update();
        element.checkPlayerDistance(spaceShip.position);
    });

    for (var _i2 = 0; _i2 < explosions.length; _i2++) {
        explosions[_i2].show();
        explosions[_i2].update();

        if (explosions[_i2].explosionComplete()) {
            explosions.splice(_i2, 1);
            _i2 -= 1;
        }
    }

    for (var _i3 = 0; _i3 < bullets.length; _i3++) {
        for (var j = 0; j < enemies.length; j++) {
            if (enemies[j].pointIsInside([bullets[_i3].x, bullets[_i3].y])) {
                var enemyDead = enemies[j].takeDamageAndCheckDeath();
                if (enemyDead) {
                    explosions.push(new Explosion(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth * 7 / 45));
                    if (enemies[j].baseWidth > 100) {
                        enemies.push(new Enemy(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth / 2));
                        enemies.push(new Enemy(enemies[j].position.x, enemies[j].position.y, enemies[j].baseWidth / 2));
                    }

                    enemies.splice(j, 1);
                    j -= 1;
                }
                bullets.splice(_i3, 1);
                _i3 = _i3 === 0 ? 0 : _i3 - 1;
            }
        }
    }

    for (var _i4 = 0; _i4 < enemies.length; _i4++) {
        for (var _j = 0; _j < enemies[_i4].bullets.length; _j++) {
            // FixMe: Check bullet undefined
            if (enemies[_i4].bullets[_j]) if (spaceShip.pointIsInside([enemies[_i4].bullets[_j].x, enemies[_i4].bullets[_j].y])) {
                spaceShip.decreaseHealth(2 * enemies[_i4].bullets[_j].baseWidth / 10);
                enemies[_i4].bullets.splice(_j, 1);

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
            var randomValue = random();
            if (randomValue < 0.1) explosions.push(new Explosion(random(0, width), random(0, height), random(0, 10)));

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
    bullets = [];
    enemies = [];
    explosions = [];
    waitFrameCount = minFrameWaitCount;

    currentLevelCount = 1;
    maxLevelCount = 7;
    timeoutCalled = false;

    buttonDisplayed = false;
    button.elt.style.display = 'none';
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwic3BhY2Utc2hpcC5qcyIsImVuZW15LmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFBhcnRpY2xlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBhcnRpY2xlKHgsIHksIGNvbG9yTnVtYmVyLCBtYXhTdHJva2VXZWlnaHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcnRpY2xlKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcDUuVmVjdG9yLnJhbmRvbTJEKCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdChyYW5kb20oMCwgNzApKTtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICAgIHRoaXMuY29sb3JOdW1iZXIgPSBjb2xvck51bWJlcjtcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBhcnRpY2xlLCBbe1xuICAgICAgICBrZXk6IFwiYXBwbHlGb3JjZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYXBwbHlGb3JjZShmb3JjZSkge1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKGZvcmNlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICB2YXIgY29sb3JWYWx1ZSA9IGNvbG9yKFwiaHNsYShcIiArIHRoaXMuY29sb3JOdW1iZXIgKyBcIiwgMTAwJSwgNTAlLCBcIiArIHRoaXMuYWxwaGEgKyBcIilcIik7XG4gICAgICAgICAgICB2YXIgbWFwcGVkU3Ryb2tlV2VpZ2h0ID0gbWFwKHRoaXMuYWxwaGEsIDAsIDEsIDAsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcblxuICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0KG1hcHBlZFN0cm9rZVdlaWdodCk7XG4gICAgICAgICAgICBzdHJva2UoY29sb3JWYWx1ZSk7XG4gICAgICAgICAgICBwb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWxwaGEgLT0gMC4wNTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDAuNSk7XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlzVmlzaWJsZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNWaXNpYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEgPiAwO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBhcnRpY2xlO1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJ1bGxldCh4UG9zaXRpb24sIHlQb3NpdGlvbiwgc2l6ZSwgZ29VcCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQnVsbGV0KTtcblxuICAgICAgICB0aGlzLmdvVXAgPSBnb1VwO1xuICAgICAgICB0aGlzLnNwZWVkID0gZ29VcCA/IDEwIDogLTEwO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IHNpemU7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHNpemUgKiAyO1xuXG4gICAgICAgIHRoaXMueCA9IHhQb3NpdGlvbjtcbiAgICAgICAgdGhpcy55ID0geVBvc2l0aW9uO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEJ1bGxldCwgW3tcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCh0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgcmVjdCh0aGlzLngsIHRoaXMueSAtIHRoaXMuYmFzZUhlaWdodCwgdGhpcy5iYXNlV2lkdGgsIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICBpZiAodGhpcy5nb1VwKSB7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGUodGhpcy54IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmJhc2VIZWlnaHQsIHRoaXMueCwgdGhpcy55IC0gdGhpcy5iYXNlSGVpZ2h0ICogMiwgdGhpcy54ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmJhc2VIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5zcGVlZCAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCdWxsZXQ7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhcnRpY2xlLmpzXCIgLz5cblxudmFyIEV4cGxvc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFeHBsb3Npb24oc3Bhd25YLCBzcGF3blksIG1heFN0cm9rZVdlaWdodCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXhwbG9zaW9uKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHNwYXduWCwgc3Bhd25ZKTtcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gY3JlYXRlVmVjdG9yKDAsIDAuMik7XG4gICAgICAgIHRoaXMubWF4U3Ryb2tlV2VpZ2h0ID0gbWF4U3Ryb2tlV2VpZ2h0O1xuXG4gICAgICAgIHZhciByYW5kb21Db2xvciA9IGludChyYW5kb20oMCwgMzU5KSk7XG4gICAgICAgIHRoaXMuY29sb3IgPSByYW5kb21Db2xvcjtcblxuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRXhwbG9zaW9uLCBbe1xuICAgICAgICBrZXk6IFwiZXhwbG9kZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXhwbG9kZSgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFydGljbGUgPSBuZXcgUGFydGljbGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuY29sb3IsIHRoaXMubWF4U3Ryb2tlV2VpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uYXBwbHlGb3JjZSh0aGlzLmdyYXZpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2xlc1tpXS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJleHBsb3Npb25Db21wbGV0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXhwbG9zaW9uQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEV4cGxvc2lvbjtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTcGFjZVNoaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3BhY2VTaGlwKGJvZHlDb2xvcikge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3BhY2VTaGlwKTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gYm9keUNvbG9yO1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IDcwO1xuICAgICAgICB0aGlzLmJhc2VIZWlnaHQgPSB0aGlzLmJhc2VXaWR0aCAvIDU7XG4gICAgICAgIHRoaXMuc2hvb3RlcldpZHRoID0gdGhpcy5iYXNlV2lkdGggLyAxMDtcbiAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtdO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Iod2lkdGggLyAyLCBoZWlnaHQgLSB0aGlzLmJhc2VIZWlnaHQgLSAxMCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IDE1O1xuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwMDtcblxuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuXG4gICAgICAgIHRoaXMuR29kTW9kZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTcGFjZVNoaXAsIFt7XG4gICAgICAgIGtleTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgICAgICAgdGhpcy5zaGFwZVBvaW50cyA9IFtbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDJdLCBbeCArIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyA0LCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCAtIHRoaXMuc2hvb3RlcldpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV1dO1xuXG4gICAgICAgICAgICBiZWdpblNoYXBlKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgodGhpcy5zaGFwZVBvaW50c1tpXVswXSwgdGhpcy5zaGFwZVBvaW50c1tpXVsxXSk7XG4gICAgICAgICAgICB9ZW5kU2hhcGUoQ0xPU0UpO1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudENvbG9yID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDUwKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuemVyb0hlYWx0aENvbG9yLCB0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5oZWFsdGggLyA1MCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsICh0aGlzLmhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcbiAgICAgICAgICAgIHJlY3Qod2lkdGggLyAyLCBoZWlnaHQgLSA3LCB3aWR0aCAqIHRoaXMuaGVhbHRoIC8gMTAwLCAxMCk7XG5cbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21vdmVTaGlwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVTaGlwKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA8IHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuYmFzZVdpZHRoIC8gMiArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54ID4gd2lkdGggLSB0aGlzLmJhc2VXaWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMiAtIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3Iod2lkdGgsIDApO1xuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ0xFRlQnKSB0aGlzLnZlbG9jaXR5LnNldE1hZygtdGhpcy5zcGVlZCk7ZWxzZSB0aGlzLnZlbG9jaXR5LnNldE1hZyh0aGlzLnNwZWVkKTtcblxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlY3JlYXNlSGVhbHRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlY3JlYXNlSGVhbHRoKGFtb3VudCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLkdvZE1vZGUpIHRoaXMuaGVhbHRoIC09IGFtb3VudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWN0aXZhdGVHb2RNb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFjdGl2YXRlR29kTW9kZSgpIHtcbiAgICAgICAgICAgIHRoaXMuR29kTW9kZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRGVzdHJveWVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRGVzdHJveWVkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWx0aCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9pbnRJc0luc2lkZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb2ludElzSW5zaWRlKHBvaW50KSB7XG4gICAgICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuICAgICAgICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggLSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeGkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHhqID0gdGhpcy5zaGFwZVBvaW50c1tqXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdCA9IHlpID4geSAhPSB5aiA+IHkgJiYgeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTcGFjZVNoaXA7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuXG52YXIgRW5lbXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW5lbXkoeFBvc2l0aW9uLCB5UG9zaXRpb24sIGVuZW15QmFzZVdpZHRoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbmVteSk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih4UG9zaXRpb24sIHlQb3NpdGlvbik7XG4gICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24gPSBjcmVhdGVWZWN0b3IoMCwgMCk7XG5cbiAgICAgICAgdGhpcy5tYXhTcGVlZCA9IDU7XG4gICAgICAgIC8vIEFiaWxpdHkgdG8gdHVyblxuICAgICAgICB0aGlzLm1heEZvcmNlID0gNTtcblxuICAgICAgICB0aGlzLmNvbG9yID0gMjU1O1xuICAgICAgICB0aGlzLmJhc2VXaWR0aCA9IGVuZW15QmFzZVdpZHRoO1xuICAgICAgICB0aGlzLmdlbmVyYWxEaW1lbnNpb24gPSB0aGlzLmJhc2VXaWR0aCAvIDU7XG4gICAgICAgIHRoaXMuc2hvb3RlckhlaWdodCA9IHRoaXMuYmFzZVdpZHRoICogMyAvIDIwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5tYWduaXR1ZGVMaW1pdCA9IDUwO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25zdEJ1bGxldFRpbWUgPSA3O1xuICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG5cbiAgICAgICAgdGhpcy5tYXhIZWFsdGggPSAxMDAgKiBlbmVteUJhc2VXaWR0aCAvIDQ1O1xuICAgICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xuICAgICAgICB0aGlzLmZ1bGxIZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMTIwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuaGFsZkhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCg2MCwgMTAwJSwgNTAlKScpO1xuICAgICAgICB0aGlzLnplcm9IZWFsdGhDb2xvciA9IGNvbG9yKCdoc2woMCwgMTAwJSwgNTAlKScpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFbmVteSwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgdmFyIG1hcHBlZEhlYWx0aCA9IG1hcCh0aGlzLmhlYWx0aCwgMCwgdGhpcy5tYXhIZWFsdGgsIDAsIDEwMCk7XG4gICAgICAgICAgICBpZiAobWFwcGVkSGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCBtYXBwZWRIZWFsdGggLyA1MCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLmhhbGZIZWFsdGhDb2xvciwgdGhpcy5mdWxsSGVhbHRoQ29sb3IsIChtYXBwZWRIZWFsdGggLSA1MCkgLyA1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxsKGN1cnJlbnRDb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24sIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41ICsgdGhpcy5zaG9vdGVySGVpZ2h0XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gLyAyXV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrQXJyaXZhbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0Fycml2YWwoKSB7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZCA9IHA1LlZlY3Rvci5zdWIodGhpcy5wb3NpdGlvblRvUmVhY2gsIHRoaXMucG9zaXRpb24pO1xuICAgICAgICAgICAgdmFyIGRlc2lyZWRNYWcgPSBkZXNpcmVkLm1hZygpO1xuICAgICAgICAgICAgaWYgKGRlc2lyZWRNYWcgPCB0aGlzLm1hZ25pdHVkZUxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNwZWVkID0gbWFwKGRlc2lyZWRNYWcsIDAsIDUwLCAwLCB0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgICAgICBkZXNpcmVkLnNldE1hZyhtYXBwZWRTcGVlZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3RlZXJpbmcgPSBwNS5WZWN0b3Iuc3ViKGRlc2lyZWQsIHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgc3RlZXJpbmcubGltaXQodGhpcy5tYXhGb3JjZSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoc3RlZXJpbmcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzaG9vdEJ1bGxldHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvb3RCdWxsZXRzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPT09IHRoaXMuY29uc3RCdWxsZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC41KSB0aGlzLmJ1bGxldHMucHVzaChuZXcgQnVsbGV0KHRoaXMucHJldlgsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDUsIHRoaXMuYmFzZVdpZHRoIC8gNSwgZmFsc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tQbGF5ZXJEaXN0YW5jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja1BsYXllckRpc3RhbmNlKHBsYXllclBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QnVsbGV0VGltZSA8IDApIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcblxuICAgICAgICAgICAgdmFyIHhQb3NpdGlvbkRpc3RhbmNlID0gYWJzKHBsYXllclBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngpO1xuICAgICAgICAgICAgaWYgKHhQb3NpdGlvbkRpc3RhbmNlIDwgMjAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG9vdEJ1bGxldHMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Rha2VEYW1hZ2VBbmRDaGVja0RlYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRha2VEYW1hZ2VBbmRDaGVja0RlYXRoKCkge1xuICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gMjA7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPCAwKSByZXR1cm4gdHJ1ZTtlbHNlIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMucHJldlggPSB0aGlzLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkubGltaXQodGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIGNvbnRpbnVvdXMgYWNjZWxlcmF0aW9uIGl0cyBvbmx5IGluc3RhbnRhbmVvdXNcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZlbG9jaXR5Lm1hZygpIDw9IDEpIHRoaXMucG9zaXRpb25Ub1JlYWNoID0gY3JlYXRlVmVjdG9yKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQgLyAyKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uIChidWxsZXQpIHtcbiAgICAgICAgICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWxsZXRzW2ldLnkgPiB0aGlzLmJ1bGxldHNbaV0uYmFzZUhlaWdodCArIGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1bGxldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVuZW15O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYnVsbGV0LmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cGxvc2lvbi5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zcGFjZS1zaGlwLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2VuZW15LmpzXCIgLz5cblxudmFyIHNwYWNlU2hpcCA9IHZvaWQgMDtcbnZhciBzcGFjZVNoaXBEZXN0cm95ZWQgPSBmYWxzZTtcbnZhciBidWxsZXRzID0gW107XG52YXIgZW5lbWllcyA9IFtdO1xudmFyIGV4cGxvc2lvbnMgPSBbXTtcbnZhciBtaW5GcmFtZVdhaXRDb3VudCA9IDc7XG52YXIgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxudmFyIGN1cnJlbnRMZXZlbENvdW50ID0gMTtcbnZhciBtYXhMZXZlbENvdW50ID0gNztcbnZhciB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG52YXIgYnV0dG9uID0gdm9pZCAwO1xudmFyIGJ1dHRvbkRpc3BsYXllZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB2YXIgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIDMwKTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG4gICAgYnV0dG9uID0gY3JlYXRlQnV0dG9uKCdSZXBsYXkhJyk7XG4gICAgYnV0dG9uLnBvc2l0aW9uKHdpZHRoIC8gMiAtIDYyLCBoZWlnaHQgLyAyICsgMzApO1xuICAgIGJ1dHRvbi5lbHQuY2xhc3NOYW1lID0gJ3B1bHNlJztcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgYnV0dG9uLm1vdXNlUHJlc3NlZChyZXNldEdhbWUpO1xuXG4gICAgc3BhY2VTaGlwID0gbmV3IFNwYWNlU2hpcCgyNTUpO1xuXG4gICAgdGV4dEFsaWduKENFTlRFUik7XG4gICAgcmVjdE1vZGUoQ0VOVEVSKTtcbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIGlmICgha2V5SXNEb3duKDMyKSkgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIGlmIChrZXlJc0Rvd24oNzEpICYmIGtleUlzRG93big3OSkgJiYga2V5SXNEb3duKDY4KSkgc3BhY2VTaGlwLmFjdGl2YXRlR29kTW9kZSgpO1xuXG4gICAgaWYgKHNwYWNlU2hpcC5pc0Rlc3Ryb3llZCgpKSB7XG4gICAgICAgIGlmICghc3BhY2VTaGlwRGVzdHJveWVkKSB7XG4gICAgICAgICAgICBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihzcGFjZVNoaXAucG9zaXRpb24ueCwgc3BhY2VTaGlwLnBvc2l0aW9uLnksIHNwYWNlU2hpcC5iYXNlV2lkdGgpKTtcbiAgICAgICAgICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGVuZW1pZXNbaV0ucG9zaXRpb24ueCwgZW5lbWllc1tpXS5wb3NpdGlvbi55LCBlbmVtaWVzW2ldLmJhc2VXaWR0aCAqIDcgLyA0NSkpO1xuICAgICAgICAgICAgZW5lbWllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1LCAwLCAwKTtcbiAgICAgICAgdGV4dCgnWW91IEFyZSBEZWFkJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKCFidXR0b25EaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBidXR0b25EaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BhY2VTaGlwLnNob3coKTtcbiAgICAgICAgaWYgKGtleUlzRG93bihMRUZUX0FSUk9XKSAmJiBrZXlJc0Rvd24oUklHSFRfQVJST1cpKSB7LyogRG8gbm90aGluZyAqL30gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLm1vdmVTaGlwKCdMRUZUJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleUlzRG93bihSSUdIVF9BUlJPVykpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAubW92ZVNoaXAoJ1JJR0hUJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5SXNEb3duKDMyKSkge1xuICAgICAgICAgICAgaWYgKHdhaXRGcmFtZUNvdW50ID09PSBtaW5GcmFtZVdhaXRDb3VudCkgYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQoc3BhY2VTaGlwLnByZXZYLCBoZWlnaHQgLSAyICogc3BhY2VTaGlwLmJhc2VIZWlnaHQgLSAxNSwgc3BhY2VTaGlwLmJhc2VXaWR0aCAvIDEwLCB0cnVlKSk7XG4gICAgICAgICAgICB3YWl0RnJhbWVDb3VudCAtPSAxICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh3YWl0RnJhbWVDb3VudCA8IDApIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBidWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICBidWxsZXQuc2hvdygpO1xuICAgICAgICBidWxsZXQudXBkYXRlKCk7XG4gICAgfSk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGJ1bGxldHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGlmIChidWxsZXRzW19pXS55IDwgLWJ1bGxldHNbX2ldLmJhc2VIZWlnaHQpIHtcbiAgICAgICAgICAgIGJ1bGxldHMuc3BsaWNlKF9pLCAxKTtcbiAgICAgICAgICAgIF9pIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tBcnJpdmFsKCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tQbGF5ZXJEaXN0YW5jZShzcGFjZVNoaXAucG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgZXhwbG9zaW9ucy5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIGV4cGxvc2lvbnNbX2kyXS5zaG93KCk7XG4gICAgICAgIGV4cGxvc2lvbnNbX2kyXS51cGRhdGUoKTtcblxuICAgICAgICBpZiAoZXhwbG9zaW9uc1tfaTJdLmV4cGxvc2lvbkNvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMuc3BsaWNlKF9pMiwgMSk7XG4gICAgICAgICAgICBfaTIgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pMyA9IDA7IF9pMyA8IGJ1bGxldHMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVuZW1pZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLnBvaW50SXNJbnNpZGUoW2J1bGxldHNbX2kzXS54LCBidWxsZXRzW19pM10ueV0pKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuZW15RGVhZCA9IGVuZW1pZXNbal0udGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5lbXlEZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAqIDcgLyA0NSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllc1tqXS5iYXNlV2lkdGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkoZW5lbWllc1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2pdLnBvc2l0aW9uLnksIGVuZW1pZXNbal0uYmFzZVdpZHRoIC8gMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBidWxsZXRzLnNwbGljZShfaTMsIDEpO1xuICAgICAgICAgICAgICAgIF9pMyA9IF9pMyA9PT0gMCA/IDAgOiBfaTMgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2k0ID0gMDsgX2k0IDwgZW5lbWllcy5sZW5ndGg7IF9pNCsrKSB7XG4gICAgICAgIGZvciAodmFyIF9qID0gMDsgX2ogPCBlbmVtaWVzW19pNF0uYnVsbGV0cy5sZW5ndGg7IF9qKyspIHtcbiAgICAgICAgICAgIC8vIEZpeE1lOiBDaGVjayBidWxsZXQgdW5kZWZpbmVkXG4gICAgICAgICAgICBpZiAoZW5lbWllc1tfaTRdLmJ1bGxldHNbX2pdKSBpZiAoc3BhY2VTaGlwLnBvaW50SXNJbnNpZGUoW2VuZW1pZXNbX2k0XS5idWxsZXRzW19qXS54LCBlbmVtaWVzW19pNF0uYnVsbGV0c1tfal0ueV0pKSB7XG4gICAgICAgICAgICAgICAgc3BhY2VTaGlwLmRlY3JlYXNlSGVhbHRoKDIgKiBlbmVtaWVzW19pNF0uYnVsbGV0c1tfal0uYmFzZVdpZHRoIC8gMTApO1xuICAgICAgICAgICAgICAgIGVuZW1pZXNbX2k0XS5idWxsZXRzLnNwbGljZShfaiwgMSk7XG5cbiAgICAgICAgICAgICAgICBfaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNwYWNlU2hpcC5Hb2RNb2RlKSB7XG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICB0ZXh0KCdHb2QgTW9kZScsIHdpZHRoIC0gODAsIGhlaWdodCAtIDMwKTtcbiAgICB9XG5cbiAgICBpZiAoZW5lbWllcy5sZW5ndGggPT09IDAgJiYgIXNwYWNlU2hpcERlc3Ryb3llZCkge1xuICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgIGZpbGwoMjU1KTtcbiAgICAgICAgaWYgKGN1cnJlbnRMZXZlbENvdW50IDw9IG1heExldmVsQ291bnQpIHtcbiAgICAgICAgICAgIHRleHQoJ0xvYWRpbmcgTGV2ZWwgJyArIGN1cnJlbnRMZXZlbENvdW50LCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0Q2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoaW5jcmVtZW50TGV2ZWwsIDMwMDApO1xuICAgICAgICAgICAgICAgIHRpbWVvdXRDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwoMCwgMjU1LCAwKTtcbiAgICAgICAgICAgIHRleHQoJ0NvbmdyYXR1bGF0aW9ucyB5b3Ugd29uIHRoZSBnYW1lISEhJywgd2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIHZhciByYW5kb21WYWx1ZSA9IHJhbmRvbSgpO1xuICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC4xKSBleHBsb3Npb25zLnB1c2gobmV3IEV4cGxvc2lvbihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0KSwgcmFuZG9tKDAsIDEwKSkpO1xuXG4gICAgICAgICAgICBpZiAoIWJ1dHRvbkRpc3BsYXllZCkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgYnV0dG9uRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5jcmVtZW50TGV2ZWwoKSB7XG4gICAgdmFyIGkgPSB2b2lkIDA7XG4gICAgc3dpdGNoIChjdXJyZW50TGV2ZWxDb3VudCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIHJhbmRvbSg0NSwgNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDE1MCwgMTcwKSkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDE1MCwgMTcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgMjApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNTA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCAyMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRMZXZlbENvdW50IDw9IG1heExldmVsQ291bnQpIHtcbiAgICAgICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50TGV2ZWxDb3VudCsrO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVzZXRHYW1lKCkge1xuICAgIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xuICAgIGJ1bGxldHMgPSBbXTtcbiAgICBlbmVtaWVzID0gW107XG4gICAgZXhwbG9zaW9ucyA9IFtdO1xuICAgIHdhaXRGcmFtZUNvdW50ID0gbWluRnJhbWVXYWl0Q291bnQ7XG5cbiAgICBjdXJyZW50TGV2ZWxDb3VudCA9IDE7XG4gICAgbWF4TGV2ZWxDb3VudCA9IDc7XG4gICAgdGltZW91dENhbGxlZCA9IGZhbHNlO1xuXG4gICAgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG4gICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufSJdfQ==
