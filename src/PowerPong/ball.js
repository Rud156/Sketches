class Ball {
    constructor(x, y, radius) {
        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 5;
        this.maxSpeed = 7;
        this.ballLaunched = false;
    }

    launchBall() {
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(this.minSpeed);
    }

    clampBallSpeed() {
        let { x, y } = this.velocity;
        let signX = x < 0 ? -1 : x == 0 ? 0 : 1;
        let signY = y < 0 ? -1 : y == 0 ? 0 : 1;

        x = abs(x);
        y = abs(y);

        if (x < this.minSpeed) x = this.minSpeed;
        else if (x > this.maxSpeed) x = this.maxSpeed;

        if (y < this.minSpeed) y = this.minSpeed;
        else if (y > this.maxSpeed) y = this.maxSpeed;

        this.velocity = createVector(x * signX, y * signY);
    }

    draw() {
        fill(255);
        let { x, y } = this.position;
        ellipse(x, y, this.radius * 2);
    }

    update(keys) {
        this.position.add(this.velocity);

        let { x: posX, y: posY } = this.position;
        let { x: velX, y: velY } = this.velocity;
        let radius = this.radius;

        if (posY < radius / 2 || posY > height - radius / 2) {
            this.velocity.y = -1 * velY;
        }

        this.checkOutOfScreen();
        this.clampBallSpeed();

        if (keys[32] && !this.ballLaunched) {
            this.ballLaunched = true;
            this.launchBall();
        }
    }

    checkOutOfScreen() {
        let { x } = this.position;
        if (x < 0 - this.radius || x > width + this.radius) {
            this.position = createVector(
                this.initialPosition.x,
                this.initialPosition.y
            );
            this.ballLaunched = false;
            this.velocity = createVector(0, 0);
        }
    }
}

export default Ball;
