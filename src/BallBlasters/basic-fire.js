/// <reference path="./../../typings/matter.d.ts" />

class BasicFire {
    constructor(x, y, angle, world) {
        this.radius = 5;
        this.body = Matter.Bodies.circle(x, y, this.radius, {
            label: 'basicFire',
            friction: 0.1,
            restitution: 0.8
        });
        Matter.World.add(world, this.body);

        this.movementSpeed = 7;
        this.angle = angle;
        this.world = world;

        this.setVelocity();
    }

    show() {
        fill(255);
        noStroke();

        let pos = this.body.position;

        push();
        translate(pos.x, pos.y);
        ellipse(0, 0, this.radius * 2);
        pop();
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

    checkVelocityZero() {
        let velocity = this.body.velocity;
        return sqrt(sq(velocity.x) + sq(velocity.y)) <= 0.07;
    }
}