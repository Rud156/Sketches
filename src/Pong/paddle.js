/// <reference path="./../../typings/babylon.d.ts" />

class Paddle {
    constructor(name, scene, spawnPosition, paddleId, isAI, color = 1) {
        this.paddle = BABYLON.MeshBuilder.CreateBox(`paddle_${name}`, {
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
        this.paddle.physicsImpostor.uniqueId = paddleId;

        this.initialPosition = spawnPosition.clone();
        this.color = color;
        this.movementSpeed = 5;

        this.isAI = isAI;
    }

    movePaddle(keyStates) {
        if (keyStates[37]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
        } else if (keyStates[39]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
        }

        if ((!keyStates[37] && !keyStates[39]) || (keyStates[37] && keyStates[39]))
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
    }

    movePaddleAI(ballMesh) {
        let desiredDirection = Math.sign(ballMesh.position.x - this.paddle.position.x);

        if (desiredDirection === -1) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
        } else if (desiredDirection === 1) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
        } else {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        }
    }

    update(keyStates, ball) {
        if (!this.isAI)
            this.movePaddle(keyStates);
        else
            this.movePaddleAI(ball);

        this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }

    resetPaddle() {
        this.paddle.position = this.initialPosition;
        this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }
}