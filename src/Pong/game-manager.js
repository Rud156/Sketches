/// <reference path="./../../typings/babylon.d.ts" />

class GameManager {
    constructor(scene, ballClassObject, paddleOne, paddleTwo) {
        this.highlightLayer_1 = new BABYLON.HighlightLayer('scoreBoardHighlight', scene);

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

        this.gameStarted = false;
        this.currentLevel = 1;

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

        this.scoreBoardTexture.drawText(`Level ${this.currentLevel}`, 300, 150, `small-caps bolder 100px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText('Player 1', 50, 400, `90px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText('Computer', 520, 400, `90px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerOneScore}`, 150, 700, ` bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerTwoScore}`, 680, 700, `bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');


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
        this.scoreBoardTexture.drawText(`${this.playerOneScore}`, 150, 700, `bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${this.playerTwoScore}`, 680, 700, `bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');

        if (this.playerOneScore >= this.maxScorePossible) {
            this.currentLevel++;
            this.paddleOne.movementSpeed += 5;
            this.paddleTwo.movementSpeed += 5;
            this.resetGame();
        } else if (this.playerTwoScore >= this.maxScorePossible) {
            this.currentLevel = 1;
            this.paddleOne.movementSpeed = 5;
            this.paddleTwo.movementSpeed = 5;
            this.resetGame();
        }
    }

    resetGame() {
        if (this.playerOneScore > this.playerTwoScore) {
            document.getElementById('winnerName').innerText = 'Player 1 Wins';
            document.getElementById('replayButton').innerText = 'Next Level';
        } else {
            document.getElementById('winnerName').innerText = 'Computer Wins';
            document.getElementById('replayButton').innerText = 'Replay';
        }
        document.getElementsByClassName('end-overlay')[0].style.height = '100%';
        document.getElementById('player1Score').innerText = this.playerOneScore;
        document.getElementById('computerScore').innerText = this.playerTwoScore;

        this.gameStarted = false;

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.playingBall.resetBallStats();
        this.paddleOne.resetPaddle();
        this.paddleTwo.resetPaddle();

        this.scoreBoardTextureContext.clearRect(0, 0, 1024, 200);
        this.scoreBoardTexture.drawText(`Level ${this.currentLevel}`, 300, 150, `small-caps bolder 100px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTextureContext.clearRect(0, 500, 1024, 1024);
        this.scoreBoardTexture.drawText(`${0}`, 150, 700, `bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');
        this.scoreBoardTexture.drawText(`${0}`, 680, 700, `bolder 200px 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`, '#ff6a00');

    }

    update() {
        this.ballResetCollider.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ballResetCollider.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    }
}