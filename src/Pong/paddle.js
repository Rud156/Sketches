/// <reference path="./../../typings/babylon.d.ts" />

class Paddle {
    constructor(name, scene, spawnPosition, paddleId, isAI, keys = [37, 39], color = 1) {
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

        this.paddleHighlight = new BABYLON.HighlightLayer(`paddle_${name}_highlight`, scene);
        this.paddleHighlight.addMesh(this.paddle, BABYLON.Color3.Yellow());
        this.paddleHighlight.blurHorizontalSize = 0.1;
        this.paddleHighlight.blurVerticalSize = 0.1;
        this.paddleMaterial = new BABYLON.StandardMaterial(`paddle_${name}_material`, scene);
        this.paddleMaterial.diffuseColor = BABYLON.Color3.Black();
        this.paddle.material = this.paddleMaterial;

        this.initialPosition = spawnPosition.clone();
        this.color = color;
        this.movementSpeed = 5;
        this.keys = keys;

        this.isAI = isAI;
    }

    movePaddle(keyStates) {
        if (keyStates[this.keys[0]]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
        } else if (keyStates[this.keys[1]]) {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
        }

        if ((!keyStates[this.keys[0]] && !keyStates[this.keys[1]]) ||
            (keyStates[this.keys[0]] && keyStates[this.keys[1]]))
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
    }

    movePaddleAI(ballClass) {
        if (ballClass.isLaunched) {
            let desiredDirection = Math.sign(ballClass.ball.position.x - this.paddle.position.x);

            if (desiredDirection === -1) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
            } else if (desiredDirection === 1) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
            } else {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            }
        }
    }

    update(keyStates, ballClass) {
        if (!this.isAI)
            this.movePaddle(keyStates);
        else
            this.movePaddleAI(ballClass);

        this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }

    resetPaddle() {
        this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        this.paddle.position = this.initialPosition.clone();
    }
}