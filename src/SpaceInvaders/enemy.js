// TODO: Make something like golem from clash of clans. Where the ship breaks into two more
/// <reference path="./bullet.js" />

class Enemy {
    constructor(xPosition, positionToReachX, positionToReachY, spawnWidth) {
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

    show() {
        noStroke();
        fill(this.color);

        let x = this.position.x;
        let y = this.position.y;
        this.shapePoints = [
            [x - this.mainBase / 2, y - this.generalDimension * 1.5],
            [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension * 1.5],
            [x - this.mainBase / 2 + this.generalDimension, y - this.generalDimension / 2],
            [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension / 2],
            [x + this.mainBase / 2 - this.generalDimension, y - this.generalDimension * 1.5],
            [x + this.mainBase / 2, y - this.generalDimension * 1.5],
            [x + this.mainBase / 2, y + this.generalDimension / 2],
            [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension / 2],
            [x + this.mainBase / 2 - this.mainBase / 5, y + this.generalDimension * 1.5],
            [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5],
            [x + this.mainBase / 2 - this.mainBase / 5 - this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x - this.mainBase / 2 + this.mainBase / 5 + this.mainBase / 5, y + this.generalDimension * 1.5],
            [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension * 1.5],
            [x - this.mainBase / 2 + this.mainBase / 5, y + this.generalDimension / 2],
            [x - this.mainBase / 2, y + this.generalDimension / 2]
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
                        this.mainBase / 5,
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

    update() {
        this.prevX = this.position.x;

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        // There is no continuous acceleration its only instantaneous
        this.acceleration.set(0, 0);

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
            if (this.bullets[i].y < -this.bullets[i].baseHeight) {
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