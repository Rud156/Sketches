import Paddle from './Paddle';
import Ball from './Ball';

class GameManager {
    constructor(socket) {
        this.paddles = [];
        this.ball = null;

        this.socket = socket;
        this.id = null;

        this.paddles.push(new Paddle(7, height / 2, 87, 83, socket, 1));
        this.paddles.push(new Paddle(width - 7, height / 2, 38, 40, socket, 2));
        this.ball = new Ball(width / 2, height / 2, socket);

        this.socket.emit('getPlayerId', null);
        this.socket.on(
            'recievePlayerId',
            this.handleRecievePlayerId.bind(this)
        );
        this.socket.on('startGame', this.handleStartGame.bind(this));

        this.startGame = false;
    }

    handleRecievePlayerId(id) {
        this.id = id;
        if (id % 2 == 0) this.paddles[0].reduceAlpha();
        else this.paddles[1].reduceAlpha();
    }

    handleStartGame(value) {
        this.startGame = value;
    }

    draw(keys) {
        if (!this.startGame) return;

        for (let paddle of this.paddles) {
            paddle.draw();
            paddle.update(keys, ball);
        }

        this.ball.draw();
        this.ball.update(keys);
    }
}
