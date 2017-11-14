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
        this.movementSpeed = 10;
        this.angularVelocity = 0.2;

        this.jumpHeight = 10;
        this.jumpBreathingSpace = 3;

        this.grounded = true;
        this.maxJumpNumber = 3;
        this.currentJumpNumber = 0;
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

        fill(255);
        ellipse(0, 0, this.radius);
        rect(0 - this.radius / 2, 0, 30, 10);

        strokeWeight(1);
        stroke(0);
        line(0, 0, -this.radius * 1.25, 0);

        pop();
    }

    moveHorizontal(activeKeys) {
        let yVelocity = this.body.velocity.y;

        if (activeKeys[37]) {
            Matter.Body.setVelocity(this.body, {
                x: -this.movementSpeed,
                y: yVelocity
            });
            Matter.Body.setAngularVelocity(this.body, 0);
        } else if (activeKeys[39]) {
            Matter.Body.setVelocity(this.body, {
                x: this.movementSpeed,
                y: yVelocity
            });
            Matter.Body.setAngularVelocity(this.body, 0);
        } else if (activeKeys[38]) {
            Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
        } else if (activeKeys[40]) {
            Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
        }

        if ((!keyStates[37] && !keyStates[39]) || (keyStates[37] && keyStates[39])) {
            Matter.Body.setVelocity(this.body, {
                x: 0,
                y: yVelocity
            });
        }
        if ((!keyStates[38] && !keyStates[40]) || (keyStates[38] && keyStates[40])) {
            Matter.Body.setAngularVelocity(this.body, 0);
        }
    }

    moveVertical(activeKeys, ground) {
        let xVelocity = this.body.velocity.x;
        let pos = this.body.position

        let collisions = Matter.Query.ray([ground.body], pos, {
            x: pos.x,
            y: height
        });
        let minDistance = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < collisions.length; i++) {
            let distance = dist(pos.x, pos.y,
                pos.x, collisions[i].bodyA.position.y);
            minDistance = distance < minDistance ? distance : minDistance;
        }

        if (minDistance <= this.radius + ground.height / 2 + this.jumpBreathingSpace) {
            this.grounded = true;
            this.currentJumpNumber = 0;
        } else
            this.grounded = false;

        if (activeKeys[32]) {
            if (!this.grounded && this.currentJumpNumber < this.maxJumpNumber) {
                Matter.Body.setVelocity(this.body, {
                    x: xVelocity,
                    y: -this.jumpHeight
                });
                this.currentJumpNumber++;
            } else if (this.grounded) {
                Matter.Body.setVelocity(this.body, {
                    x: xVelocity,
                    y: -this.jumpHeight
                });
                this.currentJumpNumber++;
            }
        }

        activeKeys[32] = false;
    }

    update(activeKeys, ground) {
        this.moveHorizontal(activeKeys);
        this.moveVertical(activeKeys, ground);
    }
}