/// <reference path="./../../typings/matter.d.ts" />

class BasicFire {
    constructor(x, y, radius, angle, world, catAndMask) {
        fireAudio.play();

        this.radius = radius;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
            label: 'basicFire',
            friction: 0,
            frictionAir: 0,
            restitution: 0,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);

        this.movementSpeed = this.radius * 3;
        this.angle = angle;
        this.world = world;

        this.body.damaged = false;
        this.body.damageAmount = this.radius / 2;

        this.body.health = map(this.radius, 5, 12, 34, 100);

        this.setVelocity();
    }

    show() {
        if (!this.body.damaged) {

            fill(255);
            noStroke();

            let pos = this.body.position;

            push();
            translate(pos.x, pos.y);
            ellipse(0, 0, this.radius * 2);
            pop();
        }
    }

    setVelocity() {
        Matter.Body.setVelocity(this.body, {
            x: this.movementSpeed * cos(this.angle),
            y: this.movementSpeed * sin(this.angle)
        });
    }

    removeFromWorld() {
        Matter.World.remove(this.world, this.body);
    }

    isVelocityZero() {
        let velocity = this.body.velocity;
        return sqrt(sq(velocity.x) + sq(velocity.y)) <= 0.07;
    }

    isOutOfScreen() {
        let pos = this.body.position;
        return (
            pos.x > width || pos.x < 0 || pos.y > height || pos.y < 0
        );
    }
}