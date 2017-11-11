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

        this.scoreBoardTexture.drawText('Scores', 330, 150, 'small-caps bolder 100px \'Quicksand\', sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('Player 1', 50, 400, '90px \'Quicksand\', sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('Player 2', 620, 400, '90px \'Quicksand\', sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('' + this.playerOneScore, 150, 700, ' bolder 200px \'Quicksand\', sans-serif', '#ff6a00');
        this.scoreBoardTexture.drawText('' + this.playerTwoScore, 730, 700, 'bolder 200px \'Quicksand\', sans-serif', '#ff6a00');

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
            this.scoreBoardTexture.drawText('' + this.playerOneScore, 150, 700, 'bolder 200px \'Quicksand\', sans-serif', '#ff6a00');
            this.scoreBoardTexture.drawText('' + this.playerTwoScore, 730, 700, 'bolder 200px \'Quicksand\', sans-serif', '#ff6a00');

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
        this.ballParticles.em = this.ball;

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwiaGlnaGxpZ2h0TGF5ZXJfMSIsIkJBQllMT04iLCJIaWdobGlnaHRMYXllciIsInBsYXllck9uZVNjb3JlIiwicGxheWVyVHdvU2NvcmUiLCJtYXhTY29yZVBvc3NpYmxlIiwiZ2FtZVN0YXJ0ZWQiLCJzY29yZUJvYXJkIiwiTWVzaEJ1aWxkZXIiLCJDcmVhdGVQbGFuZSIsImhlaWdodCIsIndpZHRoIiwic2lkZU9yaWVudGF0aW9uIiwiTWVzaCIsIkRPVUJMRVNJREUiLCJwb3NpdGlvbiIsIlZlY3RvcjMiLCJhZGRNZXNoIiwiQ29sb3IzIiwiYmx1clZlcnRpY2FsU2l6ZSIsImJsdXJIb3Jpem9udGFsU2l6ZSIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwiQmxhY2siLCJtYXRlcmlhbCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJzY29yZUJvYXJkVGV4dHVyZUNvbnRleHQiLCJnZXRDb250ZXh0IiwiZGlmZnVzZVRleHR1cmUiLCJlbWlzc2l2ZUNvbG9yIiwic3BlY3VsYXJDb2xvciIsIlJlZCIsImRyYXdUZXh0IiwicGxheWluZ0JhbGwiLCJvblRyaWdnZXJFbnRlciIsImJpbmQiLCJiYWxsSW1wb3N0ZXIiLCJyZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUiLCJiYWxsUmVzZXRJbXBvc3RlciIsImNvbGxpZGVkQWdhaW5zdCIsInNldExpbmVhclZlbG9jaXR5IiwiWmVybyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImdldE9iamVjdENlbnRlciIsInoiLCJyZXNldEJhbGxTdGF0cyIsInJlc2V0UGFkZGxlIiwiY2xlYXJSZWN0IiwicmVzZXRHYW1lIiwiQmFsbCIsInNwYXduUG9zaXRpb24iLCJiYWxsSWQiLCJjb2xvciIsIm1pbkJhbGxTcGVlZCIsIm1heEJhbGxTcGVlZCIsImJhbGwiLCJDcmVhdGVTcGhlcmUiLCJzZWdtZW50cyIsImRpYW1ldGVyIiwiU3BoZXJlSW1wb3N0b3IiLCJ1bmlxdWVJZCIsImJhbGxNYXRlcmlhbCIsImJhbGxQYXJ0aWNsZXMiLCJQYXJ0aWNsZVN5c3RlbSIsImVtIiwiaW5pdGlhbFBvc2l0aW9uIiwiY2xvbmUiLCJpc0xhdW5jaGVkIiwicGxheWVyUGFkZGxlVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ4IiwiTWF0aCIsInJhbmRvbSIsImltcG9zdGVyc0FycmF5IiwiYmFsbFBoeXNpY3NJbXBvc3RlciIsInZlbG9jaXR5WCIsImdldExpbmVhclZlbG9jaXR5IiwidmVsb2NpdHlYQmFsbCIsInZlbG9jaXR5WiIsInZlbG9jaXR5IiwidmVsb2NpdHlaQWJzIiwiYWJzIiwiY2xhbXBlZFZlbG9jaXR5WiIsIk1hdGhUb29scyIsIkNsYW1wIiwiZGlyZWN0aW9uIiwic2lnbiIsInZlbG9jaXR5WSIsInkiLCJsaW1pdEJhbGxWZWxvY2l0eSIsImxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlIiwibGF1bmNoQmFsbCIsIlBhZGRsZSIsIm5hbWUiLCJwYWRkbGVJZCIsImlzQUkiLCJrZXlzIiwicGFkZGxlIiwiQ3JlYXRlQm94IiwiZGVwdGgiLCJwYWRkbGVIaWdobGlnaHQiLCJZZWxsb3ciLCJwYWRkbGVNYXRlcmlhbCIsIm1vdmVtZW50U3BlZWQiLCJMZWZ0Iiwic2NhbGUiLCJSaWdodCIsImJhbGxDbGFzcyIsImRlc2lyZWREaXJlY3Rpb24iLCJtb3ZlUGFkZGxlIiwibW92ZVBhZGRsZUFJIiwiY2FudmFzSG9sZGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNhbnZhcyIsImNyZWF0ZUVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJhcHBlbmRDaGlsZCIsImVuZ2luZSIsIkVuZ2luZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImtleUNvZGUiLCJjcmVhdGVET01FbGVtZW50c1N0YXJ0IiwiaG9tZU92ZXJsYXkiLCJjbGFzc05hbWUiLCJob21lT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXJDb250ZW50IiwiaW5uZXJUZXh0IiwibWFpbkNvbnRlbnRIb2xkZXIiLCJzdGFydEJ1dHRvbiIsInN0eWxlIiwiZ2FtZU1hbmFnZXIiLCJoZWxwQ29udGVudCIsImJvZHkiLCJjcmVhdGVET01FbGVtZW50c0VuZCIsImNyZWF0ZVNjZW5lIiwiU2NlbmUiLCJlbmFibGVQaHlzaWNzIiwiQ2Fubm9uSlNQbHVnaW4iLCJjb2xsaXNpb25zRW5hYmxlZCIsIndvcmtlckNvbGxpc2lvbnMiLCJjbGVhckNvbG9yIiwiZ3JvdW5kSGlnaGxpZ2h0IiwiaW5uZXJHbG93IiwiY2FtZXJhIiwiRnJlZUNhbWVyYSIsInNldFRhcmdldCIsImxpZ2h0IiwiSGVtaXNwaGVyaWNMaWdodCIsImdlbmVyaWNCbGFja01hdGVyaWFsIiwiZ3JvdW5kIiwibGVmdEJhciIsInJpZ2h0QmFyIiwicGxheWVyXzEiLCJhaVBsYXllciIsInNldENvbGxpc2lvbkNvbXBvbmVudHMiLCJ0ZXN0SGlnaGxpZ2h0IiwiYWRkRXhjbHVkZWRNZXNoIiwiZ2V0SGlnaGxpZ2h0TGF5ZXJCeU5hbWUiLCJydW5SZW5kZXJMb29wIiwia2V5IiwidXBkYXRlIiwicmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFFTUEsVztBQUNGLHlCQUFZQyxLQUFaLEVBQW1CQyxlQUFuQixFQUFvQ0MsU0FBcEMsRUFBK0NDLFNBQS9DLEVBQTBEO0FBQUE7O0FBQ3RELGFBQUtDLGdCQUFMLEdBQXdCLElBQUlDLFFBQVFDLGNBQVosQ0FBMkIs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QixnQkFBZ0JlLGVBQWhCLENBQWdDSixTQUFTM0QsTUFBekM7QUFDQWdELGdCQUFnQmUsZUFBaEIsQ0FBZ0NILFNBQVM1RCxNQUF6Qzs7QUFFQXVCLE9BQU8wQyxhQUFQLENBQXFCLFlBQU07QUFDdkIsUUFBSSxDQUFDNUIsWUFBWTVJLFdBQWpCLEVBQThCO0FBQzFCLGFBQUssSUFBSXlLLEdBQVQsSUFBZ0I5RixTQUFoQixFQUEyQjtBQUN2QkEsc0JBQVU4RixHQUFWLElBQWlCLEtBQWpCO0FBQ0g7QUFDSjs7QUFFRGxJLGdCQUFZbUksTUFBWixDQUFtQi9GLFNBQW5CLEVBQThCdUYsU0FBUzNELE1BQVQsQ0FBZ0JyRixlQUFoQixDQUFnQ2dFLGlCQUFoQyxFQUE5QjtBQUNBZ0YsYUFBU1EsTUFBVCxDQUFnQi9GLFNBQWhCLEVBQTJCcEMsV0FBM0I7QUFDQTRILGFBQVNPLE1BQVQsQ0FBZ0IvRixTQUFoQixFQUEyQnBDLFdBQTNCOztBQUVBcUcsZ0JBQVk4QixNQUFaO0FBQ0FwTCxVQUFNcUwsTUFBTjtBQUNILENBYkQiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIGJhbGxDbGFzc09iamVjdCwgcGFkZGxlT25lLCBwYWRkbGVUd28pIHtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcignc2NvcmVCb2FyZEhpZ2hsaWdodCcsIHNjZW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhTY29yZVBvc3NpYmxlID0gNTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIGF0IHRoZSBlbmRcclxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVQbGFuZSgnc2NvcmVCb2FyZCcsIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgICAgICBzaWRlT3JpZW50YXRpb246IEJBQllMT04uTWVzaC5ET1VCTEVTSURFXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTYsIDM2KTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYWRkTWVzaCh0aGlzLnNjb3JlQm9hcmQsIG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLjQxLCAwKSk7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXllcl8xLmJsdXJWZXJ0aWNhbFNpemUgPSAwLjM7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXllcl8xLmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kKCdiYWxsQ29sbGlkZXInLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA2NCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyMDAsXHJcbiAgICAgICAgICAgIHN1YmRpdmlzaW9uczogMlxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAtMiwgMCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncmVzZXRNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLm1hdGVyaWFsID0gdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Njb3JlQm9hcmRNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICAvLyBPcHRpb25zIGlzIHRvIHNldCB0aGUgcmVzb2x1dGlvbiAtIE9yIHNvbWV0aGluZyBsaWtlIHRoYXRcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlID0gbmV3IEJBQllMT04uRHluYW1pY1RleHR1cmUoJ3Njb3JlQm9hcmRNYXRlcmlhbER5bmFtaWMnLCAxMDI0LCBzY2VuZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQgPSB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmdldENvbnRleHQoKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmU7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuc3BlY3VsYXJDb2xvciA9IEJBQllMT04uQ29sb3IzLlJlZCgpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5tYXRlcmlhbCA9IHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdTY29yZXMnLCAzMzAsIDE1MCwgYHNtYWxsLWNhcHMgYm9sZGVyIDEwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdQbGF5ZXIgMScsIDUwLCA0MDAsIGA5MHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdQbGF5ZXIgMicsIDYyMCwgNDAwLCBgOTBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllck9uZVNjb3JlfWAsIDE1MCwgNzAwLCBgIGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllclR3b1Njb3JlfWAsIDczMCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwgPSBiYWxsQ2xhc3NPYmplY3Q7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUgPSBwYWRkbGVPbmU7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28gPSBwYWRkbGVUd287XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhiYWxsSW1wb3N0ZXIpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoYmFsbEltcG9zdGVyLCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUmVzZXRJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgICAgICBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPCAtMzQpXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUrKztcclxuICAgICAgICBlbHNlIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA+IDM0KVxyXG4gICAgICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlKys7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwucmVzZXRCYWxsU3RhdHMoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZU9uZS5yZXNldFBhZGRsZSgpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmVDb250ZXh0LmNsZWFyUmVjdCgwLCA1MDAsIDEwMjQsIDEwMjQpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllclR3b1Njb3JlfWAsIDczMCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyT25lU2NvcmUgPiB0aGlzLm1heFNjb3JlUG9zc2libGUgfHwgdGhpcy5wbGF5ZXJUd29TY29yZSA+IHRoaXMubWF4U2NvcmVQb3NzaWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEdhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbC5yZXNldEJhbGxTdGF0cygpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28ucmVzZXRQYWRkbGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhbGwge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIHNwYXduUG9zaXRpb24sIGJhbGxJZCwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5taW5CYWxsU3BlZWQgPSAxMDtcclxuICAgICAgICB0aGlzLm1heEJhbGxTcGVlZCA9IDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVTcGhlcmUoJ3BsYXlCYWxsJywge1xyXG4gICAgICAgICAgICBzZWdtZW50czogMTYsXHJcbiAgICAgICAgICAgIGRpYW1ldGVyOiAxXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMuYmFsbCxcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuU3BoZXJlSW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjZW5lXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBiYWxsSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncGxheWluZ0JhbGxNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5SZWQoKTtcclxuICAgICAgICB0aGlzLmJhbGwubWF0ZXJpYWwgPSB0aGlzLmJhbGxNYXRlcmlhbDtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsUGFydGljbGVzID0gbmV3IEJBQllMT04uUGFydGljbGVTeXN0ZW0oJ3BsYXlpbmdCYWxsUGFydGljbGVzJywgMTAwMCwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbFBhcnRpY2xlcy5lbSA9IHRoaXMuYmFsbDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBzcGF3blBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgdGhpcy5pc0xhdW5jaGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyID0gdGhpcy5vblRyaWdnZXJFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGF1bmNoQmFsbChrZXlTdGF0ZXMsIHBsYXllclBhZGRsZVZlbG9jaXR5KSB7XHJcbiAgICAgICAgaWYgKGtleVN0YXRlc1szMl0pIHtcclxuICAgICAgICAgICAgdGhpcy5pc0xhdW5jaGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoXHJcbiAgICAgICAgICAgICAgICBuZXcgQkFCWUxPTi5WZWN0b3IzKFxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBhZGRsZVZlbG9jaXR5LngsXHJcbiAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnJhbmRvbSgpICogMTBcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhpbXBvc3RlcnNBcnJheSkge1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IucmVnaXN0ZXJPblBoeXNpY3NDb2xsaWRlKGltcG9zdGVyc0FycmF5LCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUGh5c2ljc0ltcG9zdGVyLCBjb2xsaWRlZEFnYWluc3QpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gY29sbGlkZWRBZ2FpbnN0LmdldExpbmVhclZlbG9jaXR5KCkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlYQmFsbCA9IGJhbGxQaHlzaWNzSW1wb3N0ZXIuZ2V0TGluZWFyVmVsb2NpdHkoKS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVogPSAtYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLno7XHJcblxyXG4gICAgICAgIGJhbGxQaHlzaWNzSW1wb3N0ZXIuc2V0TGluZWFyVmVsb2NpdHkoXHJcbiAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVggLSB2ZWxvY2l0eVhCYWxsLFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WlxyXG4gICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgY29sbGlkZWRBZ2FpbnN0LnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICBsaW1pdEJhbGxWZWxvY2l0eSgpIHtcclxuICAgICAgICBsZXQgdmVsb2NpdHkgPSB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCk7XHJcblxyXG4gICAgICAgIGxldCB2ZWxvY2l0eVogPSB2ZWxvY2l0eS56O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVpBYnMgPSBNYXRoLmFicyh2ZWxvY2l0eVopO1xyXG4gICAgICAgIGxldCBjbGFtcGVkVmVsb2NpdHlaID0gQkFCWUxPTi5NYXRoVG9vbHMuQ2xhbXAodmVsb2NpdHlaQWJzLCB0aGlzLm1pbkJhbGxTcGVlZCwgdGhpcy5tYXhCYWxsU3BlZWQpO1xyXG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBNYXRoLnNpZ24odmVsb2NpdHlaKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WCA9IHZlbG9jaXR5Lng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WSA9IHZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoXHJcbiAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVgsXHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVksXHJcbiAgICAgICAgICAgICAgICBjbGFtcGVkVmVsb2NpdHlaICogZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShrZXlTdGF0ZXMsIHBsYXllclBhZGRsZVZlbG9jaXR5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMYXVuY2hlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0QmFsbFZlbG9jaXR5KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZShwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIHRoaXMubGF1bmNoQmFsbChrZXlTdGF0ZXMsIHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRCYWxsU3RhdHMoKSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24gPSB0aGlzLmluaXRpYWxQb3NpdGlvbi5jbG9uZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgUGFkZGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHNjZW5lLCBzcGF3blBvc2l0aW9uLCBwYWRkbGVJZCwgaXNBSSwga2V5cyA9IFszNywgMzldLCBjb2xvciA9IDEpIHtcclxuICAgICAgICB0aGlzLnBhZGRsZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KGBwYWRkbGVfJHtuYW1lfWAsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDUsXHJcbiAgICAgICAgICAgIGhlaWdodDogMSxcclxuICAgICAgICAgICAgZGVwdGg6IDFcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2VuZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci51bmlxdWVJZCA9IHBhZGRsZUlkO1xyXG5cclxuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKGBwYWRkbGVfJHtuYW1lfV9oaWdobGlnaHRgLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVIaWdobGlnaHQuYWRkTWVzaCh0aGlzLnBhZGRsZSwgQkFCWUxPTi5Db2xvcjMuWWVsbG93KCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMTtcclxuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodC5ibHVyVmVydGljYWxTaXplID0gMC4xO1xyXG4gICAgICAgIHRoaXMucGFkZGxlTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKGBwYWRkbGVfJHtuYW1lfV9tYXRlcmlhbGAsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnBhZGRsZU1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUubWF0ZXJpYWwgPSB0aGlzLnBhZGRsZU1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gNTtcclxuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xyXG5cclxuICAgICAgICB0aGlzLmlzQUkgPSBpc0FJO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVQYWRkbGUoa2V5U3RhdGVzKSB7XHJcbiAgICAgICAgaWYgKGtleVN0YXRlc1t0aGlzLmtleXNbMF1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuTGVmdCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pIHtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzW3RoaXMua2V5c1swXV0gJiYgIWtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSB8fFxyXG4gICAgICAgICAgICAoa2V5U3RhdGVzW3RoaXMua2V5c1swXV0gJiYga2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pKVxyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVBhZGRsZUFJKGJhbGxDbGFzcykge1xyXG4gICAgICAgIGlmIChiYWxsQ2xhc3MuaXNMYXVuY2hlZCkge1xyXG4gICAgICAgICAgICBsZXQgZGVzaXJlZERpcmVjdGlvbiA9IE1hdGguc2lnbihiYWxsQ2xhc3MuYmFsbC5wb3NpdGlvbi54IC0gdGhpcy5wYWRkbGUucG9zaXRpb24ueCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzaXJlZERpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuTGVmdCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRlc2lyZWREaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuUmlnaHQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoa2V5U3RhdGVzLCBiYWxsQ2xhc3MpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNBSSlcclxuICAgICAgICAgICAgdGhpcy5tb3ZlUGFkZGxlKGtleVN0YXRlcyk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVQYWRkbGVBSShiYWxsQ2xhc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0UGFkZGxlKCkge1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb24uY2xvbmUoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYWRkbGUuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYWxsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ2FtZS1tYW5hZ2VyLmpzXCIgLz5cclxuXHJcbi8vIFRvRG86IFJlbW92ZSBgc2hvd0JvdW5kaW5nQm94YCBmcm9tIGFsbCBib2RpZXNcclxuXHJcbmNvbnN0IGNhbnZhc0hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMtaG9sZGVyJyk7XHJcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDI1O1xyXG5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gMzA7XHJcbmNhbnZhc0hvbGRlci5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG5jb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlLCAvLyBET1dOXHJcbiAgICA4NzogZmFsc2UsIC8vIFdcclxuICAgIDY1OiBmYWxzZSwgLy8gQVxyXG4gICAgODM6IGZhbHNlLCAvLyBTXHJcbiAgICA2ODogZmFsc2UgLy8gRFxyXG59O1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1tldmVudC5rZXlDb2RlXSA9IHRydWU7XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNbZXZlbnQua2V5Q29kZV0gPSBmYWxzZTtcclxufSk7XHJcblxyXG5jb25zdCBjcmVhdGVET01FbGVtZW50c1N0YXJ0ID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaG9tZU92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhvbWVPdmVybGF5LmNsYXNzTmFtZSA9ICdvdmVybGF5JztcclxuXHJcbiAgICBjb25zdCBob21lT3ZlcmxheUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhvbWVPdmVybGF5Q29udGVudC5jbGFzc05hbWUgPSAnb3ZlcmxheS1jb250ZW50JztcclxuICAgIGhvbWVPdmVybGF5LmFwcGVuZENoaWxkKGhvbWVPdmVybGF5Q29udGVudCk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaGVhZGVyQ29udGVudC5jbGFzc05hbWUgPSAnaGVhZGVyJztcclxuICAgIGhlYWRlckNvbnRlbnQuaW5uZXJUZXh0ID0gJ1BvbmcnO1xyXG5cclxuICAgIGNvbnN0IG1haW5Db250ZW50SG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBtYWluQ29udGVudEhvbGRlci5jbGFzc05hbWUgPSAnbWFpbi1jb250ZW50LWhvbGRlcic7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBzdGFydEJ1dHRvbi5jbGFzc05hbWUgPSAnc3RhcnQtYnV0dG9uJztcclxuICAgIHN0YXJ0QnV0dG9uLmlubmVyVGV4dCA9ICdTdGFydCBHYW1lJztcclxuICAgIHN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIC8vIFRvZG86IENoYW5nZSBHYW1lIFN0YXRlIEhlcmVcclxuICAgICAgICBob21lT3ZlcmxheS5zdHlsZS53aWR0aCA9ICcwJztcclxuICAgICAgICBnYW1lTWFuYWdlci5nYW1lU3RhcnRlZCA9IHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBoZWxwQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaGVscENvbnRlbnQuY2xhc3NOYW1lID0gJ2hlbHAtY29udGVudCc7XHJcbiAgICBoZWxwQ29udGVudC5pbm5lclRleHQgPSAnQSBwb25nIGdhbWUgbWFkZSB1c2luZyBCQUJZTE9OLkpTLiBVc2UgQVJST1cgS0VZUyB0byBjb250cm9sIGFuZCBTUEFDRSB0byBsYXVuY2ggdGhlIGJhbGwuJztcclxuXHJcbiAgICBtYWluQ29udGVudEhvbGRlci5hcHBlbmRDaGlsZChzdGFydEJ1dHRvbik7XHJcbiAgICBtYWluQ29udGVudEhvbGRlci5hcHBlbmRDaGlsZChoZWxwQ29udGVudCk7XHJcbiAgICBob21lT3ZlcmxheUNvbnRlbnQuYXBwZW5kQ2hpbGQoaGVhZGVyQ29udGVudCk7XHJcbiAgICBob21lT3ZlcmxheUNvbnRlbnQuYXBwZW5kQ2hpbGQobWFpbkNvbnRlbnRIb2xkZXIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChob21lT3ZlcmxheSk7XHJcbn07XHJcblxyXG5jb25zdCBjcmVhdGVET01FbGVtZW50c0VuZCA9ICgpID0+IHtcclxuXHJcbn07XHJcblxyXG5jb25zdCBjcmVhdGVTY2VuZSA9ICgpID0+IHtcclxuICAgIGNvbnN0IHNjZW5lID0gbmV3IEJBQllMT04uU2NlbmUoZW5naW5lKTtcclxuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCAtOS44MSwgMCksIG5ldyBCQUJZTE9OLkNhbm5vbkpTUGx1Z2luKCkpO1xyXG4gICAgc2NlbmUuY29sbGlzaW9uc0VuYWJsZWQgPSB0cnVlO1xyXG4gICAgc2NlbmUud29ya2VyQ29sbGlzaW9ucyA9IHRydWU7XHJcbiAgICBzY2VuZS5jbGVhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuXHJcbiAgICBjb25zdCBncm91bmRIaWdobGlnaHQgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcignZ3JvdW5kSGlnaGxpZ2h0Jywgc2NlbmUpO1xyXG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmJsdXJIb3Jpem9udGFsU2l6ZSA9IDAuMztcclxuICAgIGdyb3VuZEhpZ2hsaWdodC5ibHVyVmVydGljYWxTaXplID0gMC4zO1xyXG4gICAgZ3JvdW5kSGlnaGxpZ2h0LmlubmVyR2xvdyA9IDA7XHJcblxyXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IEJBQllMT04uRnJlZUNhbWVyYSgnbWFpbkNhbWVyYScsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMjAsIC02MCksIHNjZW5lKTtcclxuICAgIGNhbWVyYS5zZXRUYXJnZXQoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcblxyXG4gICAgY29uc3QgbGlnaHQgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KCdtYWluTGlnaHQnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDEsIDApLCBzY2VuZSk7XHJcblxyXG4gICAgY29uc3QgZ2VuZXJpY0JsYWNrTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdibGFja01hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgZ2VuZXJpY0JsYWNrTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuXHJcbiAgICBjb25zdCBncm91bmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnbWFpbkdyb3VuZCcsIHtcclxuICAgICAgICB3aWR0aDogMzIsXHJcbiAgICAgICAgaGVpZ2h0OiA3MCxcclxuICAgICAgICBzdWJkaXZpc2lvbnM6IDJcclxuICAgIH0sIHNjZW5lKTtcclxuICAgIGdyb3VuZC5wb3NpdGlvbiA9IEJBQllMT04uVmVjdG9yMy5aZXJvKCk7XHJcbiAgICBncm91bmQucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgIGdyb3VuZCxcclxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICBncm91bmQubWF0ZXJpYWwgPSBnZW5lcmljQmxhY2tNYXRlcmlhbDtcclxuICAgIGdyb3VuZEhpZ2hsaWdodC5hZGRNZXNoKGdyb3VuZCwgQkFCWUxPTi5Db2xvcjMuUmVkKCkpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgnbGVmdEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBsZWZ0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTUsIDEsIDApO1xyXG4gICAgbGVmdEJhci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgbGVmdEJhcixcclxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcclxuICAgICAgICB9KTtcclxuICAgIGxlZnRCYXIubWF0ZXJpYWwgPSBnZW5lcmljQmxhY2tNYXRlcmlhbDtcclxuXHJcbiAgICBjb25zdCByaWdodEJhciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KCdyaWdodEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICByaWdodEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMTUsIDEsIDApO1xyXG4gICAgcmlnaHRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgIHJpZ2h0QmFyLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgcmlnaHRCYXIubWF0ZXJpYWwgPSBnZW5lcmljQmxhY2tNYXRlcmlhbDtcclxuXHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbn07XHJcbmNvbnN0IHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcclxuLy8gY3JlYXRlRE9NRWxlbWVudHNTdGFydCgpO1xyXG4vLyBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTM0KVxyXG5cclxuY29uc3QgcGxheWVyXzEgPSBuZXcgUGFkZGxlKCdwbGF5ZXJfMScsIHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTM0KSwgMiwgZmFsc2UpO1xyXG5jb25zdCBhaVBsYXllciA9IG5ldyBQYWRkbGUoJ2FpUGxheWVyJywgc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAzNCksIDMsIHRydWUpO1xyXG5cclxuY29uc3QgcGxheWluZ0JhbGwgPSBuZXcgQmFsbChzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zMyksIDEpO1xyXG5wbGF5aW5nQmFsbC5zZXRDb2xsaXNpb25Db21wb25lbnRzKFtwbGF5ZXJfMS5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLCBhaVBsYXllci5wYWRkbGUucGh5c2ljc0ltcG9zdG9yXSk7XHJcblxyXG5jb25zdCBnYW1lTWFuYWdlciA9IG5ldyBHYW1lTWFuYWdlcihzY2VuZSwgcGxheWluZ0JhbGwsIHBsYXllcl8xLCBhaVBsYXllcik7XHJcbmdhbWVNYW5hZ2VyLnNldENvbGxpc2lvbkNvbXBvbmVudHMocGxheWluZ0JhbGwuYmFsbC5waHlzaWNzSW1wb3N0b3IpO1xyXG5jb25zdCB0ZXN0SGlnaGxpZ2h0ID0gbmV3IEJBQllMT04uSGlnaGxpZ2h0TGF5ZXIoJ3Rlc3RIaWdobGlnaHQnLCBzY2VuZSk7XHJcbnRlc3RIaWdobGlnaHQuYmx1ckhvcml6b250YWxTaXplID0gMC4zO1xyXG50ZXN0SGlnaGxpZ2h0LmJsdXJWZXJ0aWNhbFNpemUgPSAwLjM7XHJcbnRlc3RIaWdobGlnaHQuYWRkTWVzaChnYW1lTWFuYWdlci5iYWxsUmVzZXRDb2xsaWRlciwgQkFCWUxPTi5Db2xvcjMuUmVkKCkpO1xyXG50ZXN0SGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChwbGF5ZXJfMS5wYWRkbGUpO1xyXG50ZXN0SGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChhaVBsYXllci5wYWRkbGUpO1xyXG5jb25zdCBncm91bmRIaWdobGlnaHQgPSBzY2VuZS5nZXRIaWdobGlnaHRMYXllckJ5TmFtZSgnZ3JvdW5kSGlnaGxpZ2h0Jyk7XHJcbmdyb3VuZEhpZ2hsaWdodC5hZGRFeGNsdWRlZE1lc2gocGxheWVyXzEucGFkZGxlKTtcclxuZ3JvdW5kSGlnaGxpZ2h0LmFkZEV4Y2x1ZGVkTWVzaChhaVBsYXllci5wYWRkbGUpO1xyXG5cclxuZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgaWYgKCFnYW1lTWFuYWdlci5nYW1lU3RhcnRlZCkge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBrZXlTdGF0ZXMpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVzW2tleV0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcGxheWluZ0JhbGwudXBkYXRlKGtleVN0YXRlcywgcGxheWVyXzEucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpKTtcclxuICAgIHBsYXllcl8xLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXlpbmdCYWxsKTtcclxuICAgIGFpUGxheWVyLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXlpbmdCYWxsKTtcclxuXHJcbiAgICBnYW1lTWFuYWdlci51cGRhdGUoKTtcclxuICAgIHNjZW5lLnJlbmRlcigpO1xyXG59KTsiXX0=
