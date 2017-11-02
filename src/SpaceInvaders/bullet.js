class Bullet {
    constructor(xPosition, yPosition, size, goUp) {
        this.goUp = goUp;
        this.speed = goUp ? 10 : -10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.x = xPosition;
        this.y = yPosition;

        this.color = 255;
    }

    show() {
        noStroke();
        fill(this.color);

        rect(this.x, this.y - this.baseHeight, this.baseWidth, this.baseHeight);
        if (this.goUp) {
            triangle(this.x - this.baseWidth / 2, this.y - this.baseHeight,
                this.x, this.y - this.baseHeight * 2,
                this.x + this.baseWidth / 2, this.y - this.baseHeight);
        }
    }

    update() {
        this.y -= this.speed * (60 / frameRate());
    }
}