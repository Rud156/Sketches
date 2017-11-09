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
        this.ballResetCollider.showBoundingBox = true;

        this.ballResetColliderMaterial = new BABYLON.StandardMaterial('resetMaterial', scene);
        this.ballResetColliderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.ballResetCollider.material = this.ballResetColliderMaterial;

        this.scoreBoardMaterial = new BABYLON.StandardMaterial('scoreBoardMaterial', scene);

        this.scoreBoardTexture = new BABYLON.DynamicTexture('scoreBoardMaterialDynamic', 512, scene, true);
        this.scoreBoardMaterial.diffuseTexture = this.scoreBoardTexture;
        this.scoreBoardMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.scoreBoardMaterial.specularColor = new BABYLON.Color3(1, 0, 0);
        this.scoreBoard.material = this.scoreBoardMaterial;

        this.scoreBoardTexture.drawText('Scores', 155, 75, 'bold 60px \'Quicksand\', sans-serif', 'white');

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

            if (this.playerOneScore > this.maxScorePossible || this.playerTwoScore > this.maxScorePossible) {}
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
        var color = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;

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

        this.isAI = isAI;
    }

    _createClass(Paddle, [{
        key: 'movePaddle',
        value: function movePaddle(keyStates) {
            if (keyStates[37]) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
            } else if (keyStates[39]) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
            }

            if (!keyStates[37] && !keyStates[39] || keyStates[37] && keyStates[39]) this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        }
    }, {
        key: 'movePaddleAI',
        value: function movePaddleAI(ballMesh) {
            var desiredDirection = Math.sign(ballMesh.position.x - this.paddle.position.x);

            if (desiredDirection === -1) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Left().scale(this.movementSpeed));
            } else if (desiredDirection === 1) {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Right().scale(this.movementSpeed));
            } else {
                this.paddle.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            }
        }
    }, {
        key: 'update',
        value: function update(keyStates, ball) {
            if (!this.isAI) this.movePaddle(keyStates);else this.movePaddleAI(ball);

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
    40: false };
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


var player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
var aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

var playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

var gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);

