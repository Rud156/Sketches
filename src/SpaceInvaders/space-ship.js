class SpaceShip {
    constructor(color) {
        this.color = color;
        this.baseWidth = 100;
        this.baseHeight = 20;
        this.shooterWidth = 10;
        this.shapePoints = [];

        this.position = createVector(width / 2, height - this.baseHeight - 10);
        this.velocity = createVector(0, 0);

        this.prevX = this.position.x;
        this.speed = 15;
    }

    show() {
        noStroke();
        fill(this.color);

        let x = this.position.x;
        let y = this.position.y;
        this.shapePoints = [
            [x - this.shooterWidth / 2, y - this.baseHeight * 2],
            [x + this.shooterWidth / 2, y - this.baseHeight * 2],
            [x + this.shooterWidth / 2, y - this.baseHeight * 1.5],
            [x + this.baseWidth / 4, y - this.baseHeight * 1.5],
            [x + this.baseWidth / 4, y - this.baseHeight / 2],
            [x + this.baseWidth / 2, y - this.baseHeight / 2],
            [x + this.baseWidth / 2, y + this.baseHeight / 2],
            [x - this.baseWidth / 2, y + this.baseHeight / 2],
            [x - this.baseWidth / 2, y - this.baseHeight / 2],
            [x - this.baseWidth / 4, y - this.baseHeight / 2],
            [x - this.baseWidth / 4, y - this.baseHeight * 1.5],
            [x - this.shooterWidth / 2, y - this.baseHeight * 1.5]
        ];

        beginShape();
        for (let i = 0; i < this.shapePoints.length; i++)
            vertex(this.shapePoints[i][0], this.shapePoints[i][1]);
        endShape(CLOSE);

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

        this.velocity = createVector(width, 0);
        if (direction === 'LEFT')
            this.velocity.setMag(-this.speed);
        else
            this.velocity.setMag(this.speed);


        this.position.add(this.velocity);
    }
}