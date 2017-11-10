/// <reference path="./../../typings/babylon.d.ts" />
/// <reference path="./paddle.js" />
/// <reference path="./ball.js" />
/// <reference path="./game-manager.js" />

// ToDo: Remove `showBoundingBox` from all bodies

const canvasHolder = document.getElementById('canvas-holder');
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 25;
canvas.height = window.innerHeight - 30;
canvasHolder.appendChild(canvas);
const engine = new BABYLON.Engine(canvas, true);

const keyStates = {
    32: false, // SPACE
    37: false, // LEFT
    38: false, // UP
    39: false, // RIGHT
    40: false, // DOWN
    87: false, // W
    65: false, // A
    83: false, // S
    68: false // D
};
window.addEventListener('keydown', (event) => {
    if (event.keyCode in keyStates)
        keyStates[event.keyCode] = true;
});
window.addEventListener('keyup', (event) => {
    if (event.keyCode in keyStates)
        keyStates[event.keyCode] = false;
});

const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.clearColor = BABYLON.Color3.Black();

    const light = new BABYLON.HemisphericLight('mainLight', new BABYLON.Vector3(0, 1, 0), scene);

    const ground = BABYLON.MeshBuilder.CreateGround('mainGround', {
        width: 32,
        height: 70,
        subdivisions: 2
    }, scene);
    ground.position = BABYLON.Vector3.Zero();
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            friction: 0,
            restitution: 0
        }, scene);

    const leftBar = BABYLON.MeshBuilder.CreateBox('leftBar', {
        width: 2,
        height: 2,
        depth: 70
    }, scene);
    leftBar.position = new BABYLON.Vector3(-15, 1, 0);
    leftBar.physicsImpostor = new BABYLON.PhysicsImpostor(
        leftBar,
        BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            friction: 0,
            restitution: 1
        });

    const rightBar = BABYLON.MeshBuilder.CreateBox('rightBar', {
        width: 2,
        height: 2,
        depth: 70
    }, scene);
    rightBar.position = new BABYLON.Vector3(15, 1, 0);
    rightBar.physicsImpostor = new BABYLON.PhysicsImpostor(
        rightBar,
        BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            friction: 0,
            restitution: 1
        });

    return scene;
};

const createGameStartObjects = (sceneObject) => {

};

const createGameEndObjects = (sceneObject) => {

};

const scene = createScene();

const camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(90, 20, -60), scene);
const startToGame = new BABYLON.Animation('startToGame', 'position.x',
    30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const startToGameKeys = [{
    frame: 0,
    value: 90
}, {
    frame: 100,
    value: 0
}];
startToGame.setKeys(startToGameKeys);
const gameToEnd = new BABYLON.Animation('gameToEnd', 'position.x',
    30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const gameToEndKeys = [{
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
// scene.beginDirectAnimation(camera, [startToGame], 0, 100, true);
// new BABYLON.Vector3(0, 0.5, -34)

const player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
const aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

const playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

const gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);

engine.runRenderLoop(() => {
    playingBall.update(keyStates, player_1.paddle.physicsImpostor.getLinearVelocity());
    player_1.update(keyStates, playingBall);
    aiPlayer.update(keyStates, playingBall);

    gameManager.update();
    scene.render();
});