class Bullet {
    constructor(xPosition, yPosition) {
        this.speed = 10;
        this.baseHeight = 20;
        this.baseWidth = 10;

        this.x = xPosition;
        this.y = yPosition;

        this.color = 255;
    }

    show() {
        noStroke();
        fill(this.color);

        rectMode(CENTER);
        rect(this.x, this.y - this.baseHeight, this.baseWidth, this.baseHeight);
    }

    update() {
        this.y -= this.speed * (60 / frameRate());
    }
}