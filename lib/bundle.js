'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = function () {
    function GameManager(scene, ballClassObject, paddleOne, paddleTwo) {
        _classCallCheck(this, GameManager);

        this.highlightLayer_1 = new BABYLON.HighlightLayer('scoreBoardHighlight', scene);

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

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
        this.ballResetCollider.physicsImpostor = new BABYLON.PhysicsImpostor(this.ballResetCollider, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            friction: 0,
            restitution: 0
        });

        this.ballResetColliderMaterial = new BABYLON.StandardMaterial('resetMaterial', scene);
        this.ballResetColliderMaterial.diffuseColor = BABYLON.Color3.Black();
        this.ballResetCollider.material = this.ballResetColliderMaterial;

        this.scoreBoardMaterial = new BABYLON.StandardMaterial('scoreBoardMaterial', scene);

        this.scoreBoardTexture = new BABYLON.DynamicTexture('scoreBoardMaterialDynamic', 1024, scene, true);
        this.scoreBoardTextureContext = this.scoreBoardTexture.getContext();
        this.scoreBoardMaterial.diffuseTexture = this.scoreBoardTexture;
        this.scoreBoardMaterial.emissiveColor = BABYLON.Color3.Black();
        this.scoreBoardMaterial.specularColor = BABYLON.Color3.Red();
        this.scoreBoard.material = this.scoreBoardMaterial;

        this.scoreBoardTexture.drawText('Scores', 330, 150, 'small-caps bolder 100px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('Player 1', 50, 400, '90px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('Computer', 520, 400, '90px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('' + this.playerOneScore, 150, 700, ' bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('' + this.playerTwoScore, 680, 700, 'bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');

        this.playingBall = ballClassObject;
        this.paddleOne = paddleOne;
        this.paddleTwo = paddleTwo;

        this.onTriggerEnter = this.onTriggerEnter.bind(this);
    }

    _createClass(GameManager, [{
        key: 'setCollisionComponents',
        value: function setCollisionComponents(ballImposter) {
            this.ballResetCollider.physicsImpostor.registerOnPhysicsCollide(ballImposter, this.onTriggerEnter);
        }
    }, {
        key: 'onTriggerEnter',
        value: function onTriggerEnter(ballResetImposter, collidedAgainst) {
            ballResetImposter.setLinearVelocity(BABYLON.Vector3.Zero());
            ballResetImposter.setAngularVelocity(BABYLON.Vector3.Zero());

            if (collidedAgainst.getObjectCenter().z < -34) this.playerTwoScore++;else if (collidedAgainst.getObjectCenter().z > 34) this.playerOneScore++;

            this.playingBall.resetBallStats();
            this.paddleOne.resetPaddle();
            this.paddleTwo.resetPaddle();

            this.scoreBoardTextureContext.clearRect(0, 500, 1024, 1024);
            this.scoreBoardTexture.drawText('' + this.playerOneScore, 150, 700, 'bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
            this.scoreBoardTexture.drawText('' + this.playerTwoScore, 680, 700, 'bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');

            if (this.playerOneScore >= this.maxScorePossible || this.playerTwoScore >= this.maxScorePossible) {
                this.resetGame();
            }
        }
    }, {
        key: 'resetGame',
        value: function resetGame() {
            if (this.playerOneScore > this.playerTwoScore) {
                document.getElementById('winnerName').innerText = 'Player 1 Wins';
            } else {
                document.getElementById('winnerName').innerText = 'Computer Wins';
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

            this.scoreBoardTextureContext.clearRect(0, 500, 1024, 1024);
            this.scoreBoardTexture.drawText('' + 0, 150, 700, 'bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
            this.scoreBoardTexture.drawText('' + 0, 680, 700, 'bolder 200px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
        }
    }, {
        key: 'update',
        value: function update() {
            this.ballResetCollider.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            this.ballResetCollider.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        }
    }]);

    return GameManager;
}();

var Ball = function () {
    function Ball(scene, spawnPosition, ballId) {
        var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

        _classCallCheck(this, Ball);

        this.minBallSpeed = 10;
        this.maxBallSpeed = 100;

        this.ball = BABYLON.MeshBuilder.CreateSphere('playBall', {
            segments: 16,
            diameter: 1
        }, scene);
        this.ball.physicsImpostor = new BABYLON.PhysicsImpostor(this.ball, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction: 0,
            restitution: 1
        }, scene);
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

    _createClass(Ball, [{
        key: 'lockPositionToPlayerPaddle',
        value: function lockPositionToPlayerPaddle(playerPaddleVelocity) {
            this.ball.physicsImpostor.setLinearVelocity(playerPaddleVelocity);
        }
    }, {
        key: 'launchBall',
        value: function launchBall(keyStates, playerPaddleVelocity) {
            if (keyStates[32]) {
                this.isLaunched = true;

                this.ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(playerPaddleVelocity.x, 0, Math.random() * 10));
            }
        }
    }, {
        key: 'setCollisionComponents',
        value: function setCollisionComponents(impostersArray) {
            this.ball.physicsImpostor.registerOnPhysicsCollide(impostersArray, this.onTriggerEnter);
        }
    }, {
        key: 'onTriggerEnter',
        value: function onTriggerEnter(ballPhysicsImposter, collidedAgainst) {
            var velocityX = collidedAgainst.getLinearVelocity().x;
            var velocityXBall = ballPhysicsImposter.getLinearVelocity().x;
            var velocityZ = -ballPhysicsImposter.getLinearVelocity().z;

            ballPhysicsImposter.setLinearVelocity(new BABYLON.Vector3(velocityX - velocityXBall, 0, velocityZ));

            collidedAgainst.setAngularVelocity(BABYLON.Vector3.Zero());
        }
    }, {
        key: 'limitBallVelocity',
        value: function limitBallVelocity() {
            var velocity = this.ball.physicsImpostor.getLinearVelocity();

            var velocityZ = velocity.z;
            var velocityZAbs = Math.abs(velocityZ);
            var clampedVelocityZ = BABYLON.MathTools.Clamp(velocityZAbs, this.minBallSpeed, this.maxBallSpeed);
            var direction = Math.sign(velocityZ);

            var velocityX = velocity.x;
            var velocityY = velocity.y;

            this.ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocityX, velocityY, clampedVelocityZ * direction));
        }
    }, {
        key: 'update',
        value: function update(keyStates, playerPaddleVelocity) {
            if (this.isLaunched) {
                this.limitBallVelocity();
            } else {
                this.lockPositionToPlayerPaddle(playerPaddleVelocity);
                this.launchBall(keyStates, playerPaddleVelocity);
            }
        }
    }, {
        key: 'resetBallStats',
        value: function resetBallStats() {
            this.ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            this.ball.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            this.ball.position = this.initialPosition.clone();

            this.isLaunched = false;
        }
    }]);

    return Ball;
}();

var Paddle = function () {
    function Paddle(name, scene, spawnPosition, paddleId, isAI) {
        var keys = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [37, 39];
        var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

        _classCallCheck(this, Paddle);

        this.paddle = BABYLON.MeshBuilder.CreateBox('paddle_' + name, {
            width: 5,
            height: 1,
            depth: 1
        }, scene);
        this.paddle.position = spawnPosition;
        this.paddle.physicsImpostor = new BABYLON.PhysicsImpostor(this.paddle, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 1,
            friction: 0,
            restitution: 0
        }, scene);
        this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.paddle.physicsImpostor.uniqueId = paddleId;

        this.paddleHighlight = new BABYLON.HighlightLayer('paddle_' + name + '_highlight', scene);
        this.paddleHighlight.addMesh(this.paddle, BABYLON.Color3.Yellow());
        this.paddleHighlight.blurHorizontalSize = 0.1;
        this.paddleHighlight.blurVerticalSize = 0.1;
        this.paddleMaterial = new BABYLON.StandardMaterial('paddle_' + name + '_material', scene);
        this.paddleMaterial.diffuseColor = BABYLON.Color3.Black();
        this.paddle.material = this.paddleMaterial;

        this.initialPosition = spawnPosition.clone();
        this.color = color;
        this.movementSpeed = 5;
        this.keys = keys;

        this.isAI = isAI;
    }

    _createClass(Paddle, [{
        key: 'movePaddle',
        value: function movePaddle(keyStates) {
            if (keyStates[this.keys[0]]) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
            } else if (keyStates[this.keys[1]]) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
            }

            if (!keyStates[this.keys[0]] && !keyStates[this.keys[1]] || keyStates[this.keys[0]] && keyStates[this.keys[1]]) this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        }
    }, {
        key: 'movePaddleAI',
        value: function movePaddleAI(ballClass) {
            if (ballClass.isLaunched) {
                var desiredDirection = Math.sign(ballClass.ball.position.x - this.paddle.position.x);

                if (desiredDirection === -1) {
                    this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
                } else if (desiredDirection === 1) {
                    this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
                } else {
                    this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
                }
            }
        }
    }, {
        key: 'update',
        value: function update(keyStates, ballClass) {
            if (!this.isAI) this.movePaddle(keyStates);else this.movePaddleAI(ballClass);

            this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        }
    }, {
        key: 'resetPaddle',
        value: function resetPaddle() {
            this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            this.paddle.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            this.paddle.position = this.initialPosition.clone();
        }
    }]);

    return Paddle;
}();

