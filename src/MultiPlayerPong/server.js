const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const chalk = require('chalk');

app.get('/', (req, res) => {
    return res.json({
        message: 'Hello World'
    });
});

let initialId = -1;

io.on('connection', socket => {
    console.log(chalk.default.blue('A User Connected'));

    socket.on('ballPosition', ballPosition => {
        // socket.broadcast.emit('ballPosition', ballPosition);
    });

    socket.on('paddlePosition', paddlePosition => {
        socket.broadcast.emit('paddlePosition', paddlePosition);
    });

    socket.on('getPlayerId', () => {
        initialId += 1;
        console.log(chalk.default.yellowBright(`Player Id: ${initialId}`));
        socket.emit('recievePlayerId', initialId);
        if (initialId == 1) {
            console.log(chalk.default.greenBright('Game Start Initiated'));
            io.emit('startGame', true);
            initialId = -1;
        }
    });

    socket.on('disconnect', () => {
        initialId = -1;
        console.log(chalk.default.blue('A User Disconnected'));
    });
});

http.listen(5000, () => {
    console.log(`Server started on port ${5000}`);
});
