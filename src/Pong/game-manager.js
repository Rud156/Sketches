/// <reference path="./../../typings/babylon.d.ts" />

class GameManager {
    constructor(scene, ballClassObject, paddleOne, paddleTwo) {
        this.highlightLayer_1 = new BABYLON.HighlightLayer('scoreBoardHighlight', scene);

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

        // TODO: Change at the end
        this.gameStarted = true;

        this.scoreBoard = BABYLON.MeshBuilder.CreatePlane('scoreBoard', {
            height: 16,
            width: 32,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.scoreBoard.position = new BABYLON.Vector3(0, 16, 36);
        this.highlightLayer_1.addMesh(this.scoreBoard, new BABYLON.Color3(1, 0.41, 0));
        this.highlightLayer_1.blurVerticalSize = 0.3;
        this.highlightLayer_1.blurHorizontalSize = 0.3;

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

        this.ballResetColliderMaterial = new BABYLON.StandardMaterial('resetMaterial', scene);
        this.ballResetColliderMaterial.diffuseColor = BABYLON.Color3.Black();
        this.ballResetCollider.material = this.ballResetColliderMaterial;

        this.scoreBoardMaterial = new BABYLON.StandardMaterial('scoreBoardMaterial', scene);
        // Options is to set the resolution - Or something like that
        this.scoreBoardTexture = new BABYLON.DynamicTexture('scoreBoardMaterialDynamic', 1024, scene, true);
        this.scoreBoardTextureContext = this.scoreBoardTexture.getContext();
        this.scoreBoardMaterial.diffuseTexture = this.scoreBoardTexture;
        this.scoreBoardMaterial.emissiveColor = BABYLON.Color3.Black();
        this.scoreBoardMaterial.specularColor = BABYLON.Color3.Red();
        this.scoreBoard.material = this.scoreBoardMaterial;

        this.scoreBoardTexture.drawText('Scores', 330, 150, `small-caps bolder 100px 'Quicksand', sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText('Player 1', 50, 400, `90px 'Quicksand', sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText('Player 2', 620, 400, `90px 'Quicksand', sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerOneScore}`, 150, 700, ` bolder 200px 'Quicksand', sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerTwoScore}`, 730, 700, `bolder 200px 'Quicksand', sans-serif`, '#ff6a00');


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

        this.scoreBoardTextureContext.clearRect(0, 500, 1024, 1024);
        this.scoreBoardTexture.drawText(`${this.playerOneScore}`, 150, 700, `bolder 200px 'Quicksand', sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerTwoScore}`, 730, 700, `bolder 200px 'Quicksand', sans-serif`, '#ff6a00');

        if (this.playerOneScore > this.maxScorePossible || this.playerTwoScore > this.maxScorePossible) {
            this.resetGame();
        }
    }

    resetGame() {
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.playingBall.resetBallStats();
        this.paddleOne.resetPaddle();
        this.paddleTwo.resetPaddle();

        this.gameStarted = false;
    }

    update() {
        this.ballResetCollider.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ballResetCollider.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }
}