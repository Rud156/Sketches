/// <reference path="./../../typings/matter.d.ts" />
/// <reference path="./basic-fire.js" />


class Player {
    constructor(x, y, world, catAndMask = {
        category: playerCategory,
        mask: groundCategory | playerCategory | basicFireCategory
    }) {
        this.body = Matter.Bodies.circle(x, y, 20, {
            label: 'player',
            friction: 0.1,
            restitution: 0.3,
            collisionFilter: {
                category: catAndMask.category,
                mask: catAndMask.mask
            }
        });
        Matter.World.add(world, this.body);
        this.world = world;

        this.radius = 20;
        this.movementSpeed = 10;
        this.angularVelocity = 0.2;

        this.jumpHeight = 10;
        this.jumpBreathingSpace = 3;

        this.body.grounded = true;
        this.maxJumpNumber = 3;
        this.body.currentJumpNumber = 0;

        this.bullets = [];
        this.initialChargeValue = 5;
        this.maxChargeValue = 12;
        this.currentChargeValue = this.initialChargeValue;
        this.chargeIncrementValue = 0.1;
        this.chargeStarted = false;

        this.body.damageLevel = 1;
        this.keys = [];
    }

    setControlKeys(keys) {
        this.keys = keys;
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
        rect(0 + this.radius / 2, 0, this.radius * 1.5, this.radius / 2);

        // ellipse(-this.radius * 1.5, 0, 5);

        strokeWeight(1);
        stroke(0);
        line(0, 0, this.radius * 1.25, 0);

        pop();
    }

    rotateBlaster(activeKeys) {
        if (activeKeys[this.keys[2]]) {
            Matter.Body.setAngularVelocity(this.body, -this.angularVelocity);
        } else if (activeKeys[this.keys[3]]) {
            Matter.Body.setAngularVelocity(this.body, this.angularVelocity);
        }

        if ((!keyStates[this.keys[2]] && !keyStates[this.keys[3]]) ||
            (keyStates[this.keys[2]] && keyStates[this.keys[3]])) {
            Matter.Body.setAngularVelocity(this.body, 0);
        }
    }

    moveHorizontal(activeKeys) {
        let yVelocity = this.body.velocity.y;
        let xVelocity = this.body.velocity.x;

        let absXVelocity = abs(xVelocity);
        let sign = xVelocity < 0 ? -1 : 1;

        if (activeKeys[this.keys[0]]) {
            if (absXVelocity > this.movementSpeed) {
                Matter.Body.setVelocity(this.body, {
                    x: this.movementSpeed * sign,
                    y: yVelocity
                });
            }

            Matter.Body.applyForce(this.body, this.body.position, {
                x: -0.005,
                y: 0
            });

            Matter.Body.setAngularVelocity(this.body, 0);
        } else if (activeKeys[this.keys[1]]) {
            if (absXVelocity > this.movementSpeed) {
                Matter.Body.setVelocity(this.body, {
                    x: this.movementSpeed * sign,
                    y: yVelocity
                });
            }
            Matter.Body.applyForce(this.body, this.body.position, {
                x: 0.005,
                y: 0
            });

            Matter.Body.setAngularVelocity(this.body, 0);
        }
    }

    moveVertical(activeKeys, groundObjects) {
        let xVelocity = this.body.velocity.x;

        if (activeKeys[this.keys[5]]) {
            if (!this.body.grounded && this.body.currentJumpNumber < this.maxJumpNumber) {
                Matter.Body.setVelocity(this.body, {
                    x: xVelocity,
                    y: -this.jumpHeight
                });
                this.body.currentJumpNumber++;
            } else if (this.body.grounded) {
                Matter.Body.setVelocity(this.body, {
                    x: xVelocity,
                    y: -this.jumpHeight
                });
                this.body.currentJumpNumber++;
                this.body.grounded = false;
            }
        }

        activeKeys[this.keys[5]] = false;
    }

    drawChargedShot(x, y, radius) {
        fill(255);
        noStroke();

        ellipse(x, y, radius * 2);
    }

    chargeAndShoot(activeKeys) {
        let pos = this.body.position;
        let angle = this.body.angle;

        let x = this.radius * cos(angle) * 1.5 + pos.x;
        let y = this.radius * sin(angle) * 1.5 + pos.y;

        if (activeKeys[this.keys[4]]) {
            this.chargeStarted = true;
            this.currentChargeValue += this.chargeIncrementValue;

            this.currentChargeValue = this.currentChargeValue > this.maxChargeValue ?
                this.maxChargeValue : this.currentChargeValue;

            this.drawChargedShot(x, y, this.currentChargeValue);

        } else if (!activeKeys[this.keys[4]] && this.chargeStarted) {
            this.bullets.push(new BasicFire(x, y, this.currentChargeValue, angle, this.world, {
                category: basicFireCategory,
                mask: groundCategory | playerCategory | basicFireCategory
            }));

            this.chargeStarted = false;
            this.currentChargeValue = this.initialChargeValue;
        }
    }

    update(activeKeys, groundObjects) {
        this.rotateBlaster(activeKeys);
        this.moveHorizontal(activeKeys);
        this.moveVertical(activeKeys, groundObjects);

        this.chargeAndShoot(activeKeys);

        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].show();

            if (this.bullets[i].checkVelocityZero() || this.bullets[i].checkOutOfScreen()) {
                this.bullets[i].removeFromWorld();
                this.bullets.splice(i, 1);
                i -= 1;
            }
        }
    }
}