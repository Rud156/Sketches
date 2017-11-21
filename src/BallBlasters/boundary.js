/// <reference path="./../../typings/matter.d.ts" />

class Boundary {
    constructor(x, y, boundaryWidth, boundaryHeight, world, index = -1, label = 'boundaryControlLines') {
        this.body = Matter.Bodies.rectangle(x, y, boundaryWidth, boundaryHeight, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: label,
            collisionFilter: {
                category: groundCategory,
                mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
            }
        });
        Matter.World.add(world, this.body);

        this.width = boundaryWidth;
        this.height = boundaryHeight;
        this.index = index;
    }

    show() {
        let pos = this.body.position;

        if (this.index === 0)
            fill(208, 0, 255);
        else if (this.index === 1)
            fill(255, 165, 0);
        else
            fill(255, 0, 0);
        noStroke();

        rect(pos.x, pos.y, this.width, this.height);
    }
}