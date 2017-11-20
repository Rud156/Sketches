/// <reference path="./../../typings/matter.d.ts" />

class ObjectCollect {
    constructor(x, y, width, height, world) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            label: 'collectibleFlag',
            friction: 0,
            frictionAir: 0
        });
        Matter.World.add(world, this.body);
        Matter.Body.setAngularVelocity(this.body, 0.1);

        this.width = width;
        this.height = height;
        this.radius = 0.5 * sqrt(sq(width) + sq(height));

        this.objectCollected = false;
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;

        fill(255);
        noStroke();

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rect(0, 0, this.width, this.height);
        pop();
    }

    update() {

    }
}