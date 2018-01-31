import Paddle from './Paddle';
import Ball from './Ball';

class GameManager {
    constructor(socket) {
        this.paddles = [];

        this.socket = socket;
        this.id = null;

        this.ball = new Ball(width / 2 - 10, height / 2, socket);
        this.paddles.push(new Paddle(7, height / 2, 38, 40, socket, 0));
        this.paddles.push(new Paddle(width - 7, height / 2, 38, 40, socket, 1));

        this.startGame = false;
        this.ballLaunched = false;

        this.socket.emit('getPlayerId');
        this.socket.on(
            'recievePlayerId',
            this.handleRecievePlayerId.bind(this)
        );
        this.socket.on('startGame', this.handleStartGame.bind(this));
        this.socket.on('ballPosition', this.handleRecieveBallData.bind(this));
        this.socket.on('ballLaunch', this.handleRecieveBallData.bind(this));

        this.draw = this.draw.bind(this);
        this.isPaddleCollidingWithBall = this.isPaddleCollidingWithBall.bind(
            this
        );
        this.emitBallEvents = this.emitBallEvents.bind(this);
        this.launchBall = this.launchBall.bind(this);
        this.isBallOutOfScreen = this.isBallOutOfScreen.bind(this);
        this.update = this.update.bind(this);
    }

    handleRecievePlayerId(id) {
        console.log(`Recieved Player ID: ${id}`);
        this.id = id;

        this.paddles[id].increaseAlpha();
        this.paddles[id].gameManagerId = id;
    }

    handleStartGame(value) {
        console.log('Game Started');
        this.startGame = value;
    }

    handleRecieveBallData(data) {
        let { position, velocity } = data;
        this.ball.position = createVector(position.x, position.y);
        this.ball.velocity = createVector(velocity.x, velocity.y);
        this.ballLaunched = true;
    }

    launchBall() {
        let { x, y } = this.paddles[0].velocity;
        this.ball.velocity = createVector(this.ball.minSpeed, y);
        this.ball.velocity.setMag(this.ball.minSpeed);
        this.ballLaunched = true;
        this.socket.emit('ballLaunch', {
            position: {
                x: this.ball.position.x,
                y: this.ball.position.y
            },
            velocity: {
                x: this.ball.velocity.x,
                y: this.ball.velocity.y
            }
        });
    }

    isPaddleCollidingWithBall(paddle) {
        let { x: ballX, y: ballY } = this.ball.position;
        let radius = this.ball.radius;

        let { x, y } = paddle.position;
        let halfWidth = paddle.width / 2;
        let halfHeight = paddle.height / 2;

        if (
            ballY - radius > y - halfHeight &&
            ballY + radius < y + halfHeight
        ) {
            if (x < width / 2 && ballX - radius <= x + halfWidth) {
                this.ball.position = createVector(
                    x + halfWidth + radius,
                    ballY
                );
                return true;
            } else if (x > width / 2 && ballX + radius >= x - halfWidth) {
                this.ball.position = createVector(
                    x - halfWidth - radius,
                    ballY
                );
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    isBallOutOfScreen() {
        let { x } = this.ball.position;
        if (x < 0 - this.ball.radius || x > width + this.ball.radius) {
            return true;
        }

        return false;
    }

    emitBallEvents() {
        let { position, velocity } = this.ball;

        this.socket.emit('ballPosition', {
            position: {
                x: position.x,
                y: position.y
            },
            velocity: {
                x: velocity.x,
                y: velocity.y
            }
        });
    }

    draw() {
        for (let paddle of this.paddles) paddle.draw();
        this.ball.draw();
    }

    update(keys) {
        if (!this.startGame) return;

        for (let i = 0; i < this.paddles.length; i++) {
            if (this.paddles[i].gameManagerId === this.id) {
                this.paddles[i].update(keys);
                if (
                    this.isPaddleCollidingWithBall(this.paddles[i], this.ball)
                ) {
                    let { x } = this.ball.velocity;
                    this.ball.velocity.x = -1 * x;
                    this.ball.velocity.add(this.paddles[i].velocity);

                    if (this.ballLaunched) this.emitBallEvents();
                }
            }
        }

        if (this.isBallOutOfScreen()) {
            this.ballLaunched = false;
            this.ball.velocity = createVector(0, 0);
            console.log('Ball Is Out Of Screen');
        }

        if (!this.ballLaunched) {
            let { x, y } = this.paddles[0].position;
            let paddleWidth = this.paddles[0].width;
            let radius = this.ball.radius;
            this.ball.position = createVector(x + radius + paddleWidth, y);
        }

        if (keys[32] && !this.ballLaunched) {
            this.launchBall();
        }

        if (this.ballLaunched) this.ball.update();
    }
}

export default GameManager;
