class Paddle {
    constructor(x, y, width, height) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.width = width;
        this.height = height;
    }

    movePaddle() {
        
    }

    draw() {
        let { x, y } = this.position;
        rect(x, y, this.width, this.height);
    }

    update() {
        this.position.add(this.velocity);
    }
}
