class Paddle {
    constructor(x, y, upKey, downKey, socket, id, width = 10, height = 100) {
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
        this.id = id;
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
        fill(255);

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
            ball.setPaddleId(this.id);
            let { x } = ball.velocity;
            ball.velocity.x = -1 * x;
            ball.velocity.add(this.velocity);
        }
        this.emitEvents();
    }

    emitEvents() {
        this.socket.emit('paddlePosition', {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            },
            id: this.id
        });
    }
}

export default Paddle;
