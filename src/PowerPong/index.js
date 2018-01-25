/// <reference path="./paddle.js" />
/// <reference path="./ball.js" />

let ball;
function setup() {
    ball = new Ball(0, 0, 0);
}

function draw() {
    background(0);
    ball.draw();
}
