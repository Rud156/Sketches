/// <reference path="./../../typings/babylon.d.ts" />

class Ball {
    constructor(scene, spawnPosition, ballId, color = 1) {
        this.minBallSpeed = 10;
        this.maxBallSpeed = 1000;

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

        this.ballMaterial = new BABYLON.StandardMaterial('playingBallMaterial', scene);
        this.ballMaterial.diffuseTexture = new BABYLON.Texture('/assets/flare.png', scene);
        this.ballMaterial.diffuseColor = BABYLON.Color3.Magenta();
        this.ball.material = this.ballMaterial;

        this.ballParticles = new BABYLON.ParticleSystem('playingBallParticles', 5000, scene);
        this.ballParticles.emitter = this.ball;
        this.ballParticles.particleTexture = new BABYLON.Texture('/assets/flare.png', scene);
        this.ballParticles.color1 = BABYLON.Color3.Red();
        this.ballParticles.color2 = BABYLON.Color3.Magenta();
        this.ballParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        this.ballParticles.minSize = 0.3;
        this.ballParticles.maxSize = 1;
        this.ballParticles.minLifeTime = 0.2;
        this.ballParticles.maxLifeTime = 0.4;
        this.ballParticles.minAngularSpeed = 0;
        this.ballParticles.maxAngularSpeed = Math.PI;
        this.ballParticles.emitRate = 1500;
        this.ballParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        this.ballParticles.minEmitPower = 1;
        this.ballParticles.maxEmitPower = 3;
        this.ballParticles.updateSpeed = 0.007;
        this.ballParticles.direction1 = BABYLON.Vector3.Zero();
        this.ballParticles.direction2 = BABYLON.Vector3.Zero();
        this.ballParticles.start();

        this.initialPosition = spawnPosition.clone();
        this.isLaunched = false;
        this.color = color;

        this.onTriggerEnter = this.onTriggerEnter.bind(this);
    }

    lockPositionToPlayerPaddle(playerPaddleVelocity) {
        this.ball.physicsImpostor.setLinearVelocity(playerPaddleVelocity);
    }

    launchBall(keyStates, playerPaddleVelocity) {
        if (keyStates[32]) {
            this.isLaunched = true;

            this.ball.physicsImpostor.setLinearVelocity(
                new BABYLON.Vector3(
                    playerPaddleVelocity.x,
                    0,
                    Math.random() * 10
                )
            );
        }
    }

    setCollisionComponents(impostersArray) {
        this.ball.physicsImpostor.registerOnPhysicsCollide(impostersArray, this.onTriggerEnter);
    }

    onTriggerEnter(ballPhysicsImposter, collidedAgainst) {
        let velocityX = collidedAgainst.getLinearVelocity().x;
        let velocityXBall = ballPhysicsImposter.getLinearVelocity().x;
        let velocityZ = -ballPhysicsImposter.getLinearVelocity().z;

        ballPhysicsImposter.setLinearVelocity(
            new BABYLON.Vector3(
                velocityX - velocityXBall,
                0,
                velocityZ
            ));

        collidedAgainst.setAngularVelocity(BABYLON.Vector3.Zero());
    }

    limitBallVelocity() {
        let velocity = this.ball.physicsImpostor.getLinearVelocity();

        let velocityZ = velocity.z;
        let velocityZAbs = Math.abs(velocityZ);
        let clampedVelocityZ = BABYLON.MathTools.Clamp(velocityZAbs, this.minBallSpeed, this.maxBallSpeed);
        let direction = Math.sign(velocityZ);

        let velocityX = velocity.x;
        let velocityY = velocity.y;

        this.ball.physicsImpostor.setLinearVelocity(
            new BABYLON.Vector3(
                velocityX,
                velocityY,
                clampedVelocityZ * direction
            )
        );
    }

    update(keyStates, playerPaddleVelocity) {
        if (this.isLaunched) {
            this.limitBallVelocity();
        } else {
            this.lockPositionToPlayerPaddle(playerPaddleVelocity);
            this.launchBall(keyStates, playerPaddleVelocity);
        }
    }

    resetBallStats() {
        this.ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ball.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        this.ball.position = this.initialPosition.clone();

        this.isLaunched = false;
    }
}