var canvasHolder = document.getElementById('canvas-holder');
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 25;
canvas.height = window.innerHeight - 30;
canvasHolder.appendChild(canvas);
var engine = new BABYLON.Engine(canvas, true);

var keyStates = {
    32: false,
    37: false,
    38: false,
    39: false,
    40: false,
    87: false,
    65: false,
    83: false,
    68: false };
window.addEventListener('keydown', function (event) {
    if (event.keyCode in keyStates) keyStates[event.keyCode] = true;
});
window.addEventListener('keyup', function (event) {
    if (event.keyCode in keyStates) keyStates[event.keyCode] = false;
});

var createDOMElementsStart = function createDOMElementsStart() {
    var homeOverlay = document.createElement('div');
    homeOverlay.className = 'overlay';

    var homeOverlayContent = document.createElement('div');
    homeOverlayContent.className = 'overlay-content';
    homeOverlay.appendChild(homeOverlayContent);

    var headerContent = document.createElement('div');
    headerContent.className = 'header';
    headerContent.innerText = 'Pong';

    var mainContentHolder = document.createElement('div');
    mainContentHolder.className = 'main-content-holder';

    var startButton = document.createElement('span');
    startButton.className = 'start-button';
    startButton.innerText = 'Start Game';
    startButton.addEventListener('click', function () {
        homeOverlay.style.width = '0';
        gameManager.gameStarted = true;
    });

    var helpContent = document.createElement('div');
    helpContent.className = 'help-content';
    helpContent.innerText = 'A pong game made using BABYLON.JS. Use ARROW KEYS to control and SPACE to launch the ball.';

    mainContentHolder.appendChild(startButton);
    mainContentHolder.appendChild(helpContent);
    homeOverlayContent.appendChild(headerContent);
    homeOverlayContent.appendChild(mainContentHolder);
    document.body.appendChild(homeOverlay);
};

var createDOMElementsEnd = function createDOMElementsEnd() {
    var endOverlay = document.createElement('div');
    endOverlay.className = 'end-overlay';

    var endOverlayContent = document.createElement('overlay-content');
    endOverlayContent.className = 'overlay-content';
    endOverlay.appendChild(endOverlayContent);

    var header = document.createElement('div');
    header.className = 'header';
    header.id = 'winnerName';

    var replayButton = document.createElement('span');
    replayButton.className = 'start-button';
    replayButton.innerText = 'Replay';
    replayButton.addEventListener('click', function () {
        endOverlay.style.height = '0';
        gameManager.gameStarted = true;
    });

    var playerHolder = document.createElement('div');
    playerHolder.className = 'player-holder';

    var playerOne = document.createElement('div');
    var computer = document.createElement('div');
    playerOne.className = 'player';
    computer.className = 'player';

    var playerOneName = document.createElement('div');
    playerOneName.className = 'name-holder';
    var computerName = document.createElement('div');
    computerName.className = 'name-holder';
    playerOneName.innerText = 'Player 1';
    computerName.innerText = 'Computer';

    var playerOneScore = document.createElement('div');
    playerOneScore.className = 'score-holder';
    playerOneScore.id = 'player1Score';
    var computerScore = document.createElement('div');
    computerScore.className = 'score-holder';
    computerScore.id = 'computerScore';

    playerOne.appendChild(playerOneName);
    playerOne.appendChild(playerOneScore);
    computer.appendChild(computerName);
    computer.appendChild(computerScore);

    playerHolder.appendChild(playerOne);
    playerHolder.appendChild(computer);

    endOverlayContent.appendChild(header);
    endOverlayContent.appendChild(playerHolder);
    endOverlayContent.appendChild(replayButton);
    document.body.appendChild(endOverlay);
};

var createScene = function createScene() {
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.clearColor = BABYLON.Color3.Black();

    var groundHighlight = new BABYLON.HighlightLayer('groundHighlight', scene);
    groundHighlight.blurHorizontalSize = 0.3;
    groundHighlight.blurVerticalSize = 0.3;
    groundHighlight.innerGlow = 0;

    var camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(0, 20, -60), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    var light = new BABYLON.HemisphericLight('mainLight', new BABYLON.Vector3(0, 1, 0), scene);

    var genericBlackMaterial = new BABYLON.StandardMaterial('blackMaterial', scene);
    genericBlackMaterial.diffuseColor = BABYLON.Color3.Black();

    var ground = BABYLON.MeshBuilder.CreateGround('mainGround', {
        width: 32,
        height: 70,
        subdivisions: 2
    }, scene);
    ground.position = BABYLON.Vector3.Zero();
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 0,
        restitution: 0
    }, scene);
    ground.material = genericBlackMaterial;
    groundHighlight.addMesh(ground, BABYLON.Color3.Red());

    var leftBar = BABYLON.MeshBuilder.CreateBox('leftBar', {
        width: 2,
        height: 2,
        depth: 70
    }, scene);
    leftBar.position = new BABYLON.Vector3(-15, 1, 0);
    leftBar.physicsImpostor = new BABYLON.PhysicsImpostor(leftBar, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 0,
        restitution: 1
    });
    leftBar.material = genericBlackMaterial;

    var rightBar = BABYLON.MeshBuilder.CreateBox('rightBar', {
        width: 2,
        height: 2,
        depth: 70
    }, scene);
    rightBar.position = new BABYLON.Vector3(15, 1, 0);
    rightBar.physicsImpostor = new BABYLON.PhysicsImpostor(rightBar, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 0,
        restitution: 1
    });
    rightBar.material = genericBlackMaterial;

    return scene;
};
createDOMElementsStart();
createDOMElementsEnd();
var scene = createScene();


