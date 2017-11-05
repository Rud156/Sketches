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

const camera = new BABYLON.FreeCamera("mainCamera", new BABYLON.Vector3(0, 5, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, false);

const light = new BABYLON.HemisphericLight("pointLight", new BABYLON.Vector3(5, 7, 5), scene);
light.intensity = 0.7;

const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    width: 10, height: 10, subdivisions: 2
}, scene);
ground.position = BABYLON.Vector3.Zero();
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
ground.isPickable = true;

const player = new Player(scene, ground);
scene.registerBeforeRender(() => {
    player.update();
});

engine.runRenderLoop(() => {
    scene.render();
    fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
});