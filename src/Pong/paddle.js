/// <reference path="./../../typings/babylon.d.ts" />

class Paddle {
    constructor(name, scene, spawnPosition, color) {
        this.paddle = BABYLON.MeshBuilder.CreateBox(`paddle${name}`, {
            width: 5,
            height: 1,
            depth: 1
        }, scene);
        this.paddle.position = spawnPosition;
        this.paddle.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.paddle,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                friction: 0,
                restitution: 0
            },
            scene
        );
        this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.paddle.showBoundingBox = true;

        this.initialPosition = spawnPosition.clone();
        this.color = color;
        this.movementSpeed = 5;

        this.leftLimit = -14;
        this.rightLimit = 14;
    }

    movePaddle(keyStates) {
        if (keyStates[37]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
        } else if (keyStates[39]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
        }

        if ((!keyStates[37] && !keyStates[39]) || (keyStates[37] && keyStates[39]))
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());

        this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());

    }

    update(keyStates) {
        this.movePaddle(keyStates);
    }
}