var player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
var aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

var playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

var gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);
var testHighlight = new BABYLON.HighlightLayer('testHighlight', scene);
testHighlight.blurHorizontalSize = 0.3;
testHighlight.blurVerticalSize = 0.3;
testHighlight.addMesh(gameManager.ballResetCollider, BABYLON.Color3.Red());
testHighlight.addExcludedMesh(player_1.paddle);
testHighlight.addExcludedMesh(aiPlayer.paddle);
var groundHighlight = scene.getHighlightLayerByName('groundHighlight');
groundHighlight.addExcludedMesh(player_1.paddle);
groundHighlight.addExcludedMesh(aiPlayer.paddle);

engine.runRenderLoop(function () {
    if (!gameManager.gameStarted) {
        for (var key in keyStates) {
            keyStates[key] = false;
        }
    }

    playingBall.update(keyStates, player_1.paddle.physicsImpostor.getLinearVelocity());
    player_1.update(keyStates, playingBall);
    aiPlayer.update(keyStates, playingBall);

    gameManager.update();
    scene.render();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwiaGlnaGxpZ2h0TGF5ZXJfMSIsIkJBQllMT04iLCJIaWdobGlnaHRMYXllciIsInBsYXllck9uZVNjb3JlIiwicGxheWVyVHdvU2NvcmUiLCJtYXhTY29yZVBvc3NpYmxlIiwiZ2FtZVN0YXJ0ZWQiLCJzY29yZUJvYXJkIiwiTWVzaEJ1aWxkZXIiLCJDcmVhdGVQbGFuZSIsImhlaWdodCIsIndpZHRoIiwic2lkZU9yaWVudGF0aW9uIiwiTWVzaCIsIkRPVUJMRVNJREUiLCJwb3NpdGlvbiIsIlZlY3RvcjMiLCJhZGRNZXNoIiwiQ29sb3IzIiwiYmx1clZlcnRpY2FsU2l6ZSIsImJsdXJIb3Jpem9udGFsU2l6ZSIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwiQmxhY2siLCJtYXRlcmlhbCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJzY29yZUJvYXJkVGV4dHVyZUNvbnRleHQiLCJnZXRDb250ZXh0IiwiZGlmZnVzZVRleHR1cmUiLCJlbWlzc2l2ZUNvbG9yIiwic3BlY3VsYXJDb2xvciIsIlJlZCIsImRyYXdUZXh0IiwicGxheWluZ0JhbGwiLCJvblRyaWdnZXJFbnRlciIsImJpbmQiLCJiYWxsSW1wb3N0ZXIiLCJyZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUiLCJiYWxsUmVzZXRJbXBvc3RlciIsImNvbGxpZGVkQWdhaW5zdCIsInNldExpbmVhclZlbG9jaXR5IiwiWmVybyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImdldE9iamVjdENlbnRlciIsInoiLCJyZXNldEJhbGxTdGF0cyIsInJlc2V0UGFkZGxlIiwiY2xlYXJSZWN0IiwicmVzZXRHYW1lIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImlubmVyVGV4dCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJzdHlsZSIsIkJhbGwiLCJzcGF3blBvc2l0aW9uIiwiYmFsbElkIiwiY29sb3IiLCJtaW5CYWxsU3BlZWQiLCJtYXhCYWxsU3BlZWQiLCJiYWxsIiwiQ3JlYXRlU3BoZXJlIiwic2VnbWVudHMiLCJkaWFtZXRlciIsIlNwaGVyZUltcG9zdG9yIiwidW5pcXVlSWQiLCJiYWxsTWF0ZXJpYWwiLCJUZXh0dXJlIiwiTWFnZW50YSIsImJhbGxQYXJ0aWNsZXMiLCJQYXJ0aWNsZVN5c3RlbSIsImVtaXR0ZXIiLCJwYXJ0aWNsZVRleHR1cmUiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvckRlYWQiLCJDb2xvcjQiLCJtaW5TaXplIiwibWF4U2l6ZSIsIm1pbkxpZmVUaW1lIiwibWF4TGlmZVRpbWUiLCJtaW5Bbmd1bGFyU3BlZWQiLCJtYXhBbmd1bGFyU3BlZWQiLCJNYXRoIiwiUEkiLCJlbWl0UmF0ZSIsImJsZW5kTW9kZSIsIkJMRU5ETU9ERV9PTkVPTkUiLCJtaW5FbWl0UG93ZXIiLCJtYXhFbWl0UG93ZXIiLCJ1cGRhdGVTcGVlZCIsImRpcmVjdGlvbjEiLCJkaXJlY3Rpb24yIiwic3RhcnQiLCJpbml0aWFsUG9zaXRpb24iLCJjbG9uZSIsImlzTGF1bmNoZWQiLCJwbGF5ZXJQYWRkbGVWZWxvY2l0eSIsImtleVN0YXRlcyIsIngiLCJyYW5kb20iLCJpbXBvc3RlcnNBcnJheSIsImJhbGxQaHlzaWNzSW1wb3N0ZXIiLCJ2ZWxvY2l0eVgiLCJnZXRMaW5lYXJWZWxvY2l0eSIsInZlbG9jaXR5WEJhbGwiLCJ2ZWxvY2l0eVoiLCJ2ZWxvY2l0eSIsInZlbG9jaXR5WkFicyIsImFicyIsImNsYW1wZWRWZWxvY2l0eVoiLCJNYXRoVG9vbHMiLCJDbGFtcCIsImRpcmVjdGlvbiIsInNpZ24iLCJ2ZWxvY2l0eVkiLCJ5IiwibGltaXRCYWxsVmVsb2NpdHkiLCJsb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZSIsImxhdW5jaEJhbGwiLCJQYWRkbGUiLCJuYW1lIiwicGFkZGxlSWQiLCJpc0FJIiwia2V5cyIsInBhZGRsZSIsIkNyZWF0ZUJveCIsImRlcHRoIiwicGFkZGxlSGlnaGxpZ2h0IiwiWWVsbG93IiwicGFkZGxlTWF0ZXJpYWwiLCJtb3ZlbWVudFNwZWVkIiwiTGVmdCIsInNjYWxlIiwiUmlnaHQiLCJiYWxsQ2xhc3MiLCJkZXNpcmVkRGlyZWN0aW9uIiwibW92ZVBhZGRsZSIsIm1vdmVQYWRkbGVBSSIsImNhbnZhc0hvbGRlciIsImNhbnZhcyIsImNyZWF0ZUVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJhcHBlbmRDaGlsZCIsImVuZ2luZSIsIkVuZ2luZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImtleUNvZGUiLCJjcmVhdGVET01FbGVtZW50c1N0YXJ0IiwiaG9tZU92ZXJsYXkiLCJjbGFzc05hbWUiLCJob21lT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXJDb250ZW50IiwibWFpbkNvbnRlbnRIb2xkZXIiLCJzdGFydEJ1dHRvbiIsImdhbWVNYW5hZ2VyIiwiaGVscENvbnRlbnQiLCJib2R5IiwiY3JlYXRlRE9NRWxlbWVudHNFbmQiLCJlbmRPdmVybGF5IiwiZW5kT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXIiLCJpZCIsInJlcGxheUJ1dHRvbiIsInBsYXllckhvbGRlciIsInBsYXllck9uZSIsImNvbXB1dGVyIiwicGxheWVyT25lTmFtZSIsImNvbXB1dGVyTmFtZSIsImNvbXB1dGVyU2NvcmUiLCJjcmVhdGVTY2VuZSIsIlNjZW5lIiwiZW5hYmxlUGh5c2ljcyIsIkNhbm5vbkpTUGx1Z2luIiwiY29sbGlzaW9uc0VuYWJsZWQiLCJ3b3JrZXJDb2xsaXNpb25zIiwiY2xlYXJDb2xvciIsImdyb3VuZEhpZ2hsaWdodCIsImlubmVyR2xvdyIsImNhbWVyYSIsIkZyZWVDYW1lcmEiLCJzZXRUYXJnZXQiLCJsaWdodCIsIkhlbWlzcGhlcmljTGlnaHQiLCJnZW5lcmljQmxhY2tNYXRlcmlhbCIsImdyb3VuZCIsImxlZnRCYXIiLCJyaWdodEJhciIsInBsYXllcl8xIiwiYWlQbGF5ZXIiLCJzZXRDb2xsaXNpb25Db21wb25lbnRzIiwidGVzdEhpZ2hsaWdodCIsImFkZEV4Y2x1ZGVkTWVzaCIsImdldEhpZ2hsaWdodExheWVyQnlOYW1lIiwicnVuUmVuZGVyTG9vcCIsImtleSIsInVwZGF0ZSIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFc7QUFDRix5QkFBWUMsS0FBWixFQUFtQkMsZUFBbkIsRUFBb0NDLFNBQXBDLEVBQStDQyxTQUEvQyxFQUEwRDtBQUFBOztBQUN0RCxhQUFLQyxnQkFBTCxHQUF3QixJQUFJQyxRQUFRQyxjQUFaLENBQTJCLHFCQUEzQixFQUFrRE4sS0FBbEQsQ0FBeEI7O0FBRUEsYUFBS08sY0FBTCxHQUFzQixDQUF0QjtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxhQUFLQyxnQkFBTCxHQUF3QixDQUF4Qjs7QUFHQSxhQUFLQyxXQUFMLEdBQW1CLElBQW5COztBQUVBLGFBQUtDLFVBQUwsR0FBa0JOLFFBQVFPLFdBQVIsQ0FBb0JDLFdBQXBCLENBQWdDLFlBQWhDLEVBQThDO0FBQzVEQyxvQkFBUSxFQURvRDtBQUU1REMsbUJBQU8sRUFGcUQ7QUFHNURDLDZCQUFpQlgsUUFBUVksSUFBUixDQUFhQztBQUg4QixTQUE5QyxFQUlmbEIsS0FKZSxDQUFsQjtBQUtBLGFBQUtXLFVBQUwsQ0FBZ0JRLFFBQWhCLEdBQTJCLElBQUlkLFFBQVFlLE9BQVosQ0FBb0IsQ0FBcEIsRUFBdUIsRUFBdkIsRUFBMkIsRUFBM0IsQ0FBM0I7QUFDQSxhQUFLaEIsZ0JBQUwsQ0FBc0JpQixPQUF0QixDQUE4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MkwsY0FBYzdMLE9BQWQsQ0FBc0J5SixZQUFZckosaUJBQWxDLEVBQXFEcEIsUUFBUWlCLE1BQVIsQ0FBZXlCLEdBQWYsRUFBckQ7QUFDQW1LLGNBQWNDLGVBQWQsQ0FBOEJKLFNBQVNsRSxNQUF2QztBQUNBcUUsY0FBY0MsZUFBZCxDQUE4QkgsU0FBU25FLE1BQXZDO0FBQ0EsSUFBTXVELGtCQUFrQnBNLE1BQU1vTix1QkFBTixDQUE4QixpQkFBOUIsQ0FBeEI7QUFDQWhCLGdCQUFnQmUsZUFBaEIsQ0FBZ0NKLFNBQVNsRSxNQUF6QztBQUNBdUQsZ0JBQWdCZSxlQUFoQixDQUFnQ0gsU0FBU25FLE1BQXpDOztBQUVBcUIsT0FBT21ELGFBQVAsQ0FBcUIsWUFBTTtBQUN2QixRQUFJLENBQUN2QyxZQUFZcEssV0FBakIsRUFBOEI7QUFDMUIsYUFBSyxJQUFJNE0sR0FBVCxJQUFnQnBHLFNBQWhCLEVBQTJCO0FBQ3ZCQSxzQkFBVW9HLEdBQVYsSUFBaUIsS0FBakI7QUFDSDtBQUNKOztBQUVEckssZ0JBQVlzSyxNQUFaLENBQW1CckcsU0FBbkIsRUFBOEI2RixTQUFTbEUsTUFBVCxDQUFnQmpILGVBQWhCLENBQWdDNEYsaUJBQWhDLEVBQTlCO0FBQ0F1RixhQUFTUSxNQUFULENBQWdCckcsU0FBaEIsRUFBMkJqRSxXQUEzQjtBQUNBK0osYUFBU08sTUFBVCxDQUFnQnJHLFNBQWhCLEVBQTJCakUsV0FBM0I7O0FBRUE2SCxnQkFBWXlDLE1BQVo7QUFDQXZOLFVBQU13TixNQUFOO0FBQ0gsQ0FiRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XG5cbmNsYXNzIEdhbWVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgYmFsbENsYXNzT2JqZWN0LCBwYWRkbGVPbmUsIHBhZGRsZVR3bykge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcignc2NvcmVCb2FyZEhpZ2hsaWdodCcsIHNjZW5lKTtcblxuICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XG4gICAgICAgIHRoaXMubWF4U2NvcmVQb3NzaWJsZSA9IDU7XG5cbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIGF0IHRoZSBlbmRcbiAgICAgICAgdGhpcy5nYW1lU3RhcnRlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5zY29yZUJvYXJkID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVQbGFuZSgnc2NvcmVCb2FyZCcsIHtcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICB3aWR0aDogMzIsXG4gICAgICAgICAgICBzaWRlT3JpZW50YXRpb246IEJBQllMT04uTWVzaC5ET1VCTEVTSURFXG4gICAgICAgIH0sIHNjZW5lKTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAxNiwgMzYpO1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYWRkTWVzaCh0aGlzLnNjb3JlQm9hcmQsIG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLjQxLCAwKSk7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMS5ibHVyVmVydGljYWxTaXplID0gMC4zO1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYmx1ckhvcml6b250YWxTaXplID0gMC4zO1xuXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnYmFsbENvbGxpZGVyJywge1xuICAgICAgICAgICAgd2lkdGg6IDY0LFxuICAgICAgICAgICAgaGVpZ2h0OiAyMDAsXG4gICAgICAgICAgICBzdWJkaXZpc2lvbnM6IDJcbiAgICAgICAgfSwgc2NlbmUpO1xuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAtMiwgMCk7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxuICAgICAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlcixcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Jlc2V0TWF0ZXJpYWwnLCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLm1hdGVyaWFsID0gdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsO1xuXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnc2NvcmVCb2FyZE1hdGVyaWFsJywgc2NlbmUpO1xuICAgICAgICAvLyBPcHRpb25zIGlzIHRvIHNldCB0aGUgcmVzb2x1dGlvbiAtIE9yIHNvbWV0aGluZyBsaWtlIHRoYXRcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZSA9IG5ldyBCQUJZTE9OLkR5bmFtaWNUZXh0dXJlKCdzY29yZUJvYXJkTWF0ZXJpYWxEeW5hbWljJywgMTAyNCwgc2NlbmUsIHRydWUpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dCA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZ2V0Q29udGV4dCgpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmU7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmVtaXNzaXZlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuUmVkKCk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5tYXRlcmlhbCA9IHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsO1xuXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1Njb3JlcycsIDMzMCwgMTUwLCBgc21hbGwtY2FwcyBib2xkZXIgMTAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dCgnUGxheWVyIDEnLCA1MCwgNDAwLCBgOTBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdDb21wdXRlcicsIDUyMCwgNDAwLCBgOTBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyT25lU2NvcmV9YCwgMTUwLCA3MDAsIGAgYm9sZGVyIDIwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJUd29TY29yZX1gLCA2ODAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuXG5cbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbCA9IGJhbGxDbGFzc09iamVjdDtcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUgPSBwYWRkbGVPbmU7XG4gICAgICAgIHRoaXMucGFkZGxlVHdvID0gcGFkZGxlVHdvO1xuXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhiYWxsSW1wb3N0ZXIpIHtcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3IucmVnaXN0ZXJPblBoeXNpY3NDb2xsaWRlKGJhbGxJbXBvc3RlciwgdGhpcy5vblRyaWdnZXJFbnRlcik7XG4gICAgfVxuXG4gICAgb25UcmlnZ2VyRW50ZXIoYmFsbFJlc2V0SW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xuICAgICAgICBiYWxsUmVzZXRJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuXG4gICAgICAgIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA8IC0zNClcbiAgICAgICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUrKztcbiAgICAgICAgZWxzZSBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPiAzNClcbiAgICAgICAgICAgIHRoaXMucGxheWVyT25lU2NvcmUrKztcblxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsLnJlc2V0QmFsbFN0YXRzKCk7XG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XG5cbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQuY2xlYXJSZWN0KDAsIDUwMCwgMTAyNCwgMTAyNCk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyVHdvU2NvcmV9YCwgNjgwLCA3MDAsIGBib2xkZXIgMjAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcblxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJPbmVTY29yZSA+PSB0aGlzLm1heFNjb3JlUG9zc2libGUgfHwgdGhpcy5wbGF5ZXJUd29TY29yZSA+PSB0aGlzLm1heFNjb3JlUG9zc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldEdhbWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBsYXllck9uZVNjb3JlID4gdGhpcy5wbGF5ZXJUd29TY29yZSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dpbm5lck5hbWUnKS5pbm5lclRleHQgPSAnUGxheWVyIDEgV2lucyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2lubmVyTmFtZScpLmlubmVyVGV4dCA9ICdDb21wdXRlciBXaW5zJztcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdlbmQtb3ZlcmxheScpWzBdLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcjFTY29yZScpLmlubmVyVGV4dCA9IHRoaXMucGxheWVyT25lU2NvcmU7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb21wdXRlclNjb3JlJykuaW5uZXJUZXh0ID0gdGhpcy5wbGF5ZXJUd29TY29yZTtcblxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XG4gICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUgPSAwO1xuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsLnJlc2V0QmFsbFN0YXRzKCk7XG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XG5cbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQuY2xlYXJSZWN0KDAsIDUwMCwgMTAyNCwgMTAyNCk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7MH1gLCAxNTAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAkezB9YCwgNjgwLCA3MDAsIGBib2xkZXIgMjAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcblxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICB9XG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XG5cbmNsYXNzIEJhbGwge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBzcGF3blBvc2l0aW9uLCBiYWxsSWQsIGNvbG9yID0gMSkge1xuICAgICAgICB0aGlzLm1pbkJhbGxTcGVlZCA9IDEwO1xuICAgICAgICB0aGlzLm1heEJhbGxTcGVlZCA9IDEwMDtcblxuICAgICAgICB0aGlzLmJhbGwgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgncGxheUJhbGwnLCB7XG4gICAgICAgICAgICBzZWdtZW50czogMTYsXG4gICAgICAgICAgICBkaWFtZXRlcjogMVxuICAgICAgICB9LCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXG4gICAgICAgICAgICB0aGlzLmJhbGwsXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3Rvciwge1xuICAgICAgICAgICAgICAgIG1hc3M6IDEsXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzY2VuZVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gYmFsbElkO1xuXG4gICAgICAgIHRoaXMuYmFsbE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncGxheWluZ0JhbGxNYXRlcmlhbCcsIHNjZW5lKTtcbiAgICAgICAgdGhpcy5iYWxsTWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCcvYXNzZXRzL2ZsYXJlLnBuZycsIHNjZW5lKTtcbiAgICAgICAgdGhpcy5iYWxsTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuTWFnZW50YSgpO1xuICAgICAgICB0aGlzLmJhbGwubWF0ZXJpYWwgPSB0aGlzLmJhbGxNYXRlcmlhbDtcblxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMgPSBuZXcgQkFCWUxPTi5QYXJ0aWNsZVN5c3RlbSgncGxheWluZ0JhbGxQYXJ0aWNsZXMnLCA1MDAwLCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5lbWl0dGVyID0gdGhpcy5iYWxsO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMucGFydGljbGVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgnL2Fzc2V0cy9mbGFyZS5wbmcnLCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5jb2xvcjEgPSBCQUJZTE9OLkNvbG9yMy5SZWQoKTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmNvbG9yMiA9IEJBQllMT04uQ29sb3IzLk1hZ2VudGEoKTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmNvbG9yRGVhZCA9IG5ldyBCQUJZTE9OLkNvbG9yNCgwLCAwLCAwLCAwLjApO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluU2l6ZSA9IDAuMztcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1heFNpemUgPSAxO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluTGlmZVRpbWUgPSAwLjI7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5tYXhMaWZlVGltZSA9IDAuNDtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1pbkFuZ3VsYXJTcGVlZCA9IDA7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5tYXhBbmd1bGFyU3BlZWQgPSBNYXRoLlBJO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuZW1pdFJhdGUgPSAxNTAwO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuYmxlbmRNb2RlID0gQkFCWUxPTi5QYXJ0aWNsZVN5c3RlbS5CTEVORE1PREVfT05FT05FO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluRW1pdFBvd2VyID0gMTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1heEVtaXRQb3dlciA9IDM7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy51cGRhdGVTcGVlZCA9IDAuMDA3O1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuZGlyZWN0aW9uMSA9IEJBQllMT04uVmVjdG9yMy5aZXJvKCk7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5kaXJlY3Rpb24yID0gQkFCWUxPTi5WZWN0b3IzLlplcm8oKTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBzcGF3blBvc2l0aW9uLmNsb25lKCk7XG4gICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG5cbiAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlciA9IHRoaXMub25UcmlnZ2VyRW50ZXIuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBsb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZShwbGF5ZXJQYWRkbGVWZWxvY2l0eSkge1xuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KHBsYXllclBhZGRsZVZlbG9jaXR5KTtcbiAgICB9XG5cbiAgICBsYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcbiAgICAgICAgaWYgKGtleVN0YXRlc1szMl0pIHtcbiAgICAgICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoXG4gICAgICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGFkZGxlVmVsb2NpdHkueCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSAqIDEwXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldENvbGxpc2lvbkNvbXBvbmVudHMoaW1wb3N0ZXJzQXJyYXkpIHtcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoaW1wb3N0ZXJzQXJyYXksIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xuICAgIH1cblxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxQaHlzaWNzSW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xuICAgICAgICBsZXQgdmVsb2NpdHlYID0gY29sbGlkZWRBZ2FpbnN0LmdldExpbmVhclZlbG9jaXR5KCkueDtcbiAgICAgICAgbGV0IHZlbG9jaXR5WEJhbGwgPSBiYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkueDtcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IC1iYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkuejtcblxuICAgICAgICBiYWxsUGh5c2ljc0ltcG9zdGVyLnNldExpbmVhclZlbG9jaXR5KFxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVggLSB2ZWxvY2l0eVhCYWxsLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlaXG4gICAgICAgICAgICApKTtcblxuICAgICAgICBjb2xsaWRlZEFnYWluc3Quc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgIH1cblxuICAgIGxpbWl0QmFsbFZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCk7XG5cbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IHZlbG9jaXR5Lno7XG4gICAgICAgIGxldCB2ZWxvY2l0eVpBYnMgPSBNYXRoLmFicyh2ZWxvY2l0eVopO1xuICAgICAgICBsZXQgY2xhbXBlZFZlbG9jaXR5WiA9IEJBQllMT04uTWF0aFRvb2xzLkNsYW1wKHZlbG9jaXR5WkFicywgdGhpcy5taW5CYWxsU3BlZWQsIHRoaXMubWF4QmFsbFNwZWVkKTtcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguc2lnbih2ZWxvY2l0eVopO1xuXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSB2ZWxvY2l0eS54O1xuICAgICAgICBsZXQgdmVsb2NpdHlZID0gdmVsb2NpdHkueTtcblxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KFxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVgsXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlZLFxuICAgICAgICAgICAgICAgIGNsYW1wZWRWZWxvY2l0eVogKiBkaXJlY3Rpb25cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoa2V5U3RhdGVzLCBwbGF5ZXJQYWRkbGVWZWxvY2l0eSkge1xuICAgICAgICBpZiAodGhpcy5pc0xhdW5jaGVkKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0QmFsbFZlbG9jaXR5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMubGF1bmNoQmFsbChrZXlTdGF0ZXMsIHBsYXllclBhZGRsZVZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0QmFsbFN0YXRzKCkge1xuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb24uY2xvbmUoKTtcblxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcbiAgICB9XG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XG5cbmNsYXNzIFBhZGRsZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgc2NlbmUsIHNwYXduUG9zaXRpb24sIHBhZGRsZUlkLCBpc0FJLCBrZXlzID0gWzM3LCAzOV0sIGNvbG9yID0gMSkge1xuICAgICAgICB0aGlzLnBhZGRsZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KGBwYWRkbGVfJHtuYW1lfWAsIHtcbiAgICAgICAgICAgIHdpZHRoOiA1LFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgZGVwdGg6IDFcbiAgICAgICAgfSwgc2NlbmUpO1xuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHNwYXduUG9zaXRpb247XG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLFxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2NlbmVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBwYWRkbGVJZDtcblxuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKGBwYWRkbGVfJHtuYW1lfV9oaWdobGlnaHRgLCBzY2VuZSk7XG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0LmFkZE1lc2godGhpcy5wYWRkbGUsIEJBQllMT04uQ29sb3IzLlllbGxvdygpKTtcbiAgICAgICAgdGhpcy5wYWRkbGVIaWdobGlnaHQuYmx1ckhvcml6b250YWxTaXplID0gMC4xO1xuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodC5ibHVyVmVydGljYWxTaXplID0gMC4xO1xuICAgICAgICB0aGlzLnBhZGRsZU1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChgcGFkZGxlXyR7bmFtZX1fbWF0ZXJpYWxgLCBzY2VuZSk7XG4gICAgICAgIHRoaXMucGFkZGxlTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcbiAgICAgICAgdGhpcy5wYWRkbGUubWF0ZXJpYWwgPSB0aGlzLnBhZGRsZU1hdGVyaWFsO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbi5jbG9uZSgpO1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDU7XG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XG5cbiAgICAgICAgdGhpcy5pc0FJID0gaXNBSTtcbiAgICB9XG5cbiAgICBtb3ZlUGFkZGxlKGtleVN0YXRlcykge1xuICAgICAgICBpZiAoa2V5U3RhdGVzW3RoaXMua2V5c1swXV0pIHtcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuTGVmdCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSB7XG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlJpZ2h0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pIHx8XG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1swXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pKVxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgIH1cblxuICAgIG1vdmVQYWRkbGVBSShiYWxsQ2xhc3MpIHtcbiAgICAgICAgaWYgKGJhbGxDbGFzcy5pc0xhdW5jaGVkKSB7XG4gICAgICAgICAgICBsZXQgZGVzaXJlZERpcmVjdGlvbiA9IE1hdGguc2lnbihiYWxsQ2xhc3MuYmFsbC5wb3NpdGlvbi54IC0gdGhpcy5wYWRkbGUucG9zaXRpb24ueCk7XG5cbiAgICAgICAgICAgIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuTGVmdCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoa2V5U3RhdGVzLCBiYWxsQ2xhc3MpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQUkpXG4gICAgICAgICAgICB0aGlzLm1vdmVQYWRkbGUoa2V5U3RhdGVzKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5tb3ZlUGFkZGxlQUkoYmFsbENsYXNzKTtcblxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgIH1cblxuICAgIHJlc2V0UGFkZGxlKCkge1xuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb24uY2xvbmUoKTtcbiAgICB9XG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYWRkbGUuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFsbC5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9nYW1lLW1hbmFnZXIuanNcIiAvPlxuXG4vLyBUb0RvOiBSZW1vdmUgYHNob3dCb3VuZGluZ0JveGAgZnJvbSBhbGwgYm9kaWVzXG5cbmNvbnN0IGNhbnZhc0hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMtaG9sZGVyJyk7XG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMjU7XG5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gMzA7XG5jYW52YXNIb2xkZXIuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbmNvbnN0IGVuZ2luZSA9IG5ldyBCQUJZTE9OLkVuZ2luZShjYW52YXMsIHRydWUpO1xuXG5jb25zdCBrZXlTdGF0ZXMgPSB7XG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxuICAgIDM4OiBmYWxzZSwgLy8gVVBcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXG4gICAgODc6IGZhbHNlLCAvLyBXXG4gICAgNjU6IGZhbHNlLCAvLyBBXG4gICAgODM6IGZhbHNlLCAvLyBTXG4gICAgNjg6IGZhbHNlIC8vIERcbn07XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gdHJ1ZTtcbn0pO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgaW4ga2V5U3RhdGVzKVxuICAgICAgICBrZXlTdGF0ZXNbZXZlbnQua2V5Q29kZV0gPSBmYWxzZTtcbn0pO1xuXG5jb25zdCBjcmVhdGVET01FbGVtZW50c1N0YXJ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGhvbWVPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaG9tZU92ZXJsYXkuY2xhc3NOYW1lID0gJ292ZXJsYXknO1xuXG4gICAgY29uc3QgaG9tZU92ZXJsYXlDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmNsYXNzTmFtZSA9ICdvdmVybGF5LWNvbnRlbnQnO1xuICAgIGhvbWVPdmVybGF5LmFwcGVuZENoaWxkKGhvbWVPdmVybGF5Q29udGVudCk7XG5cbiAgICBjb25zdCBoZWFkZXJDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaGVhZGVyQ29udGVudC5jbGFzc05hbWUgPSAnaGVhZGVyJztcbiAgICBoZWFkZXJDb250ZW50LmlubmVyVGV4dCA9ICdQb25nJztcblxuICAgIGNvbnN0IG1haW5Db250ZW50SG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbWFpbkNvbnRlbnRIb2xkZXIuY2xhc3NOYW1lID0gJ21haW4tY29udGVudC1ob2xkZXInO1xuXG4gICAgY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgc3RhcnRCdXR0b24uY2xhc3NOYW1lID0gJ3N0YXJ0LWJ1dHRvbic7XG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gJ1N0YXJ0IEdhbWUnO1xuICAgIHN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBob21lT3ZlcmxheS5zdHlsZS53aWR0aCA9ICcwJztcbiAgICAgICAgZ2FtZU1hbmFnZXIuZ2FtZVN0YXJ0ZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaGVscENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBoZWxwQ29udGVudC5jbGFzc05hbWUgPSAnaGVscC1jb250ZW50JztcbiAgICBoZWxwQ29udGVudC5pbm5lclRleHQgPSAnQSBwb25nIGdhbWUgbWFkZSB1c2luZyBCQUJZTE9OLkpTLiBVc2UgQVJST1cgS0VZUyB0byBjb250cm9sIGFuZCBTUEFDRSB0byBsYXVuY2ggdGhlIGJhbGwuJztcblxuICAgIG1haW5Db250ZW50SG9sZGVyLmFwcGVuZENoaWxkKHN0YXJ0QnV0dG9uKTtcbiAgICBtYWluQ29udGVudEhvbGRlci5hcHBlbmRDaGlsZChoZWxwQ29udGVudCk7XG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKGhlYWRlckNvbnRlbnQpO1xuICAgIGhvbWVPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChtYWluQ29udGVudEhvbGRlcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChob21lT3ZlcmxheSk7XG59O1xuXG5jb25zdCBjcmVhdGVET01FbGVtZW50c0VuZCA9ICgpID0+IHtcbiAgICBjb25zdCBlbmRPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZW5kT3ZlcmxheS5jbGFzc05hbWUgPSAnZW5kLW92ZXJsYXknO1xuXG4gICAgY29uc3QgZW5kT3ZlcmxheUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvdmVybGF5LWNvbnRlbnQnKTtcbiAgICBlbmRPdmVybGF5Q29udGVudC5jbGFzc05hbWUgPSAnb3ZlcmxheS1jb250ZW50JztcbiAgICBlbmRPdmVybGF5LmFwcGVuZENoaWxkKGVuZE92ZXJsYXlDb250ZW50KTtcblxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSAnaGVhZGVyJztcbiAgICBoZWFkZXIuaWQgPSAnd2lubmVyTmFtZSc7XG5cbiAgICBjb25zdCByZXBsYXlCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgcmVwbGF5QnV0dG9uLmNsYXNzTmFtZSA9ICdzdGFydC1idXR0b24nO1xuICAgIHJlcGxheUJ1dHRvbi5pbm5lclRleHQgPSAnUmVwbGF5JztcbiAgICByZXBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGVuZE92ZXJsYXkuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgICAgICBnYW1lTWFuYWdlci5nYW1lU3RhcnRlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwbGF5ZXJIb2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwbGF5ZXJIb2xkZXIuY2xhc3NOYW1lID0gJ3BsYXllci1ob2xkZXInO1xuXG4gICAgY29uc3QgcGxheWVyT25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgY29tcHV0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwbGF5ZXJPbmUuY2xhc3NOYW1lID0gJ3BsYXllcic7XG4gICAgY29tcHV0ZXIuY2xhc3NOYW1lID0gJ3BsYXllcic7XG5cbiAgICBjb25zdCBwbGF5ZXJPbmVOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGxheWVyT25lTmFtZS5jbGFzc05hbWUgPSAnbmFtZS1ob2xkZXInO1xuICAgIGNvbnN0IGNvbXB1dGVyTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbXB1dGVyTmFtZS5jbGFzc05hbWUgPSAnbmFtZS1ob2xkZXInO1xuICAgIHBsYXllck9uZU5hbWUuaW5uZXJUZXh0ID0gJ1BsYXllciAxJztcbiAgICBjb21wdXRlck5hbWUuaW5uZXJUZXh0ID0gJ0NvbXB1dGVyJztcblxuICAgIGNvbnN0IHBsYXllck9uZVNjb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGxheWVyT25lU2NvcmUuY2xhc3NOYW1lID0gJ3Njb3JlLWhvbGRlcic7XG4gICAgcGxheWVyT25lU2NvcmUuaWQgPSAncGxheWVyMVNjb3JlJztcbiAgICBjb25zdCBjb21wdXRlclNjb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29tcHV0ZXJTY29yZS5jbGFzc05hbWUgPSAnc2NvcmUtaG9sZGVyJztcbiAgICBjb21wdXRlclNjb3JlLmlkID0gJ2NvbXB1dGVyU2NvcmUnO1xuXG4gICAgcGxheWVyT25lLmFwcGVuZENoaWxkKHBsYXllck9uZU5hbWUpO1xuICAgIHBsYXllck9uZS5hcHBlbmRDaGlsZChwbGF5ZXJPbmVTY29yZSk7XG4gICAgY29tcHV0ZXIuYXBwZW5kQ2hpbGQoY29tcHV0ZXJOYW1lKTtcbiAgICBjb21wdXRlci5hcHBlbmRDaGlsZChjb21wdXRlclNjb3JlKTtcblxuICAgIHBsYXllckhvbGRlci5hcHBlbmRDaGlsZChwbGF5ZXJPbmUpO1xuICAgIHBsYXllckhvbGRlci5hcHBlbmRDaGlsZChjb21wdXRlcik7XG5cbiAgICBlbmRPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIGVuZE92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKHBsYXllckhvbGRlcik7XG4gICAgZW5kT3ZlcmxheUNvbnRlbnQuYXBwZW5kQ2hpbGQocmVwbGF5QnV0dG9uKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVuZE92ZXJsYXkpO1xufTtcblxuY29uc3QgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCAtOS44MSwgMCksIG5ldyBCQUJZTE9OLkNhbm5vbkpTUGx1Z2luKCkpO1xuICAgIHNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcbiAgICBzY2VuZS53b3JrZXJDb2xsaXNpb25zID0gdHJ1ZTtcbiAgICBzY2VuZS5jbGVhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcblxuICAgIGNvbnN0IGdyb3VuZEhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdncm91bmRIaWdobGlnaHQnLCBzY2VuZSk7XG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcbiAgICBncm91bmRIaWdobGlnaHQuYmx1clZlcnRpY2FsU2l6ZSA9IDAuMztcbiAgICBncm91bmRIaWdobGlnaHQuaW5uZXJHbG93ID0gMDtcblxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkZyZWVDYW1lcmEoJ21haW5DYW1lcmEnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDIwLCAtNjApLCBzY2VuZSk7XG4gICAgY2FtZXJhLnNldFRhcmdldChCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcblxuICAgIGNvbnN0IGxpZ2h0ID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodCgnbWFpbkxpZ2h0JywgbmV3IEJBQllMT04uVmVjdG9yMygwLCAxLCAwKSwgc2NlbmUpO1xuXG4gICAgY29uc3QgZ2VuZXJpY0JsYWNrTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdibGFja01hdGVyaWFsJywgc2NlbmUpO1xuICAgIGdlbmVyaWNCbGFja01hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XG5cbiAgICBjb25zdCBncm91bmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnbWFpbkdyb3VuZCcsIHtcbiAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICBoZWlnaHQ6IDcwLFxuICAgICAgICBzdWJkaXZpc2lvbnM6IDJcbiAgICB9LCBzY2VuZSk7XG4gICAgZ3JvdW5kLnBvc2l0aW9uID0gQkFCWUxPTi5WZWN0b3IzLlplcm8oKTtcbiAgICBncm91bmQucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxuICAgICAgICBncm91bmQsXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMFxuICAgICAgICB9LCBzY2VuZSk7XG4gICAgZ3JvdW5kLm1hdGVyaWFsID0gZ2VuZXJpY0JsYWNrTWF0ZXJpYWw7XG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmFkZE1lc2goZ3JvdW5kLCBCQUJZTE9OLkNvbG9yMy5SZWQoKSk7XG5cbiAgICBjb25zdCBsZWZ0QmFyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goJ2xlZnRCYXInLCB7XG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgIGRlcHRoOiA3MFxuICAgIH0sIHNjZW5lKTtcbiAgICBsZWZ0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTUsIDEsIDApO1xuICAgIGxlZnRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxuICAgICAgICBsZWZ0QmFyLFxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xuICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcbiAgICAgICAgfSk7XG4gICAgbGVmdEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xuXG4gICAgY29uc3QgcmlnaHRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgncmlnaHRCYXInLCB7XG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgIGRlcHRoOiA3MFxuICAgIH0sIHNjZW5lKTtcbiAgICByaWdodEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMTUsIDEsIDApO1xuICAgIHJpZ2h0QmFyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcbiAgICAgICAgcmlnaHRCYXIsXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxuICAgICAgICB9KTtcbiAgICByaWdodEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xuXG4gICAgcmV0dXJuIHNjZW5lO1xufTtcbmNyZWF0ZURPTUVsZW1lbnRzU3RhcnQoKTtcbmNyZWF0ZURPTUVsZW1lbnRzRW5kKCk7XG5jb25zdCBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XG4vLyBjcmVhdGVET01FbGVtZW50c1N0YXJ0KCk7XG4vLyBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTM0KVxuXG5jb25zdCBwbGF5ZXJfMSA9IG5ldyBQYWRkbGUoJ3BsYXllcl8xJywgc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpLCAyLCBmYWxzZSk7XG5jb25zdCBhaVBsYXllciA9IG5ldyBQYWRkbGUoJ2FpUGxheWVyJywgc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAzNCksIDMsIHRydWUpO1xuXG5jb25zdCBwbGF5aW5nQmFsbCA9IG5ldyBCYWxsKHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTMzKSwgMSk7XG5wbGF5aW5nQmFsbC5zZXRDb2xsaXNpb25Db21wb25lbnRzKFtwbGF5ZXJfMS5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLCBhaVBsYXllci5wYWRkbGUucGh5c2ljc0ltcG9zdG9yXSk7XG5cbmNvbnN0IGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKHNjZW5lLCBwbGF5aW5nQmFsbCwgcGxheWVyXzEsIGFpUGxheWVyKTtcbmdhbWVNYW5hZ2VyLnNldENvbGxpc2lvbkNvbXBvbmVudHMocGxheWluZ0JhbGwuYmFsbC5waHlzaWNzSW1wb3N0b3IpO1xuY29uc3QgdGVzdEhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCd0ZXN0SGlnaGxpZ2h0Jywgc2NlbmUpO1xudGVzdEhpZ2hsaWdodC5ibHVySG9yaXpvbnRhbFNpemUgPSAwLjM7XG50ZXN0SGlnaGxpZ2h0LmJsdXJWZXJ0aWNhbFNpemUgPSAwLjM7XG50ZXN0SGlnaGxpZ2h0LmFkZE1lc2goZ2FtZU1hbmFnZXIuYmFsbFJlc2V0Q29sbGlkZXIsIEJBQllMT04uQ29sb3IzLlJlZCgpKTtcbnRlc3RIaWdobGlnaHQuYWRkRXhjbHVkZWRNZXNoKHBsYXllcl8xLnBhZGRsZSk7XG50ZXN0SGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChhaVBsYXllci5wYWRkbGUpO1xuY29uc3QgZ3JvdW5kSGlnaGxpZ2h0ID0gc2NlbmUuZ2V0SGlnaGxpZ2h0TGF5ZXJCeU5hbWUoJ2dyb3VuZEhpZ2hsaWdodCcpO1xuZ3JvdW5kSGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChwbGF5ZXJfMS5wYWRkbGUpO1xuZ3JvdW5kSGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChhaVBsYXllci5wYWRkbGUpO1xuXG5lbmdpbmUucnVuUmVuZGVyTG9vcCgoKSA9PiB7XG4gICAgaWYgKCFnYW1lTWFuYWdlci5nYW1lU3RhcnRlZCkge1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4ga2V5U3RhdGVzKSB7XG4gICAgICAgICAgICBrZXlTdGF0ZXNba2V5XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGxheWluZ0JhbGwudXBkYXRlKGtleVN0YXRlcywgcGxheWVyXzEucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpKTtcbiAgICBwbGF5ZXJfMS51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XG4gICAgYWlQbGF5ZXIudXBkYXRlKGtleVN0YXRlcywgcGxheWluZ0JhbGwpO1xuXG4gICAgZ2FtZU1hbmFnZXIudXBkYXRlKCk7XG4gICAgc2NlbmUucmVuZGVyKCk7XG59KTsiXX0=
