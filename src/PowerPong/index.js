import Ball from './ball';
import Paddle from './paddle';

let ball;
export function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - 30);
    canvas.parent('canvas-holder');
    ball = new Ball(0, 0, 0);
}

export function draw() {
    background(0);
    ball.draw();
}

window.setup = setup;
window.draw = draw;
