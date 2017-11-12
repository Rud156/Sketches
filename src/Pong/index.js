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

const createDOMElementsStart = () => {
    const homeOverlay = document.createElement('div');
    homeOverlay.className = 'overlay';

    const homeOverlayContent = document.createElement('div');
    homeOverlayContent.className = 'overlay-content';
    homeOverlay.appendChild(homeOverlayContent);

    const headerContent = document.createElement('div');
    headerContent.className = 'header';
    headerContent.innerText = 'Pong';

    const mainContentHolder = document.createElement('div');
    mainContentHolder.className = 'main-content-holder';

    const startButton = document.createElement('span');
    startButton.className = 'start-button';
    startButton.innerText = 'Start Game';
    startButton.addEventListener('click', () => {
        homeOverlay.style.width = '0';
        gameManager.gameStarted = true;
    });

    const helpContent = document.createElement('div');
    helpContent.className = 'help-content';
    helpContent.innerText = 'A pong game made using BABYLON.JS. Use ARROW KEYS to control and SPACE to launch the ball.';

    mainContentHolder.appendChild(startButton);
    mainContentHolder.appendChild(helpContent);
    homeOverlayContent.appendChild(headerContent);
    homeOverlayContent.appendChild(mainContentHolder);
    document.body.appendChild(homeOverlay);
};

const createDOMElementsEnd = () => {
    const endOverlay = document.createElement('div');
    endOverlay.className = 'end-overlay';

    const endOverlayContent = document.createElement('overlay-content');
    endOverlayContent.className = 'overlay-content';
    endOverlay.appendChild(endOverlayContent);

    const header = document.createElement('div');
    header.className = 'header';
    header.id = 'winnerName';

    const replayButton = document.createElement('span');
    replayButton.className = 'start-button';
    replayButton.innerText = 'Replay';
    replayButton.addEventListener('click', () => {
        endOverlay.style.height = '0';
        gameManager.gameStarted = true;
    });

    const playerHolder = document.createElement('div');
    playerHolder.className = 'player-holder';

    const playerOne = document.createElement('div');
    const computer = document.createElement('div');
    playerOne.className = 'player';
    computer.className = 'player';

    const playerOneName = document.createElement('div');
    playerOneName.className = 'name-holder';
    const computerName = document.createElement('div');
    computerName.className = 'name-holder';
    playerOneName.innerText = 'Player 1';
    computerName.innerText = 'Computer';

    const playerOneScore = document.createElement('div');
    playerOneScore.className = 'score-holder';
    playerOneScore.id = 'player1Score';
    const computerScore = document.createElement('div');
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

const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    scene.clearColor = BABYLON.Color3.Black();

    const groundHighlight = new BABYLON.HighlightLayer('groundHighlight', scene);
    groundHighlight.blurHorizontalSize = 0.3;
    groundHighlight.blurVerticalSize = 0.3;
    groundHighlight.innerGlow = 0;

    const camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(0, 20, -60), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    const light = new BABYLON.HemisphericLight('mainLight', new BABYLON.Vector3(0, 1, 0), scene);

    const genericBlackMaterial = new BABYLON.StandardMaterial('blackMaterial', scene);
    genericBlackMaterial.diffuseColor = BABYLON.Color3.Black();

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
    ground.material = genericBlackMaterial;
    groundHighlight.addMesh(ground, BABYLON.Color3.Red());

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
    leftBar.material = genericBlackMaterial;

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
    rightBar.material = genericBlackMaterial;

    return scene;
};
createDOMElementsStart();
createDOMElementsEnd();
const scene = createScene();
// createDOMElementsStart();
// new BABYLON.Vector3(0, 0.5, -34)

const player_1 = new Paddle('player_1', scene, new BABYLON.Vector3(0, 0.5, -34), 2, false);
const aiPlayer = new Paddle('aiPlayer', scene, new BABYLON.Vector3(0, 0.5, 34), 3, true);

const playingBall = new Ball(scene, new BABYLON.Vector3(0, 0.5, -33), 1);
playingBall.setCollisionComponents([player_1.paddle.physicsImpostor, aiPlayer.paddle.physicsImpostor]);

const gameManager = new GameManager(scene, playingBall, player_1, aiPlayer);
gameManager.setCollisionComponents(playingBall.ball.physicsImpostor);
const testHighlight = new BABYLON.HighlightLayer('testHighlight', scene);
testHighlight.blurHorizontalSize = 0.3;
testHighlight.blurVerticalSize = 0.3;
testHighlight.addMesh(gameManager.ballResetCollider, BABYLON.Color3.Red());
testHighlight.addExcludedMesh(player_1.paddle);
testHighlight.addExcludedMesh(aiPlayer.paddle);
const groundHighlight = scene.getHighlightLayerByName('groundHighlight');
groundHighlight.addExcludedMesh(player_1.paddle);
groundHighlight.addExcludedMesh(aiPlayer.paddle);

engine.runRenderLoop(() => {
    if (!gameManager.gameStarted) {
        for (let key in keyStates) {
            keyStates[key] = false;
        }
    }

    playingBall.update(keyStates, player_1.paddle.physicsImpostor.getLinearVelocity());
    player_1.update(keyStates, playingBall);
    aiPlayer.update(keyStates, playingBall);

    gameManager.update();
    scene.render();
});