/// <reference path="./bullet.js" />

class Enemy {
    constructor(xPosition, yPosition, enemyBaseWidth) {
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

    show() {
        noStroke();
        let currentColor = null;
        let mappedHealth = map(this.health, 0, this.maxHealth, 0, 100);
        if (mappedHealth < 50) {
            currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, mappedHealth / 50);
        } else {
            currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (mappedHealth - 50) / 50);
        }
        fill(currentColor);

        let x = this.position.x;
        let y = this.position.y;
        this.shapePoints = [
            [x - this.baseWidth / 2, y - this.generalDimension * 1.5],
            [x - this.baseWidth / 2 + this.generalDimension, y - this.generalDimension * 1.5],
            [x - this.baseWidth / 2 + this.generalDimension, y - this.generalDimension / 2],
            [x + this.baseWidth / 2 - this.generalDimension, y - this.generalDimension / 2],
            [x + this.baseWidth / 2 - this.generalDimension, y - this.generalDimension * 1.5],
            [x + this.baseWidth / 2, y - this.generalDimension * 1.5],
            [x + this.baseWidth / 2, y + this.generalDimension / 2],
            [x + this.baseWidth / 2 - this.baseWidth / 5, y + this.generalDimension / 2],
            [x + this.baseWidth / 2 - this.baseWidth / 5, y + this.generalDimension * 1.5],
            [x + this.baseWidth / 2 - this.baseWidth / 5 - this.baseWidth / 5, y + this.generalDimension * 1.5],
            [x + this.baseWidth / 2 - this.baseWidth / 5 - this.baseWidth / 5, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x - this.baseWidth / 2 + this.baseWidth / 5 + this.baseWidth / 5, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x - this.baseWidth / 2 + this.baseWidth / 5 + this.baseWidth / 5, y + this.generalDimension * 1.5],
            [x - this.baseWidth / 2 + this.baseWidth / 5, y + this.generalDimension * 1.5],
            [x - this.baseWidth / 2 + this.baseWidth / 5, y + this.generalDimension / 2],
            [x - this.baseWidth / 2, y + this.generalDimension / 2]
        ];

        beginShape();
        for (let i = 0; i < this.shapePoints.length; i++)
            vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
        endShape(CLOSE);
    }

    checkArrival() {
        let desired = p5.Vector.sub(this.positionToReach, this.position);
        let desiredMag = desired.mag();
        if (desiredMag < this.magnitudeLimit) {
            let mappedSpeed = map(desiredMag, 0, 50, 0, this.maxSpeed);
            desired.setMag(mappedSpeed);
        } else {
            desired.setMag(this.maxSpeed);
        }

        let steering = p5.Vector.sub(desired, this.velocity);
        steering.limit(this.maxForce);
        this.acceleration.add(steering);
    }

    shootBullets() {
        if (this.currentBulletTime === this.constBulletTime) {
            let randomValue = random();
            if (randomValue < 0.5)
                this.bullets.push(
                    new Bullet(
                        this.prevX,
                        this.position.y + this.generalDimension * 5,
                        this.baseWidth / 5,
                        false
                    )
                );
        }
    }

    checkPlayerDistance(playerPosition) {
        if (this.currentBulletTime < 0)
            this.currentBulletTime = this.constBulletTime;

        let xPositionDistance = abs(playerPosition.x - this.position.x);
        if (xPositionDistance < 200) {
            this.shootBullets();
        } else {
            this.currentBulletTime = this.constBulletTime;
        }

        this.currentBulletTime -= (1 * (60 / frameRate()));
    }

    takeDamageAndCheckDeath() {
        this.health -= 20;
        if (this.health < 0)
            return true;
        else
            return false;
    }

    update() {
        this.prevX = this.position.x;

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        // There is no continuous acceleration its only instantaneous
        this.acceleration.mult(0);

        if (this.velocity.mag() <= 1)
            this.positionToReach = createVector(
                random(0, width),
                random(0, height / 2)
            );

        this.bullets.forEach(bullet => {
            bullet.show();
            bullet.update();
        });
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].y > this.bullets[i].baseHeight + height) {
                this.bullets.splice(i, 1);
                i -= 1;
            }
        }
    }

    pointIsInside(point) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        let x = point[0],
            y = point[1];

        let inside = false;
        for (let i = 0, j = this.shapePoints.length - 1; i < this.shapePoints.length; j = i++) {
            let xi = this.shapePoints[i][0],
                yi = this.shapePoints[i][1];
            let xj = this.shapePoints[j][0],
                yj = this.shapePoints[j][1];

            let intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
}