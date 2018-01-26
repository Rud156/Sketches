class Ball {
    constructor(x, y, radius) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = radius;
    }

    draw() {
        fill(255);
        ellipse(width / 2, height / 2, 30);
    }

    update() {}
}

export default Ball;