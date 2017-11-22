/// <reference path="./../../typings/matter.d.ts" />

class Ground {
    constructor(x, y, groundWidth, groundHeight, world, catAndMask = {
        category: groundCategory,
        mask: groundCategory | playerCategory | basicFireCategory | bulletCollisionLayer
    }) {
        let modifiedY = y - groundHeight / 2 + 10;

        this.body = Matter.Bodies.rectangle(x, modifiedY, groundWidth, 20, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            label: 'staticGround',
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });

        let modifiedHeight = groundHeight - 20;
        let modifiedWidth = 50;
        this.fakeBottomPart = Matter.Bodies.rectangle(x, y + 10, modifiedWidth, modifiedHeight, {
            isStatic: true,
            friction: 0,
            restitution: 1,
            label: 'boundaryControlLines',
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.fakeBottomPart);
        Matter.World.add(world, this.body);

        this.width = groundWidth;
        this.height = 20;
        this.modifiedHeight = modifiedHeight;
        this.modifiedWidth = modifiedWidth;
    }

    show() {
        fill(0, 100, 255);
        noStroke();

        let bodyVertices = this.body.vertices;
        let fakeBottomVertices = this.fakeBottomPart.vertices;
        let vertices = [
            bodyVertices[0],
            bodyVertices[1],
            bodyVertices[2],
            fakeBottomVertices[1],
            fakeBottomVertices[2],
            fakeBottomVertices[3],
            fakeBottomVertices[0],
            bodyVertices[3]
        ];


        beginShape();
        for (let i = 0; i < vertices.length; i++)
            vertex(vertices[i].x, vertices[i].y);
        endShape();
    }
}