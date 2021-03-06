class Ball {
    constructor(x, y, socket, radius = 10) {
        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 3;
        this.maxSpeed = 4;

        this.socket = socket;

        this.clampBallSpeed = this.clampBallSpeed.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
    }

    clampBallSpeed() {
        let { x, y } = this.velocity;
        let signX = x < 0 ? -1 : 1;
        let signY = y < 0 ? -1 : 1;

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

    update() {
        this.position.add(this.velocity);

        let { x: posX, y: posY } = this.position;
        let { x: velX, y: velY } = this.velocity;
        let radius = this.radius;

        if (posY < radius / 2 || posY > height - radius / 2) {
            this.velocity.y = -1 * velY;
        }

        this.clampBallSpeed();
    }
}

export default Ball;
