/// <reference path="./../../typings/matter.d.ts" />

class Boundary {
    constructor(x, y, boundaryWidth, boundaryHeight) {
        this.body = Matter.Bodies.rectangle(x, y, boundaryWidth, boundaryHeight, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: 'boundaryControlLines',
            collisionFilter: {
                category: groundCategory,
                mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
            }
        });

        this.width = boundaryWidth;
        this.height = boundaryHeight;
    }

    show() {
        let pos = this.body.position;

        fill(255, 0, 0);
        noStroke();

        rect(pos.x, pos.y, this.width, this.height);
    }
}