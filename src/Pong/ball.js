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

    lockPositionToPlayerPaddle(playerPaddle, playerMovementSpeed) {

    }

    setCollisionComponents(imposters) {
        this.ball.physicsImpostor.registerOnPhysicsCollide(imposters, this.onTriggerEnter);
    }

    onTriggerEnter(ball, collidedAgainst) {
        let velocityX = collidedAgainst.getLinearVelocity().x;
        let velocityXBall = ball.getLinearVelocity().x;
        let velocityZ = -ball.getLinearVelocity().z;

        ball.setLinearVelocity(new BABYLON.Vector3(
            velocityX - velocityXBall,
            0,
            velocityZ
        ));

        collidedAgainst.setAngularVelocity(BABYLON.Vector3.Zero());
    }

    update() {
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
}