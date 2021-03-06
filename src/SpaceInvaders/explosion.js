/// <reference path="./particle.js" />

class Explosion {
    constructor(spawnX, spawnY, maxStrokeWeight) {
        this.position = createVector(spawnX, spawnY);
        this.gravity = createVector(0, 0.2);
        this.maxStrokeWeight = maxStrokeWeight;

        let randomColor = int(random(0, 359));
        this.color = randomColor;

        this.particles = [];
        this.explode();
    }

    explode() {
        for (let i = 0; i < 200; i++) {
            let particle = new Particle(this.position.x, this.position.y, this.color, this.maxStrokeWeight);
            this.particles.push(particle);
        }
    }

    show() {
        this.particles.forEach(particle => {
            particle.show();
        });
    }

    update() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].applyForce(this.gravity);
            this.particles[i].update();

            if (!this.particles[i].isVisible()) {
                this.particles.splice(i, 1);
                i -= 1;
            }
        }
    }

    explosionComplete() {
        return this.particles.length === 0;
    }
}