/// <reference path="./../../typings/babylon.d.ts" />
/// <reference path="./player.ts" />

const canvasHolder = document.getElementById('canvas-holder');
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 25;
canvas.height = window.innerHeight - 25;
canvasHolder.appendChild(canvas);

const fpsLabel = document.getElementById('fpsLabel');

const engine: BABYLON.Engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
scene.collisionsEnabled = true;
scene.workerCollisions = true;
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

const camera = new BABYLON.FollowCamera('mainCamera', new BABYLON.Vector3(0, 0, 0), scene);
camera.heightOffset = 10;
camera.radius = 20;
camera.noRotationConstraint = false;
scene.activeCamera = camera;

const light = new BABYLON.HemisphericLight("pointLight", new BABYLON.Vector3(5, 7, 5), scene);
light.intensity = 0.7;

const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: 20, height: 20, subdivisions: 2
}, scene);
ground.position = BABYLON.Vector3.Zero();
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
ground.isPickable = true;

const player = new Player(scene, ground);
camera.lockedTarget = player.playerShape;
scene.registerBeforeRender(() => {
    player.update();
});

engine.runRenderLoop(() => {
    scene.render();
    fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
});