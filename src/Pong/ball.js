/// <reference path="./../../typings/babylon.d.ts" />

class Ball {
    constructor(scene, spawnPosition, color) {
        this.ball = BABYLON.MeshBuilder.CreateSphere('playBall', {
            segments: 16,
            diameter: 1
        }, scene);
        this.ball.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.ball,
            BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 1,
                friction: 0,
                restitution: 1
            },
            scene
        );
        this.ball.position = spawnPosition;
        this.ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        // this.ball.showBoundingBox = true;

        this.initialPosition = spawnPosition.clone();
        this.color = color;
    }
}