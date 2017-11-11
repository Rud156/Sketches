'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = function () {
    function GameManager(scene, ballClassObject, paddleOne, paddleTwo) {
        _classCallCheck(this, GameManager);

        this.highlightLayer_1 = new BABYLON.HighlightLayer('scoreBoardHighlight', scene);
        this.highlightLayer_2 = new BABYLON.HighlightLayer('resetPlaneHighlight', scene);

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
        this.highlightLayer_2.addMesh(this.ballResetCollider, BABYLON.Color3.Red());

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

    var camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(0, 20, -60), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    var light = new BABYLON.HemisphericLight('mainLight', new BABYLON.Vector3(0, 1, 0), scene);

    var genericBlackMaterial = new BABYLON.StandardMaterial('blackMaterial', scene);
    genericBlackMaterial.diffuseColor = BABYLON.Color3.Black();
    var highlightMaterial = new BABYLON.HighlightLayer('mainHighLighter', scene);

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
    highlightMaterial.addMesh(ground, BABYLON.Color3.Green());

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
    highlightMaterial.addMesh(ground, BABYLON.Color3.Green());

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
    highlightMaterial.addMesh(ground, BABYLON.Color3.Green());

    return scene;
};
var scene = createScene();


var player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
var aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

var playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

var gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwiaGlnaGxpZ2h0TGF5ZXJfMSIsIkJBQllMT04iLCJIaWdobGlnaHRMYXllciIsImhpZ2hsaWdodExheWVyXzIiLCJwbGF5ZXJPbmVTY29yZSIsInBsYXllclR3b1Njb3JlIiwibWF4U2NvcmVQb3NzaWJsZSIsImdhbWVTdGFydGVkIiwic2NvcmVCb2FyZCIsIk1lc2hCdWlsZGVyIiwiQ3JlYXRlUGxhbmUiLCJoZWlnaHQiLCJ3aWR0aCIsInNpZGVPcmllbnRhdGlvbiIsIk1lc2giLCJET1VCTEVTSURFIiwicG9zaXRpb24iLCJWZWN0b3IzIiwiYWRkTWVzaCIsIkNvbG9yMyIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwiQmxhY2siLCJtYXRlcmlhbCIsIlJlZCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJzY29yZUJvYXJkVGV4dHVyZUNvbnRleHQiLCJnZXRDb250ZXh0IiwiZGlmZnVzZVRleHR1cmUiLCJlbWlzc2l2ZUNvbG9yIiwic3BlY3VsYXJDb2xvciIsImRyYXdUZXh0IiwicGxheWluZ0JhbGwiLCJvblRyaWdnZXJFbnRlciIsImJpbmQiLCJiYWxsSW1wb3N0ZXIiLCJyZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUiLCJiYWxsUmVzZXRJbXBvc3RlciIsImNvbGxpZGVkQWdhaW5zdCIsInNldExpbmVhclZlbG9jaXR5IiwiWmVybyIsInNldEFuZ3VsYXJWZWxvY2l0eSIsImdldE9iamVjdENlbnRlciIsInoiLCJyZXNldEJhbGxTdGF0cyIsInJlc2V0UGFkZGxlIiwiY2xlYXJSZWN0IiwicmVzZXRHYW1lIiwiQmFsbCIsInNwYXduUG9zaXRpb24iLCJiYWxsSWQiLCJjb2xvciIsIm1pbkJhbGxTcGVlZCIsIm1heEJhbGxTcGVlZCIsImJhbGwiLCJDcmVhdGVTcGhlcmUiLCJzZWdtZW50cyIsImRpYW1ldGVyIiwiU3BoZXJlSW1wb3N0b3IiLCJ1bmlxdWVJZCIsImJhbGxNYXRlcmlhbCIsImluaXRpYWxQb3NpdGlvbiIsImNsb25lIiwiaXNMYXVuY2hlZCIsInBsYXllclBhZGRsZVZlbG9jaXR5Iiwia2V5U3RhdGVzIiwieCIsIk1hdGgiLCJyYW5kb20iLCJpbXBvc3RlcnNBcnJheSIsImJhbGxQaHlzaWNzSW1wb3N0ZXIiLCJ2ZWxvY2l0eVgiLCJnZXRMaW5lYXJWZWxvY2l0eSIsInZlbG9jaXR5WEJhbGwiLCJ2ZWxvY2l0eVoiLCJ2ZWxvY2l0eSIsInZlbG9jaXR5WkFicyIsImFicyIsImNsYW1wZWRWZWxvY2l0eVoiLCJNYXRoVG9vbHMiLCJDbGFtcCIsImRpcmVjdGlvbiIsInNpZ24iLCJ2ZWxvY2l0eVkiLCJ5IiwibGltaXRCYWxsVmVsb2NpdHkiLCJsb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZSIsImxhdW5jaEJhbGwiLCJQYWRkbGUiLCJuYW1lIiwicGFkZGxlSWQiLCJpc0FJIiwia2V5cyIsInBhZGRsZSIsIkNyZWF0ZUJveCIsImRlcHRoIiwicGFkZGxlSGlnaGxpZ2h0IiwiWWVsbG93IiwicGFkZGxlTWF0ZXJpYWwiLCJtb3ZlbWVudFNwZWVkIiwiTGVmdCIsInNjYWxlIiwiUmlnaHQiLCJiYWxsQ2xhc3MiLCJkZXNpcmVkRGlyZWN0aW9uIiwibW92ZVBhZGRsZSIsIm1vdmVQYWRkbGVBSSIsImNhbnZhc0hvbGRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjYW52YXMiLCJjcmVhdGVFbGVtZW50Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYXBwZW5kQ2hpbGQiLCJlbmdpbmUiLCJFbmdpbmUiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJrZXlDb2RlIiwiY3JlYXRlRE9NRWxlbWVudHNTdGFydCIsImhvbWVPdmVybGF5IiwiY2xhc3NOYW1lIiwiaG9tZU92ZXJsYXlDb250ZW50IiwiaGVhZGVyQ29udGVudCIsImlubmVyVGV4dCIsIm1haW5Db250ZW50SG9sZGVyIiwic3RhcnRCdXR0b24iLCJzdHlsZSIsImdhbWVNYW5hZ2VyIiwiaGVscENvbnRlbnQiLCJib2R5IiwiY3JlYXRlRE9NRWxlbWVudHNFbmQiLCJjcmVhdGVTY2VuZSIsIlNjZW5lIiwiZW5hYmxlUGh5c2ljcyIsIkNhbm5vbkpTUGx1Z2luIiwiY29sbGlzaW9uc0VuYWJsZWQiLCJ3b3JrZXJDb2xsaXNpb25zIiwiY2xlYXJDb2xvciIsImNhbWVyYSIsIkZyZWVDYW1lcmEiLCJzZXRUYXJnZXQiLCJsaWdodCIsIkhlbWlzcGhlcmljTGlnaHQiLCJnZW5lcmljQmxhY2tNYXRlcmlhbCIsImhpZ2hsaWdodE1hdGVyaWFsIiwiZ3JvdW5kIiwiR3JlZW4iLCJsZWZ0QmFyIiwicmlnaHRCYXIiLCJwbGF5ZXJfMSIsImFpUGxheWVyIiwic2V0Q29sbGlzaW9uQ29tcG9uZW50cyIsInJ1blJlbmRlckxvb3AiLCJrZXkiLCJ1cGRhdGUiLCJyZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVNQSxXO0FBQ0YseUJBQVlDLEtBQVosRUFBbUJDLGVBQW5CLEVBQW9DQyxTQUFwQyxFQUErQ0MsU0FBL0MsRUFBMEQ7QUFBQTs7QUFDdEQsYUFBS0MsZ0JBQUwsR0FBd0IsSUFBSUMsUUFBUUMsY0FBWixDQUEyQixxQkFBM0IsRUFBa0ROLEtBQWxELENBQXhCO0FBQ0EsYUFBS08sZ0JBQUwsR0FBd0IsSUFBSUYsUUFBUUMsY0FBWixDQUEyQixxQkFBM0IsRUFBa0ROLEtBQWxELENBQXhCOztBQUVBLGFBQUtRLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxhQUFLQyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsYUFBS0MsZ0JBQUwsR0FBd0IsQ0FBeEI7O0FBR0EsYUFBS0MsV0FBTCxHQUFtQixJQUFuQjs7QUFFQSxhQUFLQyxVQUFMLEdBQWtCUCxRQUFRUSxXQUFSLENBQW9CQyxXQUFwQixDQUFnQyxZQUFoQyxFQUE4QztBQUM1REMsb0JBQVEsRUFEb0Q7QUFFNURDLG1CQUFPLEVBRnFEO0FBRzVEQyw2QkFBaUJaLFFBQVFhLElBQVIsQ0FBYUM7QUFIOEIsU0FBOUMsRUFJZm5CLEtBSmUsQ0FBbEI7QUFLQSxhQUFLWSxVQUFMLENBQWdCUSxRQUFoQixHQUEyQixJQUFJZixRQUFRZ0IsT0FBWixDQUFvQixDQUFwQixFQUF1QixFQUF2QixFQUEyQixFQUEzQixDQUEzQjtBQUNBLGFBQUtqQixnQkFBTCxDQUFzQmtCLE9BQXRCLENBQThCLEtBQUtWLFVBQW5DLEVBQStDLElBQUlQLFFBQVFrQixNQUFaLENBQW1CLENBQW5CLEVBQXNCLElBQXRCLEVBQTRCLENBQTVCLENBQS9DOztBQUVBLGFBQUtDLGlCQUFMLEdBQXlCbkIsUUFBUVEsV0FBUixDQUFvQlksWUFBcEIsQ0FBaUMsY0FBakMsRUFBaUQ7QUFDdEVULG1CQUFPLEVBRCtEO0FBRXRFRCxvQkFBUSxHQUY4RDtBQUd0RVcsMEJBQWM7QUFId0QsU0FBakQsRUFJdEIxQixLQUpzQixDQUF6QjtBQUtBLGFBQUt3QixpQkFBTCxDQUF1QkosUUFBdkIsR0FBa0MsSUFBSWYsUUFBUWdCLE9BQVosQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBQyxDQUF4QixFQUEyQixDQUEzQixDQUFsQztBQUNBLGFBQUtHLGlCQUFMLENBQXVCRyxlQUF2QixHQUF5QyxJQUFJdEIsUUFBUXVCLGVBQVosQ0FDckMsS0FBS0osaUJBRGdDLEVBRXJDbkIsUUFBUXVCLGVBQVIsQ0FBd0JDLFdBRmEsRUFFQTtBQUNqQ0Msa0JBQU0sQ0FEMkI7QUFFakNDLHNCQUFVLENBRnVCO0FBR2pDQyx5QkFBYTtBQUhvQixTQUZBLENBQXpDOztBQVNBLGFBQUtDLHlCQUFMLEdBQWlDLElBQUk1QixRQUFRNkIsZ0JBQVosQ0FBNkIsZUFBN0IsRUFBOENsQyxLQUE5QyxDQUFqQztBQUNBLGFBQUtpQyx5QkFBTCxDQUErQkUsWUFBL0IsR0FBOEM5QixRQUFRa0IsTUFBUixDQUFlYSxLQUFmLEVBQTlDO0FBQ0EsYUFBS1osaUJBQUwsQ0FBdUJhLFFBQXZCLEdBQWtDLEtBQUtKLHlCQUF2QztBQUNBLGFBQUsxQixnQkFBTCxDQUFzQmUsT0FBdEIsQ0FBOEIsS0FBS0UsaUJBQW5DLEVBQXNEbkIsUUFBUWtCLE1BQVIsQ0FBZWUsR0FBZixFQUF0RDs7QUFFQSxhQUFLQyxrQkFBTCxHQUEwQixJQUFJbEMsUUFBUTZCLGdCQUFaLENBQTZCLG9CQUE3QixFQUFtRGxDLEtBQW5ELENBQTFCOztBQUVBLGFBQUt3QyxpQkFBTCxHQUF5QixJQUFJbkMsUUFBUW9DLGNBQVosQ0FBMkIsMkJBQTNCLEVBQXdELElBQXhELEVBQThEekMsS0FBOUQsRUFBcUUsSUFBckUsQ0FBekI7QUFDQSxhQUFLMEMsd0JBQUwsR0FBZ0MsS0FBS0YsaUJBQUwsQ0FBdUJHLFVBQXZCLEVBQWhDO0FBQ0EsYUFBS0osa0JBQUwsQ0FBd0JLLGNBQXhCLEdBQXlDLEtBQUtKLGlCQUE5QztBQUNBLGFBQUtELGtCQUFMLENBQXdCTSxhQUF4QixHQUF3Q3hDLFFBQVFrQixNQUFSLENBQWVhLEtBQWYsRUFBeEM7QUFDQSxhQUFLRyxrQkFBTCxDQUF3Qk8sYUFBeEIsR0FBd0N6QyxRQUFRa0IsTUFBUixDQUFlZSxHQUFmLEVBQXhDO0FBQ0EsYUFBSzFCLFVBQUwsQ0FBZ0J5QixRQUFoQixHQUEyQixLQUFLRSxrQkFBaEM7O0FBRUEsYUFBS0MsaUJBQUwsQ0FBdUJPLFFBQXZCLENBQWdDLFFBQWhDLEVBQTBDLEdBQTFDLEVBQStDLEdBQS9DLHVEQUF1RyxTQUF2RztBQUNBLGFBQUtQLGlCQUFMLENBQXVCTyxRQUF2QixDQUFnQyxVQUFoQyxFQUE0QyxFQUE1QyxFQUFnRCxHQUFoRCxvQ0FBcUYsU0FBckY7QUFDQSxhQUFLUCxpQkFBTCxDQUF1Qk8sUUFBdkIsQ0FBZ0MsVUFBaEMsRUFBNEMsR0FBNUMsRUFBaUQsR0FBakQsb0NBQXNGLFNBQXRGO0FBQ0EsYUFBS1AsaUJBQUwsQ0FBdUJPLFFBQXZCLE1BQW1DLEtBQUt2QyxjQUF4QyxFQUEwRCxHQUExRCxFQUErRCxHQUEvRCw2Q0FBNkcsU0FBN0c7QUFDQSxhQUFLZ0MsaUJBQUwsQ0FBdUJPLFFBQXZCLE1BQW1DLEtBQUt0QyxjQUF4QyxFQUEwRCxHQUExRCxFQUErRCxHQUEvRCw0Q0FBNEcsU0FBNUc7O0FBR0EsYUFBS3VDLFdBQUwsR0FBbUIvQyxlQUFuQjtBQUNBLGFBQUtDLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsYUFBS0MsU0FBTCxHQUFpQkEsU0FBakI7O0FBRUEsYUFBSzhDLGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQkMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBdEI7QUFDSDs7OzsrQ0FFc0JDLFksRUFBYztBQUNqQyxpQkFBSzNCLGlCQUFMLENBQXVCRyxlQUF2QixDQUF1Q3lCLHdCQUF2QyxDQUFnRUQsWUFBaEUsRUFBOEUsS0FBS0YsY0FBbkY7QUFDSDs7O3VDQUVjSSxpQixFQUFtQkMsZSxFQUFpQjtBQUMvQ0QsOEJBQWtCRSxpQkFBbEIsQ0FBb0NsRCxRQUFRZ0IsT0FBUixDQUFnQm1DLElBQWhCLEVBQXBDO0FBQ0FILDhCQUFrQkksa0JBQWxCLENBQXFDcEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUFyQzs7QUFFQSxnQkFBSUYsZ0JBQWdCSSxlQUFoQixHQUFrQ0MsQ0FBbEMsR0FBc0MsQ0FBQyxFQUEzQyxFQUNJLEtBQUtsRCxjQUFMLEdBREosS0FFSyxJQUFJNkMsZ0JBQWdCSSxlQUFoQixHQUFrQ0MsQ0FBbEMsR0FBc0MsRUFBMUMsRUFDRCxLQUFLbkQsY0FBTDs7QUFFSixpQkFBS3dDLFdBQUwsQ0FBaUJZLGNBQWpCO0FBQ0EsaUJBQUsxRCxTQUFMLENBQWUyRCxXQUFmO0FBQ0EsaUJBQUsxRCxTQUFMLENBQWUwRCxXQUFmOztBQUVBLGlCQUFLbkIsd0JBQUwsQ0FBOEJvQixTQUE5QixDQUF3QyxDQUF4QyxFQUEyQyxHQUEzQyxFQUFnRCxJQUFoRCxFQUFzRCxJQUF0RDtBQUNBLGlCQUFLdEIsaUJBQUwsQ0FBdUJPLFFBQXZCLE1BQW1DLEtBQUt2QyxjQUF4QyxFQUEwRCxHQUExRCxFQUErRCxHQUEvRCw0Q0FBNEcsU0FBNUc7QUFDQSxpQkFBS2dDLGlCQUFMLENBQXVCTyxRQUF2QixNQUFtQyxLQUFLdEMsY0FBeEMsRUFBMEQsR0FBMUQsRUFBK0QsR0FBL0QsNENBQTRHLFNBQTVHOztBQUVBLGdCQUFJLEtBQUtELGNBQUwsR0FBc0IsS0FBS0UsZ0JBQTNCLElBQStDLEtBQUtELGNBQUwsR0FBc0IsS0FBS0MsZ0JBQTlFLEVBQWdHO0FBQzVGLHFCQUFLcUQsU0FBTDtBQUNIO0FBQ0o7OztvQ0FFVztBQUNSLGlCQUFLdkQsY0FBTCxHQUFzQixDQUF0QjtBQUNBLGlCQUFLQyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsaUJBQUt1QyxXQUFMLENBQWlCWSxjQUFqQjtBQUNBLGlCQUFLMUQsU0FBTCxDQUFlMkQsV0FBZjtBQUNBLGlCQUFLMUQsU0FBTCxDQUFlMEQsV0FBZjs7QUFFQSxpQkFBS2xELFdBQUwsR0FBbUIsS0FBbkI7QUFDSDs7O2lDQUVRO0FBQ0wsaUJBQUthLGlCQUFMLENBQXVCRyxlQUF2QixDQUF1QzRCLGlCQUF2QyxDQUF5RGxELFFBQVFnQixPQUFSLENBQWdCbUMsSUFBaEIsRUFBekQ7QUFDQSxpQkFBS2hDLGlCQUFMLENBQXVCRyxlQUF2QixDQUF1QzhCLGtCQUF2QyxDQUEwRHBELFFBQVFnQixPQUFSLENBQWdCbUMsSUFBaEIsRUFBMUQ7QUFDSDs7Ozs7O0lBSUNRLEk7QUFDRixrQkFBWWhFLEtBQVosRUFBbUJpRSxhQUFuQixFQUFrQ0MsTUFBbEMsRUFBcUQ7QUFBQSxZQUFYQyxLQUFXLHVFQUFILENBQUc7O0FBQUE7O0FBQ2pELGFBQUtDLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxhQUFLQyxZQUFMLEdBQW9CLEdBQXBCOztBQUVBLGFBQUtDLElBQUwsR0FBWWpFLFFBQVFRLFdBQVIsQ0FBb0IwRCxZQUFwQixDQUFpQyxVQUFqQyxFQUE2QztBQUNyREMsc0JBQVUsRUFEMkM7QUFFckRDLHNCQUFVO0FBRjJDLFNBQTdDLEVBR1R6RSxLQUhTLENBQVo7QUFJQSxhQUFLc0UsSUFBTCxDQUFVM0MsZUFBVixHQUE0QixJQUFJdEIsUUFBUXVCLGVBQVosQ0FDeEIsS0FBSzBDLElBRG1CLEVBRXhCakUsUUFBUXVCLGVBQVIsQ0FBd0I4QyxjQUZBLEVBRWdCO0FBQ3BDNUMsa0JBQU0sQ0FEOEI7QUFFcENDLHNCQUFVLENBRjBCO0FBR3BDQyx5QkFBYTtBQUh1QixTQUZoQixFQU94QmhDLEtBUHdCLENBQTVCO0FBU0EsYUFBS3NFLElBQUwsQ0FBVWxELFFBQVYsR0FBcUI2QyxhQUFyQjtBQUNBLGFBQUtLLElBQUwsQ0FBVTNDLGVBQVYsQ0FBMEJnRCxRQUExQixHQUFxQ1QsTUFBckM7O0FBRUEsYUFBS1UsWUFBTCxHQUFvQixJQUFJdkUsUUFBUTZCLGdCQUFaLENBQTZCLHFCQUE3QixFQUFvRGxDLEtBQXBELENBQXBCO0FBQ0EsYUFBSzRFLFlBQUwsQ0FBa0J6QyxZQUFsQixHQUFpQzlCLFFBQVFrQixNQUFSLENBQWVlLEdBQWYsRUFBakM7QUFDQSxhQUFLZ0MsSUFBTCxDQUFVakMsUUFBVixHQUFxQixLQUFLdUMsWUFBMUI7O0FBRUEsYUFBS0MsZUFBTCxHQUF1QlosY0FBY2EsS0FBZCxFQUF2QjtBQUNBLGFBQUtDLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxhQUFLWixLQUFMLEdBQWFBLEtBQWI7O0FBRUEsYUFBS2xCLGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQkMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBdEI7QUFDSDs7OzttREFFMEI4QixvQixFQUFzQjtBQUM3QyxpQkFBS1YsSUFBTCxDQUFVM0MsZUFBVixDQUEwQjRCLGlCQUExQixDQUE0Q3lCLG9CQUE1QztBQUNIOzs7bUNBRVVDLFMsRUFBV0Qsb0IsRUFBc0I7QUFDeEMsZ0JBQUlDLFVBQVUsRUFBVixDQUFKLEVBQW1CO0FBQ2YscUJBQUtGLFVBQUwsR0FBa0IsSUFBbEI7O0FBRUEscUJBQUtULElBQUwsQ0FBVTNDLGVBQVYsQ0FBMEI0QixpQkFBMUIsQ0FDSSxJQUFJbEQsUUFBUWdCLE9BQVosQ0FDSTJELHFCQUFxQkUsQ0FEekIsRUFFSSxDQUZKLEVBR0lDLEtBQUtDLE1BQUwsS0FBZ0IsRUFIcEIsQ0FESjtBQU9IO0FBQ0o7OzsrQ0FFc0JDLGMsRUFBZ0I7QUFDbkMsaUJBQUtmLElBQUwsQ0FBVTNDLGVBQVYsQ0FBMEJ5Qix3QkFBMUIsQ0FBbURpQyxjQUFuRCxFQUFtRSxLQUFLcEMsY0FBeEU7QUFDSDs7O3VDQUVjcUMsbUIsRUFBcUJoQyxlLEVBQWlCO0FBQ2pELGdCQUFJaUMsWUFBWWpDLGdCQUFnQmtDLGlCQUFoQixHQUFvQ04sQ0FBcEQ7QUFDQSxnQkFBSU8sZ0JBQWdCSCxvQkFBb0JFLGlCQUFwQixHQUF3Q04sQ0FBNUQ7QUFDQSxnQkFBSVEsWUFBWSxDQUFDSixvQkFBb0JFLGlCQUFwQixHQUF3QzdCLENBQXpEOztBQUVBMkIsZ0NBQW9CL0IsaUJBQXBCLENBQ0ksSUFBSWxELFFBQVFnQixPQUFaLENBQ0lrRSxZQUFZRSxhQURoQixFQUVJLENBRkosRUFHSUMsU0FISixDQURKOztBQU9BcEMsNEJBQWdCRyxrQkFBaEIsQ0FBbUNwRCxRQUFRZ0IsT0FBUixDQUFnQm1DLElBQWhCLEVBQW5DO0FBQ0g7Ozs0Q0FFbUI7QUFDaEIsZ0JBQUltQyxXQUFXLEtBQUtyQixJQUFMLENBQVUzQyxlQUFWLENBQTBCNkQsaUJBQTFCLEVBQWY7O0FBRUEsZ0JBQUlFLFlBQVlDLFNBQVNoQyxDQUF6QjtBQUNBLGdCQUFJaUMsZUFBZVQsS0FBS1UsR0FBTCxDQUFTSCxTQUFULENBQW5CO0FBQ0EsZ0JBQUlJLG1CQUFtQnpGLFFBQVEwRixTQUFSLENBQWtCQyxLQUFsQixDQUF3QkosWUFBeEIsRUFBc0MsS0FBS3hCLFlBQTNDLEVBQXlELEtBQUtDLFlBQTlELENBQXZCO0FBQ0EsZ0JBQUk0QixZQUFZZCxLQUFLZSxJQUFMLENBQVVSLFNBQVYsQ0FBaEI7O0FBRUEsZ0JBQUlILFlBQVlJLFNBQVNULENBQXpCO0FBQ0EsZ0JBQUlpQixZQUFZUixTQUFTUyxDQUF6Qjs7QUFFQSxpQkFBSzlCLElBQUwsQ0FBVTNDLGVBQVYsQ0FBMEI0QixpQkFBMUIsQ0FDSSxJQUFJbEQsUUFBUWdCLE9BQVosQ0FDSWtFLFNBREosRUFFSVksU0FGSixFQUdJTCxtQkFBbUJHLFNBSHZCLENBREo7QUFPSDs7OytCQUVNaEIsUyxFQUFXRCxvQixFQUFzQjtBQUNwQyxnQkFBSSxLQUFLRCxVQUFULEVBQXFCO0FBQ2pCLHFCQUFLc0IsaUJBQUw7QUFDSCxhQUZELE1BRU87QUFDSCxxQkFBS0MsMEJBQUwsQ0FBZ0N0QixvQkFBaEM7QUFDQSxxQkFBS3VCLFVBQUwsQ0FBZ0J0QixTQUFoQixFQUEyQkQsb0JBQTNCO0FBQ0g7QUFDSjs7O3lDQUVnQjtBQUNiLGlCQUFLVixJQUFMLENBQVUzQyxlQUFWLENBQTBCNEIsaUJBQTFCLENBQTRDbEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUE1QztBQUNBLGlCQUFLYyxJQUFMLENBQVUzQyxlQUFWLENBQTBCOEIsa0JBQTFCLENBQTZDcEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUE3QztBQUNBLGlCQUFLYyxJQUFMLENBQVVsRCxRQUFWLEdBQXFCLEtBQUt5RCxlQUFMLENBQXFCQyxLQUFyQixFQUFyQjs7QUFFQSxpQkFBS0MsVUFBTCxHQUFrQixLQUFsQjtBQUNIOzs7Ozs7SUFJQ3lCLE07QUFDRixvQkFBWUMsSUFBWixFQUFrQnpHLEtBQWxCLEVBQXlCaUUsYUFBekIsRUFBd0N5QyxRQUF4QyxFQUFrREMsSUFBbEQsRUFBb0Y7QUFBQSxZQUE1QkMsSUFBNEIsdUVBQXJCLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBcUI7QUFBQSxZQUFYekMsS0FBVyx1RUFBSCxDQUFHOztBQUFBOztBQUNoRixhQUFLMEMsTUFBTCxHQUFjeEcsUUFBUVEsV0FBUixDQUFvQmlHLFNBQXBCLGFBQXdDTCxJQUF4QyxFQUFnRDtBQUMxRHpGLG1CQUFPLENBRG1EO0FBRTFERCxvQkFBUSxDQUZrRDtBQUcxRGdHLG1CQUFPO0FBSG1ELFNBQWhELEVBSVgvRyxLQUpXLENBQWQ7QUFLQSxhQUFLNkcsTUFBTCxDQUFZekYsUUFBWixHQUF1QjZDLGFBQXZCO0FBQ0EsYUFBSzRDLE1BQUwsQ0FBWWxGLGVBQVosR0FBOEIsSUFBSXRCLFFBQVF1QixlQUFaLENBQzFCLEtBQUtpRixNQURxQixFQUUxQnhHLFFBQVF1QixlQUFSLENBQXdCQyxXQUZFLEVBRVc7QUFDakNDLGtCQUFNLENBRDJCO0FBRWpDQyxzQkFBVSxDQUZ1QjtBQUdqQ0MseUJBQWE7QUFIb0IsU0FGWCxFQU8xQmhDLEtBUDBCLENBQTlCO0FBU0EsYUFBSzZHLE1BQUwsQ0FBWWxGLGVBQVosQ0FBNEI0QixpQkFBNUIsQ0FBOENsRCxRQUFRZ0IsT0FBUixDQUFnQm1DLElBQWhCLEVBQTlDO0FBQ0EsYUFBS3FELE1BQUwsQ0FBWWxGLGVBQVosQ0FBNEJnRCxRQUE1QixHQUF1QytCLFFBQXZDOztBQUVBLGFBQUtNLGVBQUwsR0FBdUIsSUFBSTNHLFFBQVFDLGNBQVosYUFBcUNtRyxJQUFyQyxpQkFBdUR6RyxLQUF2RCxDQUF2QjtBQUNBLGFBQUtnSCxlQUFMLENBQXFCMUYsT0FBckIsQ0FBNkIsS0FBS3VGLE1BQWxDLEVBQTBDeEcsUUFBUWtCLE1BQVIsQ0FBZTBGLE1BQWYsRUFBMUM7QUFDQSxhQUFLQyxjQUFMLEdBQXNCLElBQUk3RyxRQUFRNkIsZ0JBQVosYUFBdUN1RSxJQUF2QyxnQkFBd0R6RyxLQUF4RCxDQUF0QjtBQUNBLGFBQUtrSCxjQUFMLENBQW9CL0UsWUFBcEIsR0FBbUM5QixRQUFRa0IsTUFBUixDQUFlYSxLQUFmLEVBQW5DO0FBQ0EsYUFBS3lFLE1BQUwsQ0FBWXhFLFFBQVosR0FBdUIsS0FBSzZFLGNBQTVCOztBQUVBLGFBQUtyQyxlQUFMLEdBQXVCWixjQUFjYSxLQUFkLEVBQXZCO0FBQ0EsYUFBS1gsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsYUFBS2dELGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxhQUFLUCxJQUFMLEdBQVlBLElBQVo7O0FBRUEsYUFBS0QsSUFBTCxHQUFZQSxJQUFaO0FBQ0g7Ozs7bUNBRVUxQixTLEVBQVc7QUFDbEIsZ0JBQUlBLFVBQVUsS0FBSzJCLElBQUwsQ0FBVSxDQUFWLENBQVYsQ0FBSixFQUE2QjtBQUN6QixxQkFBS0MsTUFBTCxDQUFZbEYsZUFBWixDQUE0QjRCLGlCQUE1QixDQUE4Q2xELFFBQVFnQixPQUFSLENBQWdCK0YsSUFBaEIsR0FBdUJDLEtBQXZCLENBQTZCLEtBQUtGLGFBQWxDLENBQTlDO0FBQ0gsYUFGRCxNQUVPLElBQUlsQyxVQUFVLEtBQUsyQixJQUFMLENBQVUsQ0FBVixDQUFWLENBQUosRUFBNkI7QUFDaEMscUJBQUtDLE1BQUwsQ0FBWWxGLGVBQVosQ0FBNEI0QixpQkFBNUIsQ0FBOENsRCxRQUFRZ0IsT0FBUixDQUFnQmlHLEtBQWhCLEdBQXdCRCxLQUF4QixDQUE4QixLQUFLRixhQUFuQyxDQUE5QztBQUNIOztBQUVELGdCQUFLLENBQUNsQyxVQUFVLEtBQUsyQixJQUFMLENBQVUsQ0FBVixDQUFWLENBQUQsSUFBNEIsQ0FBQzNCLFVBQVUsS0FBSzJCLElBQUwsQ0FBVSxDQUFWLENBQVYsQ0FBOUIsSUFDQzNCLFVBQVUsS0FBSzJCLElBQUwsQ0FBVSxDQUFWLENBQVYsS0FBMkIzQixVQUFVLEtBQUsyQixJQUFMLENBQVUsQ0FBVixDQUFWLENBRGhDLEVBRUksS0FBS0MsTUFBTCxDQUFZbEYsZUFBWixDQUE0QjRCLGlCQUE1QixDQUE4Q2xELFFBQVFnQixPQUFSLENBQWdCbUMsSUFBaEIsRUFBOUM7QUFDUDs7O3FDQUVZK0QsUyxFQUFXO0FBQ3BCLGdCQUFJQSxVQUFVeEMsVUFBZCxFQUEwQjtBQUN0QixvQkFBSXlDLG1CQUFtQnJDLEtBQUtlLElBQUwsQ0FBVXFCLFVBQVVqRCxJQUFWLENBQWVsRCxRQUFmLENBQXdCOEQsQ0FBeEIsR0FBNEIsS0FBSzJCLE1BQUwsQ0FBWXpGLFFBQVosQ0FBcUI4RCxDQUEzRCxDQUF2Qjs7QUFFQSxvQkFBSXNDLHFCQUFxQixDQUFDLENBQTFCLEVBQTZCO0FBQ3pCLHlCQUFLWCxNQUFMLENBQVlsRixlQUFaLENBQTRCNEIsaUJBQTVCLENBQThDbEQsUUFBUWdCLE9BQVIsQ0FBZ0IrRixJQUFoQixHQUF1QkMsS0FBdkIsQ0FBNkIsS0FBS0YsYUFBbEMsQ0FBOUM7QUFDSCxpQkFGRCxNQUVPLElBQUlLLHFCQUFxQixDQUF6QixFQUE0QjtBQUMvQix5QkFBS1gsTUFBTCxDQUFZbEYsZUFBWixDQUE0QjRCLGlCQUE1QixDQUE4Q2xELFFBQVFnQixPQUFSLENBQWdCaUcsS0FBaEIsR0FBd0JELEtBQXhCLENBQThCLEtBQUtGLGFBQW5DLENBQTlDO0FBQ0gsaUJBRk0sTUFFQTtBQUNILHlCQUFLTixNQUFMLENBQVlsRixlQUFaLENBQTRCNEIsaUJBQTVCLENBQThDbEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUE5QztBQUNIO0FBQ0o7QUFDSjs7OytCQUVNeUIsUyxFQUFXc0MsUyxFQUFXO0FBQ3pCLGdCQUFJLENBQUMsS0FBS1osSUFBVixFQUNJLEtBQUtjLFVBQUwsQ0FBZ0J4QyxTQUFoQixFQURKLEtBR0ksS0FBS3lDLFlBQUwsQ0FBa0JILFNBQWxCOztBQUVKLGlCQUFLVixNQUFMLENBQVlsRixlQUFaLENBQTRCOEIsa0JBQTVCLENBQStDcEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUEvQztBQUNIOzs7c0NBRWE7QUFDVixpQkFBS3FELE1BQUwsQ0FBWWxGLGVBQVosQ0FBNEI0QixpQkFBNUIsQ0FBOENsRCxRQUFRZ0IsT0FBUixDQUFnQm1DLElBQWhCLEVBQTlDO0FBQ0EsaUJBQUtxRCxNQUFMLENBQVlsRixlQUFaLENBQTRCOEIsa0JBQTVCLENBQStDcEQsUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUEvQztBQUNBLGlCQUFLcUQsTUFBTCxDQUFZekYsUUFBWixHQUF1QixLQUFLeUQsZUFBTCxDQUFxQkMsS0FBckIsRUFBdkI7QUFDSDs7Ozs7O0FBU0wsSUFBTTZDLGVBQWVDLFNBQVNDLGNBQVQsQ0FBd0IsZUFBeEIsQ0FBckI7QUFDQSxJQUFNQyxTQUFTRixTQUFTRyxhQUFULENBQXVCLFFBQXZCLENBQWY7QUFDQUQsT0FBTzlHLEtBQVAsR0FBZWdILE9BQU9DLFVBQVAsR0FBb0IsRUFBbkM7QUFDQUgsT0FBTy9HLE1BQVAsR0FBZ0JpSCxPQUFPRSxXQUFQLEdBQXFCLEVBQXJDO0FBQ0FQLGFBQWFRLFdBQWIsQ0FBeUJMLE1BQXpCO0FBQ0EsSUFBTU0sU0FBUyxJQUFJL0gsUUFBUWdJLE1BQVosQ0FBbUJQLE1BQW5CLEVBQTJCLElBQTNCLENBQWY7O0FBRUEsSUFBTTdDLFlBQVk7QUFDZCxRQUFJLEtBRFU7QUFFZCxRQUFJLEtBRlU7QUFHZCxRQUFJLEtBSFU7QUFJZCxRQUFJLEtBSlU7QUFLZCxRQUFJLEtBTFU7QUFNZCxRQUFJLEtBTlU7QUFPZCxRQUFJLEtBUFU7QUFRZCxRQUFJLEtBUlU7QUFTZCxRQUFJLEtBVFUsRUFBbEI7QUFXQStDLE9BQU9NLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFVBQUNDLEtBQUQsRUFBVztBQUMxQyxRQUFJQSxNQUFNQyxPQUFOLElBQWlCdkQsU0FBckIsRUFDSUEsVUFBVXNELE1BQU1DLE9BQWhCLElBQTJCLElBQTNCO0FBQ1AsQ0FIRDtBQUlBUixPQUFPTSxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxVQUFDQyxLQUFELEVBQVc7QUFDeEMsUUFBSUEsTUFBTUMsT0FBTixJQUFpQnZELFNBQXJCLEVBQ0lBLFVBQVVzRCxNQUFNQyxPQUFoQixJQUEyQixLQUEzQjtBQUNQLENBSEQ7O0FBS0EsSUFBTUMseUJBQXlCLFNBQXpCQSxzQkFBeUIsR0FBTTtBQUNqQyxRQUFNQyxjQUFjZCxTQUFTRyxhQUFULENBQXVCLEtBQXZCLENBQXBCO0FBQ0FXLGdCQUFZQyxTQUFaLEdBQXdCLFNBQXhCOztBQUVBLFFBQU1DLHFCQUFxQmhCLFNBQVNHLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBM0I7QUFDQWEsdUJBQW1CRCxTQUFuQixHQUErQixpQkFBL0I7QUFDQUQsZ0JBQVlQLFdBQVosQ0FBd0JTLGtCQUF4Qjs7QUFFQSxRQUFNQyxnQkFBZ0JqQixTQUFTRyxhQUFULENBQXVCLEtBQXZCLENBQXRCO0FBQ0FjLGtCQUFjRixTQUFkLEdBQTBCLFFBQTFCO0FBQ0FFLGtCQUFjQyxTQUFkLEdBQTBCLE1BQTFCOztBQUVBLFFBQU1DLG9CQUFvQm5CLFNBQVNHLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBMUI7QUFDQWdCLHNCQUFrQkosU0FBbEIsR0FBOEIscUJBQTlCOztBQUVBLFFBQU1LLGNBQWNwQixTQUFTRyxhQUFULENBQXVCLE1BQXZCLENBQXBCO0FBQ0FpQixnQkFBWUwsU0FBWixHQUF3QixjQUF4QjtBQUNBSyxnQkFBWUYsU0FBWixHQUF3QixZQUF4QjtBQUNBRSxnQkFBWVYsZ0JBQVosQ0FBNkIsT0FBN0IsRUFBc0MsWUFBTTtBQUV4Q0ksb0JBQVlPLEtBQVosQ0FBa0JqSSxLQUFsQixHQUEwQixHQUExQjtBQUNBa0ksb0JBQVl2SSxXQUFaLEdBQTBCLElBQTFCO0FBQ0gsS0FKRDs7QUFNQSxRQUFNd0ksY0FBY3ZCLFNBQVNHLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBcEI7QUFDQW9CLGdCQUFZUixTQUFaLEdBQXdCLGNBQXhCO0FBQ0FRLGdCQUFZTCxTQUFaLEdBQXdCLDRGQUF4Qjs7QUFFQUMsc0JBQWtCWixXQUFsQixDQUE4QmEsV0FBOUI7QUFDQUQsc0JBQWtCWixXQUFsQixDQUE4QmdCLFdBQTlCO0FBQ0FQLHVCQUFtQlQsV0FBbkIsQ0FBK0JVLGFBQS9CO0FBQ0FELHVCQUFtQlQsV0FBbkIsQ0FBK0JZLGlCQUEvQjtBQUNBbkIsYUFBU3dCLElBQVQsQ0FBY2pCLFdBQWQsQ0FBMEJPLFdBQTFCO0FBQ0gsQ0FqQ0Q7O0FBbUNBLElBQU1XLHVCQUF1QixTQUF2QkEsb0JBQXVCLEdBQU0sQ0FFbEMsQ0FGRDs7QUFJQSxJQUFNQyxjQUFjLFNBQWRBLFdBQWMsR0FBTTtBQUN0QixRQUFNdEosUUFBUSxJQUFJSyxRQUFRa0osS0FBWixDQUFrQm5CLE1BQWxCLENBQWQ7QUFDQXBJLFVBQU13SixhQUFOLENBQW9CLElBQUluSixRQUFRZ0IsT0FBWixDQUFvQixDQUFwQixFQUF1QixDQUFDLElBQXhCLEVBQThCLENBQTlCLENBQXBCLEVBQXNELElBQUloQixRQUFRb0osY0FBWixFQUF0RDtBQUNBekosVUFBTTBKLGlCQUFOLEdBQTBCLElBQTFCO0FBQ0ExSixVQUFNMkosZ0JBQU4sR0FBeUIsSUFBekI7QUFDQTNKLFVBQU00SixVQUFOLEdBQW1CdkosUUFBUWtCLE1BQVIsQ0FBZWEsS0FBZixFQUFuQjs7QUFFQSxRQUFNeUgsU0FBUyxJQUFJeEosUUFBUXlKLFVBQVosQ0FBdUIsWUFBdkIsRUFBcUMsSUFBSXpKLFFBQVFnQixPQUFaLENBQW9CLENBQXBCLEVBQXVCLEVBQXZCLEVBQTJCLENBQUMsRUFBNUIsQ0FBckMsRUFBc0VyQixLQUF0RSxDQUFmO0FBQ0E2SixXQUFPRSxTQUFQLENBQWlCMUosUUFBUWdCLE9BQVIsQ0FBZ0JtQyxJQUFoQixFQUFqQjs7QUFFQSxRQUFNd0csUUFBUSxJQUFJM0osUUFBUTRKLGdCQUFaLENBQTZCLFdBQTdCLEVBQTBDLElBQUk1SixRQUFRZ0IsT0FBWixDQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQixDQUExQixDQUExQyxFQUF3RXJCLEtBQXhFLENBQWQ7O0FBRUEsUUFBTWtLLHVCQUF1QixJQUFJN0osUUFBUTZCLGdCQUFaLENBQTZCLGVBQTdCLEVBQThDbEMsS0FBOUMsQ0FBN0I7QUFDQWtLLHlCQUFxQi9ILFlBQXJCLEdBQW9DOUIsUUFBUWtCLE1BQVIsQ0FBZWEsS0FBZixFQUFwQztBQUNBLFFBQU0rSCxvQkFBb0IsSUFBSTlKLFFBQVFDLGNBQVosQ0FBMkIsaUJBQTNCLEVBQThDTixLQUE5QyxDQUExQjs7QUFFQSxRQUFNb0ssU0FBUy9KLFFBQVFRLFdBQVIsQ0FBb0JZLFlBQXBCLENBQWlDLFlBQWpDLEVBQStDO0FBQzFEVCxlQUFPLEVBRG1EO0FBRTFERCxnQkFBUSxFQUZrRDtBQUcxRFcsc0JBQWM7QUFINEMsS0FBL0MsRUFJWjFCLEtBSlksQ0FBZjtBQUtBb0ssV0FBT2hKLFFBQVAsR0FBa0JmLFFBQVFnQixPQUFSLENBQWdCbUMsSUFBaEIsRUFBbEI7QUFDQTRHLFdBQU96SSxlQUFQLEdBQXlCLElBQUl0QixRQUFRdUIsZUFBWixDQUNyQndJLE1BRHFCLEVBRXJCL0osUUFBUXVCLGVBQVIsQ0FBd0JDLFdBRkgsRUFFZ0I7QUFDakNDLGNBQU0sQ0FEMkI7QUFFakNDLGtCQUFVLENBRnVCO0FBR2pDQyxxQkFBYTtBQUhvQixLQUZoQixFQU1sQmhDLEtBTmtCLENBQXpCO0FBT0FvSyxXQUFPL0gsUUFBUCxHQUFrQjZILG9CQUFsQjtBQUNBQyxzQkFBa0I3SSxPQUFsQixDQUEwQjhJLE1BQTFCLEVBQWtDL0osUUFBUWtCLE1BQVIsQ0FBZThJLEtBQWYsRUFBbEM7O0FBRUEsUUFBTUMsVUFBVWpLLFFBQVFRLFdBQVIsQ0FBb0JpRyxTQUFwQixDQUE4QixTQUE5QixFQUF5QztBQUNyRDlGLGVBQU8sQ0FEOEM7QUFFckRELGdCQUFRLENBRjZDO0FBR3JEZ0csZUFBTztBQUg4QyxLQUF6QyxFQUliL0csS0FKYSxDQUFoQjtBQUtBc0ssWUFBUWxKLFFBQVIsR0FBbUIsSUFBSWYsUUFBUWdCLE9BQVosQ0FBb0IsQ0FBQyxFQUFyQixFQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUFuQjtBQUNBaUosWUFBUTNJLGVBQVIsR0FBMEIsSUFBSXRCLFFBQVF1QixlQUFaLENBQ3RCMEksT0FEc0IsRUFFdEJqSyxRQUFRdUIsZUFBUixDQUF3QkMsV0FGRixFQUVlO0FBQ2pDQyxjQUFNLENBRDJCO0FBRWpDQyxrQkFBVSxDQUZ1QjtBQUdqQ0MscUJBQWE7QUFIb0IsS0FGZixDQUExQjtBQU9Bc0ksWUFBUWpJLFFBQVIsR0FBbUI2SCxvQkFBbkI7QUFDQUMsc0JBQWtCN0ksT0FBbEIsQ0FBMEI4SSxNQUExQixFQUFrQy9KLFFBQVFrQixNQUFSLENBQWU4SSxLQUFmLEVBQWxDOztBQUVBLFFBQU1FLFdBQVdsSyxRQUFRUSxXQUFSLENBQW9CaUcsU0FBcEIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDdkQ5RixlQUFPLENBRGdEO0FBRXZERCxnQkFBUSxDQUYrQztBQUd2RGdHLGVBQU87QUFIZ0QsS0FBMUMsRUFJZC9HLEtBSmMsQ0FBakI7QUFLQXVLLGFBQVNuSixRQUFULEdBQW9CLElBQUlmLFFBQVFnQixPQUFaLENBQW9CLEVBQXBCLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQXBCO0FBQ0FrSixhQUFTNUksZUFBVCxHQUEyQixJQUFJdEIsUUFBUXVCLGVBQVosQ0FDdkIySSxRQUR1QixFQUV2QmxLLFFBQVF1QixlQUFSLENBQXdCQyxXQUZELEVBRWM7QUFDakNDLGNBQU0sQ0FEMkI7QUFFakNDLGtCQUFVLENBRnVCO0FBR2pDQyxxQkFBYTtBQUhvQixLQUZkLENBQTNCO0FBT0F1SSxhQUFTbEksUUFBVCxHQUFvQjZILG9CQUFwQjtBQUNBQyxzQkFBa0I3SSxPQUFsQixDQUEwQjhJLE1BQTFCLEVBQWtDL0osUUFBUWtCLE1BQVIsQ0FBZThJLEtBQWYsRUFBbEM7O0FBRUEsV0FBT3JLLEtBQVA7QUFDSCxDQWpFRDtBQWtFQSxJQUFNQSxRQUFRc0osYUFBZDs7O0FBSUEsSUFBTWtCLFdBQVcsSUFBSWhFLE1BQUosQ0FBVyxVQUFYLEVBQXVCeEcsS0FBdkIsRUFBOEIsSUFBSUssUUFBUWdCLE9BQVosQ0FBb0IsQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsQ0FBQyxFQUE3QixDQUE5QixFQUFnRSxDQUFoRSxFQUFtRSxLQUFuRSxDQUFqQjtBQUNBLElBQU1vSixXQUFXLElBQUlqRSxNQUFKLENBQVcsVUFBWCxFQUF1QnhHLEtBQXZCLEVBQThCLElBQUlLLFFBQVFnQixPQUFaLENBQW9CLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLEVBQTVCLENBQTlCLEVBQStELENBQS9ELEVBQWtFLElBQWxFLENBQWpCOztBQUVBLElBQU0yQixjQUFjLElBQUlnQixJQUFKLENBQVNoRSxLQUFULEVBQWdCLElBQUlLLFFBQVFnQixPQUFaLENBQW9CLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLENBQUMsRUFBN0IsQ0FBaEIsRUFBa0QsQ0FBbEQsQ0FBcEI7QUFDQTJCLFlBQVkwSCxzQkFBWixDQUFtQyxDQUFDRixTQUFTM0QsTUFBVCxDQUFnQmxGLGVBQWpCLEVBQWtDOEksU0FBUzVELE1BQVQsQ0FBZ0JsRixlQUFsRCxDQUFuQzs7QUFFQSxJQUFNdUgsY0FBYyxJQUFJbkosV0FBSixDQUFnQkMsS0FBaEIsRUFBdUJnRCxXQUF2QixFQUFvQ3dILFFBQXBDLEVBQThDQyxRQUE5QyxDQUFwQjtBQUNBdkIsWUFBWXdCLHNCQUFaLENBQW1DMUgsWUFBWXNCLElBQVosQ0FBaUIzQyxlQUFwRDs7QUFFQXlHLE9BQU91QyxhQUFQLENBQXFCLFlBQU07QUFDdkIsUUFBSSxDQUFDekIsWUFBWXZJLFdBQWpCLEVBQThCO0FBQzFCLGFBQUssSUFBSWlLLEdBQVQsSUFBZ0IzRixTQUFoQixFQUEyQjtBQUN2QkEsc0JBQVUyRixHQUFWLElBQWlCLEtBQWpCO0FBQ0g7QUFDSjs7QUFFRDVILGdCQUFZNkgsTUFBWixDQUFtQjVGLFNBQW5CLEVBQThCdUYsU0FBUzNELE1BQVQsQ0FBZ0JsRixlQUFoQixDQUFnQzZELGlCQUFoQyxFQUE5QjtBQUNBZ0YsYUFBU0ssTUFBVCxDQUFnQjVGLFNBQWhCLEVBQTJCakMsV0FBM0I7QUFDQXlILGFBQVNJLE1BQVQsQ0FBZ0I1RixTQUFoQixFQUEyQmpDLFdBQTNCOztBQUVBa0csZ0JBQVkyQixNQUFaO0FBQ0E3SyxVQUFNOEssTUFBTjtBQUNILENBYkQiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgR2FtZU1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIGJhbGxDbGFzc09iamVjdCwgcGFkZGxlT25lLCBwYWRkbGVUd28pIHtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcignc2NvcmVCb2FyZEhpZ2hsaWdodCcsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzIgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcigncmVzZXRQbGFuZUhpZ2hsaWdodCcsIHNjZW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhTY29yZVBvc3NpYmxlID0gNTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIGF0IHRoZSBlbmRcclxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVQbGFuZSgnc2NvcmVCb2FyZCcsIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgICAgICBzaWRlT3JpZW50YXRpb246IEJBQllMT04uTWVzaC5ET1VCTEVTSURFXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTYsIDM2KTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzEuYWRkTWVzaCh0aGlzLnNjb3JlQm9hcmQsIG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLjQxLCAwKSk7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnYmFsbENvbGxpZGVyJywge1xyXG4gICAgICAgICAgICB3aWR0aDogNjQsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjAwLFxyXG4gICAgICAgICAgICBzdWJkaXZpc2lvbnM6IDJcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTIsIDApO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Jlc2V0TWF0ZXJpYWwnLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5tYXRlcmlhbCA9IHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbDtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyXzIuYWRkTWVzaCh0aGlzLmJhbGxSZXNldENvbGxpZGVyLCBCQUJZTE9OLkNvbG9yMy5SZWQoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnc2NvcmVCb2FyZE1hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgICAgIC8vIE9wdGlvbnMgaXMgdG8gc2V0IHRoZSByZXNvbHV0aW9uIC0gT3Igc29tZXRoaW5nIGxpa2UgdGhhdFxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUgPSBuZXcgQkFCWUxPTi5EeW5hbWljVGV4dHVyZSgnc2NvcmVCb2FyZE1hdGVyaWFsRHluYW1pYycsIDEwMjQsIHNjZW5lLCB0cnVlKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dCA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5lbWlzc2l2ZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gQkFCWUxPTi5Db2xvcjMuUmVkKCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLm1hdGVyaWFsID0gdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1Njb3JlcycsIDMzMCwgMTUwLCBgc21hbGwtY2FwcyBib2xkZXIgMTAwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1BsYXllciAxJywgNTAsIDQwMCwgYDkwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1BsYXllciAyJywgNjIwLCA0MDAsIGA5MHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyT25lU2NvcmV9YCwgMTUwLCA3MDAsIGAgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyVHdvU2NvcmV9YCwgNzMwLCA3MDAsIGBib2xkZXIgMjAwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbCA9IGJhbGxDbGFzc09iamVjdDtcclxuICAgICAgICB0aGlzLnBhZGRsZU9uZSA9IHBhZGRsZU9uZTtcclxuICAgICAgICB0aGlzLnBhZGRsZVR3byA9IHBhZGRsZVR3bztcclxuXHJcbiAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlciA9IHRoaXMub25UcmlnZ2VyRW50ZXIuYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGJhbGxJbXBvc3Rlcikge1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnJlZ2lzdGVyT25QaHlzaWNzQ29sbGlkZShiYWxsSW1wb3N0ZXIsIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxSZXNldEltcG9zdGVyLCBjb2xsaWRlZEFnYWluc3QpIHtcclxuICAgICAgICBiYWxsUmVzZXRJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICBiYWxsUmVzZXRJbXBvc3Rlci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcblxyXG4gICAgICAgIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA8IC0zNClcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSsrO1xyXG4gICAgICAgIGVsc2UgaWYgKGNvbGxpZGVkQWdhaW5zdC5nZXRPYmplY3RDZW50ZXIoKS56ID4gMzQpXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyT25lU2NvcmUrKztcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbC5yZXNldEJhbGxTdGF0cygpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28ucmVzZXRQYWRkbGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQuY2xlYXJSZWN0KDAsIDUwMCwgMTAyNCwgMTAyNCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllck9uZVNjb3JlfWAsIDE1MCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyVHdvU2NvcmV9YCwgNzMwLCA3MDAsIGBib2xkZXIgMjAwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJPbmVTY29yZSA+IHRoaXMubWF4U2NvcmVQb3NzaWJsZSB8fCB0aGlzLnBsYXllclR3b1Njb3JlID4gdGhpcy5tYXhTY29yZVBvc3NpYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRHYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0R2FtZSgpIHtcclxuICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlID0gMDtcclxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsLnJlc2V0QmFsbFN0YXRzKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUucmVzZXRQYWRkbGUoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZVR3by5yZXNldFBhZGRsZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVTdGFydGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFsbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgc3Bhd25Qb3NpdGlvbiwgYmFsbElkLCBjb2xvciA9IDEpIHtcclxuICAgICAgICB0aGlzLm1pbkJhbGxTcGVlZCA9IDEwO1xyXG4gICAgICAgIHRoaXMubWF4QmFsbFNwZWVkID0gMTAwO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGwgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgncGxheUJhbGwnLCB7XHJcbiAgICAgICAgICAgIHNlZ21lbnRzOiAxNixcclxuICAgICAgICAgICAgZGlhbWV0ZXI6IDFcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICAgICAgdGhpcy5iYWxsLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NlbmVcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHNwYXduUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci51bmlxdWVJZCA9IGJhbGxJZDtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdwbGF5aW5nQmFsbE1hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbE1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLlJlZCgpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5tYXRlcmlhbCA9IHRoaXMuYmFsbE1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBsYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzMyXSkge1xyXG4gICAgICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGFkZGxlVmVsb2NpdHkueCxcclxuICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGltcG9zdGVyc0FycmF5KSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoaW1wb3N0ZXJzQXJyYXksIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxQaHlzaWNzSW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSBjb2xsaWRlZEFnYWluc3QuZ2V0TGluZWFyVmVsb2NpdHkoKS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVhCYWxsID0gYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IC1iYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkuejtcclxuXHJcbiAgICAgICAgYmFsbFBoeXNpY3NJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCAtIHZlbG9jaXR5WEJhbGwsXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlaXHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICBjb2xsaWRlZEFnYWluc3Quc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxpbWl0QmFsbFZlbG9jaXR5KCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IHZlbG9jaXR5Lno7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WkFicyA9IE1hdGguYWJzKHZlbG9jaXR5Wik7XHJcbiAgICAgICAgbGV0IGNsYW1wZWRWZWxvY2l0eVogPSBCQUJZTE9OLk1hdGhUb29scy5DbGFtcCh2ZWxvY2l0eVpBYnMsIHRoaXMubWluQmFsbFNwZWVkLCB0aGlzLm1heEJhbGxTcGVlZCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguc2lnbih2ZWxvY2l0eVopO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gdmVsb2NpdHkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlZID0gdmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCxcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WSxcclxuICAgICAgICAgICAgICAgIGNsYW1wZWRWZWxvY2l0eVogKiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRCYWxsVmVsb2NpdHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5sYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEJhbGxTdGF0cygpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcblxyXG5jbGFzcyBQYWRkbGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgc2NlbmUsIHNwYXduUG9zaXRpb24sIHBhZGRsZUlkLCBpc0FJLCBrZXlzID0gWzM3LCAzOV0sIGNvbG9yID0gMSkge1xyXG4gICAgICAgIHRoaXMucGFkZGxlID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goYHBhZGRsZV8ke25hbWV9YCwge1xyXG4gICAgICAgICAgICB3aWR0aDogNSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxyXG4gICAgICAgICAgICBkZXB0aDogMVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHNwYXduUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZSxcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjZW5lXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gcGFkZGxlSWQ7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlSGlnaGxpZ2h0ID0gbmV3IEJBQllMT04uSGlnaGxpZ2h0TGF5ZXIoYHBhZGRsZV8ke25hbWV9X2hpZ2hsaWdodGAsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnBhZGRsZUhpZ2hsaWdodC5hZGRNZXNoKHRoaXMucGFkZGxlLCBCQUJZTE9OLkNvbG9yMy5ZZWxsb3coKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoYHBhZGRsZV8ke25hbWV9X21hdGVyaWFsYCwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gQkFCWUxPTi5Db2xvcjMuQmxhY2soKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5tYXRlcmlhbCA9IHRoaXMucGFkZGxlTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSA1O1xyXG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XHJcblxyXG4gICAgICAgIHRoaXMuaXNBSSA9IGlzQUk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVBhZGRsZShrZXlTdGF0ZXMpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzW3RoaXMua2V5c1swXV0pIHtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5MZWZ0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlJpZ2h0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKCFrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSAmJiAha2V5U3RhdGVzW3RoaXMua2V5c1sxXV0pIHx8XHJcbiAgICAgICAgICAgIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSAmJiBrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkpXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUGFkZGxlQUkoYmFsbENsYXNzKSB7XHJcbiAgICAgICAgaWYgKGJhbGxDbGFzcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXNpcmVkRGlyZWN0aW9uID0gTWF0aC5zaWduKGJhbGxDbGFzcy5iYWxsLnBvc2l0aW9uLnggLSB0aGlzLnBhZGRsZS5wb3NpdGlvbi54KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5MZWZ0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzaXJlZERpcmVjdGlvbiA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShrZXlTdGF0ZXMsIGJhbGxDbGFzcykge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0FJKVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVQYWRkbGUoa2V5U3RhdGVzKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZUFJKGJhbGxDbGFzcyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRQYWRkbGUoKSB7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucG9zaXRpb24gPSB0aGlzLmluaXRpYWxQb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3BhZGRsZS5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2JhbGwuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9nYW1lLW1hbmFnZXIuanNcIiAvPlxyXG5cclxuLy8gVG9EbzogUmVtb3ZlIGBzaG93Qm91bmRpbmdCb3hgIGZyb20gYWxsIGJvZGllc1xyXG5cclxuY29uc3QgY2FudmFzSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcy1ob2xkZXInKTtcclxuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMjU7XHJcbmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSAzMDtcclxuY2FudmFzSG9sZGVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcbmNvbnN0IGVuZ2luZSA9IG5ldyBCQUJZTE9OLkVuZ2luZShjYW52YXMsIHRydWUpO1xyXG5cclxuY29uc3Qga2V5U3RhdGVzID0ge1xyXG4gICAgMzI6IGZhbHNlLCAvLyBTUEFDRVxyXG4gICAgMzc6IGZhbHNlLCAvLyBMRUZUXHJcbiAgICAzODogZmFsc2UsIC8vIFVQXHJcbiAgICAzOTogZmFsc2UsIC8vIFJJR0hUXHJcbiAgICA0MDogZmFsc2UsIC8vIERPV05cclxuICAgIDg3OiBmYWxzZSwgLy8gV1xyXG4gICAgNjU6IGZhbHNlLCAvLyBBXHJcbiAgICA4MzogZmFsc2UsIC8vIFNcclxuICAgIDY4OiBmYWxzZSAvLyBEXHJcbn07XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gdHJ1ZTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgaW4ga2V5U3RhdGVzKVxyXG4gICAgICAgIGtleVN0YXRlc1tldmVudC5rZXlDb2RlXSA9IGZhbHNlO1xyXG59KTtcclxuXHJcbmNvbnN0IGNyZWF0ZURPTUVsZW1lbnRzU3RhcnQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBob21lT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaG9tZU92ZXJsYXkuY2xhc3NOYW1lID0gJ292ZXJsYXknO1xyXG5cclxuICAgIGNvbnN0IGhvbWVPdmVybGF5Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmNsYXNzTmFtZSA9ICdvdmVybGF5LWNvbnRlbnQnO1xyXG4gICAgaG9tZU92ZXJsYXkuYXBwZW5kQ2hpbGQoaG9tZU92ZXJsYXlDb250ZW50KTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXJDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWFkZXJDb250ZW50LmNsYXNzTmFtZSA9ICdoZWFkZXInO1xyXG4gICAgaGVhZGVyQ29udGVudC5pbm5lclRleHQgPSAnUG9uZyc7XHJcblxyXG4gICAgY29uc3QgbWFpbkNvbnRlbnRIb2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIG1haW5Db250ZW50SG9sZGVyLmNsYXNzTmFtZSA9ICdtYWluLWNvbnRlbnQtaG9sZGVyJztcclxuXHJcbiAgICBjb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHN0YXJ0QnV0dG9uLmNsYXNzTmFtZSA9ICdzdGFydC1idXR0b24nO1xyXG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gJ1N0YXJ0IEdhbWUnO1xyXG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgLy8gVG9kbzogQ2hhbmdlIEdhbWUgU3RhdGUgSGVyZVxyXG4gICAgICAgIGhvbWVPdmVybGF5LnN0eWxlLndpZHRoID0gJzAnO1xyXG4gICAgICAgIGdhbWVNYW5hZ2VyLmdhbWVTdGFydGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGhlbHBDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWxwQ29udGVudC5jbGFzc05hbWUgPSAnaGVscC1jb250ZW50JztcclxuICAgIGhlbHBDb250ZW50LmlubmVyVGV4dCA9ICdBIHBvbmcgZ2FtZSBtYWRlIHVzaW5nIEJBQllMT04uSlMuIFVzZSBBUlJPVyBLRVlTIHRvIGNvbnRyb2wgYW5kIFNQQUNFIHRvIGxhdW5jaCB0aGUgYmFsbC4nO1xyXG5cclxuICAgIG1haW5Db250ZW50SG9sZGVyLmFwcGVuZENoaWxkKHN0YXJ0QnV0dG9uKTtcclxuICAgIG1haW5Db250ZW50SG9sZGVyLmFwcGVuZENoaWxkKGhlbHBDb250ZW50KTtcclxuICAgIGhvbWVPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChoZWFkZXJDb250ZW50KTtcclxuICAgIGhvbWVPdmVybGF5Q29udGVudC5hcHBlbmRDaGlsZChtYWluQ29udGVudEhvbGRlcik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGhvbWVPdmVybGF5KTtcclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZURPTUVsZW1lbnRzRW5kID0gKCkgPT4ge1xyXG5cclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZVNjZW5lID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xyXG4gICAgc2NlbmUuZW5hYmxlUGh5c2ljcyhuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC05LjgxLCAwKSwgbmV3IEJBQllMT04uQ2Fubm9uSlNQbHVnaW4oKSk7XHJcbiAgICBzY2VuZS5jb2xsaXNpb25zRW5hYmxlZCA9IHRydWU7XHJcbiAgICBzY2VuZS53b3JrZXJDb2xsaXNpb25zID0gdHJ1ZTtcclxuICAgIHNjZW5lLmNsZWFyQ29sb3IgPSBCQUJZTE9OLkNvbG9yMy5CbGFjaygpO1xyXG5cclxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkZyZWVDYW1lcmEoJ21haW5DYW1lcmEnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDIwLCAtNjApLCBzY2VuZSk7XHJcbiAgICBjYW1lcmEuc2V0VGFyZ2V0KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgIGNvbnN0IGxpZ2h0ID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodCgnbWFpbkxpZ2h0JywgbmV3IEJBQllMT04uVmVjdG9yMygwLCAxLCAwKSwgc2NlbmUpO1xyXG5cclxuICAgIGNvbnN0IGdlbmVyaWNCbGFja01hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnYmxhY2tNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgIGdlbmVyaWNCbGFja01hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcbiAgICBjb25zdCBoaWdobGlnaHRNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLkhpZ2hsaWdodExheWVyKCdtYWluSGlnaExpZ2h0ZXInLCBzY2VuZSk7XHJcblxyXG4gICAgY29uc3QgZ3JvdW5kID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ21haW5Hcm91bmQnLCB7XHJcbiAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgIGhlaWdodDogNzAsXHJcbiAgICAgICAgc3ViZGl2aXNpb25zOiAyXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBncm91bmQucG9zaXRpb24gPSBCQUJZTE9OLlZlY3RvcjMuWmVybygpO1xyXG4gICAgZ3JvdW5kLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICBncm91bmQsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgZ3JvdW5kLm1hdGVyaWFsID0gZ2VuZXJpY0JsYWNrTWF0ZXJpYWw7XHJcbiAgICBoaWdobGlnaHRNYXRlcmlhbC5hZGRNZXNoKGdyb3VuZCwgQkFCWUxPTi5Db2xvcjMuR3JlZW4oKSk7XHJcblxyXG4gICAgY29uc3QgbGVmdEJhciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KCdsZWZ0QmFyJywge1xyXG4gICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgIGhlaWdodDogMixcclxuICAgICAgICBkZXB0aDogNzBcclxuICAgIH0sIHNjZW5lKTtcclxuICAgIGxlZnRCYXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKC0xNSwgMSwgMCk7XHJcbiAgICBsZWZ0QmFyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICBsZWZ0QmFyLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgbGVmdEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xyXG4gICAgaGlnaGxpZ2h0TWF0ZXJpYWwuYWRkTWVzaChncm91bmQsIEJBQllMT04uQ29sb3IzLkdyZWVuKCkpO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0QmFyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goJ3JpZ2h0QmFyJywge1xyXG4gICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgIGhlaWdodDogMixcclxuICAgICAgICBkZXB0aDogNzBcclxuICAgIH0sIHNjZW5lKTtcclxuICAgIHJpZ2h0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygxNSwgMSwgMCk7XHJcbiAgICByaWdodEJhci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgcmlnaHRCYXIsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICByaWdodEJhci5tYXRlcmlhbCA9IGdlbmVyaWNCbGFja01hdGVyaWFsO1xyXG4gICAgaGlnaGxpZ2h0TWF0ZXJpYWwuYWRkTWVzaChncm91bmQsIEJBQllMT04uQ29sb3IzLkdyZWVuKCkpO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxufTtcclxuY29uc3Qgc2NlbmUgPSBjcmVhdGVTY2VuZSgpO1xyXG4vLyBjcmVhdGVET01FbGVtZW50c1N0YXJ0KCk7XHJcbi8vIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpXHJcblxyXG5jb25zdCBwbGF5ZXJfMSA9IG5ldyBQYWRkbGUoJ3BsYXllcl8xJywgc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpLCAyLCBmYWxzZSk7XHJcbmNvbnN0IGFpUGxheWVyID0gbmV3IFBhZGRsZSgnYWlQbGF5ZXInLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIDM0KSwgMywgdHJ1ZSk7XHJcblxyXG5jb25zdCBwbGF5aW5nQmFsbCA9IG5ldyBCYWxsKHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTMzKSwgMSk7XHJcbnBsYXlpbmdCYWxsLnNldENvbGxpc2lvbkNvbXBvbmVudHMoW3BsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IsIGFpUGxheWVyLnBhZGRsZS5waHlzaWNzSW1wb3N0b3JdKTtcclxuXHJcbmNvbnN0IGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKHNjZW5lLCBwbGF5aW5nQmFsbCwgcGxheWVyXzEsIGFpUGxheWVyKTtcclxuZ2FtZU1hbmFnZXIuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhwbGF5aW5nQmFsbC5iYWxsLnBoeXNpY3NJbXBvc3Rvcik7XHJcblxyXG5lbmdpbmUucnVuUmVuZGVyTG9vcCgoKSA9PiB7XHJcbiAgICBpZiAoIWdhbWVNYW5hZ2VyLmdhbWVTdGFydGVkKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGtleVN0YXRlcykge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZXNba2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwbGF5aW5nQmFsbC51cGRhdGUoa2V5U3RhdGVzLCBwbGF5ZXJfMS5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkpO1xyXG4gICAgcGxheWVyXzEudXBkYXRlKGtleVN0YXRlcywgcGxheWluZ0JhbGwpO1xyXG4gICAgYWlQbGF5ZXIudXBkYXRlKGtleVN0YXRlcywgcGxheWluZ0JhbGwpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLnVwZGF0ZSgpO1xyXG4gICAgc2NlbmUucmVuZGVyKCk7XHJcbn0pOyJdfQ==
