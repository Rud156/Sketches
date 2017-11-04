/// <reference path="./bullet.js" />

class SpaceShip {
    constructor() {
        this.baseWidth = 70;
        this.baseHeight = this.baseWidth / 5;
        this.shooterWidth = this.baseWidth / 10;
        this.shapePoints = [];

        this.bullets = [];
        this.minFrameWaitCount = 7;
        this.waitFrameCount = this.minFrameWaitCount

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

    show() {
        noStroke();
        let bodyColor = lerpColor(this.zeroHealthColor, this.spaceShipColor, this.health / 100);
        fill(bodyColor);

        let x = this.position.x;
        let y = this.position.y;
        this.shapePoints = [
            [x - this.shooterWidth / 2, y - this.baseHeight * 2],
            [x + this.shooterWidth / 2, y - this.baseHeight * 2],
            [x + this.shooterWidth / 2, y - this.baseHeight * 1.5],
            [x + this.baseWidth / 4, y - this.baseHeight * 1.5],
            [x + this.baseWidth / 4, y - this.baseHeight / 2],
            [x + this.baseWidth / 2, y - this.baseHeight / 2],
            [x + this.baseWidth / 2, y + this.baseHeight / 2],
            [x - this.baseWidth / 2, y + this.baseHeight / 2],
            [x - this.baseWidth / 2, y - this.baseHeight / 2],
            [x - this.baseWidth / 4, y - this.baseHeight / 2],
            [x - this.baseWidth / 4, y - this.baseHeight * 1.5],
            [x - this.shooterWidth / 2, y - this.baseHeight * 1.5]
        ];

        beginShape();
        for (let i = 0; i < this.shapePoints.length; i++)
            vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
        endShape(CLOSE);

        let currentColor = null;
        if (this.health < 50) {
            currentColor = lerpColor(this.zeroHealthColor, this.halfHealthColor, this.health / 50);
        } else {
            currentColor = lerpColor(this.halfHealthColor, this.fullHealthColor, (this.health - 50) / 50);
        }
        fill(currentColor);
        rect(width / 2, height - 7, width * this.health / 100, 10);
    }

    update() {
        if (!keyIsDown(32))
            this.waitFrameCount = this.minFrameWaitCount;

        if (this.waitFrameCount < 0)
            this.waitFrameCount = this.minFrameWaitCount;

        this.bullets.forEach(bullet => {
            bullet.show();
            bullet.update();
        });
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].position.y < -this.bullets[i].baseHeight ||
                this.bullets[i].position.x < -this.bullets[i].baseHeight ||
                this.bullets[i].position.x > width + this.bullets[i].baseHeight) {
                this.bullets.splice(i, 1);
                i -= 1;
            }
        }
    }

    moveShip(direction) {

        if (this.position.x < this.baseWidth / 2) {
            this.position.x = this.baseWidth / 2 + 1;
        }
        if (this.position.x > width - this.baseWidth / 2) {
            this.position.x = width - this.baseWidth / 2 - 1;
        }

        this.velocity = createVector(width, 0);
        if (direction === 'LEFT')
            this.velocity.setMag(-this.speed);
        else
            this.velocity.setMag(this.speed);


        this.position.add(this.velocity);
    }

    setBulletType(colorValue) {
        this.bulletColor = colorValue;
    }

    getBulletType() {
        switch (this.bulletColor) {
            case 0:
                return [
                    new Bullet(
                        this.position.x,
                        this.position.y - this.baseHeight * 1.5,
                        this.baseWidth / 10,
                        true,
                        this.bulletColor
                    )
                ];
                break;
            case 120:
                return [
                    new Bullet(
                        this.position.x - this.shooterWidth,
                        this.position.y - this.baseHeight * 1.5,
                        this.baseWidth / 10,
                        true,
                        this.bulletColor
                    ),
                    new Bullet(
                        this.position.x + this.shooterWidth,
                        this.position.y - this.baseHeight * 1.5,
                        this.baseWidth / 10,
                        true,
                        this.bulletColor
                    ),
                ]
                break;
            default:
                let array = [];
                for (let i = 0; i < 80; i += 10) {
                    array.push(
                        new Bullet(
                            this.position.x,
                            this.position.y - this.baseHeight * 1.5,
                            this.baseWidth / 10,
                            true,
                            this.bulletColor, -40 + i
                        )
                    );
                }
                return array;
                break;
        }
    }

    shootBullets() {
        if (this.waitFrameCount === this.minFrameWaitCount) {
            this.bullets.push(...this.getBulletType());
        }
        this.waitFrameCount -= (1 * (60 / frameRate()));
    }

    decreaseHealth(amount) {
        if (!this.GodMode)
            this.health -= amount;
    }

    activateGodMode() {
        this.GodMode = true;
    }

    isDestroyed() {
        if (this.health <= 0) {
            this.health = 0;
            return true;
        } else {
            return false;
        }
    }

    reset() {
        this.bullets = [];
        this.waitFrameCount = this.minFrameWaitCount;
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