class Bullet {
    constructor(xPosition, yPosition, size, goUp, colorValue, rotation) {
        this.goUp = goUp;
        this.speed = goUp ? -10 : 10;
        this.baseWidth = size;
        this.baseHeight = size * 2;

        this.color = colorValue !== undefined ? color(`hsl(${colorValue}, 100%, 50%)`) : 255;
        this.rotation = rotation;

        this.position = createVector(xPosition, yPosition);
        if (this.rotation === undefined)
            this.velocity = createVector(0, 45);
        else {
            let rotation = 45 - this.rotation;
            this.velocity = createVector(-45 + rotation, 45);
        }
        this.velocity.setMag(this.speed);
    }

    show() {
        noStroke();
        fill(this.color);

        let x = this.position.x;
        let y = this.position.y;

        push();
        translate(x, y);
        rotate(this.rotation);
        rect(0, -this.baseHeight, this.baseWidth, this.baseHeight);
        if (this.goUp) {
            triangle(-this.baseWidth / 2, -this.baseHeight,
                0, -this.baseHeight * 2,
                this.baseWidth / 2, -this.baseHeight
            );
        }
        pop();
    }

    update() {
        this.position.add(this.velocity);
    }
}