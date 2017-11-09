/// <reference path="./../../typings/babylon.d.ts" />

class GameManager {
    constructor(scene, ballClassObject, paddleOne, paddleTwo) {
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

        this.scoreBoard = BABYLON.MeshBuilder.CreatePlane('scoreBoard', {
            height: 16,
            width: 32,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.scoreBoard.position = new BABYLON.Vector3(0, 16, 36);

        this.ballResetCollider = BABYLON.MeshBuilder.CreateGround('ballCollider', {
            width: 64,
            height: 200,
            subdivisions: 2
        }, scene);
        this.ballResetCollider.position = new BABYLON.Vector3(0, -2, 0);
        this.ballResetCollider.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.ballResetCollider,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0,
                friction: 0,
                restitution: 0
            }
        );
        this.ballResetCollider.showBoundingBox = true;

        // TODO: Change to transparent material
        /**
         * var outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);
            outputplane.material.diffuseTexture = outputplaneTexture;
            outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
            outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            outputplane.material.backFaceCulling = false;

            var context = outputplaneTexture.getContext()
            
            
            scene.registerBeforeRender(() => {
                context.clearRect(0, 0, 512, 512);
                outputplaneTexture.drawText(sphere.position.x.toFixed(2), null, 140, "bold 80px verdana", "white");
                sphere.position.x += 0.01;
            });
         */
        this.ballResetColliderMaterial = new BABYLON.StandardMaterial('resetMaterial', scene);
        this.ballResetColliderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.ballResetCollider.material = this.ballResetColliderMaterial;

        this.scoreBoardMaterial = new BABYLON.StandardMaterial('scoreBoardMaterial', scene);
        // Options is to set the resolution
        this.scoreBoardTexture = new BABYLON.DynamicTexture('scoreBoardMaterialDynamic', 512, scene, true);
        this.scoreBoardMaterial.diffuseTexture = this.scoreBoardTexture;
        this.scoreBoardMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.scoreBoardMaterial.specularColor = new BABYLON.Color3(1, 0, 0);
        this.scoreBoard.material = this.scoreBoardMaterial;

        this.scoreBoardTexture.drawText('Scores', 155, 75, `bold 60px 'Quicksand', sans-serif`, 'white');


        this.playingBall = ballClassObject;
        this.paddleOne = paddleOne;
        this.paddleTwo = paddleTwo;

        this.onTriggerEnter = this.onTriggerEnter.bind(this);
    }

    setCollisionComponents(ballImposter) {
        this.ballResetCollider.physicsImpostor.registerOnPhysicsCollide(ballImposter, this.onTriggerEnter);
    }

    onTriggerEnter(ballResetImposter, collidedAgainst) {
        ballResetImposter.setLinearVelocity(BABYLON.Vector3.Zero());
        ballResetImposter.setAngularVelocity(BABYLON.Vector3.Zero());

        if (collidedAgainst.getObjectCenter().z < -34)
            this.playerTwoScore++;
        else if (collidedAgainst.getObjectCenter().z > 34)
            this.playerOneScore++;

        this.playingBall.resetBallStats();
        this.paddleOne.resetPaddle();
        this.paddleTwo.resetPaddle();

        if (this.playerOneScore > this.maxScorePossible || this.playerTwoScore > this.maxScorePossible) {
            // Someone Wins
            // Reset Game and move to older scene
        }
    }

    update() {
        this.ballResetCollider.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ballResetCollider.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }
}