engine.runRenderLoop(function () {
    playingBall.update(keyStates, player_1.paddle.physicsImpostor.getLinearVelocity());
    player_1.update(keyStates, playingBall.ball);
    aiPlayer.update(keyStates, playingBall.ball);

    gameManager.update();
    scene.render();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyJdLCJuYW1lcyI6WyJHYW1lTWFuYWdlciIsInNjZW5lIiwiYmFsbENsYXNzT2JqZWN0IiwicGFkZGxlT25lIiwicGFkZGxlVHdvIiwicGxheWVyT25lU2NvcmUiLCJwbGF5ZXJUd29TY29yZSIsIm1heFNjb3JlUG9zc2libGUiLCJzY29yZUJvYXJkIiwiQkFCWUxPTiIsIk1lc2hCdWlsZGVyIiwiQ3JlYXRlUGxhbmUiLCJoZWlnaHQiLCJ3aWR0aCIsInNpZGVPcmllbnRhdGlvbiIsIk1lc2giLCJET1VCTEVTSURFIiwicG9zaXRpb24iLCJWZWN0b3IzIiwiYmFsbFJlc2V0Q29sbGlkZXIiLCJDcmVhdGVHcm91bmQiLCJzdWJkaXZpc2lvbnMiLCJwaHlzaWNzSW1wb3N0b3IiLCJQaHlzaWNzSW1wb3N0b3IiLCJCb3hJbXBvc3RvciIsIm1hc3MiLCJmcmljdGlvbiIsInJlc3RpdHV0aW9uIiwic2hvd0JvdW5kaW5nQm94IiwiYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbCIsIlN0YW5kYXJkTWF0ZXJpYWwiLCJkaWZmdXNlQ29sb3IiLCJDb2xvcjMiLCJtYXRlcmlhbCIsInNjb3JlQm9hcmRNYXRlcmlhbCIsInNjb3JlQm9hcmRUZXh0dXJlIiwiRHluYW1pY1RleHR1cmUiLCJkaWZmdXNlVGV4dHVyZSIsImVtaXNzaXZlQ29sb3IiLCJzcGVjdWxhckNvbG9yIiwiZHJhd1RleHQiLCJwbGF5aW5nQmFsbCIsIm9uVHJpZ2dlckVudGVyIiwiYmluZCIsImJhbGxJbXBvc3RlciIsInJlZ2lzdGVyT25QaHlzaWNzQ29sbGlkZSIsImJhbGxSZXNldEltcG9zdGVyIiwiY29sbGlkZWRBZ2FpbnN0Iiwic2V0TGluZWFyVmVsb2NpdHkiLCJaZXJvIiwic2V0QW5ndWxhclZlbG9jaXR5IiwiZ2V0T2JqZWN0Q2VudGVyIiwieiIsInJlc2V0QmFsbFN0YXRzIiwicmVzZXRQYWRkbGUiLCJCYWxsIiwic3Bhd25Qb3NpdGlvbiIsImJhbGxJZCIsImNvbG9yIiwibWluQmFsbFNwZWVkIiwibWF4QmFsbFNwZWVkIiwiYmFsbCIsIkNyZWF0ZVNwaGVyZSIsInNlZ21lbnRzIiwiZGlhbWV0ZXIiLCJTcGhlcmVJbXBvc3RvciIsInVuaXF1ZUlkIiwiaW5pdGlhbFBvc2l0aW9uIiwiY2xvbmUiLCJpc0xhdW5jaGVkIiwicGxheWVyUGFkZGxlVmVsb2NpdHkiLCJrZXlTdGF0ZXMiLCJ4IiwiTWF0aCIsInJhbmRvbSIsImltcG9zdGVyc0FycmF5IiwiYmFsbFBoeXNpY3NJbXBvc3RlciIsInZlbG9jaXR5WCIsImdldExpbmVhclZlbG9jaXR5IiwidmVsb2NpdHlYQmFsbCIsInZlbG9jaXR5WiIsInZlbG9jaXR5IiwidmVsb2NpdHlaQWJzIiwiYWJzIiwiY2xhbXBlZFZlbG9jaXR5WiIsIk1hdGhUb29scyIsIkNsYW1wIiwiZGlyZWN0aW9uIiwic2lnbiIsInZlbG9jaXR5WSIsInkiLCJsaW1pdEJhbGxWZWxvY2l0eSIsImxvY2tQb3NpdGlvblRvUGxheWVyUGFkZGxlIiwibGF1bmNoQmFsbCIsIlBhZGRsZSIsIm5hbWUiLCJwYWRkbGVJZCIsImlzQUkiLCJwYWRkbGUiLCJDcmVhdGVCb3giLCJkZXB0aCIsIm1vdmVtZW50U3BlZWQiLCJMZWZ0Iiwic2NhbGUiLCJSaWdodCIsImJhbGxNZXNoIiwiZGVzaXJlZERpcmVjdGlvbiIsIm1vdmVQYWRkbGUiLCJtb3ZlUGFkZGxlQUkiLCJjYW52YXNIb2xkZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY2FudmFzIiwiY3JlYXRlRWxlbWVudCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImFwcGVuZENoaWxkIiwiZW5naW5lIiwiRW5naW5lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwia2V5Q29kZSIsImNyZWF0ZVNjZW5lIiwiU2NlbmUiLCJlbmFibGVQaHlzaWNzIiwiQ2Fubm9uSlNQbHVnaW4iLCJjb2xsaXNpb25zRW5hYmxlZCIsIndvcmtlckNvbGxpc2lvbnMiLCJjYW1lcmEiLCJGcmVlQ2FtZXJhIiwic2V0VGFyZ2V0IiwibGlnaHQiLCJIZW1pc3BoZXJpY0xpZ2h0IiwiZ3JvdW5kIiwibGVmdEJhciIsInJpZ2h0QmFyIiwicGxheWVyXzEiLCJhaVBsYXllciIsInNldENvbGxpc2lvbkNvbXBvbmVudHMiLCJnYW1lTWFuYWdlciIsInJ1blJlbmRlckxvb3AiLCJ1cGRhdGUiLCJyZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUVNQSxXO0FBQ0YseUJBQVlDLEtBQVosRUFBbUJDLGVBQW5CLEVBQW9DQyxTQUFwQyxFQUErQ0MsU0FBL0MsRUFBMEQ7QUFBQTs7QUFDdEQsYUFBS0MsY0FBTCxHQUFzQixDQUF0QjtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxhQUFLQyxnQkFBTCxHQUF3QixDQUF4Qjs7QUFFQSxhQUFLQyxVQUFMLEdBQWtCQyxRQUFRQyxXQUFSLENBQW9CQyxXQUFwQixDQUFnQyxZQUFoQyxFQUE4QztBQUM1REMsb0JBQVEsRUFEb0Q7QUFFNURDLG1CQUFPLEVBRnFEO0FBRzVEQyw2QkFBaUJMLFFBQVFNLElBQVIsQ0FBYUM7QUFIOEIsU0FBOUMsRUFJZmYsS0FKZSxDQUFsQjtBQUtBLGFBQUtPLFVBQUwsQ0FBZ0JTLFFBQWhCLEdBQTJCLElBQUlSLFFBQVFTLE9BQVosQ0FBb0IsQ0FBcEIsRUFBdUIsRUFBdkIsRUFBMkIsRUFBM0IsQ0FBM0I7O0FBRUEsYUFBS0MsaUJBQUwsR0FBeUJWLFFBQVFDLFdBQVIsQ0FBb0JVLFlBQXBCLENBQWlDLGNBQWpDLEVBQWlEO0FBQ3RFUCxtQkFBTyxFQUQrRDtBQUV0RUQsb0JBQVEsR0FGOEQ7QUFHdEVTLDBCQUFjO0FBSHdELFNBQWpELEVBSXRCcEIsS0FKc0IsQ0FBekI7QUFLQSxhQUFLa0IsaUJBQUwsQ0FBdUJGLFFBQXZCLEdBQWtDLElBQUlSLFFBQVFTLE9BQVosQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBQyxDQUF4QixFQUEyQixDQUEzQixDQUFsQztBQUNBLGFBQUtDLGlCQUFMLENBQXVCRyxlQUF2QixHQUF5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LGFBQVNLLE1BQVQsQ0FBZ0J2RSxTQUFoQixFQUEyQjlCLFlBQVlvQixJQUF2QztBQUNBNkUsYUFBU0ksTUFBVCxDQUFnQnZFLFNBQWhCLEVBQTJCOUIsWUFBWW9CLElBQXZDOztBQUVBK0UsZ0JBQVlFLE1BQVo7QUFDQTdJLFVBQU04SSxNQUFOO0FBQ0gsQ0FQRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi8uLi8uLi90eXBpbmdzL2JhYnlsb24uZC50c1wiIC8+XHJcblxyXG5jbGFzcyBHYW1lTWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgYmFsbENsYXNzT2JqZWN0LCBwYWRkbGVPbmUsIHBhZGRsZVR3bykge1xyXG4gICAgICAgIHRoaXMucGxheWVyT25lU2NvcmUgPSAwO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUgPSAwO1xyXG4gICAgICAgIHRoaXMubWF4U2NvcmVQb3NzaWJsZSA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlUGxhbmUoJ3Njb3JlQm9hcmQnLCB7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTYsXHJcbiAgICAgICAgICAgIHdpZHRoOiAzMixcclxuICAgICAgICAgICAgc2lkZU9yaWVudGF0aW9uOiBCQUJZTE9OLk1lc2guRE9VQkxFU0lERVxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmQucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDE2LCAzNik7XHJcblxyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnYmFsbENvbGxpZGVyJywge1xyXG4gICAgICAgICAgICB3aWR0aDogNjQsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjAwLFxyXG4gICAgICAgICAgICBzdWJkaXZpc2lvbnM6IDJcclxuICAgICAgICB9LCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTIsIDApO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlci5zaG93Qm91bmRpbmdCb3ggPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBDaGFuZ2UgdG8gdHJhbnNwYXJlbnQgbWF0ZXJpYWxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB2YXIgb3V0cHV0cGxhbmVUZXh0dXJlID0gbmV3IEJBQllMT04uRHluYW1pY1RleHR1cmUoXCJkeW5hbWljIHRleHR1cmVcIiwgNTEyLCBzY2VuZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIG91dHB1dHBsYW5lLm1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gb3V0cHV0cGxhbmVUZXh0dXJlO1xyXG4gICAgICAgICAgICBvdXRwdXRwbGFuZS5tYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xyXG4gICAgICAgICAgICBvdXRwdXRwbGFuZS5tYXRlcmlhbC5lbWlzc2l2ZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpO1xyXG4gICAgICAgICAgICBvdXRwdXRwbGFuZS5tYXRlcmlhbC5iYWNrRmFjZUN1bGxpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gb3V0cHV0cGxhbmVUZXh0dXJlLmdldENvbnRleHQoKVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNjZW5lLnJlZ2lzdGVyQmVmb3JlUmVuZGVyKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIDUxMiwgNTEyKTtcclxuICAgICAgICAgICAgICAgIG91dHB1dHBsYW5lVGV4dHVyZS5kcmF3VGV4dChzcGhlcmUucG9zaXRpb24ueC50b0ZpeGVkKDIpLCBudWxsLCAxNDAsIFwiYm9sZCA4MHB4IHZlcmRhbmFcIiwgXCJ3aGl0ZVwiKTtcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi54ICs9IDAuMDE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXJNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Jlc2V0TWF0ZXJpYWwnLCBzY2VuZSk7XHJcbiAgICAgICAgdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKTtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLm1hdGVyaWFsID0gdGhpcy5iYWxsUmVzZXRDb2xsaWRlck1hdGVyaWFsO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ3Njb3JlQm9hcmRNYXRlcmlhbCcsIHNjZW5lKTtcclxuICAgICAgICAvLyBPcHRpb25zIGlzIHRvIHNldCB0aGUgcmVzb2x1dGlvblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUgPSBuZXcgQkFCWUxPTi5EeW5hbWljVGV4dHVyZSgnc2NvcmVCb2FyZE1hdGVyaWFsRHluYW1pYycsIDUxMiwgc2NlbmUsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gdGhpcy5zY29yZUJvYXJkVGV4dHVyZTtcclxuICAgICAgICB0aGlzLnNjb3JlQm9hcmRNYXRlcmlhbC5lbWlzc2l2ZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZE1hdGVyaWFsLnNwZWN1bGFyQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5zY29yZUJvYXJkLm1hdGVyaWFsID0gdGhpcy5zY29yZUJvYXJkTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcmVCb2FyZFRleHR1cmUuZHJhd1RleHQoJ1Njb3JlcycsIDE1NSwgNzUsIGBib2xkIDYwcHggJ1F1aWNrc2FuZCcsIHNhbnMtc2VyaWZgLCAnd2hpdGUnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwgPSBiYWxsQ2xhc3NPYmplY3Q7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVPbmUgPSBwYWRkbGVPbmU7XHJcbiAgICAgICAgdGhpcy5wYWRkbGVUd28gPSBwYWRkbGVUd287XHJcblxyXG4gICAgICAgIHRoaXMub25UcmlnZ2VyRW50ZXIgPSB0aGlzLm9uVHJpZ2dlckVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhiYWxsSW1wb3N0ZXIpIHtcclxuICAgICAgICB0aGlzLmJhbGxSZXNldENvbGxpZGVyLnBoeXNpY3NJbXBvc3Rvci5yZWdpc3Rlck9uUGh5c2ljc0NvbGxpZGUoYmFsbEltcG9zdGVyLCB0aGlzLm9uVHJpZ2dlckVudGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRyaWdnZXJFbnRlcihiYWxsUmVzZXRJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgYmFsbFJlc2V0SW1wb3N0ZXIuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgICAgICBpZiAoY29sbGlkZWRBZ2FpbnN0LmdldE9iamVjdENlbnRlcigpLnogPCAtMzQpXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyVHdvU2NvcmUrKztcclxuICAgICAgICBlbHNlIGlmIChjb2xsaWRlZEFnYWluc3QuZ2V0T2JqZWN0Q2VudGVyKCkueiA+IDM0KVxyXG4gICAgICAgICAgICB0aGlzLnBsYXllck9uZVNjb3JlKys7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWluZ0JhbGwucmVzZXRCYWxsU3RhdHMoKTtcclxuICAgICAgICB0aGlzLnBhZGRsZU9uZS5yZXNldFBhZGRsZSgpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlVHdvLnJlc2V0UGFkZGxlKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBsYXllck9uZVNjb3JlID4gdGhpcy5tYXhTY29yZVBvc3NpYmxlIHx8IHRoaXMucGxheWVyVHdvU2NvcmUgPiB0aGlzLm1heFNjb3JlUG9zc2libGUpIHtcclxuICAgICAgICAgICAgLy8gU29tZW9uZSBXaW5zXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IEdhbWUgYW5kIG1vdmUgdG8gb2xkZXIgc2NlbmVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMuYmFsbFJlc2V0Q29sbGlkZXIucGh5c2ljc0ltcG9zdG9yLnNldEFuZ3VsYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgQmFsbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgc3Bhd25Qb3NpdGlvbiwgYmFsbElkLCBjb2xvciA9IDEpIHtcclxuICAgICAgICB0aGlzLm1pbkJhbGxTcGVlZCA9IDU7XHJcbiAgICAgICAgdGhpcy5tYXhCYWxsU3BlZWQgPSAyMDtcclxuXHJcbiAgICAgICAgdGhpcy5iYWxsID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVTcGhlcmUoJ3BsYXlCYWxsJywge1xyXG4gICAgICAgICAgICBzZWdtZW50czogMTYsXHJcbiAgICAgICAgICAgIGRpYW1ldGVyOiAxXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMuYmFsbCxcclxuICAgICAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuU3BoZXJlSW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjZW5lXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24gPSBzcGF3blBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBiYWxsSWQ7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5vblRyaWdnZXJFbnRlciA9IHRoaXMub25UcmlnZ2VyRW50ZXIuYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2NrUG9zaXRpb25Ub1BsYXllclBhZGRsZShwbGF5ZXJQYWRkbGVWZWxvY2l0eSkge1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkocGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxhdW5jaEJhbGwoa2V5U3RhdGVzLCBwbGF5ZXJQYWRkbGVWZWxvY2l0eSkge1xyXG4gICAgICAgIGlmIChrZXlTdGF0ZXNbMzJdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMYXVuY2hlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KFxyXG4gICAgICAgICAgICAgICAgbmV3IEJBQllMT04uVmVjdG9yMyhcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJQYWRkbGVWZWxvY2l0eS54LFxyXG4gICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSAqIDEwXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldENvbGxpc2lvbkNvbXBvbmVudHMoaW1wb3N0ZXJzQXJyYXkpIHtcclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnJlZ2lzdGVyT25QaHlzaWNzQ29sbGlkZShpbXBvc3RlcnNBcnJheSwgdGhpcy5vblRyaWdnZXJFbnRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgb25UcmlnZ2VyRW50ZXIoYmFsbFBoeXNpY3NJbXBvc3RlciwgY29sbGlkZWRBZ2FpbnN0KSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WCA9IGNvbGxpZGVkQWdhaW5zdC5nZXRMaW5lYXJWZWxvY2l0eSgpLng7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5WEJhbGwgPSBiYWxsUGh5c2ljc0ltcG9zdGVyLmdldExpbmVhclZlbG9jaXR5KCkueDtcclxuICAgICAgICBsZXQgdmVsb2NpdHlaID0gLWJhbGxQaHlzaWNzSW1wb3N0ZXIuZ2V0TGluZWFyVmVsb2NpdHkoKS56O1xyXG5cclxuICAgICAgICBiYWxsUGh5c2ljc0ltcG9zdGVyLnNldExpbmVhclZlbG9jaXR5KFxyXG4gICAgICAgICAgICBuZXcgQkFCWUxPTi5WZWN0b3IzKFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlYIC0gdmVsb2NpdHlYQmFsbCxcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eVpcclxuICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgIGNvbGxpZGVkQWdhaW5zdC5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGltaXRCYWxsVmVsb2NpdHkoKSB7XHJcbiAgICAgICAgbGV0IHZlbG9jaXR5ID0gdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpO1xyXG5cclxuICAgICAgICBsZXQgdmVsb2NpdHlaID0gdmVsb2NpdHkuejtcclxuICAgICAgICBsZXQgdmVsb2NpdHlaQWJzID0gTWF0aC5hYnModmVsb2NpdHlaKTtcclxuICAgICAgICBsZXQgY2xhbXBlZFZlbG9jaXR5WiA9IEJBQllMT04uTWF0aFRvb2xzLkNsYW1wKHZlbG9jaXR5WkFicywgdGhpcy5taW5CYWxsU3BlZWQsIHRoaXMubWF4QmFsbFNwZWVkKTtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gTWF0aC5zaWduKHZlbG9jaXR5Wik7XHJcblxyXG4gICAgICAgIGxldCB2ZWxvY2l0eVggPSB2ZWxvY2l0eS54O1xyXG4gICAgICAgIGxldCB2ZWxvY2l0eVkgPSB2ZWxvY2l0eS55O1xyXG5cclxuICAgICAgICB0aGlzLmJhbGwucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KFxyXG4gICAgICAgICAgICBuZXcgQkFCWUxPTi5WZWN0b3IzKFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlYLFxyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHlZLFxyXG4gICAgICAgICAgICAgICAgY2xhbXBlZFZlbG9jaXR5WiAqIGRpcmVjdGlvblxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoa2V5U3RhdGVzLCBwbGF5ZXJQYWRkbGVWZWxvY2l0eSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTGF1bmNoZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEJhbGxWZWxvY2l0eSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9ja1Bvc2l0aW9uVG9QbGF5ZXJQYWRkbGUocGxheWVyUGFkZGxlVmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLmxhdW5jaEJhbGwoa2V5U3RhdGVzLCBwbGF5ZXJQYWRkbGVWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0QmFsbFN0YXRzKCkge1xyXG4gICAgICAgIHRoaXMuYmFsbC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBoeXNpY3NJbXBvc3Rvci5zZXRBbmd1bGFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLlplcm8oKSk7XHJcbiAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmlzTGF1bmNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG5cclxuY2xhc3MgUGFkZGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHNjZW5lLCBzcGF3blBvc2l0aW9uLCBwYWRkbGVJZCwgaXNBSSwgY29sb3IgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5wYWRkbGUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveChgcGFkZGxlXyR7bmFtZX1gLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDEsXHJcbiAgICAgICAgICAgIGRlcHRoOiAxXHJcbiAgICAgICAgfSwgc2NlbmUpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gc3Bhd25Qb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLFxyXG4gICAgICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NlbmVcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IudW5pcXVlSWQgPSBwYWRkbGVJZDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBzcGF3blBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IDU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNBSSA9IGlzQUk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVBhZGRsZShrZXlTdGF0ZXMpIHtcclxuICAgICAgICBpZiAoa2V5U3RhdGVzWzM3XSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleVN0YXRlc1szOV0pIHtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgha2V5U3RhdGVzWzM3XSAmJiAha2V5U3RhdGVzWzM5XSkgfHwgKGtleVN0YXRlc1szN10gJiYga2V5U3RhdGVzWzM5XSkpXHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUGFkZGxlQUkoYmFsbE1lc2gpIHtcclxuICAgICAgICBsZXQgZGVzaXJlZERpcmVjdGlvbiA9IE1hdGguc2lnbihiYWxsTWVzaC5wb3NpdGlvbi54IC0gdGhpcy5wYWRkbGUucG9zaXRpb24ueCk7XHJcblxyXG4gICAgICAgIGlmIChkZXNpcmVkRGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkoQkFCWUxPTi5WZWN0b3IzLkxlZnQoKS5zY2FsZSh0aGlzLm1vdmVtZW50U3BlZWQpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRlc2lyZWREaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wYWRkbGUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5SaWdodCgpLnNjYWxlKHRoaXMubW92ZW1lbnRTcGVlZCkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGtleVN0YXRlcywgYmFsbCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0FJKVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVQYWRkbGUoa2V5U3RhdGVzKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZGRsZUFJKGJhbGwpO1xyXG5cclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0UGFkZGxlKCkge1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShCQUJZTE9OLlZlY3RvcjMuWmVybygpKTtcclxuICAgICAgICB0aGlzLnBhZGRsZS5waHlzaWNzSW1wb3N0b3Iuc2V0QW5ndWxhclZlbG9jaXR5KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG4gICAgICAgIHRoaXMucGFkZGxlLnBvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb24uY2xvbmUoKTtcclxuICAgIH1cclxufVxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vLi4vLi4vdHlwaW5ncy9iYWJ5bG9uLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wYWRkbGUuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9iYWxsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ2FtZS1tYW5hZ2VyLmpzXCIgLz5cclxuXHJcbi8vIFRvRG86IFJlbW92ZSBgc2hvd0JvdW5kaW5nQm94YCBmcm9tIGFsbCBib2RpZXNcclxuXHJcbmNvbnN0IGNhbnZhc0hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMtaG9sZGVyJyk7XHJcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDI1O1xyXG5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gMzA7XHJcbmNhbnZhc0hvbGRlci5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG5jb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcclxuXHJcbmNvbnN0IGtleVN0YXRlcyA9IHtcclxuICAgIDMyOiBmYWxzZSwgLy8gU1BBQ0VcclxuICAgIDM3OiBmYWxzZSwgLy8gTEVGVFxyXG4gICAgMzg6IGZhbHNlLCAvLyBVUFxyXG4gICAgMzk6IGZhbHNlLCAvLyBSSUdIVFxyXG4gICAgNDA6IGZhbHNlIC8vIERPV05cclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlIGluIGtleVN0YXRlcylcclxuICAgICAgICBrZXlTdGF0ZXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSBpbiBrZXlTdGF0ZXMpXHJcbiAgICAgICAga2V5U3RhdGVzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XHJcbn0pO1xyXG5cclxuY29uc3QgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIHNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcclxuICAgIHNjZW5lLndvcmtlckNvbGxpc2lvbnMgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkZyZWVDYW1lcmEoJ21haW5DYW1lcmEnLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDIwLCAtNjApLCBzY2VuZSk7XHJcbiAgICBjYW1lcmEuc2V0VGFyZ2V0KEJBQllMT04uVmVjdG9yMy5aZXJvKCkpO1xyXG5cclxuICAgIGNvbnN0IGxpZ2h0ID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodCgnbWFpbkxpZ2h0JywgbmV3IEJBQllMT04uVmVjdG9yMygwLCAxLCAwKSwgc2NlbmUpO1xyXG5cclxuICAgIGNvbnN0IGdyb3VuZCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kKCdtYWluR3JvdW5kJywge1xyXG4gICAgICAgIHdpZHRoOiAzMixcclxuICAgICAgICBoZWlnaHQ6IDcwLFxyXG4gICAgICAgIHN1YmRpdmlzaW9uczogMlxyXG4gICAgfSwgc2NlbmUpO1xyXG4gICAgZ3JvdW5kLnBvc2l0aW9uID0gQkFCWUxPTi5WZWN0b3IzLlplcm8oKTtcclxuICAgIGdyb3VuZC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoXHJcbiAgICAgICAgZ3JvdW5kLFxyXG4gICAgICAgIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLkJveEltcG9zdG9yLCB7XHJcbiAgICAgICAgICAgIG1hc3M6IDAsXHJcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwLFxyXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMFxyXG4gICAgICAgIH0sIHNjZW5lKTtcclxuXHJcbiAgICBjb25zdCBsZWZ0QmFyID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3goJ2xlZnRCYXInLCB7XHJcbiAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgaGVpZ2h0OiAyLFxyXG4gICAgICAgIGRlcHRoOiA3MFxyXG4gICAgfSwgc2NlbmUpO1xyXG4gICAgbGVmdEJhci5wb3NpdGlvbiA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoLTE1LCAxLCAwKTtcclxuICAgIGxlZnRCYXIucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKFxyXG4gICAgICAgIGxlZnRCYXIsXHJcbiAgICAgICAgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgZnJpY3Rpb246IDAsXHJcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmlnaHRCYXIgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveCgncmlnaHRCYXInLCB7XHJcbiAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgaGVpZ2h0OiAyLFxyXG4gICAgICAgIGRlcHRoOiA3MFxyXG4gICAgfSwgc2NlbmUpO1xyXG4gICAgcmlnaHRCYXIucG9zaXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDE1LCAxLCAwKTtcclxuICAgIHJpZ2h0QmFyLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihcclxuICAgICAgICByaWdodEJhcixcclxuICAgICAgICBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3Rvciwge1xyXG4gICAgICAgICAgICBtYXNzOiAwLFxyXG4gICAgICAgICAgICBmcmljdGlvbjogMCxcclxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbn07XHJcbmNvbnN0IHNjZW5lID0gY3JlYXRlU2NlbmUoKTtcclxuLy8gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNClcclxuXHJcbmNvbnN0IHBsYXllcl8xID0gbmV3IFBhZGRsZSgncGxheWVyXzEnLCBzY2VuZSwgbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLjUsIC0zNCksIDIsIGZhbHNlKTtcclxuY29uc3QgYWlQbGF5ZXIgPSBuZXcgUGFkZGxlKCdhaVBsYXllcicsIHNjZW5lLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAuNSwgMzQpLCAzLCB0cnVlKTtcclxuXHJcbmNvbnN0IHBsYXlpbmdCYWxsID0gbmV3IEJhbGwoc2NlbmUsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMC41LCAtMzMpLCAxKTtcclxucGxheWluZ0JhbGwuc2V0Q29sbGlzaW9uQ29tcG9uZW50cyhbcGxheWVyXzEucGFkZGxlLnBoeXNpY3NJbXBvc3RvciwgYWlQbGF5ZXIucGFkZGxlLnBoeXNpY3NJbXBvc3Rvcl0pO1xyXG5cclxuY29uc3QgZ2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoc2NlbmUsIHBsYXlpbmdCYWxsLCBwbGF5ZXJfMSwgYWlQbGF5ZXIpO1xyXG5nYW1lTWFuYWdlci5zZXRDb2xsaXNpb25Db21wb25lbnRzKHBsYXlpbmdCYWxsLmJhbGwucGh5c2ljc0ltcG9zdG9yKTtcclxuXHJcbmVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgIHBsYXlpbmdCYWxsLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXllcl8xLnBhZGRsZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKSk7XHJcbiAgICBwbGF5ZXJfMS51cGRhdGUoa2V5U3RhdGVzLCBwbGF5aW5nQmFsbC5iYWxsKTtcclxuICAgIGFpUGxheWVyLnVwZGF0ZShrZXlTdGF0ZXMsIHBsYXlpbmdCYWxsLmJhbGwpO1xyXG5cclxuICAgIGdhbWVNYW5hZ2VyLnVwZGF0ZSgpO1xyXG4gICAgc2NlbmUucmVuZGVyKCk7XHJcbn0pOyJdfQ==
