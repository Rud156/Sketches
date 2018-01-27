class Ball {
    constructor(x, y, socket, radius = 10) {
        this.initialPosition = { x: x, y: y };

        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;

        this.minSpeed = 3;
        this.maxSpeed = 4;
        this.ballLaunched = false;

        this.socket = socket;

        this.launchBall = this.launchBall.bind(this);
        this.clampBallSpeed = this.clampBallSpeed.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.checkOutOfScreen = this.checkOutOfScreen.bind(this);
        this.emitEvents = this.emitEvents.bind(this);
    }

    launchBall() {
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(this.minSpeed);

        this.socket.emit('ballPosition', {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        });
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

        if (keys[32] && !this.ballLaunched) {
            this.ballLaunched = true;
            this.launchBall();
        }

        this.checkOutOfScreen();
        this.clampBallSpeed();
    }

    emitEvents() {
        this.socket.emit('ballPosition', {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            }
        });
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
            console.log('Out Of Screen');
        }
    }
}

export default Ball;
