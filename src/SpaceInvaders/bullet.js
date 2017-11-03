class Bullet {
    constructor(xPosition, yPosition, size, goUp) {
        this.goUp = goUp;
        this.speed = goUp ? -10 : 10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.position = createVector(xPosition, yPosition);
        this.velocity = createVector(0, 0);

        this.color = 255;
    }

    show() {
        noStroke();
        fill(this.color);

        let x = this.position.x;
        let y = this.position.y;

        rect(x, y - this.baseHeight, this.baseWidth, this.baseHeight);
        if (this.goUp) {
            triangle(x - this.baseWidth / 2, y - this.baseHeight,
                x, y - this.baseHeight * 2,
                x + this.baseWidth / 2, y - this.baseHeight);
        }
    }

    update() {
        this.velocity = createVector(0, height);
        this.velocity.setMag(this.speed);
        this.position.add(this.velocity);
    }
}