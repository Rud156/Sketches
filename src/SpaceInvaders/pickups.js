class Pickup {
    constructor(xPosition, yPosition, colorValue) {
        this.position = createVector(xPosition, yPosition);
        this.velocity = createVector(0, 0);

        this.speed = 2;
        this.shapePoints = [0, 0, 0, 0];
        this.baseWidth = 15;

        this.colorValue = colorValue;
        this.color = color(`hsl(${colorValue}, 100%, 50%)`);
        this.angle = 0;
    }

    show() {
        noStroke();
        fill(this.color);

        let x = this.position.x;
        let y = this.position.y;


        push();
        translate(x, y);
        rotate(this.angle);
        rect(0, 0, this.baseWidth, this.baseWidth);
        pop();

        this.angle = frameRate() > 0 ? this.angle + 2 * (60 / frameRate()) : this.angle + 2;
        this.angle = this.angle > 360 ? 0 : this.angle;
    }

    update() {
        this.velocity = createVector(0, height);
        this.velocity.setMag(this.speed);
        this.position.add(this.velocity);
    }

    isOutOfScreen() {
        return this.position.y > (height + this.baseWidth);
    }

    pointIsInside(point) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        let x = point[0],
            y = point[1];

        let inside = false;
        for (let i = 0, j = this.shapePoints.length - 1; i < this.shapePoints.length; j = i++) {
            let xi = this.shapePoints[i][0],
                yi = this.shapePoints[i][1];
            let xj = this.shapePoints[j][0],
                yj = this.shapePoints[j][1];

            let intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
}