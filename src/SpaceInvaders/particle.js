class Particle {
    constructor(x, y, colorNumber, maxStrokeWeight) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.velocity.mult(random(0, 70));
        this.acceleration = createVector(0, 0);

        this.alpha = 1;
        this.colorNumber = colorNumber;
        this.maxStrokeWeight = maxStrokeWeight;
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    show() {
        let colorValue = color(`hsla(${this.colorNumber}, 100%, 50%, ${this.alpha})`);
        let mappedStrokeWeight = map(this.alpha, 0, 1, 0, this.maxStrokeWeight);

        strokeWeight(mappedStrokeWeight);
        stroke(colorValue);
        point(this.position.x, this.position.y);

        this.alpha -= 0.05;
    }

    update() {
        this.velocity.mult(0.5);

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    isVisible() {
        return this.alpha > 0;
    }
}