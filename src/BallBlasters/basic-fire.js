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
    }

    show() {
        let xVelocity = this.body.velocity.x;
        
        let alphaValue = 255;
        if (xVelocity <= 0.3)
            alphaValue = map(xVelocity, 0, 0.3, 0, 255);

        fill(255, 255, 255, alphaValue);
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

    checkVelocityZero() {
        return Math.abs(this.body.velocity.x) <= 0;
    }
}