/// <reference path="./../../typings/babylon.d.ts" />


class Player {
    velocity: BABYLON.Vector3;

    playerShape: BABYLON.Mesh;
    ray: BABYLON.Ray;
    rayHelper: BABYLON.RayHelper;

    scene: BABYLON.Scene;
    ground: BABYLON.Mesh;

    jumpVelocity: number = 10;
    hitDistance: number = 0.7;
    fallMultiplier: number = 2.5;
    lowJumpMultiplier: number = 2;

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
        this.playerShape.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.playerShape, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1 },
            this.scene
        );
        this.playerShape.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());

        window.addEventListener('keydown', event => {
            this.handleKeyDown(event);
        });
        window.addEventListener('keyup', event => {
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

    private vecToLocal(vector: BABYLON.Vector3, mesh: BABYLON.Mesh): BABYLON.Vector3 {
        let m = mesh.getWorldMatrix();
        let v = BABYLON.Vector3.TransformCoordinates(vector, m);
        return v;
    }

    private basicJump() {
        let ray = new BABYLON.Ray(this.playerShape.position, BABYLON.Vector3.Up().negate(), 10);
        let hit = ray.intersectsMeshes([ground], true);

        if (hit.length)
            if (hit[0].distance <= this.hitDistance && this.requiredKeys[32]) {
                let zVelocity = this.playerShape.physicsImpostor.getLinearVelocity().z;
                this.playerShape.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, this.jumpVelocity, zVelocity));

                this.requiredKeys[32] = false;
            }
    }

    update() {
        this.basicJump();
    }
}