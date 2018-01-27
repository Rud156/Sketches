class Paddle {
    constructor(x, y, upKey, downKey, socket, ball, width = 10, height = 100) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;

        this.moveSpeed = 5;
        this.keys = {
            up: upKey,
            down: downKey
        };

        this.socket = socket;
        this.gameManagerId = null;
        this.alpha = 100;

        this.ball = ball;

        this.socket.on('paddlePosition', this.handlePaddlePosition.bind(this));

        this.movePaddle = this.movePaddle.bind(this);
        this.increaseAlpha = this.increaseAlpha.bind(this);
        this.collideWithBall = this.collideWithBall.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.emitPaddleEvents = this.emitPaddleEvents.bind(this);
        this.emitBallEvents = this.emitBallEvents.bind(this);
    }

    handlePaddlePosition(data) {
        if (this.gameManagerId !== null) return;

        let { position, velocity } = data;
        this.position = createVector(position.x, position.y);
        this.velocity = createVector(velocity.x, velocity.y);
    }

    movePaddle(direction) {
        let { y } = this.position;
        if (y < this.height / 2) this.position.y = this.height / 2 + 1;
        if (y > height - this.height / 2)
            this.position.y = height - this.height / 2 - 1;

        this.velocity = createVector(0, direction * height);
        this.velocity.setMag(this.moveSpeed);
        this.position.add(this.velocity);
    }

    increaseAlpha() {
        this.alpha = 255;
    }

    collideWithBall(ball) {
        let { x: ballX, y: ballY } = ball.position;
        let radius = ball.radius;

        let { x, y } = this.position;
        let halfWidth = this.width / 2;
        let halfHeight = this.height / 2;

        if (
            ballY - radius > y - halfHeight &&
            ballY + radius < y + halfHeight
        ) {
            if (
                (x < width / 2 && ballX - radius <= x + halfWidth) ||
                (x > width / 2 && ballX + radius >= x - halfWidth)
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    draw() {
        fill(255, this.alpha);

        let { x, y } = this.position;
        rect(x, y, this.width, this.height);
    }

    update(keys, ball) {
        let { up, down } = this.keys;

        if ((keys[up] && keys[down]) || (!keys[up] && !keys[down])) {
            this.movePaddle(0);
        } else if (keys[up]) {
            this.movePaddle(-1);
        } else if (keys[down]) {
            this.movePaddle(1);
        }

        if (this.collideWithBall(ball)) {
            let { x } = ball.velocity;
            ball.velocity.x = -1 * x;
            ball.velocity.add(this.velocity);

            this.emitBallEvents();
        }

        this.emitPaddleEvents();
    }

    emitBallEvents() {
        let { position, velocity } = this.ball;
        this.socket.emit('ballPosition', {
            position: {
                x: position.x,
                y: position.y
            },
            velocity: {
                x: velocity.x,
                y: velocity.y
            }
        });
    }

    emitPaddleEvents() {
        this.socket.emit('paddlePosition', {
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
}

export default Paddle;
