import Paddle from './Paddle';
import Ball from './Ball';

class GameManager {
    constructor(socket) {
        this.paddles = [];

        this.socket = socket;
        this.id = null;

        this.ball = new Ball(width / 2, height / 2, socket);
        this.paddles.push(new Paddle(7, height / 2, 38, 40, socket, this.ball));
        this.paddles.push(new Paddle(width - 7, height / 2, 38, 40, socket, this.ball));

        this.socket.emit('getPlayerId');
        this.socket.on(
            'recievePlayerId',
            this.handleRecievePlayerId.bind(this)
        );
        this.socket.on('startGame', this.handleStartGame.bind(this));
        this.socket.on('ballPosition', this.handleRecieveBallData.bind(this));

        this.startGame = false;
        this.draw = this.draw.bind(this);
    }

    handleRecievePlayerId(id) {
        console.log(`Recieved PLayer ID: ${id}`);
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
    }

    draw(keys) {
        for (let i = 0; i < this.paddles.length; i++) {
            this.paddles[i].draw();
            if (!this.startGame) continue;

            if (this.paddles[i].gameManagerId === this.id) {
                this.paddles[i].update(keys, this.ball);
            }
        }

        this.ball.draw();
        if (!this.startGame) return;
        this.ball.update(keys);
    }
}

export default GameManager;
