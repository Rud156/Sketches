class Enemy {
    constructor(xPosition) {
        this.x = xPosition;
        this.y = -30;

        this.initialMovementSpeed = 5;
        this.positionReached = false;
        this.color = 255;
    }

    show() {
        noStroke();
        fill(this.color);
        
        // TODO: Think out and implement and enemy type
    }

    update() {

    }
}