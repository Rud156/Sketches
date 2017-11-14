/// <reference path="./../../typings/matter.d.ts" />

class Player {
    constructor(x, y, radius, world) {
        this.body = Matter.Bodies.circle(x, y, radius, {
            label: 'player',
            friction: 0.3,
            restitution: 0.3
        });
        Matter.World.add(world, this.body);

        this.radius = radius;
        this.speedScale = 4;
    }

    show() {
        fill(0, 255, 0);
        noStroke();

        let pos = this.body.position;
        let angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        ellipse(0, 0, this.radius * 2);
        stroke(255);
        line(0, 0, this.radius, 0);
        pop();
    }

    update(activeKeys) {
        let yVelocity = this.body.velocity.y;
        let xVelocity = this.body.velocity.x;

        if (keyStates[37]) {
            Matter.Body.setVelocity(this.body, {
                x: -this.speedScale,
                y: yVelocity
            });
        } else if (keyStates[39]) {
            Matter.Body.setVelocity(this.body, {
                x: this.speedScale,
                y: yVelocity
            });
        }

        if ((!keyStates[37] && !keyStates[39]) || (keyStates[37] && keyStates[39]))
            Matter.Body.setVelocity(this.body, {
                x: 0,
                y: yVelocity
            });
    }
}