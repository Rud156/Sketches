class SpaceShip {
    constructor(color) {
        this.color = color;
        this.baseWidth = 100;
        this.baseHeight = 20;
        this.shooterWidth = 10;

        this.x = width / 2;
        this.prevX = this.x;
        this.speed = 10;
    }

    show() {
        noStroke();
        fill(this.color);

        rectMode(CENTER);

        rect(this.x, height - this.baseHeight - 10, this.baseWidth, this.baseHeight);
        rect(this.x, height - 2 * this.baseHeight - 10, this.baseWidth / 2, this.baseHeight);

        rect(this.x, height - 2 * this.baseHeight - 15 - this.baseHeight / 2,
            this.shooterWidth, this.baseHeight / 2);

        this.prevX = this.x;
    }

    moveShip(direction) {
        this.prevX = this.x;

        if (this.x < this.baseWidth / 2) {
            this.x = this.baseWidth / 2 + 1;
        }
        if (this.x > width - this.baseWidth / 2) {
            this.x = width - this.baseWidth / 2 - 1;
        }

        if (direction === 'LEFT') {
            this.x -= this.speed;
        } else {
            this.x += this.speed;
        }
    }
}