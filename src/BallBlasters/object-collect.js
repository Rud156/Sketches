/// <reference path="./../../typings/matter.d.ts" />

class ObjectCollect {
    constructor(x, y, width, height, world, index) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            label: 'collectibleFlag',
            friction: 0,
            frictionAir: 0
        });
        Matter.World.add(world, this.body);
        Matter.Body.setAngularVelocity(this.body, 0.1);

        this.width = width;
        this.height = height;
        this.radius = 0.5 * sqrt(sq(width) + sq(height)) + 5;

        this.body.objectCollected = false;
        this.index = index;

        this.alpha = 255;
        this.alphaReduceAmount = 20;
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;

        if (this.index === 0)
            fill(208, 0, 255);
        else
            fill(255, 165, 0);
        noStroke();

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rect(0, 0, this.width, this.height);

        stroke(255, this.alpha);
        strokeWeight(3);
        noFill();
        ellipse(0, 0, this.radius * 2);
        pop();
    }

    update() {
        this.alpha -= this.alphaReduceAmount;
        if (this.alpha < 0)
            this.alpha = 255;
    }
}