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

        this.scoreBoardTexture.drawText('Level ' + this.currentLevel, 300, 150, 'small-caps bolder 100px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
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
    }, {
        key: 'resetGame',
        value: function resetGame() {
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
            this.scoreBoardTexture.drawText('Level ' + this.currentLevel, 300, 150, 'small-caps bolder 100px \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif', '#ff6a00');
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
        this.maxBallSpeed = 1000;

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
    replayButton.id = 'replayButton';
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwiaGlnaGxpZ2h0TGF5ZXJfMSIsIkJBQllMT04iLCJIaWdobGlnaHRMYXllciIsInBsYXllck9uZVNjb3JlIiwicGxheWVyVHdvU2NvcmUiLCJtYXhTY29yZVBvc3NpYmxlIiwiZ2FtZVN0YXJ0ZWQiLCJjdXJyZW50TGV2ZWwiLCJzY29yZUJvYXJkIiwiTWVzaEJ1aWxkZXIiLCJDcmVhdGVQbGFuZSIsImhlaWdodCIsIndpZHRoIiwic2lkZU9yaWVudGF0aW9uIiwiTWVzaCIsIkRPVUJMRVNJREUiLCJwb3NpdGlvbiIsIlZlY3RvcjMiLCJhZGRNZXNoIiwiQ29sb3IzIiwiYmx1clZlcnRpY2FsU2l6ZSIsImJsdXJIb3Jpem9udGFsU2l6ZSIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwiQmxhY2siLCJtYXRlcmlhbCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJzY29yZUJvYXJkVGV4dHVyZUNvbnRleHQiLCJnZXRDb250ZXh0IiwiZGlmZnVzZVRleHR1cmUiLCJlbWlzc2l2ZUNvbG9yIiwic3BlY3VsYXJDb2xvciIsIlJlZCIsImRyYXdUZXh0IiwicGxheWluZ0JhbGwiLCJvblRyaWdnZXJFbnRlciIsImJpbmQiLCJiYWxsSW1wb3N0ZXIiLCJyZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUiLCJiYWxsUmVzZXRJbXBvc3RlciIsImNvbGxpZGVkQWdhaW5zdCIsInNldExpbmVhclZlbG9jaXR5IiwiWmVybyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImdldE9iamVjdENlbnRlciIsInoiLCJyZXNldEJhbGxTdGF0cyIsInJlc2V0UGFkZGxlIiwiY2xlYXJSZWN0IiwibW92ZW1lbnRTcGVlZCIsInJlc2V0R2FtZSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lclRleHQiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwic3R5bGUiLCJCYWxsIiwic3Bhd25Qb3NpdGlvbiIsImJhbGxJZCIsImNvbG9yIiwibWluQmFsbFNwZWVkIiwibWF4QmFsbFNwZWVkIiwiYmFsbCIsIkNyZWF0ZVNwaGVyZSIsInNlZ21lbnRzIiwiZGlhbWV0ZXIiLCJTcGhlcmVJbXBvc3RvciIsInVuaXF1ZUlkIiwiYmFsbE1hdGVyaWFsIiwiVGV4dHVyZSIsIk1hZ2VudGEiLCJiYWxsUGFydGljbGVzIiwiUGFydGljbGVTeXN0ZW0iLCJlbWl0dGVyIiwicGFydGljbGVUZXh0dXJlIiwiY29sb3IxIiwiY29sb3IyIiwiY29sb3JEZWFkIiwiQ29sb3I0IiwibWluU2l6ZSIsIm1heFNpemUiLCJtaW5MaWZlVGltZSIsIm1heExpZmVUaW1lIiwibWluQW5ndWxhclNwZWVkIiwibWF4QW5ndWxhclNwZWVkIiwiTWF0aCIsIlBJIiwiZW1pdFJhdGUiLCJibGVuZE1vZGUiLCJCTEVORE1PREVfT05FT05FIiwibWluRW1pdFBvd2VyIiwibWF4RW1pdFBvd2VyIiwidXBkYXRlU3BlZWQiLCJkaXJlY3Rpb24xIiwiZGlyZWN0aW9uMiIsInN0YXJ0IiwiaW5pdGlhbFBvc2l0aW9uIiwiY2xvbmUiLCJpc0xhdW5jaGVkIiwicGxheWVyUGFkZGxlVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ4IiwicmFuZG9tIiwiaW1wb3N0ZXJzQXJyYXkiLCJiYWxsUGh5c2ljc0ltcG9zdGVyIiwidmVsb2NpdHlYIiwiZ2V0TGluZWFyVmVsb2NpdHkiLCJ2ZWxvY2l0eVhCYWxsIiwidmVsb2NpdHlaIiwidmVsb2NpdHkiLCJ2ZWxvY2l0eVpBYnMiLCJhYnMiLCJjbGFtcGVkVmVsb2NpdHlaIiwiTWF0aFRvb2xzIiwiQ2xhbXAiLCJkaXJlY3Rpb24iLCJzaWduIiwidmVsb2NpdHlZIiwieSIsImxpbWl0QmFsbFZlbG9jaXR5IiwibG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUiLCJsYXVuY2hCYWxsIiwiUGFkZGxlIiwibmFtZSIsInBhZGRsZUlkIiwiaXNBSSIsImtleXMiLCJwYWRkbGUiLCJDcmVhdGVCb3giLCJkZXB0aCIsInBhZGRsZUhpZ2hsaWdodCIsIlllbGxvdyIsInBhZGRsZU1hdGVyaWFsIiwiTGVmdCIsInNjYWxlIiwiUmlnaHQiLCJiYWxsQ2xhc3MiLCJkZXNpcmVkRGlyZWN0aW9uIiwibW92ZVBhZGRsZSIsIm1vdmVQYWRkbGVBSSIsImNhbnZhc0hvbGRlciIsImNhbnZhcyIsImNyZWF0ZUVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJhcHBlbmRDaGlsZCIsImVuZ2luZSIsIkVuZ2luZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImtleUNvZGUiLCJjcmVhdGVET01FbGVtZW50c1N0YXJ0IiwiaG9tZU92ZXJsYXkiLCJjbGFzc05hbWUiLCJob21lT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXJDb250ZW50IiwibWFpbkNvbnRlbnRIb2xkZXIiLCJzdGFydEJ1dHRvbiIsImdhbWVNYW5hZ2VyIiwiaGVscENvbnRlbnQiLCJib2R5IiwiY3JlYXRlRE9NRWxlbWVudHNFbmQiLCJlbmRPdmVybGF5IiwiZW5kT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXIiLCJpZCIsInJlcGxheUJ1dHRvbiIsInBsYXllckhvbGRlciIsInBsYXllck9uZSIsImNvbXB1dGVyIiwicGxheWVyT25lTmFtZSIsImNvbXB1dGVyTmFtZSIsImNvbXB1dGVyU2NvcmUiLCJjcmVhdGVTY2VuZSIsIlNjZW5lIiwiZW5hYmxlUGh5c2ljcyIsIkNhbm5vbkpTUGx1Z2luIiwiY29sbGlzaW9uc0VuYWJsZWQiLCJ3b3JrZXJDb2xsaXNpb25zIiwiY2xlYXJDb2xvciIsImdyb3VuZEhpZ2hsaWdodCIsImlubmVyR2xvdyIsImNhbWVyYSIsIkZyZWVDYW1lcmEiLCJzZXRUYXJnZXQiLCJsaWdodCIsIkhlbWlzcGhlcmljTGlnaHQiLCJnZW5lcmljQmxhY2tNYXRlcmlhbCIsImdyb3VuZCIsImxlZnRCYXIiLCJyaWdodEJhciIsInBsYXllcl8xIiwiYWlQbGF5ZXIiLCJzZXRDb2xsaXNpb25Db21wb25lbnRzIiwidGVzdEhpZ2hsaWdodCIsImFkZEV4Y2x1ZGVkTWVzaCIsImdldEhpZ2hsaWdodExheWVyQnlOYW1lIiwicnVuUmVuZGVyTG9vcCIsImtleSIsInVwZGF0ZSIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFc7QUFDRix5QkFBWUMsS0FBWixFQUFtQkMsZUFBbkIsRUFBb0NDLFNBQXBDLEVBQStDQyxTQUEvQyxFQUEwRDtBQUFBOztBQUN0RCxhQUFLQyxnQkFBTCxHQUF3QixJQUFJQyxRQUFRQyxjQUFaLENBQTJCLHFCQUEzQixFQUFrRE4sS0FBbEQsQ0FBeEI7O0FBRUEsYUFBS08sY0FBTCxHQUFzQixDQUF0QjtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxhQUFLQyxnQkFBTCxHQUF3QixDQUF4Qjs7QUFFQSxhQUFLQyxXQUFMLEdBQW1CLEtBQW5CO0FBQ0EsYUFBS0MsWUFBTCxHQUFvQixDQUFwQjs7QUFFQSxhQUFLQyxVQUFMLEdBQWtCUCxRQUFRUSxXQUFSLENBQW9CQyxXQUFwQixDQUFnQyxZQUFoQyxFQUE4QztBQUM1REMsb0JBQVEsRUFEb0Q7QUFFNURDLG1CQUFPLEVBRnFEO0FBRzVEQyw2QkFBaUJaLFFBQVFhLElBQVIsQ0FBYUM7QUFIOEIsU0FBOUMsRUFJZm5CLEtBSmUsQ0FBbEI7QUFLQSxhQUFLWSxVQUFMLENBQWdCUSxRQUFoQixHQUEyQixJQUFJZixRQUFRZ0IsT0FBWixDQUFvQixDQUFwQixFQUF1QixFQUF2QixFQUEyQixFQUEz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c0QsZ0JBQWdCZSxlQUFoQixDQUFnQ0gsU0FBU2xFLE1BQXpDOztBQUVBb0IsT0FBT21ELGFBQVAsQ0FBcUIsWUFBTTtBQUN2QixRQUFJLENBQUN2QyxZQUFZckssV0FBakIsRUFBOEI7QUFDMUIsYUFBSyxJQUFJNk0sR0FBVCxJQUFnQm5HLFNBQWhCLEVBQTJCO0FBQ3ZCQSxzQkFBVW1HLEdBQVYsSUFBaUIsS0FBakI7QUFDSDtBQUNKOztBQUVEckssZ0JBQVlzSyxNQUFaLENBQW1CcEcsU0FBbkIsRUFBOEI0RixTQUFTakUsTUFBVCxDQUFnQmxILGVBQWhCLENBQWdDNkYsaUJBQWhDLEVBQTlCO0FBQ0FzRixhQUFTUSxNQUFULENBQWdCcEcsU0FBaEIsRUFBMkJsRSxXQUEzQjtBQUNBK0osYUFBU08sTUFBVCxDQUFnQnBHLFNBQWhCLEVBQTJCbEUsV0FBM0I7O0FBRUE2SCxnQkFBWXlDLE1BQVo7QUFDQXhOLFVBQU15TixNQUFOO0FBQ0gsQ0FiRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgYmFsbENsYXNzT2JqZWN0LCBwYWRkbGVPbmUsIHBhZGRsZVR3bykge1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMSA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdzY29yZUJvYXJkSGlnaGxpZ2h0Jywgc2NlbmUpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlID0gMDtcclxuICAgICAgICB0aGlzLm1heFNjb3JlUG9zc2libGUgPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TGV2ZWwgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKCdzY29yZUJvYXJkJywge1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxyXG4gICAgICAgICAgICB3aWR0aDogMzIsXHJcbiAgICAgICAgICAgIHNpZGVPcmllbnRhdGlvbjogQkFCWUxPTi5NZXNoLkRPVUJMRVNJREVcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAxNiwgMzYpO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMS5hZGRNZXNoKHRoaXMuc2NvcmVCb2FyZCwgbmV3IEJBQllMT04uQ29sb3IzKDEsIDAuNDEsIDApKTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYmx1clZlcnRpY2FsU2l6ZSA9IDAuMztcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYmx1ckhvcml6b250YWxTaXplID0gMC4zO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ2JhbGxDb2xsaWRlcicsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDY0LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDIwMCxcclxuICAgICAgICAgICAgc3ViZGl2aXNpb25zOiAyXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC0yLCAwKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlcixcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdyZXNldE1hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIubWF0ZXJpYWwgPSB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnc2NvcmVCb2FyZE1hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgICAgIC8vIE9wdGlvbnMgaXMgdG8gc2V0IHRoZSByZXNvbHV0aW9uIC0gT3Igc29tZXRoaW5nIGxpa2UgdGhhdFxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUgPSBuZXcgQkFCWUxPTi5EeW5hbWljVGV4dHVyZSgnc2NvcmVCb2FyZE1hdGVyaWFsRHluYW1pYycsIDEwMjQsIHNjZW5lLCB0cnVlKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dCA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5lbWlzc2l2ZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuUmVkKCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLm1hdGVyaWFsID0gdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYExldmVsICR7dGhpcy5jdXJyZW50TGV2ZWx9YCwgMzAwLCAxNTAsIGBzbWFsbC1jYXBzIGJvbGRlciAxMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1BsYXllciAxJywgNTAsIDQwMCwgYDkwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdDb21wdXRlcicsIDUyMCwgNDAwLCBgOTBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYCBib2xkZXIgMjAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyVHdvU2NvcmV9YCwgNjgwLCA3MDAsIGBib2xkZXIgMjAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwgPSBiYWxsQ2xhc3NPYmplY3Q7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUgPSBwYWRkbGVPbmU7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28gPSBwYWRkbGVUd287XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhiYWxsSW1wb3N0ZXIpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoYmFsbEltcG9zdGVyLCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUmVzZXRJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgICAgICBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPCAtMzQpXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUrKztcclxuICAgICAgICBlbHNlIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA+IDM0KVxyXG4gICAgICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlKys7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwucmVzZXRCYWxsU3RhdHMoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZU9uZS5yZXNldFBhZGRsZSgpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmVDb250ZXh0LmNsZWFyUmVjdCgwLCA1MDAsIDEwMjQsIDEwMjQpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJUd29TY29yZX1gLCA2ODAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJPbmVTY29yZSA+PSB0aGlzLm1heFNjb3JlUG9zc2libGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TGV2ZWwrKztcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGVPbmUubW92ZW1lbnRTcGVlZCArPSA1O1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZVR3by5tb3ZlbWVudFNwZWVkICs9IDU7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRHYW1lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBsYXllclR3b1Njb3JlID49IHRoaXMubWF4U2NvcmVQb3NzaWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlT25lLm1vdmVtZW50U3BlZWQgPSA1O1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZVR3by5tb3ZlbWVudFNwZWVkID0gNTtcclxuICAgICAgICAgICAgdGhpcy5yZXNldEdhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRHYW1lKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnBsYXllck9uZVNjb3JlID4gdGhpcy5wbGF5ZXJUd29TY29yZSkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2lubmVyTmFtZScpLmlubmVyVGV4dCA9ICdQbGF5ZXIgMSBXaW5zJztcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcGxheUJ1dHRvbicpLmlubmVyVGV4dCA9ICdOZXh0IExldmVsJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2lubmVyTmFtZScpLmlubmVyVGV4dCA9ICdDb21wdXRlciBXaW5zJztcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlcGxheUJ1dHRvbicpLmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdlbmQtb3ZlcmxheScpWzBdLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyMVNjb3JlJykuaW5uZXJUZXh0ID0gdGhpcy5wbGF5ZXJPbmVTY29yZTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tcHV0ZXJTY29yZScpLmlubmVyVGV4dCA9IHRoaXMucGxheWVyVHdvU2NvcmU7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbC5yZXNldEJhbGxTdGF0cygpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28ucmVzZXRQYWRkbGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIDEwMjQsIDIwMCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgTGV2ZWwgJHt0aGlzLmN1cnJlbnRMZXZlbH1gLCAzMDAsIDE1MCwgYHNtYWxsLWNhcHMgYm9sZGVyIDEwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQuY2xlYXJSZWN0KDAsIDUwMCwgMTAyNCwgMTAyNCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHswfWAsIDE1MCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHswfWAsIDY4MCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhbGwge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIHNwYXduUG9zaXRpb24sIGJhbGxJZCwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5taW5CYWxsU3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLm1heEJhbGxTcGVlZCA9IDEwMDA7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKCdwbGF5QmFsbCcsIHtcclxuICAgICAgICAgICAgc2VnbWVudHM6IDE2LFxyXG4gICAgICAgICAgICBkaWFtZXRlcjogMVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLmJhbGwsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2VuZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gYmFsbElkO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGxNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3BsYXlpbmdCYWxsTWF0ZXJpYWwnLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsTWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCcvYXNzZXRzL2ZsYXJlLnBuZycsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5NYWdlbnRhKCk7XHJcbiAgICAgICAgdGhpcy5iYWxsLm1hdGVyaWFsID0gdGhpcy5iYWxsTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcyA9IG5ldyBCQUJZTE9OLlBhcnRpY2xlU3lzdGVtKCdwbGF5aW5nQmFsbFBhcnRpY2xlcycsIDUwMDAsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuZW1pdHRlciA9IHRoaXMuYmFsbDtcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMucGFydGljbGVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgnL2Fzc2V0cy9mbGFyZS5wbmcnLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmNvbG9yMSA9IEJBQllMT04uQ29sb3IzLlJlZCgpO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5jb2xvcjIgPSBCQUJZTE9OLkNvbG9yMy5NYWdlbnRhKCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmNvbG9yRGVhZCA9IG5ldyBCQUJZTE9OLkNvbG9yNCgwLCAwLCAwLCAwLjApO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5taW5TaXplID0gMC4zO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5tYXhTaXplID0gMTtcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluTGlmZVRpbWUgPSAwLjI7XHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1heExpZmVUaW1lID0gMC40O1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5taW5Bbmd1bGFyU3BlZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5tYXhBbmd1bGFyU3BlZWQgPSBNYXRoLlBJO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5lbWl0UmF0ZSA9IDE1MDA7XHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmJsZW5kTW9kZSA9IEJBQllMT04uUGFydGljbGVTeXN0ZW0uQkxFTkRNT0RFX09ORU9ORTtcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluRW1pdFBvd2VyID0gMTtcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWF4RW1pdFBvd2VyID0gMztcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMudXBkYXRlU3BlZWQgPSAwLjAwNztcclxuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuZGlyZWN0aW9uMSA9IEJBQllMT04uVmVjdG9yMy5aZXJvKCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmRpcmVjdGlvbjIgPSBCQUJZTE9OLlZlY3RvcjMuWmVybygpO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5zdGFydCgpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBsYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzMyXSkge1xyXG4gICAgICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGFkZGxlVmVsb2NpdHkueCxcclxuICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGltcG9zdGVyc0FycmF5KSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoaW1wb3N0ZXJzQXJyYXksIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxQaHlzaWNzSW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSBjb2xsaWRlZEFnYWluc3QuZ2V0TGluZWFyVmVsb2NpdHkoKS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVhCYWxsID0gYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IC1iYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkuejtcclxuXHJcbiAgICAgICAgYmFsbFBoeXNpY3NJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCAtIHZlbG9jaXR5WEJhbGwsXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlaXHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICBjb2xsaWRlZEFnYWluc3Quc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxpbWl0QmFsbFZlbG9jaXR5KCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IHZlbG9jaXR5Lno7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WkFicyA9IE1hdGguYWJzKHZlbG9jaXR5Wik7XHJcbiAgICAgICAgbGV0IGNsYW1wZWRWZWxvY2l0eVogPSBCQUJZTE9OLk1hdGhUb29scy5DbGFtcCh2ZWxvY2l0eVpBYnMsIHRoaXMubWluQmFsbFNwZWVkLCB0aGlzLm1heEJhbGxTcGVlZCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguc2lnbih2ZWxvY2l0eVopO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gdmVsb2NpdHkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlZID0gdmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCxcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WSxcclxuICAgICAgICAgICAgICAgIGNsYW1wZWRWZWxvY2l0eVogKiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRCYWxsVmVsb2NpdHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5sYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEJhbGxTdGF0cygpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcblxyXG5jbGFzcyBQYWRkbGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgc2NlbmUsIHNwYXduUG9zaXRpb24sIHBhZGRsZUlkLCBpc0FJLCBrZXlzID0gWzM3LCAzOV0sIGNvbG9yID0gMSkge1xyXG4gICAgICAgIHRoaXMucGFkZGxlID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goYHBhZGRsZV8ke25hbWV9YCwge1xyXG4gICAgICAgICAgICB3aWR0aDogNSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxyXG4gICAgICAgICAgICBkZXB0aDogMVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHNwYXduUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZSxcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjZW5lXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gcGFkZGxlSWQ7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0ID0gbmV3IEJBQllMT04uSGlnaGxpZ2h0TGF5ZXIoYHBhZGRsZV8ke25hbWV9X2hpZ2hsaWdodGAsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodC5hZGRNZXNoKHRoaXMucGFkZGxlLCBCQUJZTE9OLkNvbG9yMy5ZZWxsb3coKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVIaWdobGlnaHQuYmx1ckhvcml6b250YWxTaXplID0gMC4xO1xyXG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0LmJsdXJWZXJ0aWNhbFNpemUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoYHBhZGRsZV8ke25hbWV9X21hdGVyaWFsYCwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5tYXRlcmlhbCA9IHRoaXMucGFkZGxlTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSA1O1xyXG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XHJcblxyXG4gICAgICAgIHRoaXMuaXNBSSA9IGlzQUk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVBhZGRsZShrZXlTdGF0ZXMpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzW3RoaXMua2V5c1swXV0pIHtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5MZWZ0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlJpZ2h0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pIHx8XHJcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkpXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUGFkZGxlQUkoYmFsbENsYXNzKSB7XHJcbiAgICAgICAgaWYgKGJhbGxDbGFzcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXNpcmVkRGlyZWN0aW9uID0gTWF0aC5zaWduKGJhbGxDbGFzcy5iYWxsLnBvc2l0aW9uLnggLSB0aGlzLnBhZGRsZS5wb3NpdGlvbi54KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5MZWZ0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzaXJlZERpcmVjdGlvbiA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShrZXlTdGF0ZXMsIGJhbGxDbGFzcykge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0FJKVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVQYWRkbGUoa2V5U3RhdGVzKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZUFJKGJhbGxDbGFzcyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRQYWRkbGUoKSB7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucG9zaXRpb24gPSB0aGlzLmluaXRpYWxQb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhZGRsZS5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JhbGwuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9nYW1lLW1hbmFnZXIuanNcIiAvPlxyXG5cclxuY29uc3QgY2FudmFzSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcy1ob2xkZXInKTtcclxuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMjU7XHJcbmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMDtcclxuY2FudmFzSG9sZGVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcbmNvbnN0IGVuZ2luZSA9IG5ldyBCQUJZTE9OLkVuZ2luZShjYW52YXMsIHRydWUpO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSAvLyBEXHJcbn07XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gdHJ1ZTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1tldmVudC5rZXlDb2RlXSA9IGZhbHNlO1xyXG59KTtcclxuXHJcbmNvbnN0IGNyZWF0ZURPTUVsZW1lbnRzU3RhcnQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBob21lT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaG9tZU92ZXJsYXkuY2xhc3NOYW1lID0gJ292ZXJsYXknO1xyXG5cclxuICAgIGNvbnN0IGhvbWVPdmVybGF5Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmNsYXNzTmFtZSA9ICdvdmVybGF5LWNvbnRlbnQnO1xyXG4gICAgaG9tZU92ZXJsYXkuYXBwZW5kQ2hpbGQoaG9tZU92ZXJsYXlDb250ZW50KTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXJDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXJDb250ZW50LmNsYXNzTmFtZSA9ICdoZWFkZXInO1xyXG4gICAgaGVhZGVyQ29udGVudC5pbm5lclRleHQgPSAnUG9uZyc7XHJcblxyXG4gICAgY29uc3QgbWFpbkNvbnRlbnRIb2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIG1haW5Db250ZW50SG9sZGVyLmNsYXNzTmFtZSA9ICdtYWluLWNvbnRlbnQtaG9sZGVyJztcclxuXHJcbiAgICBjb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHN0YXJ0QnV0dG9uLmNsYXNzTmFtZSA9ICdzdGFydC1idXR0b24nO1xyXG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gJ1N0YXJ0IEdhbWUnO1xyXG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgaG9tZU92ZXJsYXkuc3R5bGUud2lkdGggPSAnMCc7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuZ2FtZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaGVscENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhlbHBDb250ZW50LmNsYXNzTmFtZSA9ICdoZWxwLWNvbnRlbnQnO1xyXG4gICAgaGVscENvbnRlbnQuaW5uZXJUZXh0ID0gJ0EgcG9uZyBnYW1lIG1hZGUgdXNpbmcgQkFCWUxPTi5KUy4gVXNlIEFSUk9XIEtFWVMgdG8gY29udHJvbCBhbmQgU1BBQ0UgdG8gbGF1bmNoIHRoZSBiYWxsLic7XHJcblxyXG4gICAgbWFpbkNvbnRlbnRIb2xkZXIuYXBwZW5kQ2hpbGQoc3RhcnRCdXR0b24pO1xyXG4gICAgbWFpbkNvbnRlbnRIb2xkZXIuYXBwZW5kQ2hpbGQoaGVscENvbnRlbnQpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKGhlYWRlckNvbnRlbnQpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKG1haW5Db250ZW50SG9sZGVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaG9tZU92ZXJsYXkpO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlRE9NRWxlbWVudHNFbmQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBlbmRPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlbmRPdmVybGF5LmNsYXNzTmFtZSA9ICdlbmQtb3ZlcmxheSc7XHJcblxyXG4gICAgY29uc3QgZW5kT3ZlcmxheUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvdmVybGF5LWNvbnRlbnQnKTtcclxuICAgIGVuZE92ZXJsYXlDb250ZW50LmNsYXNzTmFtZSA9ICdvdmVybGF5LWNvbnRlbnQnO1xyXG4gICAgZW5kT3ZlcmxheS5hcHBlbmRDaGlsZChlbmRPdmVybGF5Q29udGVudCk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gJ2hlYWRlcic7XHJcbiAgICBoZWFkZXIuaWQgPSAnd2lubmVyTmFtZSc7XHJcblxyXG4gICAgY29uc3QgcmVwbGF5QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgcmVwbGF5QnV0dG9uLmNsYXNzTmFtZSA9ICdzdGFydC1idXR0b24nO1xyXG4gICAgcmVwbGF5QnV0dG9uLmlubmVyVGV4dCA9ICdSZXBsYXknO1xyXG4gICAgcmVwbGF5QnV0dG9uLmlkID0gJ3JlcGxheUJ1dHRvbic7XHJcbiAgICByZXBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgZW5kT3ZlcmxheS5zdHlsZS5oZWlnaHQgPSAnMCc7XHJcbiAgICAgICAgZ2FtZU1hbmFnZXIuZ2FtZVN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcGxheWVySG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBwbGF5ZXJIb2xkZXIuY2xhc3NOYW1lID0gJ3BsYXllci1ob2xkZXInO1xyXG5cclxuICAgIGNvbnN0IHBsYXllck9uZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29uc3QgY29tcHV0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHBsYXllck9uZS5jbGFzc05hbWUgPSAncGxheWVyJztcclxuICAgIGNvbXB1dGVyLmNsYXNzTmFtZSA9ICdwbGF5ZXInO1xyXG5cclxuICAgIGNvbnN0IHBsYXllck9uZU5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHBsYXllck9uZU5hbWUuY2xhc3NOYW1lID0gJ25hbWUtaG9sZGVyJztcclxuICAgIGNvbnN0IGNvbXB1dGVyTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29tcHV0ZXJOYW1lLmNsYXNzTmFtZSA9ICduYW1lLWhvbGRlcic7XHJcbiAgICBwbGF5ZXJPbmVOYW1lLmlubmVyVGV4dCA9ICdQbGF5ZXIgMSc7XHJcbiAgICBjb21wdXRlck5hbWUuaW5uZXJUZXh0ID0gJ0NvbXB1dGVyJztcclxuXHJcbiAgICBjb25zdCBwbGF5ZXJPbmVTY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgcGxheWVyT25lU2NvcmUuY2xhc3NOYW1lID0gJ3Njb3JlLWhvbGRlcic7XHJcbiAgICBwbGF5ZXJPbmVTY29yZS5pZCA9ICdwbGF5ZXIxU2NvcmUnO1xyXG4gICAgY29uc3QgY29tcHV0ZXJTY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29tcHV0ZXJTY29yZS5jbGFzc05hbWUgPSAnc2NvcmUtaG9sZGVyJztcclxuICAgIGNvbXB1dGVyU2NvcmUuaWQgPSAnY29tcHV0ZXJTY29yZSc7XHJcblxyXG4gICAgcGxheWVyT25lLmFwcGVuZENoaWxkKHBsYXllck9uZU5hbWUpO1xyXG4gICAgcGxheWVyT25lLmFwcGVuZENoaWxkKHBsYXllck9uZVNjb3JlKTtcclxuICAgIGNvbXB1dGVyLmFwcGVuZENoaWxkKGNvbXB1dGVyTmFtZSk7XHJcbiAgICBjb21wdXRlci5hcHBlbmRDaGlsZChjb21wdXRlclNjb3JlKTtcclxuXHJcbiAgICBwbGF5ZXJIb2xkZXIuYXBwZW5kQ2hpbGQocGxheWVyT25lKTtcclxuICAgIHBsYXllckhvbGRlci5hcHBlbmRDaGlsZChjb21wdXRlcik7XHJcblxyXG4gICAgZW5kT3ZlcmxheUNvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuICAgIGVuZE92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKHBsYXllckhvbGRlcik7XHJcbiAgICBlbmRPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChyZXBsYXlCdXR0b24pO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbmRPdmVybGF5KTtcclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZVNjZW5lID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xyXG4gICAgc2NlbmUuZW5hYmxlUGh5c2ljcyhuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC05LjgxLCAwKSwgbmV3IEJBQllMT04uQ2Fubm9uSlNQbHVnaW4oKSk7XHJcbiAgICBzY2VuZS5jb2xsaXNpb25zRW5hYmxlZCA9IHRydWU7XHJcbiAgICBzY2VuZS53b3JrZXJDb2xsaXNpb25zID0gdHJ1ZTtcclxuICAgIHNjZW5lLmNsZWFyQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xyXG5cclxuICAgIGNvbnN0IGdyb3VuZEhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdncm91bmRIaWdobGlnaHQnLCBzY2VuZSk7XHJcbiAgICBncm91bmRIaWdobGlnaHQuYmx1ckhvcml6b250YWxTaXplID0gMC4zO1xyXG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmJsdXJWZXJ0aWNhbFNpemUgPSAwLjM7XHJcbiAgICBncm91bmRIaWdobGlnaHQuaW5uZXJHbG93ID0gMDtcclxuXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5GcmVlQ2FtZXJhKCdtYWluQ2FtZXJhJywgbmV3IEJBQllMT04uVmVjdG9yMygwLCAyMCwgLTYwKSwgc2NlbmUpO1xyXG4gICAgY2FtZXJhLnNldFRhcmdldChCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuXHJcbiAgICBjb25zdCBsaWdodCA9IG5ldyBCQUJZTE9OLkhlbWlzcGhlcmljTGlnaHQoJ21haW5MaWdodCcsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMSwgMCksIHNjZW5lKTtcclxuXHJcbiAgICBjb25zdCBnZW5lcmljQmxhY2tNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ2JsYWNrTWF0ZXJpYWwnLCBzY2VuZSk7XHJcbiAgICBnZW5lcmljQmxhY2tNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xyXG5cclxuICAgIGNvbnN0IGdyb3VuZCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kKCdtYWluR3JvdW5kJywge1xyXG4gICAgICAgIHdpZHRoOiAzMixcclxuICAgICAgICBoZWlnaHQ6IDcwLFxyXG4gICAgICAgIHN1YmRpdmlzaW9uczogMlxyXG4gICAgfSwgc2NlbmUpO1xyXG4gICAgZ3JvdW5kLnBvc2l0aW9uID0gQkFCWUxPTi5WZWN0b3IzLlplcm8oKTtcclxuICAgIGdyb3VuZC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgZ3JvdW5kLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMFxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgIGdyb3VuZC5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xyXG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmFkZE1lc2goZ3JvdW5kLCBCQUJZTE9OLkNvbG9yMy5SZWQoKSk7XHJcblxyXG4gICAgY29uc3QgbGVmdEJhciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KCdsZWZ0QmFyJywge1xyXG4gICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgIGhlaWdodDogMixcclxuICAgICAgICBkZXB0aDogNzBcclxuICAgIH0sIHNjZW5lKTtcclxuICAgIGxlZnRCYXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKC0xNSwgMSwgMCk7XHJcbiAgICBsZWZ0QmFyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICBsZWZ0QmFyLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgbGVmdEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0QmFyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goJ3JpZ2h0QmFyJywge1xyXG4gICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgIGhlaWdodDogMixcclxuICAgICAgICBkZXB0aDogNzBcclxuICAgIH0sIHNjZW5lKTtcclxuICAgIHJpZ2h0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygxNSwgMSwgMCk7XHJcbiAgICByaWdodEJhci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgcmlnaHRCYXIsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICByaWdodEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxufTtcclxuY3JlYXRlRE9NRWxlbWVudHNTdGFydCgpO1xyXG5jcmVhdGVET01FbGVtZW50c0VuZCgpO1xyXG5jb25zdCBzY2VuZSA9IGNyZWF0ZVNjZW5lKCk7XHJcbi8vIGNyZWF0ZURPTUVsZW1lbnRzU3RhcnQoKTtcclxuLy8gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNClcclxuXHJcbmNvbnN0IHBsYXllcl8xID0gbmV3IFBhZGRsZSgncGxheWVyXzEnLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNCksIDIsIGZhbHNlKTtcclxuY29uc3QgYWlQbGF5ZXIgPSBuZXcgUGFkZGxlKCdhaVBsYXllcicsIHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgMzQpLCAzLCB0cnVlKTtcclxuXHJcbmNvbnN0IHBsYXlpbmdCYWxsID0gbmV3IEJhbGwoc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzMpLCAxKTtcclxucGxheWluZ0JhbGwuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhbcGxheWVyXzEucGFkZGxlLnBoeXNpY3NJbXBvc3RvciwgYWlQbGF5ZXIucGFkZGxlLnBoeXNpY3NJbXBvc3Rvcl0pO1xyXG5cclxuY29uc3QgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoc2NlbmUsIHBsYXlpbmdCYWxsLCBwbGF5ZXJfMSwgYWlQbGF5ZXIpO1xyXG5nYW1lTWFuYWdlci5zZXRDb2xsaXNpb25Db21wb25lbnRzKHBsYXlpbmdCYWxsLmJhbGwucGh5c2ljc0ltcG9zdG9yKTtcclxuY29uc3QgdGVzdEhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCd0ZXN0SGlnaGxpZ2h0Jywgc2NlbmUpO1xyXG50ZXN0SGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcclxudGVzdEhpZ2hsaWdodC5ibHVyVmVydGljYWxTaXplID0gMC4zO1xyXG50ZXN0SGlnaGxpZ2h0LmFkZE1lc2goZ2FtZU1hbmFnZXIuYmFsbFJlc2V0Q29sbGlkZXIsIEJBQllMT04uQ29sb3IzLlJlZCgpKTtcclxudGVzdEhpZ2hsaWdodC5hZGRFeGNsdWRlZE1lc2gocGxheWVyXzEucGFkZGxlKTtcclxudGVzdEhpZ2hsaWdodC5hZGRFeGNsdWRlZE1lc2goYWlQbGF5ZXIucGFkZGxlKTtcclxuY29uc3QgZ3JvdW5kSGlnaGxpZ2h0ID0gc2NlbmUuZ2V0SGlnaGxpZ2h0TGF5ZXJCeU5hbWUoJ2dyb3VuZEhpZ2hsaWdodCcpO1xyXG5ncm91bmRIaWdobGlnaHQuYWRkRXhjbHVkZWRNZXNoKHBsYXllcl8xLnBhZGRsZSk7XHJcbmdyb3VuZEhpZ2hsaWdodC5hZGRFeGNsdWRlZE1lc2goYWlQbGF5ZXIucGFkZGxlKTtcclxuXHJcbmVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgIGlmICghZ2FtZU1hbmFnZXIuZ2FtZVN0YXJ0ZWQpIHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4ga2V5U3RhdGVzKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlc1trZXldID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBsYXlpbmdCYWxsLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKSk7XHJcbiAgICBwbGF5ZXJfMS51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XHJcbiAgICBhaVBsYXllci51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIudXBkYXRlKCk7XHJcbiAgICBzY2VuZS5yZW5kZXIoKTtcclxufSk7Il19
