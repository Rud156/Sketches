class Star {
    constructor(reset, autoColor, x, y, z, speed) {
        this.x = x === undefined ? random(-width / 2, width / 2) : x;
        this.y = y === undefined ? random(-height / 2, height / 2) : y;

        this.z = z === undefined ? random(width / 2) : z;
        this.size = 0;
        this.speed = speed === undefined ? random(0, 20) : speed;
        this.alpha = 0;

        this.previousZ = this.z;
        this.reset = reset;

        this.color = autoColor ? null : random([235, 115, 0]);
        this.autoColor = autoColor;
    }

    setStartPositions(x, y, z, speed) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.speed = speed;
        this.previousZ = this.z;
    }

    show() {
        if (this.autoColor)
            this.color = parseInt(map(this.z, 0, width / 2, 0, 359));
        let fillColor = color(`hsl(${this.color}, 100%, 50%)`);


        let positionX = map(this.x / this.z, 0, 1, 0, width / 2);
        let positionY = map(this.y / this.z, 0, 1, 0, height / 2);

        this.size = map(this.z, 0, width / 2, 16, 0);
        fill(fillColor);
        noStroke();
        ellipse(positionX, positionY, this.size);

        let previousX = map(this.x / this.previousZ, 0, 1, 0, width / 2);
        let previousY = map(this.y / this.previousZ, 0, 1, 0, height / 2);

        stroke(fillColor);
        line(previousX, previousY, positionX, positionY);
    }

    update() {
        this.previousZ = this.z;
        this.z -= this.speed;

        if (this.z < 1 && this.reset) {
            this.x = random(-width / 2, width / 2);
            this.y = random(-height / 2, height / 2);
            this.z = width / 2;
            this.size = 0;
            this.previousZ = this.z;
        } else if (this.z >= width / 2 && this.reset) {
            this.z = 2;
            this.x = random(-width / 2, width / 2);
            this.y = random(-height / 2, height / 2);
            this.previousZ = this.z;
            this.size = 16;
        }
    }

    setSpeed() {
        this.speed = map(mouseX, 0, width, -60, 60);
    }
}