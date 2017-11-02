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
    spaceShip.GodMode = false;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnRpY2xlLmpzIiwiYnVsbGV0LmpzIiwiZXhwbG9zaW9uLmpzIiwic3BhY2Utc2hpcC5qcyIsImVuZW15LmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUGFydGljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUGFydGljbGUoeCwgeSwgY29sb3JOdW1iZXIsIG1heFN0cm9rZVdlaWdodCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFydGljbGUpO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3IoeCwgeSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBwNS5WZWN0b3IucmFuZG9tMkQoKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KHJhbmRvbSgwLCA3MCkpO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgICAgdGhpcy5jb2xvck51bWJlciA9IGNvbG9yTnVtYmVyO1xuICAgICAgICB0aGlzLm1heFN0cm9rZVdlaWdodCA9IG1heFN0cm9rZVdlaWdodDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFydGljbGUsIFt7XG4gICAgICAgIGtleTogXCJhcHBseUZvcmNlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhcHBseUZvcmNlKGZvcmNlKSB7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5hZGQoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIHZhciBjb2xvclZhbHVlID0gY29sb3IoXCJoc2xhKFwiICsgdGhpcy5jb2xvck51bWJlciArIFwiLCAxMDAlLCA1MCUsIFwiICsgdGhpcy5hbHBoYSArIFwiKVwiKTtcbiAgICAgICAgICAgIHZhciBtYXBwZWRTdHJva2VXZWlnaHQgPSBtYXAodGhpcy5hbHBoYSwgMCwgMSwgMCwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xuXG4gICAgICAgICAgICBzdHJva2VXZWlnaHQobWFwcGVkU3Ryb2tlV2VpZ2h0KTtcbiAgICAgICAgICAgIHN0cm9rZShjb2xvclZhbHVlKTtcbiAgICAgICAgICAgIHBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcblxuICAgICAgICAgICAgdGhpcy5hbHBoYSAtPSAwLjA1O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5Lm11bHQoMC41KTtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbi5tdWx0KDApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiaXNWaXNpYmxlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1Zpc2libGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA+IDA7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFydGljbGU7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnVsbGV0KHhQb3NpdGlvbiwgeVBvc2l0aW9uLCBzaXplLCBnb1VwKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCdWxsZXQpO1xuXG4gICAgICAgIHRoaXMuZ29VcCA9IGdvVXA7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBnb1VwID8gMTAgOiAtMTA7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gc2l6ZTtcbiAgICAgICAgdGhpcy5iYXNlSGVpZ2h0ID0gc2l6ZSAqIDI7XG5cbiAgICAgICAgdGhpcy54ID0geFBvc2l0aW9uO1xuICAgICAgICB0aGlzLnkgPSB5UG9zaXRpb247XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IDI1NTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQnVsbGV0LCBbe1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKCk7XG4gICAgICAgICAgICBmaWxsKHRoaXMuY29sb3IpO1xuXG4gICAgICAgICAgICByZWN0KHRoaXMueCwgdGhpcy55IC0gdGhpcy5iYXNlSGVpZ2h0LCB0aGlzLmJhc2VXaWR0aCwgdGhpcy5iYXNlSGVpZ2h0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdvVXApIHtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZSh0aGlzLnggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHRoaXMueSAtIHRoaXMuYmFzZUhlaWdodCwgdGhpcy54LCB0aGlzLnkgLSB0aGlzLmJhc2VIZWlnaHQgKiAyLCB0aGlzLnggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHRoaXMueSAtIHRoaXMuYmFzZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMueSAtPSB0aGlzLnNwZWVkICogKDYwIC8gZnJhbWVSYXRlKCkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEJ1bGxldDtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFydGljbGUuanNcIiAvPlxuXG52YXIgRXhwbG9zaW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEV4cGxvc2lvbihzcGF3blgsIHNwYXduWSwgbWF4U3Ryb2tlV2VpZ2h0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFeHBsb3Npb24pO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjcmVhdGVWZWN0b3Ioc3Bhd25YLCBzcGF3blkpO1xuICAgICAgICB0aGlzLmdyYXZpdHkgPSBjcmVhdGVWZWN0b3IoMCwgMC4yKTtcbiAgICAgICAgdGhpcy5tYXhTdHJva2VXZWlnaHQgPSBtYXhTdHJva2VXZWlnaHQ7XG5cbiAgICAgICAgdmFyIHJhbmRvbUNvbG9yID0gaW50KHJhbmRvbSgwLCAzNTkpKTtcbiAgICAgICAgdGhpcy5jb2xvciA9IHJhbmRvbUNvbG9yO1xuXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFeHBsb3Npb24sIFt7XG4gICAgICAgIGtleTogXCJleHBsb2RlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBleHBsb2RlKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDA7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5jb2xvciwgdGhpcy5tYXhTdHJva2VXZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24gKHBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGUuc2hvdygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5hcHBseUZvcmNlKHRoaXMuZ3Jhdml0eSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGFydGljbGVzW2ldLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImV4cGxvc2lvbkNvbXBsZXRlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBleHBsb3Npb25Db21wbGV0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDA7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRXhwbG9zaW9uO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNwYWNlU2hpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFjZVNoaXAoYm9keUNvbG9yKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTcGFjZVNoaXApO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBib2R5Q29sb3I7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gNzA7XG4gICAgICAgIHRoaXMuYmFzZUhlaWdodCA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVyV2lkdGggPSB0aGlzLmJhc2VXaWR0aCAvIDEwO1xuICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW107XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih3aWR0aCAvIDIsIGhlaWdodCAtIHRoaXMuYmFzZUhlaWdodCAtIDEwKTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnNwZWVkID0gMTU7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTAwO1xuXG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgdGhpcy5Hb2RNb2RlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNwYWNlU2hpcCwgW3tcbiAgICAgICAga2V5OiAnc2hvdycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGZpbGwodGhpcy5jb2xvcik7XG5cbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlUG9pbnRzID0gW1t4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMl0sIFt4ICsgdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDQsIHkgLSB0aGlzLmJhc2VIZWlnaHQgKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gNCwgeSAtIHRoaXMuYmFzZUhlaWdodCAqIDEuNV0sIFt4IC0gdGhpcy5zaG9vdGVyV2lkdGggLyAyLCB5IC0gdGhpcy5iYXNlSGVpZ2h0ICogMS41XV07XG5cbiAgICAgICAgICAgIGJlZ2luU2hhcGUoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZlcnRleCh0aGlzLnNoYXBlUG9pbnRzW2ldWzBdLCB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdKTtcbiAgICAgICAgICAgIH1lbmRTaGFwZShDTE9TRSk7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29sb3IgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDwgNTApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBsZXJwQ29sb3IodGhpcy56ZXJvSGVhbHRoQ29sb3IsIHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKHRoaXMuaGVhbHRoIC0gNTApIC8gNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbChjdXJyZW50Q29sb3IpO1xuICAgICAgICAgICAgcmVjdCh3aWR0aCAvIDIsIGhlaWdodCAtIDcsIHdpZHRoICogdGhpcy5oZWFsdGggLyAxMDAsIDEwKTtcblxuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbW92ZVNoaXAnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVNoaXAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZYID0gdGhpcy5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgdGhpcy5iYXNlV2lkdGggLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5iYXNlV2lkdGggLyAyICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPiB3aWR0aCAtIHRoaXMuYmFzZVdpZHRoIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHdpZHRoIC0gdGhpcy5iYXNlV2lkdGggLyAyIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3Rvcih3aWR0aCwgMCk7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnTEVGVCcpIHRoaXMudmVsb2NpdHkuc2V0TWFnKC10aGlzLnNwZWVkKTtlbHNlIHRoaXMudmVsb2NpdHkuc2V0TWFnKHRoaXMuc3BlZWQpO1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0aGlzLnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVjcmVhc2VIZWFsdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVjcmVhc2VIZWFsdGgoYW1vdW50KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuR29kTW9kZSkgdGhpcy5oZWFsdGggLT0gYW1vdW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhY3RpdmF0ZUdvZE1vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWN0aXZhdGVHb2RNb2RlKCkge1xuICAgICAgICAgICAgdGhpcy5Hb2RNb2RlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEZXN0cm95ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNEZXN0cm95ZWQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGVhbHRoID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb2ludElzSW5zaWRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvaW50SXNJbnNpZGUocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuXG4gICAgICAgICAgICB2YXIgeCA9IHBvaW50WzBdLFxuICAgICAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAtIDE7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4aSA9IHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlpID0gdGhpcy5zaGFwZVBvaW50c1tpXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgeGogPSB0aGlzLnNoYXBlUG9pbnRzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICB5aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKHhqIC0geGkpICogKHkgLSB5aSkgLyAoeWogLSB5aSkgKyB4aTtcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNwYWNlU2hpcDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2J1bGxldC5qc1wiIC8+XG5cbnZhciBFbmVteSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbmVteSh4UG9zaXRpb24sIHlQb3NpdGlvbiwgZW5lbXlCYXNlV2lkdGgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVuZW15KTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHhQb3NpdGlvbiwgeVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uVG9SZWFjaCA9IGNyZWF0ZVZlY3RvcihyYW5kb20oMCwgd2lkdGgpLCByYW5kb20oMCwgaGVpZ2h0IC8gMikpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsIDApO1xuICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGNyZWF0ZVZlY3RvcigwLCAwKTtcblxuICAgICAgICB0aGlzLm1heFNwZWVkID0gNTtcbiAgICAgICAgLy8gQWJpbGl0eSB0byB0dXJuXG4gICAgICAgIHRoaXMubWF4Rm9yY2UgPSA1O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSAyNTU7XG4gICAgICAgIHRoaXMuYmFzZVdpZHRoID0gZW5lbXlCYXNlV2lkdGg7XG4gICAgICAgIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiA9IHRoaXMuYmFzZVdpZHRoIC8gNTtcbiAgICAgICAgdGhpcy5zaG9vdGVySGVpZ2h0ID0gdGhpcy5iYXNlV2lkdGggKiAzIC8gMjA7XG4gICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbXTtcblxuICAgICAgICB0aGlzLm1hZ25pdHVkZUxpbWl0ID0gNTA7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbnN0QnVsbGV0VGltZSA9IDc7XG4gICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgPSB0aGlzLmNvbnN0QnVsbGV0VGltZTtcblxuICAgICAgICB0aGlzLm1heEhlYWx0aCA9IDEwMCAqIGVuZW15QmFzZVdpZHRoIC8gNDU7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gdGhpcy5tYXhIZWFsdGg7XG4gICAgICAgIHRoaXMuZnVsbEhlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgxMjAsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgdGhpcy5oYWxmSGVhbHRoQ29sb3IgPSBjb2xvcignaHNsKDYwLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIHRoaXMuemVyb0hlYWx0aENvbG9yID0gY29sb3IoJ2hzbCgwLCAxMDAlLCA1MCUpJyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVuZW15LCBbe1xuICAgICAgICBrZXk6ICdzaG93JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xvciA9IG51bGw7XG4gICAgICAgICAgICB2YXIgbWFwcGVkSGVhbHRoID0gbWFwKHRoaXMuaGVhbHRoLCAwLCB0aGlzLm1heEhlYWx0aCwgMCwgMTAwKTtcbiAgICAgICAgICAgIGlmIChtYXBwZWRIZWFsdGggPCA1MCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGxlcnBDb2xvcih0aGlzLnplcm9IZWFsdGhDb2xvciwgdGhpcy5oYWxmSGVhbHRoQ29sb3IsIG1hcHBlZEhlYWx0aCAvIDUwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbG9yID0gbGVycENvbG9yKHRoaXMuaGFsZkhlYWx0aENvbG9yLCB0aGlzLmZ1bGxIZWFsdGhDb2xvciwgKG1hcHBlZEhlYWx0aCAtIDUwKSAvIDUwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwoY3VycmVudENvbG9yKTtcblxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGVQb2ludHMgPSBbW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiwgeSAtIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uIC8gMl0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uLCB5IC0gdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIsIHkgLSB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCArIHRoaXMuYmFzZVdpZHRoIC8gMiAtIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNV0sIFt4ICsgdGhpcy5iYXNlV2lkdGggLyAyIC0gdGhpcy5iYXNlV2lkdGggLyA1IC0gdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggKyB0aGlzLmJhc2VXaWR0aCAvIDIgLSB0aGlzLmJhc2VXaWR0aCAvIDUgLSB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjUgKyB0aGlzLnNob290ZXJIZWlnaHRdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAqIDEuNSArIHRoaXMuc2hvb3RlckhlaWdodF0sIFt4IC0gdGhpcy5iYXNlV2lkdGggLyAyICsgdGhpcy5iYXNlV2lkdGggLyA1ICsgdGhpcy5iYXNlV2lkdGggLyA1LCB5ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogMS41XSwgW3ggLSB0aGlzLmJhc2VXaWR0aCAvIDIgKyB0aGlzLmJhc2VXaWR0aCAvIDUsIHkgKyB0aGlzLmdlbmVyYWxEaW1lbnNpb24gKiAxLjVdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiArIHRoaXMuYmFzZVdpZHRoIC8gNSwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdLCBbeCAtIHRoaXMuYmFzZVdpZHRoIC8gMiwgeSArIHRoaXMuZ2VuZXJhbERpbWVuc2lvbiAvIDJdXTtcblxuICAgICAgICAgICAgYmVnaW5TaGFwZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmVydGV4KHRoaXMuc2hhcGVQb2ludHNbaV1bMF0sIHRoaXMuc2hhcGVQb2ludHNbaV1bMV0pO1xuICAgICAgICAgICAgfWVuZFNoYXBlKENMT1NFKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tBcnJpdmFsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrQXJyaXZhbCgpIHtcbiAgICAgICAgICAgIHZhciBkZXNpcmVkID0gcDUuVmVjdG9yLnN1Yih0aGlzLnBvc2l0aW9uVG9SZWFjaCwgdGhpcy5wb3NpdGlvbik7XG4gICAgICAgICAgICB2YXIgZGVzaXJlZE1hZyA9IGRlc2lyZWQubWFnKCk7XG4gICAgICAgICAgICBpZiAoZGVzaXJlZE1hZyA8IHRoaXMubWFnbml0dWRlTGltaXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWFwcGVkU3BlZWQgPSBtYXAoZGVzaXJlZE1hZywgMCwgNTAsIDAsIHRoaXMubWF4U3BlZWQpO1xuICAgICAgICAgICAgICAgIGRlc2lyZWQuc2V0TWFnKG1hcHBlZFNwZWVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzaXJlZC5zZXRNYWcodGhpcy5tYXhTcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdGVlcmluZyA9IHA1LlZlY3Rvci5zdWIoZGVzaXJlZCwgdGhpcy52ZWxvY2l0eSk7XG4gICAgICAgICAgICBzdGVlcmluZy5saW1pdCh0aGlzLm1heEZvcmNlKTtcbiAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChzdGVlcmluZyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Nob290QnVsbGV0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG9vdEJ1bGxldHMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QnVsbGV0VGltZSA9PT0gdGhpcy5jb25zdEJ1bGxldFRpbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSByYW5kb20oKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjUpIHRoaXMuYnVsbGV0cy5wdXNoKG5ldyBCdWxsZXQodGhpcy5wcmV2WCwgdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5nZW5lcmFsRGltZW5zaW9uICogNSwgdGhpcy5iYXNlV2lkdGggLyA1LCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja1BsYXllckRpc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGxheWVyRGlzdGFuY2UocGxheWVyUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRCdWxsZXRUaW1lIDwgMCkgdGhpcy5jdXJyZW50QnVsbGV0VGltZSA9IHRoaXMuY29uc3RCdWxsZXRUaW1lO1xuXG4gICAgICAgICAgICB2YXIgeFBvc2l0aW9uRGlzdGFuY2UgPSBhYnMocGxheWVyUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCk7XG4gICAgICAgICAgICBpZiAoeFBvc2l0aW9uRGlzdGFuY2UgPCAyMDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob290QnVsbGV0cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRCdWxsZXRUaW1lID0gdGhpcy5jb25zdEJ1bGxldFRpbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEJ1bGxldFRpbWUgLT0gMSAqICg2MCAvIGZyYW1lUmF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndGFrZURhbWFnZUFuZENoZWNrRGVhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdGFrZURhbWFnZUFuZENoZWNrRGVhdGgoKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSAyMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8IDApIHJldHVybiB0cnVlO2Vsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2WCA9IHRoaXMucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS5saW1pdCh0aGlzLm1heFNwZWVkKTtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gY29udGludW91cyBhY2NlbGVyYXRpb24gaXRzIG9ubHkgaW5zdGFudGFuZW91c1xuICAgICAgICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmVsb2NpdHkubWFnKCkgPD0gMSkgdGhpcy5wb3NpdGlvblRvUmVhY2ggPSBjcmVhdGVWZWN0b3IocmFuZG9tKDAsIHdpZHRoKSwgcmFuZG9tKDAsIGhlaWdodCAvIDIpKTtcblxuICAgICAgICAgICAgdGhpcy5idWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xuICAgICAgICAgICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgICAgICAgICAgYnVsbGV0LnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1bGxldHNbaV0ueSA+IHRoaXMuYnVsbGV0c1tpXS5iYXNlSGVpZ2h0ICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BvaW50SXNJbnNpZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9pbnRJc0luc2lkZShwb2ludCkge1xuICAgICAgICAgICAgLy8gcmF5LWNhc3RpbmcgYWxnb3JpdGhtIGJhc2VkIG9uXG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbiAgICAgICAgICAgIHZhciB4ID0gcG9pbnRbMF0sXG4gICAgICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoIC0gMTsgaSA8IHRoaXMuc2hhcGVQb2ludHMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhpID0gdGhpcy5zaGFwZVBvaW50c1tpXVswXSxcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB0aGlzLnNoYXBlUG9pbnRzW2ldWzFdO1xuICAgICAgICAgICAgICAgIHZhciB4aiA9IHRoaXMuc2hhcGVQb2ludHNbal1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHlqID0gdGhpcy5zaGFwZVBvaW50c1tqXVsxXTtcblxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnNlY3QgPSB5aSA+IHkgIT0geWogPiB5ICYmIHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW5lbXk7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9idWxsZXQuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZXhwbG9zaW9uLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NwYWNlLXNoaXAuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZW5lbXkuanNcIiAvPlxuXG52YXIgc3BhY2VTaGlwID0gdm9pZCAwO1xudmFyIHNwYWNlU2hpcERlc3Ryb3llZCA9IGZhbHNlO1xudmFyIGJ1bGxldHMgPSBbXTtcbnZhciBlbmVtaWVzID0gW107XG52YXIgZXhwbG9zaW9ucyA9IFtdO1xudmFyIG1pbkZyYW1lV2FpdENvdW50ID0gNztcbnZhciB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG52YXIgY3VycmVudExldmVsQ291bnQgPSAxO1xudmFyIG1heExldmVsQ291bnQgPSA3O1xudmFyIHRpbWVvdXRDYWxsZWQgPSBmYWxzZTtcbnZhciBidXR0b24gPSB2b2lkIDA7XG52YXIgYnV0dG9uRGlzcGxheWVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAgIHZhciBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gMzApO1xuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcbiAgICBidXR0b24gPSBjcmVhdGVCdXR0b24oJ1JlcGxheSEnKTtcbiAgICBidXR0b24ucG9zaXRpb24od2lkdGggLyAyIC0gNjIsIGhlaWdodCAvIDIgKyAzMCk7XG4gICAgYnV0dG9uLmVsdC5jbGFzc05hbWUgPSAncHVsc2UnO1xuICAgIGJ1dHRvbi5lbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBidXR0b24ubW91c2VQcmVzc2VkKHJlc2V0R2FtZSk7XG5cbiAgICBzcGFjZVNoaXAgPSBuZXcgU3BhY2VTaGlwKDI1NSk7XG5cbiAgICB0ZXh0QWxpZ24oQ0VOVEVSKTtcbiAgICByZWN0TW9kZShDRU5URVIpO1xufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG4gICAgaWYgKCFrZXlJc0Rvd24oMzIpKSB3YWl0RnJhbWVDb3VudCA9IG1pbkZyYW1lV2FpdENvdW50O1xuXG4gICAgaWYgKGtleUlzRG93big3MSkgJiYga2V5SXNEb3duKDc5KSAmJiBrZXlJc0Rvd24oNjgpKSBzcGFjZVNoaXAuYWN0aXZhdGVHb2RNb2RlKCk7XG5cbiAgICBpZiAoc3BhY2VTaGlwLmlzRGVzdHJveWVkKCkpIHtcbiAgICAgICAgaWYgKCFzcGFjZVNoaXBEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHNwYWNlU2hpcC5wb3NpdGlvbi54LCBzcGFjZVNoaXAucG9zaXRpb24ueSwgc3BhY2VTaGlwLmJhc2VXaWR0aCkpO1xuICAgICAgICAgICAgc3BhY2VTaGlwRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oZW5lbWllc1tpXS5wb3NpdGlvbi54LCBlbmVtaWVzW2ldLnBvc2l0aW9uLnksIGVuZW1pZXNbaV0uYmFzZVdpZHRoICogNyAvIDQ1KSk7XG4gICAgICAgICAgICBlbmVtaWVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUsIDAsIDApO1xuICAgICAgICB0ZXh0KCdZb3UgQXJlIERlYWQnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICBpZiAoIWJ1dHRvbkRpc3BsYXllZCkge1xuICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIGJ1dHRvbkRpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZVNoaXAuc2hvdygpO1xuICAgICAgICBpZiAoa2V5SXNEb3duKExFRlRfQVJST1cpICYmIGtleUlzRG93bihSSUdIVF9BUlJPVykpIHsvKiBEbyBub3RoaW5nICovfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXlJc0Rvd24oTEVGVF9BUlJPVykpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAubW92ZVNoaXAoJ0xFRlQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5SXNEb3duKFJJR0hUX0FSUk9XKSkge1xuICAgICAgICAgICAgICAgIHNwYWNlU2hpcC5tb3ZlU2hpcCgnUklHSFQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXlJc0Rvd24oMzIpKSB7XG4gICAgICAgICAgICBpZiAod2FpdEZyYW1lQ291bnQgPT09IG1pbkZyYW1lV2FpdENvdW50KSBidWxsZXRzLnB1c2gobmV3IEJ1bGxldChzcGFjZVNoaXAucHJldlgsIGhlaWdodCAtIDIgKiBzcGFjZVNoaXAuYmFzZUhlaWdodCAtIDE1LCBzcGFjZVNoaXAuYmFzZVdpZHRoIC8gMTAsIHRydWUpKTtcbiAgICAgICAgICAgIHdhaXRGcmFtZUNvdW50IC09IDEgKiAoNjAgLyBmcmFtZVJhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdhaXRGcmFtZUNvdW50IDwgMCkgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIGJ1bGxldHMuZm9yRWFjaChmdW5jdGlvbiAoYnVsbGV0KSB7XG4gICAgICAgIGJ1bGxldC5zaG93KCk7XG4gICAgICAgIGJ1bGxldC51cGRhdGUoKTtcbiAgICB9KTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYnVsbGV0cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgaWYgKGJ1bGxldHNbX2ldLnkgPCAtYnVsbGV0c1tfaV0uYmFzZUhlaWdodCkge1xuICAgICAgICAgICAgYnVsbGV0cy5zcGxpY2UoX2ksIDEpO1xuICAgICAgICAgICAgX2kgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgZWxlbWVudC5jaGVja0Fycml2YWwoKTtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICAgICAgZWxlbWVudC5jaGVja1BsYXllckRpc3RhbmNlKHNwYWNlU2hpcC5wb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBleHBsb3Npb25zLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgZXhwbG9zaW9uc1tfaTJdLnNob3coKTtcbiAgICAgICAgZXhwbG9zaW9uc1tfaTJdLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChleHBsb3Npb25zW19pMl0uZXhwbG9zaW9uQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgZXhwbG9zaW9ucy5zcGxpY2UoX2kyLCAxKTtcbiAgICAgICAgICAgIF9pMiAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgYnVsbGV0cy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5lbWllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGVuZW1pZXNbal0ucG9pbnRJc0luc2lkZShbYnVsbGV0c1tfaTNdLngsIGJ1bGxldHNbX2kzXS55XSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW5lbXlEZWFkID0gZW5lbWllc1tqXS50YWtlRGFtYWdlQW5kQ2hlY2tEZWF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChlbmVteURlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9zaW9ucy5wdXNoKG5ldyBFeHBsb3Npb24oZW5lbWllc1tqXS5wb3NpdGlvbi54LCBlbmVtaWVzW2pdLnBvc2l0aW9uLnksIGVuZW1pZXNbal0uYmFzZVdpZHRoICogNyAvIDQ1KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzW2pdLmJhc2VXaWR0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShlbmVtaWVzW2pdLnBvc2l0aW9uLngsIGVuZW1pZXNbal0ucG9zaXRpb24ueSwgZW5lbWllc1tqXS5iYXNlV2lkdGggLyAyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KGVuZW1pZXNbal0ucG9zaXRpb24ueCwgZW5lbWllc1tqXS5wb3NpdGlvbi55LCBlbmVtaWVzW2pdLmJhc2VXaWR0aCAvIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ1bGxldHMuc3BsaWNlKF9pMywgMSk7XG4gICAgICAgICAgICAgICAgX2kzID0gX2kzID09PSAwID8gMCA6IF9pMyAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaTQgPSAwOyBfaTQgPCBlbmVtaWVzLmxlbmd0aDsgX2k0KyspIHtcbiAgICAgICAgZm9yICh2YXIgX2ogPSAwOyBfaiA8IGVuZW1pZXNbX2k0XS5idWxsZXRzLmxlbmd0aDsgX2orKykge1xuICAgICAgICAgICAgLy8gRml4TWU6IENoZWNrIGJ1bGxldCB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmIChlbmVtaWVzW19pNF0uYnVsbGV0c1tfal0pIGlmIChzcGFjZVNoaXAucG9pbnRJc0luc2lkZShbZW5lbWllc1tfaTRdLmJ1bGxldHNbX2pdLngsIGVuZW1pZXNbX2k0XS5idWxsZXRzW19qXS55XSkpIHtcbiAgICAgICAgICAgICAgICBzcGFjZVNoaXAuZGVjcmVhc2VIZWFsdGgoMiAqIGVuZW1pZXNbX2k0XS5idWxsZXRzW19qXS5iYXNlV2lkdGggLyAxMCk7XG4gICAgICAgICAgICAgICAgZW5lbWllc1tfaTRdLmJ1bGxldHMuc3BsaWNlKF9qLCAxKTtcblxuICAgICAgICAgICAgICAgIF9qIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3BhY2VTaGlwLkdvZE1vZGUpIHtcbiAgICAgICAgdGV4dFNpemUoMjcpO1xuICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICBmaWxsKDI1NSk7XG4gICAgICAgIHRleHQoJ0dvZCBNb2RlJywgd2lkdGggLSA4MCwgaGVpZ2h0IC0gMzApO1xuICAgIH1cblxuICAgIGlmIChlbmVtaWVzLmxlbmd0aCA9PT0gMCAmJiAhc3BhY2VTaGlwRGVzdHJveWVkKSB7XG4gICAgICAgIHRleHRTaXplKDI3KTtcbiAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgZmlsbCgyNTUpO1xuICAgICAgICBpZiAoY3VycmVudExldmVsQ291bnQgPD0gbWF4TGV2ZWxDb3VudCkge1xuICAgICAgICAgICAgdGV4dCgnTG9hZGluZyBMZXZlbCAnICsgY3VycmVudExldmVsQ291bnQsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICBpZiAoIXRpbWVvdXRDYWxsZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChpbmNyZW1lbnRMZXZlbCwgMzAwMCk7XG4gICAgICAgICAgICAgICAgdGltZW91dENhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0U2l6ZSgyNyk7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZmlsbCgwLCAyNTUsIDApO1xuICAgICAgICAgICAgdGV4dCgnQ29uZ3JhdHVsYXRpb25zIHlvdSB3b24gdGhlIGdhbWUhISEnLCB3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gcmFuZG9tKCk7XG4gICAgICAgICAgICBpZiAocmFuZG9tVmFsdWUgPCAwLjEpIGV4cGxvc2lvbnMucHVzaChuZXcgRXhwbG9zaW9uKHJhbmRvbSgwLCB3aWR0aCksIHJhbmRvbSgwLCBoZWlnaHQpLCByYW5kb20oMCwgMTApKSk7XG5cbiAgICAgICAgICAgIGlmICghYnV0dG9uRGlzcGxheWVkKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmVsdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBidXR0b25EaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbmNyZW1lbnRMZXZlbCgpIHtcbiAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICBzd2l0Y2ggKGN1cnJlbnRMZXZlbENvdW50KSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbmVtaWVzLnB1c2gobmV3IEVuZW15KHJhbmRvbSgwLCB3aWR0aCksIC0zMCwgcmFuZG9tKDQ1LCA3MCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oNDUsIDcwKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oMTUwLCAxNzApKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCByYW5kb20oMTUwLCAxNzApKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgICAgIGVuZW1pZXMucHVzaChuZXcgRW5lbXkocmFuZG9tKDAsIHdpZHRoKSwgLTMwLCAyMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA1MDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW5lbWllcy5wdXNoKG5ldyBFbmVteShyYW5kb20oMCwgd2lkdGgpLCAtMzAsIDIwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudExldmVsQ291bnQgPD0gbWF4TGV2ZWxDb3VudCkge1xuICAgICAgICB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIGN1cnJlbnRMZXZlbENvdW50Kys7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXNldEdhbWUoKSB7XG4gICAgc3BhY2VTaGlwRGVzdHJveWVkID0gZmFsc2U7XG4gICAgYnVsbGV0cyA9IFtdO1xuICAgIGVuZW1pZXMgPSBbXTtcbiAgICBleHBsb3Npb25zID0gW107XG4gICAgd2FpdEZyYW1lQ291bnQgPSBtaW5GcmFtZVdhaXRDb3VudDtcblxuICAgIGN1cnJlbnRMZXZlbENvdW50ID0gMTtcbiAgICBtYXhMZXZlbENvdW50ID0gNztcbiAgICB0aW1lb3V0Q2FsbGVkID0gZmFsc2U7XG5cbiAgICBidXR0b25EaXNwbGF5ZWQgPSBmYWxzZTtcbiAgICBidXR0b24uZWx0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgc3BhY2VTaGlwLkdvZE1vZGUgPSBmYWxzZTtcbn0iXX0=
