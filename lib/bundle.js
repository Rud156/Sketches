'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = function () {
    function GameManager(scene, ballClassObject, paddleOne, paddleTwo) {
        _classCallCheck(this, GameManager);

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

        this.gameStarted = false;

        this.scoreBoard = BABYLON.MeshBuilder.CreatePlane('scoreBoard', {
            height: 16,
            width: 32,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.scoreBoard.position = new BABYLON.Vector3(0, 16, 36);
        this.highlightLayer = new BABYLON.HighlightLayer('scoreBoardHighlight', scene);
        this.highlightLayer.addMesh(this.scoreBoard, new BABYLON.Color3(1, 0.41, 0));

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
        this.ballResetColliderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.ballResetCollider.material = this.ballResetColliderMaterial;
        this.highlightLayer.addMesh(this.ballResetCollider, BABYLON.Color3.Red());

        this.scoreBoardMaterial = new BABYLON.StandardMaterial('scoreBoardMaterial', scene);

        this.scoreBoardTexture = new BABYLON.DynamicTexture('scoreBoardMaterialDynamic', 1024, scene, true);
        this.scoreBoardTextureContext = this.scoreBoardTexture.getContext();
        this.scoreBoardMaterial.diffuseTexture = this.scoreBoardTexture;
        this.scoreBoardMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.scoreBoardMaterial.specularColor = new BABYLON.Color3(1, 0, 0);
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

    var startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.innerText = 'Start Game';
    startButton.addEventListener('click', function () {});

    var helpContent = document.createElement('div');
    helpContent.className = 'help-content';
    helpContent.innerText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum, erat vel porttitor egestas, lectus tellus blandit massa, vel convallis lacus leo ac ligula. In vitae sapien sagittis, pharetra mi nec, tristique mauris. In hac habitasse platea dictumst. Integer gravida purus sed rhoncus euismod.';

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

    return scene;
};
var scene = createScene();
createDOMElementsStart();


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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwicGxheWVyT25lU2NvcmUiLCJwbGF5ZXJUd29TY29yZSIsIm1heFNjb3JlUG9zc2libGUiLCJnYW1lU3RhcnRlZCIsInNjb3JlQm9hcmQiLCJCQUJZTE9OIiwiTWVzaEJ1aWxkZXIiLCJDcmVhdGVQbGFuZSIsImhlaWdodCIsIndpZHRoIiwic2lkZU9yaWVudGF0aW9uIiwiTWVzaCIsIkRPVUJMRVNJREUiLCJwb3NpdGlvbiIsIlZlY3RvcjMiLCJoaWdobGlnaHRMYXllciIsIkhpZ2hsaWdodExheWVyIiwiYWRkTWVzaCIsIkNvbG9yMyIsImJhbGxSZXNldENvbGxpZGVyIiwiQ3JlYXRlR3JvdW5kIiwic3ViZGl2aXNpb25zIiwicGh5c2ljc0ltcG9zdG9yIiwiUGh5c2ljc0ltcG9zdG9yIiwiQm94SW1wb3N0b3IiLCJtYXNzIiwiZnJpY3Rpb24iLCJyZXN0aXR1dGlvbiIsImJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwiLCJTdGFuZGFyZE1hdGVyaWFsIiwiZGlmZnVzZUNvbG9yIiwibWF0ZXJpYWwiLCJSZWQiLCJzY29yZUJvYXJkTWF0ZXJpYWwiLCJzY29yZUJvYXJkVGV4dHVyZSIsIkR5bmFtaWNUZXh0dXJlIiwic2NvcmVCb2FyZFRleHR1cmVDb250ZXh0IiwiZ2V0Q29udGV4dCIsImRpZmZ1c2VUZXh0dXJlIiwiZW1pc3NpdmVDb2xvciIsInNwZWN1bGFyQ29sb3IiLCJkcmF3VGV4dCIsInBsYXlpbmdCYWxsIiwib25UcmlnZ2VyRW50ZXIiLCJiaW5kIiwiYmFsbEltcG9zdGVyIiwicmVnaXN0ZXJPblBoeXNpY3NDb2xsaWRlIiwiYmFsbFJlc2V0SW1wb3N0ZXIiLCJjb2xsaWRlZEFnYWluc3QiLCJzZXRMaW5lYXJWZWxvY2l0eSIsIlplcm8iLCJzZXRBbmd1bGFyVmVsb2NpdHkiLCJnZXRPYmplY3RDZW50ZXIiLCJ6IiwicmVzZXRCYWxsU3RhdHMiLCJyZXNldFBhZGRsZSIsImNsZWFyUmVjdCIsInJlc2V0R2FtZSIsIkJhbGwiLCJzcGF3blBvc2l0aW9uIiwiYmFsbElkIiwiY29sb3IiLCJtaW5CYWxsU3BlZWQiLCJtYXhCYWxsU3BlZWQiLCJiYWxsIiwiQ3JlYXRlU3BoZXJlIiwic2VnbWVudHMiLCJkaWFtZXRlciIsIlNwaGVyZUltcG9zdG9yIiwidW5pcXVlSWQiLCJpbml0aWFsUG9zaXRpb24iLCJjbG9uZSIsImlzTGF1bmNoZWQiLCJwbGF5ZXJQYWRkbGVWZWxvY2l0eSIsImtleVN0YXRlcyIsIngiLCJNYXRoIiwicmFuZG9tIiwiaW1wb3N0ZXJzQXJyYXkiLCJiYWxsUGh5c2ljc0ltcG9zdGVyIiwidmVsb2NpdHlYIiwiZ2V0TGluZWFyVmVsb2NpdHkiLCJ2ZWxvY2l0eVhCYWxsIiwidmVsb2NpdHlaIiwidmVsb2NpdHkiLCJ2ZWxvY2l0eVpBYnMiLCJhYnMiLCJjbGFtcGVkVmVsb2NpdHlaIiwiTWF0aFRvb2xzIiwiQ2xhbXAiLCJkaXJlY3Rpb24iLCJzaWduIiwidmVsb2NpdHlZIiwieSIsImxpbWl0QmFsbFZlbG9jaXR5IiwibG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUiLCJsYXVuY2hCYWxsIiwiUGFkZGxlIiwibmFtZSIsInBhZGRsZUlkIiwiaXNBSSIsImtleXMiLCJwYWRkbGUiLCJDcmVhdGVCb3giLCJkZXB0aCIsIm1vdmVtZW50U3BlZWQiLCJMZWZ0Iiwic2NhbGUiLCJSaWdodCIsImJhbGxDbGFzcyIsImRlc2lyZWREaXJlY3Rpb24iLCJtb3ZlUGFkZGxlIiwibW92ZVBhZGRsZUFJIiwiY2FudmFzSG9sZGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNhbnZhcyIsImNyZWF0ZUVsZW1lbnQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJhcHBlbmRDaGlsZCIsImVuZ2luZSIsIkVuZ2luZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImtleUNvZGUiLCJjcmVhdGVET01FbGVtZW50c1N0YXJ0IiwiaG9tZU92ZXJsYXkiLCJjbGFzc05hbWUiLCJob21lT3ZlcmxheUNvbnRlbnQiLCJoZWFkZXJDb250ZW50IiwiaW5uZXJUZXh0IiwibWFpbkNvbnRlbnRIb2xkZXIiLCJzdGFydEJ1dHRvbiIsImhlbHBDb250ZW50IiwiYm9keSIsImNyZWF0ZURPTUVsZW1lbnRzRW5kIiwiY3JlYXRlU2NlbmUiLCJTY2VuZSIsImVuYWJsZVBoeXNpY3MiLCJDYW5ub25KU1BsdWdpbiIsImNvbGxpc2lvbnNFbmFibGVkIiwid29ya2VyQ29sbGlzaW9ucyIsImNsZWFyQ29sb3IiLCJCbGFjayIsImNhbWVyYSIsIkZyZWVDYW1lcmEiLCJzZXRUYXJnZXQiLCJsaWdodCIsIkhlbWlzcGhlcmljTGlnaHQiLCJncm91bmQiLCJsZWZ0QmFyIiwicmlnaHRCYXIiLCJwbGF5ZXJfMSIsImFpUGxheWVyIiwic2V0Q29sbGlzaW9uQ29tcG9uZW50cyIsImdhbWVNYW5hZ2VyIiwicnVuUmVuZGVyTG9vcCIsImtleSIsInVwZGF0ZSIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFc7QUFDRix5QkFBWUMsS0FBWixFQUFtQkMsZUFBbkIsRUFBb0NDLFNBQXBDLEVBQStDQyxTQUEvQyxFQUEwRDtBQUFBOztBQUN0RCxhQUFLQyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsYUFBS0MsY0FBTCxHQUFzQixDQUF0QjtBQUNBLGFBQUtDLGdCQUFMLEdBQXdCLENBQXhCOztBQUVBLGFBQUtDLFdBQUwsR0FBbUIsS0FBbkI7O0FBRUEsYUFBS0MsVUFBTCxHQUFrQkMsUUFBUUMsV0FBUixDQUFvQkMsV0FBcEIsQ0FBZ0MsWUFBaEMsRUFBOEM7QUFDNURDLG9CQUFRLEVBRG9EO0FBRTVEQyxtQkFBTyxFQUZxRDtBQUc1REMsNkJBQWlCTCxRQUFRTSxJQUFSLENBQWFDO0FBSDhCLFNBQTlDLEVBSWZoQixLQUplLENBQWxCO0FBS0EsYUFBS1EsVUFBTCxDQUFnQlMsUUFB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QnJGLFNBQWhCLEVBQTJCO0FBQ3ZCQSxzQkFBVXFGLEdBQVYsSUFBaUIsS0FBakI7QUFDSDtBQUNKOztBQUVEckgsZ0JBQVlzSCxNQUFaLENBQW1CdEYsU0FBbkIsRUFBOEJnRixTQUFTcEQsTUFBVCxDQUFnQmhGLGVBQWhCLENBQWdDMkQsaUJBQWhDLEVBQTlCO0FBQ0F5RSxhQUFTTSxNQUFULENBQWdCdEYsU0FBaEIsRUFBMkJoQyxXQUEzQjtBQUNBaUgsYUFBU0ssTUFBVCxDQUFnQnRGLFNBQWhCLEVBQTJCaEMsV0FBM0I7O0FBRUFtSCxnQkFBWUcsTUFBWjtBQUNBcEssVUFBTXFLLE1BQU47QUFDSCxDQWJEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdhbWVNYW5hZ2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBiYWxsQ2xhc3NPYmplY3QsIHBhZGRsZU9uZSwgcGFkZGxlVHdvKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhTY29yZVBvc3NpYmxlID0gNTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKCdzY29yZUJvYXJkJywge1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxyXG4gICAgICAgICAgICB3aWR0aDogMzIsXHJcbiAgICAgICAgICAgIHNpZGVPcmllbnRhdGlvbjogQkFCWUxPTi5NZXNoLkRPVUJMRVNJREVcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAxNiwgMzYpO1xyXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGF5ZXIgPSBuZXcgQkFCWUxPTi5IaWdobGlnaHRMYXllcignc2NvcmVCb2FyZEhpZ2hsaWdodCcsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyLmFkZE1lc2godGhpcy5zY29yZUJvYXJkLCBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMC40MSwgMCkpO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ2JhbGxDb2xsaWRlcicsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDY0LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDIwMCxcclxuICAgICAgICAgICAgc3ViZGl2aXNpb25zOiAyXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC0yLCAwKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlcixcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdyZXNldE1hdGVyaWFsJywgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5tYXRlcmlhbCA9IHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbDtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyLmFkZE1lc2godGhpcy5iYWxsUmVzZXRDb2xsaWRlciwgQkFCWUxPTi5Db2xvcjMuUmVkKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Njb3JlQm9hcmRNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICAvLyBPcHRpb25zIGlzIHRvIHNldCB0aGUgcmVzb2x1dGlvbiAtIE9yIHNvbWV0aGluZyBsaWtlIHRoYXRcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlID0gbmV3IEJBQllMT04uRHluYW1pY1RleHR1cmUoJ3Njb3JlQm9hcmRNYXRlcmlhbER5bmFtaWMnLCAxMDI0LCBzY2VuZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZUNvbnRleHQgPSB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmdldENvbnRleHQoKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IHRoaXMuc2NvcmVCb2FyZFRleHR1cmU7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5tYXRlcmlhbCA9IHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdTY29yZXMnLCAzMzAsIDE1MCwgYHNtYWxsLWNhcHMgYm9sZGVyIDEwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdQbGF5ZXIgMScsIDUwLCA0MDAsIGA5MHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KCdQbGF5ZXIgMicsIDYyMCwgNDAwLCBgOTBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllck9uZVNjb3JlfWAsIDE1MCwgNzAwLCBgIGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllclR3b1Njb3JlfWAsIDczMCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwgPSBiYWxsQ2xhc3NPYmplY3Q7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUgPSBwYWRkbGVPbmU7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28gPSBwYWRkbGVUd287XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhiYWxsSW1wb3N0ZXIpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoYmFsbEltcG9zdGVyLCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUmVzZXRJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgICAgICBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPCAtMzQpXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUrKztcclxuICAgICAgICBlbHNlIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA+IDM0KVxyXG4gICAgICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlKys7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwucmVzZXRCYWxsU3RhdHMoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZU9uZS5yZXNldFBhZGRsZSgpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmVDb250ZXh0LmNsZWFyUmVjdCgwLCA1MDAsIDEwMjQsIDEwMjQpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dChgJHt0aGlzLnBsYXllclR3b1Njb3JlfWAsIDczMCwgNzAwLCBgYm9sZGVyIDIwMHB4ICdRdWlja3NhbmQnLCBzYW5zLXNlcmlmYCwgJyNmZjZhMDAnKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyT25lU2NvcmUgPiB0aGlzLm1heFNjb3JlUG9zc2libGUgfHwgdGhpcy5wbGF5ZXJUd29TY29yZSA+IHRoaXMubWF4U2NvcmVQb3NzaWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEdhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQmFsbC5yZXNldEJhbGxTdGF0cygpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlT25lLnJlc2V0UGFkZGxlKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28ucmVzZXRQYWRkbGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lU3RhcnRlZCA9ICBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG59XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcblxyXG5jbGFzcyBCYWxsIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBzcGF3blBvc2l0aW9uLCBiYWxsSWQsIGNvbG9yID0gMSkge1xyXG4gICAgICAgIHRoaXMubWluQmFsbFNwZWVkID0gMTA7XHJcbiAgICAgICAgdGhpcy5tYXhCYWxsU3BlZWQgPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKCdwbGF5QmFsbCcsIHtcclxuICAgICAgICAgICAgc2VnbWVudHM6IDE2LFxyXG4gICAgICAgICAgICBkaWFtZXRlcjogMVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLmJhbGwsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2VuZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gYmFsbElkO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBsYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzMyXSkge1xyXG4gICAgICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGFkZGxlVmVsb2NpdHkueCxcclxuICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGltcG9zdGVyc0FycmF5KSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoaW1wb3N0ZXJzQXJyYXksIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxQaHlzaWNzSW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSBjb2xsaWRlZEFnYWluc3QuZ2V0TGluZWFyVmVsb2NpdHkoKS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVhCYWxsID0gYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IC1iYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkuejtcclxuXHJcbiAgICAgICAgYmFsbFBoeXNpY3NJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCAtIHZlbG9jaXR5WEJhbGwsXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlaXHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICBjb2xsaWRlZEFnYWluc3Quc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxpbWl0QmFsbFZlbG9jaXR5KCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IHZlbG9jaXR5Lno7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WkFicyA9IE1hdGguYWJzKHZlbG9jaXR5Wik7XHJcbiAgICAgICAgbGV0IGNsYW1wZWRWZWxvY2l0eVogPSBCQUJZTE9OLk1hdGhUb29scy5DbGFtcCh2ZWxvY2l0eVpBYnMsIHRoaXMubWluQmFsbFNwZWVkLCB0aGlzLm1heEJhbGxTcGVlZCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguc2lnbih2ZWxvY2l0eVopO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gdmVsb2NpdHkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlZID0gdmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCxcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WSxcclxuICAgICAgICAgICAgICAgIGNsYW1wZWRWZWxvY2l0eVogKiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRCYWxsVmVsb2NpdHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5sYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEJhbGxTdGF0cygpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pc0xhdW5jaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIFBhZGRsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBzY2VuZSwgc3Bhd25Qb3NpdGlvbiwgcGFkZGxlSWQsIGlzQUksIGtleXMgPSBbMzcsIDM5XSwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveChgcGFkZGxlXyR7bmFtZX1gLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDEsXHJcbiAgICAgICAgICAgIGRlcHRoOiAxXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NlbmVcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBwYWRkbGVJZDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBzcGF3blBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDU7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuXHJcbiAgICAgICAgdGhpcy5pc0FJID0gaXNBSTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUGFkZGxlKGtleVN0YXRlcykge1xyXG4gICAgICAgIGlmIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuUmlnaHQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1t0aGlzLmtleXNbMF1dICYmICFrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkgfHxcclxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMF1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSlcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVQYWRkbGVBSShiYWxsQ2xhc3MpIHtcclxuICAgICAgICBpZiAoYmFsbENsYXNzLmlzTGF1bmNoZWQpIHtcclxuICAgICAgICAgICAgbGV0IGRlc2lyZWREaXJlY3Rpb24gPSBNYXRoLnNpZ24oYmFsbENsYXNzLmJhbGwucG9zaXRpb24ueCAtIHRoaXMucGFkZGxlLnBvc2l0aW9uLngpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc2lyZWREaXJlY3Rpb24gPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlJpZ2h0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgYmFsbENsYXNzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzQUkpXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZShrZXlTdGF0ZXMpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5tb3ZlUGFkZGxlQUkoYmFsbENsYXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldFBhZGRsZSgpIHtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFkZGxlLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFsbC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dhbWUtbWFuYWdlci5qc1wiIC8+XHJcblxyXG4vLyBUb0RvOiBSZW1vdmUgYHNob3dCb3VuZGluZ0JveGAgZnJvbSBhbGwgYm9kaWVzXHJcblxyXG5jb25zdCBjYW52YXNIb2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzLWhvbGRlcicpO1xyXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAyNTtcclxuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDMwO1xyXG5jYW52YXNIb2xkZXIuYXBwZW5kQ2hpbGQoY2FudmFzKTtcclxuY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlIC8vIERcclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XHJcbn0pO1xyXG5cclxuY29uc3QgY3JlYXRlRE9NRWxlbWVudHNTdGFydCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGhvbWVPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBob21lT3ZlcmxheS5jbGFzc05hbWUgPSAnb3ZlcmxheSc7XHJcblxyXG4gICAgY29uc3QgaG9tZU92ZXJsYXlDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBob21lT3ZlcmxheUNvbnRlbnQuY2xhc3NOYW1lID0gJ292ZXJsYXktY29udGVudCc7XHJcbiAgICBob21lT3ZlcmxheS5hcHBlbmRDaGlsZChob21lT3ZlcmxheUNvbnRlbnQpO1xyXG5cclxuICAgIGNvbnN0IGhlYWRlckNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGhlYWRlckNvbnRlbnQuY2xhc3NOYW1lID0gJ2hlYWRlcic7XHJcbiAgICBoZWFkZXJDb250ZW50LmlubmVyVGV4dCA9ICdQb25nJztcclxuXHJcbiAgICBjb25zdCBtYWluQ29udGVudEhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICBzdGFydEJ1dHRvbi5jbGFzc05hbWUgPSAnc3RhcnQtYnV0dG9uJztcclxuICAgIHN0YXJ0QnV0dG9uLmlubmVyVGV4dCA9ICdTdGFydCBHYW1lJztcclxuICAgIHN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIC8vIFRvZG86IENoYW5nZSBHYW1lIFN0YXRlIEhlcmVcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGhlbHBDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBoZWxwQ29udGVudC5jbGFzc05hbWUgPSAnaGVscC1jb250ZW50JztcclxuICAgIGhlbHBDb250ZW50LmlubmVyVGV4dCA9ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBRdWlzcXVlIGRpY3R1bSwgZXJhdCB2ZWwgcG9ydHRpdG9yIGVnZXN0YXMsIGxlY3R1cyB0ZWxsdXMgYmxhbmRpdCBtYXNzYSwgdmVsIGNvbnZhbGxpcyBsYWN1cyBsZW8gYWMgbGlndWxhLiBJbiB2aXRhZSBzYXBpZW4gc2FnaXR0aXMsIHBoYXJldHJhIG1pIG5lYywgdHJpc3RpcXVlIG1hdXJpcy4gSW4gaGFjIGhhYml0YXNzZSBwbGF0ZWEgZGljdHVtc3QuIEludGVnZXIgZ3JhdmlkYSBwdXJ1cyBzZWQgcmhvbmN1cyBldWlzbW9kLic7XHJcblxyXG4gICAgbWFpbkNvbnRlbnRIb2xkZXIuYXBwZW5kQ2hpbGQoc3RhcnRCdXR0b24pO1xyXG4gICAgbWFpbkNvbnRlbnRIb2xkZXIuYXBwZW5kQ2hpbGQoaGVscENvbnRlbnQpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKGhlYWRlckNvbnRlbnQpO1xyXG4gICAgaG9tZU92ZXJsYXlDb250ZW50LmFwcGVuZENoaWxkKG1haW5Db250ZW50SG9sZGVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaG9tZU92ZXJsYXkpO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlRE9NRWxlbWVudHNFbmQgPSAoKSA9PiB7XHJcblxyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIHNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcclxuICAgIHNjZW5lLndvcmtlckNvbGxpc2lvbnMgPSB0cnVlO1xyXG4gICAgc2NlbmUuY2xlYXJDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcblxyXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IEJBQllMT04uRnJlZUNhbWVyYSgnbWFpbkNhbWVyYScsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMjAsIC02MCksIHNjZW5lKTtcclxuICAgIGNhbWVyYS5zZXRUYXJnZXQoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcblxyXG4gICAgY29uc3QgbGlnaHQgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KCdtYWluTGlnaHQnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDEsIDApLCBzY2VuZSk7XHJcblxyXG4gICAgY29uc3QgZ3JvdW5kID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ21haW5Hcm91bmQnLCB7XHJcbiAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgIGhlaWdodDogNzAsXHJcbiAgICAgICAgc3ViZGl2aXNpb25zOiAyXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBncm91bmQucG9zaXRpb24gPSBCQUJZTE9OLlZlY3RvcjMuWmVybygpO1xyXG4gICAgZ3JvdW5kLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICBncm91bmQsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgnbGVmdEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBsZWZ0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTUsIDEsIDApO1xyXG4gICAgbGVmdEJhci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgbGVmdEJhcixcclxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICBjb25zdCByaWdodEJhciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KCdyaWdodEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICByaWdodEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMTUsIDEsIDApO1xyXG4gICAgcmlnaHRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgIHJpZ2h0QmFyLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxufTtcclxuY29uc3Qgc2NlbmUgPSBjcmVhdGVTY2VuZSgpO1xyXG5jcmVhdGVET01FbGVtZW50c1N0YXJ0KCk7XHJcbi8vIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpXHJcblxyXG5jb25zdCBwbGF5ZXJfMSA9IG5ldyBQYWRkbGUoJ3BsYXllcl8xJywgc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzQpLCAyLCBmYWxzZSk7XHJcbmNvbnN0IGFpUGxheWVyID0gbmV3IFBhZGRsZSgnYWlQbGF5ZXInLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIDM0KSwgMywgdHJ1ZSk7XHJcblxyXG5jb25zdCBwbGF5aW5nQmFsbCA9IG5ldyBCYWxsKHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgLTMzKSwgMSk7XHJcbnBsYXlpbmdCYWxsLnNldENvbGxpc2lvbkNvbXBvbmVudHMoW3BsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IsIGFpUGxheWVyLnBhZGRsZS5waHlzaWNzSW1wb3N0b3JdKTtcclxuXHJcbmNvbnN0IGdhbWVNYW5hZ2VyID0gbmV3IEdhbWVNYW5hZ2VyKHNjZW5lLCBwbGF5aW5nQmFsbCwgcGxheWVyXzEsIGFpUGxheWVyKTtcclxuZ2FtZU1hbmFnZXIuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhwbGF5aW5nQmFsbC5iYWxsLnBoeXNpY3NJbXBvc3Rvcik7XHJcblxyXG5lbmdpbmUucnVuUmVuZGVyTG9vcCgoKSA9PiB7XHJcbiAgICBpZiAoIWdhbWVNYW5hZ2VyLmdhbWVTdGFydGVkKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGtleVN0YXRlcykge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZXNba2V5XSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwbGF5aW5nQmFsbC51cGRhdGUoa2V5U3RhdGVzLCBwbGF5ZXJfMS5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkpO1xyXG4gICAgcGxheWVyXzEudXBkYXRlKGtleVN0YXRlcywgcGxheWluZ0JhbGwpO1xyXG4gICAgYWlQbGF5ZXIudXBkYXRlKGtleVN0YXRlcywgcGxheWluZ0JhbGwpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLnVwZGF0ZSgpO1xyXG4gICAgc2NlbmUucmVuZGVyKCk7XHJcbn0pOyJdfQ==
