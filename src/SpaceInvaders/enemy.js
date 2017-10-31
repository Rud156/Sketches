// TODO: Make something like golem from clash of clans. Where the ship breaks into two more

class Enemy {
    constructor(xPosition, positionToReachX, positionToReachY) {
        this.position = createVector(xPosition, -30);

        this.positionToReach = createVector(positionToReachX, positionToReachY);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.maxSpeed = 5;
        // Ability to turn
        this.maxForce = 5;

        this.color = 255;
        this.mainBase = 70;
        this.generalDimension = 20;
        this.shooterWidth = 10;
        this.shooterHeight = 15;
        this.shapePoints = [];

        this.magnitudeLimit = 50;
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
            [x + this.mainBase / 2 - 10, y + this.generalDimension / 2],
            [x + this.mainBase / 2 - 10, y + this.generalDimension * 1.5],
            [x + this.mainBase / 2 - 10 - 20, y + this.generalDimension * 1.5],
            [x + this.mainBase / 2 - 10 - 20, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x + this.mainBase / 2 - 10 - 20 - this.shooterWidth, y + this.generalDimension * 1.5 + this.shooterHeight],
            [x - this.mainBase / 2 + 10 + 20, y + this.generalDimension * 1.5],
            [x - this.mainBase / 2 + 10, y + this.generalDimension * 1.5],
            [x - this.mainBase / 2 + 10, y + this.generalDimension / 2],
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

    update() {
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
    }

    pointIsInside(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        let x = point[0],
            y = point[1];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0],
                yi = vs[i][1];
            let xj = vs[j][0],
                yj = vs[j][1];

            let intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };
}