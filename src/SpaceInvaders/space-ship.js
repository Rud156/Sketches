class SpaceShip {
    constructor(color) {
        this.color = color;
        this.baseWidth = 100;
        this.baseHeight = 20;
        this.shooterWidth = 10;

        this.position = createVector(width / 2, this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.prevX = this.position.x;
        this.speed = 15;
    }

    show() {
        noStroke();
        fill(this.color);

        rectMode(CENTER);

        rect(this.position.x, height - this.baseHeight - 10, this.baseWidth, this.baseHeight);
        rect(this.position.x, height - 2 * this.baseHeight - 10, this.baseWidth / 2, this.baseHeight);

        rect(this.position.x, height - 2 * this.baseHeight - 15 - this.baseHeight / 2,
            this.shooterWidth, this.baseHeight / 2);

        this.prevX = this.position.x;
    }

    moveShip(direction) {
        this.prevX = this.position.x;

        if (this.position.x < this.baseWidth / 2) {
            this.position.x = this.baseWidth / 2 + 1;
        }
        if (this.position.x > width - this.baseWidth / 2) {
            this.position.x = width - this.baseWidth / 2 - 1;
        }

        this.velocity = createVector(width, this.baseHeight - 10);
        if (direction === 'LEFT')
            this.velocity.setMag(-this.speed);
        else
            this.velocity.setMag(this.speed);


        this.position.add(this.velocity);
    }
}