/// <reference path="./../../typings/babylon.d.ts" />


class Player {
    velocity: BABYLON.Vector3;

    playerShape: BABYLON.Mesh;
    ray: BABYLON.Ray;

    scene: BABYLON.Scene;
    ground: BABYLON.Mesh;

    jumpVelocity: number = 10;
    hitDistance: number = 0.7;
    fallMultiplier: number = 2.5;
    lowJumpMultiplier: number = 2;

    moveSpeed: number = 1;

    sideLength: number = 1;

    requiredKeys = {
        32: false, // SPACE
        37: false, // LEFT
        38: false, // TOP
        39: false, // RIGHT
        40: false // DOWN
    }

    constructor(scene: BABYLON.Scene, ground: BABYLON.Mesh) {
        this.scene = scene;
        this.ground = ground;

        this.playerShape = BABYLON.MeshBuilder.CreateBox('player', {
            width: 1,
            height: 1,
            depth: 1
        }, this.scene);
        this.playerShape.position = new BABYLON.Vector3(0, 5, 0);
        this.playerShape.checkCollisions = true;
        // Friction and Restitution is set to 0 to prevent rotation when moving around (for a cube)
        this.playerShape.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.playerShape, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0, restitution: 0 },
            this.scene
        );
        this.playerShape.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());

        window.addEventListener('keydown', event => {
            event.preventDefault();
            this.handleKeyDown(event);
        });
        window.addEventListener('keyup', event => {
            event.preventDefault();
            this.handleKeyUp(event);
        });
    }

    private handleKeyDown(event: KeyboardEvent) {
        let key = event.keyCode;
        if (key in this.requiredKeys) {
            this.requiredKeys[key] = true;
        }
    }

    private handleKeyUp(event: KeyboardEvent) {
        let key = event.keyCode;
        if (key in this.requiredKeys) {
            this.requiredKeys[key] = false;
        }
    }

    private basicJump() {
        this.ray = new BABYLON.Ray(this.playerShape.position, BABYLON.Vector3.Up().negate(), 10);
        let hit = this.ray.intersectsMeshes([this.ground], true);

        if (hit.length) {
            // FixMe: Change to min distance and check
            if (hit[0].distance <= this.hitDistance && this.requiredKeys[32]) {
                let zVelocity = this.playerShape.physicsImpostor.getLinearVelocity().z;
                this.playerShape.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, this.jumpVelocity, zVelocity));

                this.requiredKeys[32] = false;
            }
        }
    }

    private moveForwardAndBack() {
        let moveZ = 0;
        if (this.requiredKeys[38]) {
            moveZ = -1;
        } else if (this.requiredKeys[40]) {
            moveZ = 1;
        }

        let moveSpeed = this.moveSpeed * moveZ;
        let yVelocity = this.playerShape.physicsImpostor.getLinearVelocity().y;
        this.playerShape.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, yVelocity, moveSpeed));
    }

    update() {
        this.moveForwardAndBack();
        this.basicJump();
    }
}