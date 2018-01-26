class Ball {
    constructor(x, y, radius) {
        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 10;
        this.maxSpeed = 20;
    }

    launchBall() {
        
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

        this.checkOutOfScreen();
    }

    checkOutOfScreen() {
        let { x } = this.position;
        if (x < 0 - this.radius || x > width + this.radius) {
            this.position = createVector(
                this.initialPosition.x,
                this.initialPosition.y
            );
            console.log('Out of screen');
        }
    }
}

export default Ball;
