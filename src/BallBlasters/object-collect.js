/// <reference path="./../../typings/matter.d.ts" />

class ObjectCollect {
    constructor(x, y, width, height, world, index) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            label: 'collectibleFlag',
            friction: 0,
            frictionAir: 0,
            isSensor: true,
            collisionFilter: {
                category: flagCategory,
                mask: playerCategory
            }
        });
        Matter.World.add(world, this.body);
        Matter.Body.setAngularVelocity(this.body, 0.1);

        this.world = world;

        this.width = width;
        this.height = height;
        this.radius = 0.5 * sqrt(sq(width) + sq(height)) + 5;

        this.body.opponentCollided = false;
        this.body.playerCollided = false;
        this.body.index = index;

        this.alpha = 255;
        this.alphaReduceAmount = 20;

        this.playerOneColor = color(208, 0, 255);
        this.playerTwoColor = color(255, 165, 0);

        this.maxHealth = 300;
        this.health = this.maxHealth;
        this.changeRate = 1;
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;

        let currentColor = null;
        if (this.body.index === 0)
            currentColor = lerpColor(this.playerTwoColor, this.playerOneColor, this.health / this.maxHealth);
        else
            currentColor = lerpColor(this.playerOneColor, this.playerTwoColor, this.health / this.maxHealth);
        fill(currentColor);
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
        this.alpha -= this.alphaReduceAmount * 60 / frameRate();
        if (this.alpha < 0)
            this.alpha = 255;

        if (this.body.playerCollided && this.health < this.maxHealth) {
            this.health += this.changeRate * 60 / frameRate();
        }
        if (this.body.opponentCollided && this.health > 0) {
            this.health -= this.changeRate * 60 / frameRate();
        }
    }

    removeFromWorld() {
        Matter.World.remove(this.world, this.body);
    }
}