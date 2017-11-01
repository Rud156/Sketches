class Bullet {
    constructor(xPosition, yPosition, size, goUp) {
        this.speed = goUp ? 10 : -10;
        this.baseHeight = size * 2;
        this.baseWidth = size;

        this.x = xPosition;
        this.y = yPosition;

        this.color = 255;
    }

    show() {
        noStroke();
        fill(this.color);

        rect(this.x, this.y - this.baseHeight, this.baseWidth, this.baseHeight);
    }

    update() {
        this.y -= this.speed * (60 / frameRate());
    }
}