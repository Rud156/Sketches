'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTypes = require('../../../../.cache/typescript/2.6/node_modules/@types/babel-types');

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

            if (this.playerOneScore > this.maxScorePossible || this.playerTwoScore > this.maxScorePossible) {
                this.resetGame();
            }
        }
    }, {
        key: 'resetGame',
        value: function resetGame() {
            this.playerOneScore = 0;
            this.playerTwoScore = 0;
            this.playingBall.resetBallStats();
            this.paddleOne.resetPaddle();
            this.paddleTwo.resetPaddle();

            this.gameStarted = false;
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
        this.ballMaterial.diffuseColor = BABYLON.Color3.Red();
        this.ball.material = this.ballMaterial;

        this.ballParticles = new BABYLON.ParticleSystem('playingBallParticles', 1000, scene);
        this.ballParticles.emitter = this.ball;
        this.ballParticles.particleTexture = new BABYLON.Texture('./../../assets/flare.png', scene);
        this.ballParticles.textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
        this.ballParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        this.ballParticles.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        this.ballParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        this.ballParticles.minSize = 0.1;
        this.ballParticles.maxSize = 0.5;
        this.ballParticles.minLifeTime = 0.5;
        this.ballParticles.maxLifeTime = 1.5;
        this.ballParticles.emitRate = 500;
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

var createDOMElementsEnd = function createDOMElementsEnd() {};

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwiaGlnaGxpZ2h0TGF5ZXJfMSIsIkJBQllMT04iLCJIaWdobGlnaHRMYXllciIsInBsYXllck9uZVNjb3JlIiwicGxheWVyVHdvU2NvcmUiLCJtYXhTY29yZVBvc3NpYmxlIiwiZ2FtZVN0YXJ0ZWQiLCJzY29yZUJvYXJkIiwiTWVzaEJ1aWxkZXIiLCJDcmVhdGVQbGFuZSIsImhlaWdodCIsIndpZHRoIiwic2lkZU9yaWVudGF0aW9uIiwiTWVzaCIsIkRPVUJMRVNJREUiLCJwb3NpdGlvbiIsIlZlY3RvcjMiLCJhZGRNZXNoIiwiQ29sb3IzIiwiYmx1clZlcnRpY2FsU2l6ZSIsImJsdXJIb3Jpem9udGFsU2l6ZSIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwiQmxhY2siLCJtYXRlcmlhbCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJzY29yZUJvYXJkVGV4dHVyZUNvbnRleHQiLCJnZXRDb250ZXh0IiwiZGlmZnVzZVRleHR1cmUiLCJlbWlzc2l2ZUNvbG9yIiwic3BlY3VsYXJDb2xvciIsIlJlZCIsImRyYXdUZXh0IiwicGxheWluZ0JhbGwiLCJvblRyaWdnZXJFbnRlciIsImJpbmQiLCJiYWxsSW1wb3N0ZXIiLCJyZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUiLCJiYWxsUmVzZXRJbXBvc3RlciIsImNvbGxpZGVkQWdhaW5zdCIsInNldExpbmVhclZlbG9jaXR5IiwiWmVybyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImdldE9iamVjdENlbnRlciIsInoiLCJyZXNldEJhbGxTdGF0cyIsInJlc2V0UGFkZGxlIiwiY2xlYXJSZWN0IiwicmVzZXRHYW1lIiwiQmFsbCIsInNwYXduUG9zaXRpb24iLCJiYWxsSWQiLCJjb2xvciIsIm1pbkJhbGxTcGVlZCIsIm1heEJhbGxTcGVlZCIsImJhbGwiLCJDcmVhdGVTcGhlcmUiLCJzZWdtZW50cyIsImRpYW1ldGVyIiwiU3BoZXJlSW1wb3N0b3IiLCJ1bmlxdWVJZCIsImJhbGxNYXRlcmlhbCIsImJhbGxQYXJ0aWNsZXMiLCJQYXJ0aWNsZVN5c3RlbSIsImVtaXR0ZXIiLCJwYXJ0aWNsZVRleHR1cmUiLCJUZXh0dXJlIiwidGV4dHVyZU1hc2siLCJDb2xvcjQiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvckRlYWQiLCJtaW5TaXplIiwibWF4U2l6ZSIsIm1pbkxpZmVUaW1lIiwibWF4TGlmZVRpbWUiLCJlbWl0UmF0ZSIsInN0YXJ0IiwiaW5pdGlhbFBvc2l0aW9uIiwiY2xvbmUiLCJpc0xhdW5jaGVkIiwicGxheWVyUGFkZGxlVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ4IiwiTWF0aCIsInJhbmRvbSIsImltcG9zdGVyc0FycmF5IiwiYmFsbFBoeXNpY3NJbXBvc3RlciIsInZlbG9jaXR5WCIsImdldExpbmVhclZlbG9jaXR5IiwidmVsb2NpdHlYQmFsbCIsInZlbG9jaXR5WiIsInZlbG9jaXR5IiwidmVsb2NpdHlaQWJzIiwiYWJzIiwiY2xhbXBlZFZlbG9jaXR5WiIsIk1hdGhUb29scyIsIkNsYW1wIiwiZGlyZWN0aW9uIiwic2lnbiIsInZlbG9jaXR5WSIsInkiLCJsaW1pdEJhbGxWZWxvY2l0eSIsImxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlIiwibGF1bmNoQmFsbCIsIlBhZGRsZSIsIm5hbWUiLCJwYWRkbGVJZCIsImlzQUkiLCJrZXlzIiwicGFkZGxlIiwiQ3JlYXRlQm94IiwiZGVwdGgiLCJwYWRkbGVIaWdobGlnaHQiLCJZZWxsb3ciLCJwYWRkbGVNYXRlcmlhbCIsIm1vdmVtZW50U3BlZWQiLCJMZWZ0Iiwic2NhbGUiLCJSaWdodCIsImJhbGxDbGFzcyIsImRlc2lyZWREaXJlY3Rpb24iLCJtb3ZlUGFkZGxlIiwibW92ZVBhZGRsZUFJIiwiY2FudmFzSG9sZGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNhbnZhcyIsImNyZWF0ZUVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJhcHBlbmRDaGlsZCIsImVuZ2luZSIsIkVuZ2luZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImtleUNvZGUiLCJjcmVhdGVET01FbGVtZW50c1N0YXJ0IiwiaG9tZU92ZXJsYXkiLCJjbGFzc05hbWUiLCJob21lT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXJDb250ZW50IiwiaW5uZXJUZXh0IiwibWFpbkNvbnRlbnRIb2xkZXIiLCJzdGFydEJ1dHRvbiIsInN0eWxlIiwiZ2FtZU1hbmFnZXIiLCJoZWxwQ29udGVudCIsImJvZHkiLCJjcmVhdGVET01FbGVtZW50c0VuZCIsImNyZWF0ZVNjZW5lIiwiU2NlbmUiLCJlbmFibGVQaHlzaWNzIiwiQ2Fubm9uSlNQbHVnaW4iLCJjb2xsaXNpb25zRW5hYmxlZCIsIndvcmtlckNvbGxpc2lvbnMiLCJjbGVhckNvbG9yIiwiZ3JvdW5kSGlnaGxpZ2h0IiwiaW5uZXJHbG93IiwiY2FtZXJhIiwiRnJlZUNhbWVyYSIsInNldFRhcmdldCIsImxpZ2h0IiwiSGVtaXNwaGVyaWNMaWdodCIsImdlbmVyaWNCbGFja01hdGVyaWFsIiwiZ3JvdW5kIiwibGVmdEJhciIsInJpZ2h0QmFyIiwicGxheWVyXzEiLCJhaVBsYXllciIsInNldENvbGxpc2lvbkNvbXBvbmVudHMiLCJ0ZXN0SGlnaGxpZ2h0IiwiYWRkRXhjbHVkZWRNZXNoIiwiZ2V0SGlnaGxpZ2h0TGF5ZXJCeU5hbWUiLCJydW5SZW5kZXJMb29wIiwia2V5IiwidXBkYXRl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QThCLGlCQUE5QixDQUF4QjtBQUNBaEIsZ0JBQWdCZSxlQUFoQixDQUFnQ0osU0FBUzNELE1BQXpDO0FBQ0FnRCxnQkFBZ0JlLGVBQWhCLENBQWdDSCxTQUFTNUQsTUFBekM7O0FBRUF1QixPQUFPMEMsYUFBUCxDQUFxQixZQUFNO0FBQ3ZCLFFBQUksQ0FBQzVCLFlBQVl6SixXQUFqQixFQUE4QjtBQUMxQixhQUFLLElBQUlzTCxHQUFULElBQWdCOUYsU0FBaEIsRUFBMkI7QUFDdkJBLHNCQUFVOEYsR0FBVixJQUFpQixLQUFqQjtBQUNIO0FBQ0o7O0FBRUQvSSxnQkFBWWdKLE1BQVosQ0FBbUIvRixTQUFuQixFQUE4QnVGLFNBQVMzRCxNQUFULENBQWdCbEcsZUFBaEIsQ0FBZ0M2RSxpQkFBaEMsRUFBOUI7QUFDQWdGLGFBQVNRLE1BQVQsQ0FBZ0IvRixTQUFoQixFQUEyQmpELFdBQTNCO0FBQ0F5SSxhQUFTTyxNQUFULENBQWdCL0YsU0FBaEIsRUFBMkJqRCxXQUEzQjs7QUFFQWtILGdCQUFZOEIsTUFBWjtBQUNBak0sVUFBTWtNLE1BQU47QUFDSCxDQWJEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cblxuY2xhc3MgR2FtZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBiYWxsQ2xhc3NPYmplY3QsIHBhZGRsZU9uZSwgcGFkZGxlVHdvKSB7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMSA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdzY29yZUJvYXJkSGlnaGxpZ2h0Jywgc2NlbmUpO1xuXG4gICAgICAgIHRoaXMucGxheWVyT25lU2NvcmUgPSAwO1xuICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlID0gMDtcbiAgICAgICAgdGhpcy5tYXhTY29yZVBvc3NpYmxlID0gNTtcblxuICAgICAgICAvLyBUT0RPOiBDaGFuZ2UgYXQgdGhlIGVuZFxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNjb3JlQm9hcmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKCdzY29yZUJvYXJkJywge1xuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIHdpZHRoOiAzMixcbiAgICAgICAgICAgIHNpZGVPcmllbnRhdGlvbjogQkFCWUxPTi5NZXNoLkRPVUJMRVNJREVcbiAgICAgICAgfSwgc2NlbmUpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmQucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDE2LCAzNik7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMS5hZGRNZXNoKHRoaXMuc2NvcmVCb2FyZCwgbmV3IEJBQllMT04uQ29sb3IzKDEsIDAuNDEsIDApKTtcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXllcl8xLmJsdXJWZXJ0aWNhbFNpemUgPSAwLjM7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXJfMS5ibHVySG9yaXpvbnRhbFNpemUgPSAwLjM7XG5cbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kKCdiYWxsQ29sbGlkZXInLCB7XG4gICAgICAgICAgICB3aWR0aDogNjQsXG4gICAgICAgICAgICBoZWlnaHQ6IDIwMCxcbiAgICAgICAgICAgIHN1YmRpdmlzaW9uczogMlxuICAgICAgICB9LCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC0yLCAwKTtcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXG4gICAgICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLFxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcbiAgICAgICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncmVzZXRNYXRlcmlhbCcsIHNjZW5lKTtcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIubWF0ZXJpYWwgPSB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWw7XG5cbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdzY29yZUJvYXJkTWF0ZXJpYWwnLCBzY2VuZSk7XG4gICAgICAgIC8vIE9wdGlvbnMgaXMgdG8gc2V0IHRoZSByZXNvbHV0aW9uIC0gT3Igc29tZXRoaW5nIGxpa2UgdGhhdFxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlID0gbmV3IEJBQllMT04uRHluYW1pY1RleHR1cmUoJ3Njb3JlQm9hcmRNYXRlcmlhbER5bmFtaWMnLCAxMDI0LCBzY2VuZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmVDb250ZXh0ID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5nZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLnNwZWN1bGFyQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5SZWQoKTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLm1hdGVyaWFsID0gdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWw7XG5cbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dCgnU2NvcmVzJywgMzMwLCAxNTAsIGBzbWFsbC1jYXBzIGJvbGRlciAxMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdQbGF5ZXIgMScsIDUwLCA0MDAsIGA5MHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ0NvbXB1dGVyJywgNTIwLCA0MDAsIGA5MHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYCBib2xkZXIgMjAwcHggJ0x1Y2lkYSBTYW5zJywgJ0x1Y2lkYSBTYW5zIFJlZ3VsYXInLCAnTHVjaWRhIEdyYW5kZScsICdMdWNpZGEgU2FucyBVbmljb2RlJywgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllclR3b1Njb3JlfWAsIDY4MCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XG5cblxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsID0gYmFsbENsYXNzT2JqZWN0O1xuICAgICAgICB0aGlzLnBhZGRsZU9uZSA9IHBhZGRsZU9uZTtcbiAgICAgICAgdGhpcy5wYWRkbGVUd28gPSBwYWRkbGVUd287XG5cbiAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlciA9IHRoaXMub25UcmlnZ2VyRW50ZXIuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGJhbGxJbXBvc3Rlcikge1xuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoYmFsbEltcG9zdGVyLCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcbiAgICB9XG5cbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUmVzZXRJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XG4gICAgICAgIGJhbGxSZXNldEltcG9zdGVyLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICBiYWxsUmVzZXRJbXBvc3Rlci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG5cbiAgICAgICAgaWYgKGNvbGxpZGVkQWdhaW5zdC5nZXRPYmplY3RDZW50ZXIoKS56IDwgLTM0KVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSsrO1xuICAgICAgICBlbHNlIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA+IDM0KVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSsrO1xuXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwucmVzZXRCYWxsU3RhdHMoKTtcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUucmVzZXRQYWRkbGUoKTtcbiAgICAgICAgdGhpcy5wYWRkbGVUd28ucmVzZXRQYWRkbGUoKTtcblxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dC5jbGVhclJlY3QoMCwgNTAwLCAxMDI0LCAxMDI0KTtcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllck9uZVNjb3JlfWAsIDE1MCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdMdWNpZGEgU2FucycsICdMdWNpZGEgU2FucyBSZWd1bGFyJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIEdlbmV2YSwgVmVyZGFuYSwgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJUd29TY29yZX1gLCA2ODAsIDcwMCwgYGJvbGRlciAyMDBweCAnTHVjaWRhIFNhbnMnLCAnTHVjaWRhIFNhbnMgUmVndWxhcicsICdMdWNpZGEgR3JhbmRlJywgJ0x1Y2lkYSBTYW5zIFVuaWNvZGUnLCBHZW5ldmEsIFZlcmRhbmEsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xuXG4gICAgICAgIGlmICh0aGlzLnBsYXllck9uZVNjb3JlID4gdGhpcy5tYXhTY29yZVBvc3NpYmxlIHx8IHRoaXMucGxheWVyVHdvU2NvcmUgPiB0aGlzLm1heFNjb3JlUG9zc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldEdhbWUoKSB7XG4gICAgICAgIHRoaXMucGxheWVyT25lU2NvcmUgPSAwO1xuICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlID0gMDtcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbC5yZXNldEJhbGxTdGF0cygpO1xuICAgICAgICB0aGlzLnBhZGRsZU9uZS5yZXNldFBhZGRsZSgpO1xuICAgICAgICB0aGlzLnBhZGRsZVR3by5yZXNldFBhZGRsZSgpO1xuXG4gICAgICAgIHRoaXMuZ2FtZVN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxuaW1wb3J0IHtcbiAgICBpc1RoaXNFeHByZXNzaW9uXG59IGZyb20gXCIuLi8uLi8uLi8uLi8uY2FjaGUvdHlwZXNjcmlwdC8yLjYvbm9kZV9tb2R1bGVzL0B0eXBlcy9iYWJlbC10eXBlc1wiO1xuXG5cbmNsYXNzIEJhbGwge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBzcGF3blBvc2l0aW9uLCBiYWxsSWQsIGNvbG9yID0gMSkge1xuICAgICAgICB0aGlzLm1pbkJhbGxTcGVlZCA9IDEwO1xuICAgICAgICB0aGlzLm1heEJhbGxTcGVlZCA9IDEwMDtcblxuICAgICAgICB0aGlzLmJhbGwgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgncGxheUJhbGwnLCB7XG4gICAgICAgICAgICBzZWdtZW50czogMTYsXG4gICAgICAgICAgICBkaWFtZXRlcjogMVxuICAgICAgICB9LCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXG4gICAgICAgICAgICB0aGlzLmJhbGwsXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3Rvciwge1xuICAgICAgICAgICAgICAgIG1hc3M6IDEsXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzY2VuZVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gYmFsbElkO1xuXG4gICAgICAgIHRoaXMuYmFsbE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncGxheWluZ0JhbGxNYXRlcmlhbCcsIHNjZW5lKTtcbiAgICAgICAgdGhpcy5iYWxsTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuUmVkKCk7XG4gICAgICAgIHRoaXMuYmFsbC5tYXRlcmlhbCA9IHRoaXMuYmFsbE1hdGVyaWFsO1xuXG4gICAgICAgIC8vIFRvZG86IEZpeCBiYWxsIHBhcnRpY2xlc1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMgPSBuZXcgQkFCWUxPTi5QYXJ0aWNsZVN5c3RlbSgncGxheWluZ0JhbGxQYXJ0aWNsZXMnLCAxMDAwLCBzY2VuZSk7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5lbWl0dGVyID0gdGhpcy5iYWxsO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMucGFydGljbGVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgnLi8uLi8uLi9hc3NldHMvZmxhcmUucG5nJywgc2NlbmUpO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMudGV4dHVyZU1hc2sgPSBuZXcgQkFCWUxPTi5Db2xvcjQoMC4xLCAwLjgsIDAuOCwgMS4wKTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLmNvbG9yMSA9IG5ldyBCQUJZTE9OLkNvbG9yNCgwLjcsIDAuOCwgMS4wLCAxLjApO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuY29sb3IyID0gbmV3IEJBQllMT04uQ29sb3I0KDAuMiwgMC41LCAxLjAsIDEuMCk7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5jb2xvckRlYWQgPSBuZXcgQkFCWUxPTi5Db2xvcjQoMCwgMCwgMC4yLCAwLjApO1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMubWluU2l6ZSA9IDAuMTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1heFNpemUgPSAwLjU7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5taW5MaWZlVGltZSA9IDAuNTtcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzLm1heExpZmVUaW1lID0gMS41O1xuICAgICAgICB0aGlzLmJhbGxQYXJ0aWNsZXMuZW1pdFJhdGUgPSA1MDA7XG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5zdGFydCgpO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbi5jbG9uZSgpO1xuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgbG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XG4gICAgfVxuXG4gICAgbGF1bmNoQmFsbChrZXlTdGF0ZXMsIHBsYXllclBhZGRsZVZlbG9jaXR5KSB7XG4gICAgICAgIGlmIChrZXlTdGF0ZXNbMzJdKSB7XG4gICAgICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KFxuICAgICAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBhZGRsZVZlbG9jaXR5LngsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGltcG9zdGVyc0FycmF5KSB7XG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IucmVnaXN0ZXJPblBoeXNpY3NDb2xsaWRlKGltcG9zdGVyc0FycmF5LCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcbiAgICB9XG5cbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUGh5c2ljc0ltcG9zdGVyLCBjb2xsaWRlZEFnYWluc3QpIHtcbiAgICAgICAgbGV0IHZlbG9jaXR5WCA9IGNvbGxpZGVkQWdhaW5zdC5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XG4gICAgICAgIGxldCB2ZWxvY2l0eVhCYWxsID0gYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XG4gICAgICAgIGxldCB2ZWxvY2l0eVogPSAtYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLno7XG5cbiAgICAgICAgYmFsbFBoeXNpY3NJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShcbiAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlYIC0gdmVsb2NpdHlYQmFsbCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WlxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgY29sbGlkZWRBZ2FpbnN0LnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICB9XG5cbiAgICBsaW1pdEJhbGxWZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpO1xuXG4gICAgICAgIGxldCB2ZWxvY2l0eVogPSB2ZWxvY2l0eS56O1xuICAgICAgICBsZXQgdmVsb2NpdHlaQWJzID0gTWF0aC5hYnModmVsb2NpdHlaKTtcbiAgICAgICAgbGV0IGNsYW1wZWRWZWxvY2l0eVogPSBCQUJZTE9OLk1hdGhUb29scy5DbGFtcCh2ZWxvY2l0eVpBYnMsIHRoaXMubWluQmFsbFNwZWVkLCB0aGlzLm1heEJhbGxTcGVlZCk7XG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBNYXRoLnNpZ24odmVsb2NpdHlaKTtcblxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gdmVsb2NpdHkueDtcbiAgICAgICAgbGV0IHZlbG9jaXR5WSA9IHZlbG9jaXR5Lnk7XG5cbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcbiAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlYLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WSxcbiAgICAgICAgICAgICAgICBjbGFtcGVkVmVsb2NpdHlaICogZGlyZWN0aW9uXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNMYXVuY2hlZCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdEJhbGxWZWxvY2l0eSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZShwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XG4gICAgICAgICAgICB0aGlzLmxhdW5jaEJhbGwoa2V5U3RhdGVzLCBwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldEJhbGxTdGF0cygpIHtcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XG5cbiAgICAgICAgdGhpcy5pc0xhdW5jaGVkID0gZmFsc2U7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxuXG5jbGFzcyBQYWRkbGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHNjZW5lLCBzcGF3blBvc2l0aW9uLCBwYWRkbGVJZCwgaXNBSSwga2V5cyA9IFszNywgMzldLCBjb2xvciA9IDEpIHtcbiAgICAgICAgdGhpcy5wYWRkbGUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveChgcGFkZGxlXyR7bmFtZX1gLCB7XG4gICAgICAgICAgICB3aWR0aDogNSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIGRlcHRoOiAxXG4gICAgICAgIH0sIHNjZW5lKTtcbiAgICAgICAgdGhpcy5wYWRkbGUucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXG4gICAgICAgICAgICB0aGlzLnBhZGRsZSxcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICAgICAgbWFzczogMSxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjZW5lXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gcGFkZGxlSWQ7XG5cbiAgICAgICAgdGhpcy5wYWRkbGVIaWdobGlnaHQgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcihgcGFkZGxlXyR7bmFtZX1faGlnaGxpZ2h0YCwgc2NlbmUpO1xuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodC5hZGRNZXNoKHRoaXMucGFkZGxlLCBCQUJZTE9OLkNvbG9yMy5ZZWxsb3coKSk7XG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMTtcbiAgICAgICAgdGhpcy5wYWRkbGVIaWdobGlnaHQuYmx1clZlcnRpY2FsU2l6ZSA9IDAuMTtcbiAgICAgICAgdGhpcy5wYWRkbGVNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoYHBhZGRsZV8ke25hbWV9X21hdGVyaWFsYCwgc2NlbmUpO1xuICAgICAgICB0aGlzLnBhZGRsZU1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XG4gICAgICAgIHRoaXMucGFkZGxlLm1hdGVyaWFsID0gdGhpcy5wYWRkbGVNYXRlcmlhbDtcblxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSA1O1xuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xuXG4gICAgICAgIHRoaXMuaXNBSSA9IGlzQUk7XG4gICAgfVxuXG4gICAgbW92ZVBhZGRsZShrZXlTdGF0ZXMpIHtcbiAgICAgICAgaWYgKGtleVN0YXRlc1t0aGlzLmtleXNbMF1dKSB7XG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkge1xuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1swXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSB8fFxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMF1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSlcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICB9XG5cbiAgICBtb3ZlUGFkZGxlQUkoYmFsbENsYXNzKSB7XG4gICAgICAgIGlmIChiYWxsQ2xhc3MuaXNMYXVuY2hlZCkge1xuICAgICAgICAgICAgbGV0IGRlc2lyZWREaXJlY3Rpb24gPSBNYXRoLnNpZ24oYmFsbENsYXNzLmJhbGwucG9zaXRpb24ueCAtIHRoaXMucGFkZGxlLnBvc2l0aW9uLngpO1xuXG4gICAgICAgICAgICBpZiAoZGVzaXJlZERpcmVjdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzaXJlZERpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuUmlnaHQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKGtleVN0YXRlcywgYmFsbENsYXNzKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FJKVxuICAgICAgICAgICAgdGhpcy5tb3ZlUGFkZGxlKGtleVN0YXRlcyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZUFJKGJhbGxDbGFzcyk7XG5cbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcbiAgICB9XG5cbiAgICByZXNldFBhZGRsZSgpIHtcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XG4gICAgfVxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFkZGxlLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JhbGwuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ2FtZS1tYW5hZ2VyLmpzXCIgLz5cblxuLy8gVG9EbzogUmVtb3ZlIGBzaG93Qm91bmRpbmdCb3hgIGZyb20gYWxsIGJvZGllc1xuXG5jb25zdCBjYW52YXNIb2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzLWhvbGRlcicpO1xuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDI1O1xuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDMwO1xuY2FudmFzSG9sZGVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG5jb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcblxuY29uc3Qga2V5U3RhdGVzID0ge1xuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcbiAgICAzODogZmFsc2UsIC8vIFVQXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxuICAgIDg3OiBmYWxzZSwgLy8gV1xuICAgIDY1OiBmYWxzZSwgLy8gQVxuICAgIDgzOiBmYWxzZSwgLy8gU1xuICAgIDY4OiBmYWxzZSAvLyBEXG59O1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXG4gICAgICAgIGtleVN0YXRlc1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG59KTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XG59KTtcblxuY29uc3QgY3JlYXRlRE9NRWxlbWVudHNTdGFydCA9ICgpID0+IHtcbiAgICBjb25zdCBob21lT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhvbWVPdmVybGF5LmNsYXNzTmFtZSA9ICdvdmVybGF5JztcblxuICAgIGNvbnN0IGhvbWVPdmVybGF5Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhvbWVPdmVybGF5Q29udGVudC5jbGFzc05hbWUgPSAnb3ZlcmxheS1jb250ZW50JztcbiAgICBob21lT3ZlcmxheS5hcHBlbmRDaGlsZChob21lT3ZlcmxheUNvbnRlbnQpO1xuXG4gICAgY29uc3QgaGVhZGVyQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhlYWRlckNvbnRlbnQuY2xhc3NOYW1lID0gJ2hlYWRlcic7XG4gICAgaGVhZGVyQ29udGVudC5pbm5lclRleHQgPSAnUG9uZyc7XG5cbiAgICBjb25zdCBtYWluQ29udGVudEhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1haW5Db250ZW50SG9sZGVyLmNsYXNzTmFtZSA9ICdtYWluLWNvbnRlbnQtaG9sZGVyJztcblxuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHN0YXJ0QnV0dG9uLmNsYXNzTmFtZSA9ICdzdGFydC1idXR0b24nO1xuICAgIHN0YXJ0QnV0dG9uLmlubmVyVGV4dCA9ICdTdGFydCBHYW1lJztcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8gVG9kbzogQ2hhbmdlIEdhbWUgU3RhdGUgSGVyZVxuICAgICAgICBob21lT3ZlcmxheS5zdHlsZS53aWR0aCA9ICcwJztcbiAgICAgICAgZ2FtZU1hbmFnZXIuZ2FtZVN0YXJ0ZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaGVscENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBoZWxwQ29udGVudC5jbGFzc05hbWUgPSAnaGVscC1jb250ZW50JztcbiAgICBoZWxwQ29udGVudC5pbm5lclRleHQgPSAnQSBwb25nIGdhbWUgbWFkZSB1c2luZyBCQUJZTE9OLkpTLiBVc2UgQVJST1cgS0VZUyB0byBjb250cm9sIGFuZCBTUEFDRSB0byBsYXVuY2ggdGhlIGJhbGwuJztcblxuICAgIG1haW5Db250ZW50SG9sZGVyLmFwcGVuZENoaWxkKHN0YXJ0QnV0dG9uKTtcbiAgICBtYWluQ29udGVudEhvbGRlci5hcHBlbmRDaGlsZChoZWxwQ29udGVudCk7XG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKGhlYWRlckNvbnRlbnQpO1xuICAgIGhvbWVPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChtYWluQ29udGVudEhvbGRlcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChob21lT3ZlcmxheSk7XG59O1xuXG5jb25zdCBjcmVhdGVET01FbGVtZW50c0VuZCA9ICgpID0+IHtcblxufTtcblxuY29uc3QgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCAtOS44MSwgMCksIG5ldyBCQUJZTE9OLkNhbm5vbkpTUGx1Z2luKCkpO1xuICAgIHNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcbiAgICBzY2VuZS53b3JrZXJDb2xsaXNpb25zID0gdHJ1ZTtcbiAgICBzY2VuZS5jbGVhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcblxuICAgIGNvbnN0IGdyb3VuZEhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdncm91bmRIaWdobGlnaHQnLCBzY2VuZSk7XG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcbiAgICBncm91bmRIaWdobGlnaHQuYmx1clZlcnRpY2FsU2l6ZSA9IDAuMztcbiAgICBncm91bmRIaWdobGlnaHQuaW5uZXJHbG93ID0gMDtcblxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkZyZWVDYW1lcmEoJ21haW5DYW1lcmEnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDIwLCAtNjApLCBzY2VuZSk7XG4gICAgY2FtZXJhLnNldFRhcmdldChCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcblxuICAgIGNvbnN0IGxpZ2h0ID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodCgnbWFpbkxpZ2h0JywgbmV3IEJBQllMT04uVmVjdG9yMygwLCAxLCAwKSwgc2NlbmUpO1xuXG4gICAgY29uc3QgZ2VuZXJpY0JsYWNrTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdibGFja01hdGVyaWFsJywgc2NlbmUpO1xuICAgIGdlbmVyaWNCbGFja01hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XG5cbiAgICBjb25zdCBncm91bmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnbWFpbkdyb3VuZCcsIHtcbiAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICBoZWlnaHQ6IDcwLFxuICAgICAgICBzdWJkaXZpc2lvbnM6IDJcbiAgICB9LCBzY2VuZSk7XG4gICAgZ3JvdW5kLnBvc2l0aW9uID0gQkFCWUxPTi5WZWN0b3IzLlplcm8oKTtcbiAgICBncm91bmQucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxuICAgICAgICBncm91bmQsXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMFxuICAgICAgICB9LCBzY2VuZSk7XG4gICAgZ3JvdW5kLm1hdGVyaWFsID0gZ2VuZXJpY0JsYWNrTWF0ZXJpYWw7XG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmFkZE1lc2goZ3JvdW5kLCBCQUJZTE9OLkNvbG9yMy5SZWQoKSk7XG5cbiAgICBjb25zdCBsZWZ0QmFyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goJ2xlZnRCYXInLCB7XG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgIGRlcHRoOiA3MFxuICAgIH0sIHNjZW5lKTtcbiAgICBsZWZ0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTUsIDEsIDApO1xuICAgIGxlZnRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxuICAgICAgICBsZWZ0QmFyLFxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xuICAgICAgICAgICAgbWFzczogMCxcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcbiAgICAgICAgfSk7XG4gICAgbGVmdEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xuXG4gICAgY29uc3QgcmlnaHRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgncmlnaHRCYXInLCB7XG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgIGRlcHRoOiA3MFxuICAgIH0sIHNjZW5lKTtcbiAgICByaWdodEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMTUsIDEsIDApO1xuICAgIHJpZ2h0QmFyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcbiAgICAgICAgcmlnaHRCYXIsXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XG4gICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxuICAgICAgICB9KTtcbiAgICByaWdodEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xuXG4gICAgcmV0dXJuIHNjZW5lO1xufTtcbmNvbnN0IHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcbi8vIGNyZWF0ZURPTUVsZW1lbnRzU3RhcnQoKTtcbi8vIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpXG5cbmNvbnN0IHBsYXllcl8xID0gbmV3IFBhZGRsZSgncGxheWVyXzEnLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNCksIDIsIGZhbHNlKTtcbmNvbnN0IGFpUGxheWVyID0gbmV3IFBhZGRsZSgnYWlQbGF5ZXInLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIDM0KSwgMywgdHJ1ZSk7XG5cbmNvbnN0IHBsYXlpbmdCYWxsID0gbmV3IEJhbGwoc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzMpLCAxKTtcbnBsYXlpbmdCYWxsLnNldENvbGxpc2lvbkNvbXBvbmVudHMoW3BsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IsIGFpUGxheWVyLnBhZGRsZS5waHlzaWNzSW1wb3N0b3JdKTtcblxuY29uc3QgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoc2NlbmUsIHBsYXlpbmdCYWxsLCBwbGF5ZXJfMSwgYWlQbGF5ZXIpO1xuZ2FtZU1hbmFnZXIuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhwbGF5aW5nQmFsbC5iYWxsLnBoeXNpY3NJbXBvc3Rvcik7XG5jb25zdCB0ZXN0SGlnaGxpZ2h0ID0gbmV3IEJBQllMT04uSGlnaGxpZ2h0TGF5ZXIoJ3Rlc3RIaWdobGlnaHQnLCBzY2VuZSk7XG50ZXN0SGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcbnRlc3RIaWdobGlnaHQuYmx1clZlcnRpY2FsU2l6ZSA9IDAuMztcbnRlc3RIaWdobGlnaHQuYWRkTWVzaChnYW1lTWFuYWdlci5iYWxsUmVzZXRDb2xsaWRlciwgQkFCWUxPTi5Db2xvcjMuUmVkKCkpO1xudGVzdEhpZ2hsaWdodC5hZGRFeGNsdWRlZE1lc2gocGxheWVyXzEucGFkZGxlKTtcbnRlc3RIaWdobGlnaHQuYWRkRXhjbHVkZWRNZXNoKGFpUGxheWVyLnBhZGRsZSk7XG5jb25zdCBncm91bmRIaWdobGlnaHQgPSBzY2VuZS5nZXRIaWdobGlnaHRMYXllckJ5TmFtZSgnZ3JvdW5kSGlnaGxpZ2h0Jyk7XG5ncm91bmRIaWdobGlnaHQuYWRkRXhjbHVkZWRNZXNoKHBsYXllcl8xLnBhZGRsZSk7XG5ncm91bmRIaWdobGlnaHQuYWRkRXhjbHVkZWRNZXNoKGFpUGxheWVyLnBhZGRsZSk7XG5cbmVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcbiAgICBpZiAoIWdhbWVNYW5hZ2VyLmdhbWVTdGFydGVkKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBrZXlTdGF0ZXMpIHtcbiAgICAgICAgICAgIGtleVN0YXRlc1trZXldID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGF5aW5nQmFsbC51cGRhdGUoa2V5U3RhdGVzLCBwbGF5ZXJfMS5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkpO1xuICAgIHBsYXllcl8xLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXlpbmdCYWxsKTtcbiAgICBhaVBsYXllci51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XG5cbiAgICBnYW1lTWFuYWdlci51cGRhdGUoKTtcbiAgICBzY2VuZS5yZW5kZXIoKTtcbn0pOyJdfQ==
