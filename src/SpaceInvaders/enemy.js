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
        this.side = 20;

        this.magnitudeLimit = 50;
    }

    show() {
        noStroke();
        fill(this.color);

        // TODO: Think out and implement and enemy shape
        rect(this.position.x, this.position.y, this.side, this.side);
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
                random(0 + this.side, width - this.side),
                random(0 + this.side, height / 2)
            );
    }
}