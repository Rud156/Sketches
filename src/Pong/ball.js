/// <reference path="./../../typings/babylon.d.ts" />

class Ball {
    constructor(scene, spawnPosition, ballId, color = 1) {
        this.minBallSpeed = 5;
        this.maxBallSpeed = 20;

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
        this.ball.physicsImpostor.uniqueId = ballId;

        this.initialPosition = spawnPosition.clone();
        this.isLaunched = false;
        this.color = color;
    }

    lockPositionToPlayerPaddle(playerPaddleVelocity) {
        this.ball.physicsImpostor.setLinearVelocity(playerPaddleVelocity);
    }

    launchBall(keyStates, playerPaddleVelocity) {
        if (keyStates[32]) {
            this.isLaunched = true;

            this.ball.physicsImpostor.setLinearVelocity(
                playerPaddleVelocity.x,
                0,
                Math.random() * 10
            );
        }
    }

    setCollisionComponents(imposters) {
        this.ball.physicsImpostor.registerOnPhysicsCollide(imposters, this.onTriggerEnter);
    }

    onTriggerEnter(ballPhysicsImposter, collidedAgainst) {
        let velocityX = collidedAgainst.getLinearVelocity().x;
        let velocityXBall = ballPhysicsImposter.getLinearVelocity().x;
        let velocityZ = -ballPhysicsImposter.getLinearVelocity().z;

        ballPhysicsImposter.setLinearVelocity(new BABYLON.Vector3(
            velocityX - velocityXBall,
            0,
            velocityZ
        ));

        collidedAgainst.setAngularVelocity(BABYLON.Vector3.Zero());
    }

    limitBallVelocity() {
        let velocityZ = this.ball.physicsImpostor.getLinearVelocity().z;
        let velocityZAbs = Math.abs(velocityZ);
        let clampedVelocityZ = BABYLON.MathTools.Clamp(velocityZAbs, this.minBallSpeed, this.maxBallSpeed);
        let direction = Math.sign(velocityZ);

        let velocityX = this.ball.physicsImpostor.getLinearVelocity().x;

        this.ball.physicsImpostor.setLinearVelocity(
            new BABYLON.Vector3(
                velocityX,
                0,
                clampedVelocityZ * direction
            )
        );
    }

    update(keyStates, playerPaddleVelocity) {
        if (this.isLaunched)
            this.limitBallVelocity();
        else {
            this.lockPositionToPlayerPaddle(playerPaddleVelocity);
        }

        if (!this.isLaunched) {
            this.launchBall(keyStates, playerPaddleVelocity);
        }
    }
}