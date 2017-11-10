'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = function () {
    function GameManager(scene, ballClassObject, paddleOne, paddleTwo) {
        _classCallCheck(this, GameManager);

        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.maxScorePossible = 5;

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

        this.minBallSpeed = 5;
        this.maxBallSpeed = 20;

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

var createScene = function createScene() {
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.clearColor = BABYLON.Color3.Black();

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

var createGameStartObjects = function createGameStartObjects(sceneObject) {};

var createGameEndObjects = function createGameEndObjects(sceneObject) {};

var scene = createScene();

var camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(90, 20, -60), scene);
var startToGame = new BABYLON.Animation('startToGame', 'position.x', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
var startToGameKeys = [{
    frame: 0,
    value: 90
}, {
    frame: 100,
    value: 0
}];
startToGame.setKeys(startToGameKeys);
var gameToEnd = new BABYLON.Animation('gameToEnd', 'position.x', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
var gameToEndKeys = [{
    frame: 0,
    value: 20
}, {
    frame: 100,
    value: 140
}];
gameToEnd.setKeys(gameToEndKeys);
camera.animations = [];
camera.animations.push(startToGame);
camera.animations.push(gameToEnd);


var player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
var aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

var playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

var gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);

engine.runRenderLoop(function () {
    playingBall.update(keyStates, player_1.paddle.physicsImpostor.getLinearVelocity());
    player_1.update(keyStates, playingBall);
    aiPlayer.update(keyStates, playingBall);

    gameManager.update();
    scene.render();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwicGxheWVyT25lU2NvcmUiLCJwbGF5ZXJUd29TY29yZSIsIm1heFNjb3JlUG9zc2libGUiLCJzY29yZUJvYXJkIiwiQkFCWUxPTiIsIk1lc2hCdWlsZGVyIiwiQ3JlYXRlUGxhbmUiLCJoZWlnaHQiLCJ3aWR0aCIsInNpZGVPcmllbnRhdGlvbiIsIk1lc2giLCJET1VCTEVTSURFIiwicG9zaXRpb24iLCJWZWN0b3IzIiwiaGlnaGxpZ2h0TGF5ZXIiLCJIaWdobGlnaHRMYXllciIsImFkZE1lc2giLCJDb2xvcjMiLCJiYWxsUmVzZXRDb2xsaWRlciIsIkNyZWF0ZUdyb3VuZCIsInN1YmRpdmlzaW9ucyIsInBoeXNpY3NJbXBvc3RvciIsIlBoeXNpY3NJbXBvc3RvciIsIkJveEltcG9zdG9yIiwibWFzcyIsImZyaWN0aW9uIiwicmVzdGl0dXRpb24iLCJiYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsIiwiU3RhbmRhcmRNYXRlcmlhbCIsImRpZmZ1c2VDb2xvciIsIm1hdGVyaWFsIiwiUmVkIiwic2NvcmVCb2FyZE1hdGVyaWFsIiwic2NvcmVCb2FyZFRleHR1cmUiLCJEeW5hbWljVGV4dHVyZSIsInNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dCIsImdldENvbnRleHQiLCJkaWZmdXNlVGV4dHVyZSIsImVtaXNzaXZlQ29sb3IiLCJzcGVjdWxhckNvbG9yIiwiZHJhd1RleHQiLCJwbGF5aW5nQmFsbCIsIm9uVHJpZ2dlckVudGVyIiwiYmluZCIsImJhbGxJbXBvc3RlciIsInJlZ2lzdGVyT25QaHlzaWNzQ29sbGlkZSIsImJhbGxSZXNldEltcG9zdGVyIiwiY29sbGlkZWRBZ2FpbnN0Iiwic2V0TGluZWFyVmVsb2NpdHkiLCJaZXJvIiwic2V0QW5ndWxhclZlbG9jaXR5IiwiZ2V0T2JqZWN0Q2VudGVyIiwieiIsInJlc2V0QmFsbFN0YXRzIiwicmVzZXRQYWRkbGUiLCJjbGVhclJlY3QiLCJyZXNldEdhbWUiLCJCYWxsIiwic3Bhd25Qb3NpdGlvbiIsImJhbGxJZCIsImNvbG9yIiwibWluQmFsbFNwZWVkIiwibWF4QmFsbFNwZWVkIiwiYmFsbCIsIkNyZWF0ZVNwaGVyZSIsInNlZ21lbnRzIiwiZGlhbWV0ZXIiLCJTcGhlcmVJbXBvc3RvciIsInVuaXF1ZUlkIiwiaW5pdGlhbFBvc2l0aW9uIiwiY2xvbmUiLCJpc0xhdW5jaGVkIiwicGxheWVyUGFkZGxlVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ4IiwiTWF0aCIsInJhbmRvbSIsImltcG9zdGVyc0FycmF5IiwiYmFsbFBoeXNpY3NJbXBvc3RlciIsInZlbG9jaXR5WCIsImdldExpbmVhclZlbG9jaXR5IiwidmVsb2NpdHlYQmFsbCIsInZlbG9jaXR5WiIsInZlbG9jaXR5IiwidmVsb2NpdHlaQWJzIiwiYWJzIiwiY2xhbXBlZFZlbG9jaXR5WiIsIk1hdGhUb29scyIsIkNsYW1wIiwiZGlyZWN0aW9uIiwic2lnbiIsInZlbG9jaXR5WSIsInkiLCJsaW1pdEJhbGxWZWxvY2l0eSIsImxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlIiwibGF1bmNoQmFsbCIsIlBhZGRsZSIsIm5hbWUiLCJwYWRkbGVJZCIsImlzQUkiLCJrZXlzIiwicGFkZGxlIiwiQ3JlYXRlQm94IiwiZGVwdGgiLCJtb3ZlbWVudFNwZWVkIiwiTGVmdCIsInNjYWxlIiwiUmlnaHQiLCJiYWxsQ2xhc3MiLCJkZXNpcmVkRGlyZWN0aW9uIiwibW92ZVBhZGRsZSIsIm1vdmVQYWRkbGVBSSIsImNhbnZhc0hvbGRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjYW52YXMiLCJjcmVhdGVFbGVtZW50Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYXBwZW5kQ2hpbGQiLCJlbmdpbmUiLCJFbmdpbmUiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJrZXlDb2RlIiwiY3JlYXRlU2NlbmUiLCJTY2VuZSIsImVuYWJsZVBoeXNpY3MiLCJDYW5ub25KU1BsdWdpbiIsImNvbGxpc2lvbnNFbmFibGVkIiwid29ya2VyQ29sbGlzaW9ucyIsImNsZWFyQ29sb3IiLCJCbGFjayIsImxpZ2h0IiwiSGVtaXNwaGVyaWNMaWdodCIsImdyb3VuZCIsImxlZnRCYXIiLCJyaWdodEJhciIsImNyZWF0ZUdhbWVTdGFydE9iamVjdHMiLCJzY2VuZU9iamVjdCIsImNyZWF0ZUdhbWVFbmRPYmplY3RzIiwiY2FtZXJhIiwiRnJlZUNhbWVyYSIsInN0YXJ0VG9HYW1lIiwiQW5pbWF0aW9uIiwiQU5JTUFUSU9OVFlQRV9GTE9BVCIsIkFOSU1BVElPTkxPT1BNT0RFX0NZQ0xFIiwic3RhcnRUb0dhbWVLZXlzIiwiZnJhbWUiLCJ2YWx1ZSIsInNldEtleXMiLCJnYW1lVG9FbmQiLCJnYW1lVG9FbmRLZXlzIiwiYW5pbWF0aW9ucyIsInB1c2giLCJwbGF5ZXJfMSIsImFpUGxheWVyIiwic2V0Q29sbGlzaW9uQ29tcG9uZW50cyIsImdhbWVNYW5hZ2VyIiwicnVuUmVuZGVyTG9vcCIsInVwZGF0ZSIsInJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBRU1BLFc7QUFDRix5QkFBWUMsS0FBWixFQUFtQkMsZUFBbkIsRUFBb0NDLFNBQXBDLEVBQStDQyxTQUEvQyxFQUEwRDtBQUFBOztBQUN0RCxhQUFLQyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsYUFBS0MsY0FBTCxHQUFzQixDQUF0QjtBQUNBLGFBQUtDLGdCQUFMLEdBQXdCLENBQXhCOztBQUVBLGFBQUtDLFVBQUwsR0FBa0JDLFFBQVFDLFdBQVIsQ0FBb0JDLFdBQXBCLENBQWdDLFlBQWhDLEVBQThDO0FBQzVEQyxvQkFBUSxFQURvRDtBQUU1REMsbUJBQU8sRUFGcUQ7QUFHNURDLDZCQUFpQkwsUUFBUU0sSUFBUixDQUFhQztBQUg4QixTQUE5QyxFQUlmZixLQUplLENBQWxCO0FBS0EsYUFBS08sVUFBTCxDQUFnQlMsUUFBaEIsR0FBMkIsSUFB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ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEdhbWVNYW5hZ2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBiYWxsQ2xhc3NPYmplY3QsIHBhZGRsZU9uZSwgcGFkZGxlVHdvKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJUd29TY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhTY29yZVBvc3NpYmxlID0gNTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVQbGFuZSgnc2NvcmVCb2FyZCcsIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgICAgICBzaWRlT3JpZW50YXRpb246IEJBQllMT04uTWVzaC5ET1VCTEVTSURFXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZC5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTYsIDM2KTtcclxuICAgICAgICB0aGlzLmhpZ2hsaWdodExheWVyID0gbmV3IEJBQllMT04uSGlnaGxpZ2h0TGF5ZXIoJ3Njb3JlQm9hcmRIaWdobGlnaHQnLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXllci5hZGRNZXNoKHRoaXMuc2NvcmVCb2FyZCwgbmV3IEJBQllMT04uQ29sb3IzKDEsIDAuNDEsIDApKTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kKCdiYWxsQ29sbGlkZXInLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA2NCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyMDAsXHJcbiAgICAgICAgICAgIHN1YmRpdmlzaW9uczogMlxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAtMiwgMCk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgncmVzZXRNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIubWF0ZXJpYWwgPSB0aGlzLmJhbGxSZXNldENvbGxpZGVyTWF0ZXJpYWw7XHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXllci5hZGRNZXNoKHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIsIEJBQllMT04uQ29sb3IzLlJlZCgpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdzY29yZUJvYXJkTWF0ZXJpYWwnLCBzY2VuZSk7XHJcbiAgICAgICAgLy8gT3B0aW9ucyBpcyB0byBzZXQgdGhlIHJlc29sdXRpb24gLSBPciBzb21ldGhpbmcgbGlrZSB0aGF0XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZSA9IG5ldyBCQUJZTE9OLkR5bmFtaWNUZXh0dXJlKCdzY29yZUJvYXJkTWF0ZXJpYWxEeW5hbWljJywgMTAyNCwgc2NlbmUsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmVDb250ZXh0ID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmVtaXNzaXZlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWwuc3BlY3VsYXJDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLCAwKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmQubWF0ZXJpYWwgPSB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbDtcclxuXHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dCgnU2NvcmVzJywgMzMwLCAxNTAsIGBzbWFsbC1jYXBzIGJvbGRlciAxMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dCgnUGxheWVyIDEnLCA1MCwgNDAwLCBgOTBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkVGV4dHVyZS5kcmF3VGV4dCgnUGxheWVyIDInLCA2MjAsIDQwMCwgYDkwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJPbmVTY29yZX1gLCAxNTAsIDcwMCwgYCBib2xkZXIgMjAwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJUd29TY29yZX1gLCA3MzAsIDcwMCwgYGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsID0gYmFsbENsYXNzT2JqZWN0O1xyXG4gICAgICAgIHRoaXMucGFkZGxlT25lID0gcGFkZGxlT25lO1xyXG4gICAgICAgIHRoaXMucGFkZGxlVHdvID0gcGFkZGxlVHdvO1xyXG5cclxuICAgICAgICB0aGlzLm9uVHJpZ2dlckVudGVyID0gdGhpcy5vblRyaWdnZXJFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbGxpc2lvbkNvbXBvbmVudHMoYmFsbEltcG9zdGVyKSB7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5waHlzaWNzSW1wb3N0b3IucmVnaXN0ZXJPblBoeXNpY3NDb2xsaWRlKGJhbGxJbXBvc3RlciwgdGhpcy5vblRyaWdnZXJFbnRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRW50ZXIoYmFsbFJlc2V0SW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xyXG4gICAgICAgIGJhbGxSZXNldEltcG9zdGVyLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIGJhbGxSZXNldEltcG9zdGVyLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbGxpZGVkQWdhaW5zdC5nZXRPYmplY3RDZW50ZXIoKS56IDwgLTM0KVxyXG4gICAgICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlKys7XHJcbiAgICAgICAgZWxzZSBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPiAzNClcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJPbmVTY29yZSsrO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsLnJlc2V0QmFsbFN0YXRzKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUucmVzZXRQYWRkbGUoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZVR3by5yZXNldFBhZGRsZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlQ29udGV4dC5jbGVhclJlY3QoMCwgNTAwLCAxMDI0LCAxMDI0KTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRUZXh0dXJlLmRyYXdUZXh0KGAke3RoaXMucGxheWVyT25lU2NvcmV9YCwgMTUwLCA3MDAsIGBib2xkZXIgMjAwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnI2ZmNmEwMCcpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoYCR7dGhpcy5wbGF5ZXJUd29TY29yZX1gLCA3MzAsIDcwMCwgYGJvbGRlciAyMDBweCAnUXVpY2tzYW5kJywgc2Fucy1zZXJpZmAsICcjZmY2YTAwJyk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBsYXllck9uZVNjb3JlID4gdGhpcy5tYXhTY29yZVBvc3NpYmxlIHx8IHRoaXMucGxheWVyVHdvU2NvcmUgPiB0aGlzLm1heFNjb3JlUG9zc2libGUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNldEdhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXRHYW1lKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENvbXBsZXRlIFRoaXMgRnVuY3Rpb25cclxuICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLnBsYXllclR3b1Njb3JlID0gMDtcclxuICAgICAgICB0aGlzLnBsYXlpbmdCYWxsLnJlc2V0QmFsbFN0YXRzKCk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUucmVzZXRQYWRkbGUoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZVR3by5yZXNldFBhZGRsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIEJhbGwge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIHNwYXduUG9zaXRpb24sIGJhbGxJZCwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5taW5CYWxsU3BlZWQgPSA1O1xyXG4gICAgICAgIHRoaXMubWF4QmFsbFNwZWVkID0gMjA7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKCdwbGF5QmFsbCcsIHtcclxuICAgICAgICAgICAgc2VnbWVudHM6IDE2LFxyXG4gICAgICAgICAgICBkaWFtZXRlcjogMVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLmJhbGwsXHJcbiAgICAgICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2VuZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnVuaXF1ZUlkID0gYmFsbElkO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHNwYXduUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBsYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzMyXSkge1xyXG4gICAgICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgICAgIG5ldyBCQUJZTE9OLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGFkZGxlVmVsb2NpdHkueCxcclxuICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiAxMFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xsaXNpb25Db21wb25lbnRzKGltcG9zdGVyc0FycmF5KSB7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoaW1wb3N0ZXJzQXJyYXksIHRoaXMub25UcmlnZ2VyRW50ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJpZ2dlckVudGVyKGJhbGxQaHlzaWNzSW1wb3N0ZXIsIGNvbGxpZGVkQWdhaW5zdCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSBjb2xsaWRlZEFnYWluc3QuZ2V0TGluZWFyVmVsb2NpdHkoKS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVhCYWxsID0gYmFsbFBoeXNpY3NJbXBvc3Rlci5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IC1iYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkuejtcclxuXHJcbiAgICAgICAgYmFsbFBoeXNpY3NJbXBvc3Rlci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCAtIHZlbG9jaXR5WEJhbGwsXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlaXHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICBjb2xsaWRlZEFnYWluc3Quc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxpbWl0QmFsbFZlbG9jaXR5KCkge1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eSA9IHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKTtcclxuXHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WiA9IHZlbG9jaXR5Lno7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WkFicyA9IE1hdGguYWJzKHZlbG9jaXR5Wik7XHJcbiAgICAgICAgbGV0IGNsYW1wZWRWZWxvY2l0eVogPSBCQUJZTE9OLk1hdGhUb29scy5DbGFtcCh2ZWxvY2l0eVpBYnMsIHRoaXMubWluQmFsbFNwZWVkLCB0aGlzLm1heEJhbGxTcGVlZCk7XHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IE1hdGguc2lnbih2ZWxvY2l0eVopO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlYID0gdmVsb2NpdHkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlZID0gdmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShcclxuICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WCxcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5WSxcclxuICAgICAgICAgICAgICAgIGNsYW1wZWRWZWxvY2l0eVogKiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xhdW5jaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRCYWxsVmVsb2NpdHkoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlKHBsYXllclBhZGRsZVZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdGhpcy5sYXVuY2hCYWxsKGtleVN0YXRlcywgcGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldEJhbGxTdGF0cygpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pc0xhdW5jaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuXHJcbmNsYXNzIFBhZGRsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBzY2VuZSwgc3Bhd25Qb3NpdGlvbiwgcGFkZGxlSWQsIGlzQUksIGtleXMgPSBbMzcsIDM5XSwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveChgcGFkZGxlXyR7bmFtZX1gLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDEsXHJcbiAgICAgICAgICAgIGRlcHRoOiAxXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NlbmVcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBwYWRkbGVJZDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBzcGF3blBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDU7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuXHJcbiAgICAgICAgdGhpcy5pc0FJID0gaXNBSTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUGFkZGxlKGtleVN0YXRlcykge1xyXG4gICAgICAgIGlmIChrZXlTdGF0ZXNbdGhpcy5rZXlzWzBdXSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuUmlnaHQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoIWtleVN0YXRlc1t0aGlzLmtleXNbMF1dICYmICFrZXlTdGF0ZXNbdGhpcy5rZXlzWzFdXSkgfHxcclxuICAgICAgICAgICAgKGtleVN0YXRlc1t0aGlzLmtleXNbMF1dICYmIGtleVN0YXRlc1t0aGlzLmtleXNbMV1dKSlcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVQYWRkbGVBSShiYWxsQ2xhc3MpIHtcclxuICAgICAgICBpZiAoYmFsbENsYXNzLmlzTGF1bmNoZWQpIHtcclxuICAgICAgICAgICAgbGV0IGRlc2lyZWREaXJlY3Rpb24gPSBNYXRoLnNpZ24oYmFsbENsYXNzLmJhbGwucG9zaXRpb24ueCAtIHRoaXMucGFkZGxlLnBvc2l0aW9uLngpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc2lyZWREaXJlY3Rpb24gPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlJpZ2h0KCkuc2NhbGUodGhpcy5tb3ZlbWVudFNwZWVkKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgYmFsbENsYXNzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzQUkpXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZShrZXlTdGF0ZXMpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5tb3ZlUGFkZGxlQUkoYmFsbENsYXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldFBhZGRsZSgpIHtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5wb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLy4uLy4uL3R5cGluZ3MvYmFieWxvbi5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcGFkZGxlLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vYmFsbC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2dhbWUtbWFuYWdlci5qc1wiIC8+XHJcblxyXG4vLyBUb0RvOiBSZW1vdmUgYHNob3dCb3VuZGluZ0JveGAgZnJvbSBhbGwgYm9kaWVzXHJcblxyXG5jb25zdCBjYW52YXNIb2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzLWhvbGRlcicpO1xyXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAyNTtcclxuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDMwO1xyXG5jYW52YXNIb2xkZXIuYXBwZW5kQ2hpbGQoY2FudmFzKTtcclxuY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcblxyXG5jb25zdCBrZXlTdGF0ZXMgPSB7XHJcbiAgICAzMjogZmFsc2UsIC8vIFNQQUNFXHJcbiAgICAzNzogZmFsc2UsIC8vIExFRlRcclxuICAgIDM4OiBmYWxzZSwgLy8gVVBcclxuICAgIDM5OiBmYWxzZSwgLy8gUklHSFRcclxuICAgIDQwOiBmYWxzZSwgLy8gRE9XTlxyXG4gICAgODc6IGZhbHNlLCAvLyBXXHJcbiAgICA2NTogZmFsc2UsIC8vIEFcclxuICAgIDgzOiBmYWxzZSwgLy8gU1xyXG4gICAgNjg6IGZhbHNlIC8vIERcclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XHJcbn0pO1xyXG5cclxuY29uc3QgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIHNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcclxuICAgIHNjZW5lLndvcmtlckNvbGxpc2lvbnMgPSB0cnVlO1xyXG4gICAgc2NlbmUuY2xlYXJDb2xvciA9IEJBQllMT04uQ29sb3IzLkJsYWNrKCk7XHJcblxyXG4gICAgY29uc3QgbGlnaHQgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KCdtYWluTGlnaHQnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDEsIDApLCBzY2VuZSk7XHJcblxyXG4gICAgY29uc3QgZ3JvdW5kID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ21haW5Hcm91bmQnLCB7XHJcbiAgICAgICAgd2lkdGg6IDMyLFxyXG4gICAgICAgIGhlaWdodDogNzAsXHJcbiAgICAgICAgc3ViZGl2aXNpb25zOiAyXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBncm91bmQucG9zaXRpb24gPSBCQUJZTE9OLlZlY3RvcjMuWmVybygpO1xyXG4gICAgZ3JvdW5kLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICBncm91bmQsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgnbGVmdEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICBsZWZ0QmFyLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTUsIDEsIDApO1xyXG4gICAgbGVmdEJhci5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgbGVmdEJhcixcclxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICBjb25zdCByaWdodEJhciA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlQm94KCdyaWdodEJhcicsIHtcclxuICAgICAgICB3aWR0aDogMixcclxuICAgICAgICBoZWlnaHQ6IDIsXHJcbiAgICAgICAgZGVwdGg6IDcwXHJcbiAgICB9LCBzY2VuZSk7XHJcbiAgICByaWdodEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMTUsIDEsIDApO1xyXG4gICAgcmlnaHRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgIHJpZ2h0QmFyLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZUdhbWVTdGFydE9iamVjdHMgPSAoc2NlbmVPYmplY3QpID0+IHtcclxuXHJcbn07XHJcblxyXG5jb25zdCBjcmVhdGVHYW1lRW5kT2JqZWN0cyA9IChzY2VuZU9iamVjdCkgPT4ge1xyXG5cclxufTtcclxuXHJcbmNvbnN0IHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcclxuXHJcbmNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkZyZWVDYW1lcmEoJ21haW5DYW1lcmEnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDkwLCAyMCwgLTYwKSwgc2NlbmUpO1xyXG5jb25zdCBzdGFydFRvR2FtZSA9IG5ldyBCQUJZTE9OLkFuaW1hdGlvbignc3RhcnRUb0dhbWUnLCAncG9zaXRpb24ueCcsXHJcbiAgICAzMCwgQkFCWUxPTi5BbmltYXRpb24uQU5JTUFUSU9OVFlQRV9GTE9BVCwgQkFCWUxPTi5BbmltYXRpb24uQU5JTUFUSU9OTE9PUE1PREVfQ1lDTEUpO1xyXG5jb25zdCBzdGFydFRvR2FtZUtleXMgPSBbe1xyXG4gICAgZnJhbWU6IDAsXHJcbiAgICB2YWx1ZTogOTBcclxufSwge1xyXG4gICAgZnJhbWU6IDEwMCxcclxuICAgIHZhbHVlOiAwXHJcbn1dO1xyXG5zdGFydFRvR2FtZS5zZXRLZXlzKHN0YXJ0VG9HYW1lS2V5cyk7XHJcbmNvbnN0IGdhbWVUb0VuZCA9IG5ldyBCQUJZTE9OLkFuaW1hdGlvbignZ2FtZVRvRW5kJywgJ3Bvc2l0aW9uLngnLFxyXG4gICAgMzAsIEJBQllMT04uQW5pbWF0aW9uLkFOSU1BVElPTlRZUEVfRkxPQVQsIEJBQllMT04uQW5pbWF0aW9uLkFOSU1BVElPTkxPT1BNT0RFX0NZQ0xFKTtcclxuY29uc3QgZ2FtZVRvRW5kS2V5cyA9IFt7XHJcbiAgICBmcmFtZTogMCxcclxuICAgIHZhbHVlOiAyMFxyXG59LCB7XHJcbiAgICBmcmFtZTogMTAwLFxyXG4gICAgdmFsdWU6IDE0MFxyXG59XTtcclxuZ2FtZVRvRW5kLnNldEtleXMoZ2FtZVRvRW5kS2V5cyk7XHJcbmNhbWVyYS5hbmltYXRpb25zID0gW107XHJcbmNhbWVyYS5hbmltYXRpb25zLnB1c2goc3RhcnRUb0dhbWUpO1xyXG5jYW1lcmEuYW5pbWF0aW9ucy5wdXNoKGdhbWVUb0VuZCk7XHJcbi8vIHNjZW5lLmJlZ2luRGlyZWN0QW5pbWF0aW9uKGNhbWVyYSwgW3N0YXJ0VG9HYW1lXSwgMCwgMTAwLCB0cnVlKTtcclxuLy8gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNClcclxuXHJcbmNvbnN0IHBsYXllcl8xID0gbmV3IFBhZGRsZSgncGxheWVyXzEnLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNCksIDIsIGZhbHNlKTtcclxuY29uc3QgYWlQbGF5ZXIgPSBuZXcgUGFkZGxlKCdhaVBsYXllcicsIHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgMzQpLCAzLCB0cnVlKTtcclxuXHJcbmNvbnN0IHBsYXlpbmdCYWxsID0gbmV3IEJhbGwoc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzMpLCAxKTtcclxucGxheWluZ0JhbGwuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhbcGxheWVyXzEucGFkZGxlLnBoeXNpY3NJbXBvc3RvciwgYWlQbGF5ZXIucGFkZGxlLnBoeXNpY3NJbXBvc3Rvcl0pO1xyXG5cclxuY29uc3QgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoc2NlbmUsIHBsYXlpbmdCYWxsLCBwbGF5ZXJfMSwgYWlQbGF5ZXIpO1xyXG5nYW1lTWFuYWdlci5zZXRDb2xsaXNpb25Db21wb25lbnRzKHBsYXlpbmdCYWxsLmJhbGwucGh5c2ljc0ltcG9zdG9yKTtcclxuXHJcbmVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgIHBsYXlpbmdCYWxsLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKSk7XHJcbiAgICBwbGF5ZXJfMS51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XHJcbiAgICBhaVBsYXllci51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbCk7XHJcblxyXG4gICAgZ2FtZU1hbmFnZXIudXBkYXRlKCk7XHJcbiAgICBzY2VuZS5yZW5kZXIoKTtcclxufSk7Il19
