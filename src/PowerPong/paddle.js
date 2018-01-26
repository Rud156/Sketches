class Paddle {
    constructor(x, y, width, height, upKey, downKey) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;

        this.moveSpeed = 5;
        this.keys = {
            up: upKey,
            down: downKey
        };
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

    draw() {
        fill(255);

        let { x, y } = this.position;
        rect(x, y, this.width, this.height);
    }

    update(keys) {
        let { up, down } = this.keys;

        if (
            (keys[up] && keys[down]) ||
            (!keys[up] && !keys[down])
        ) {
            this.movePaddle(0);
        } else if (keys[up]) {
            this.movePaddle(-1);
        } else if (keys[down]) {
            this.movePaddle(1);
        }
    }
}

export default Paddle;
