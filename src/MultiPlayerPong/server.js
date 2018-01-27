const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    return res.json({
        message: 'Hello World'
    });
});

let initialId = 0;

io.on('connection', socket => {
    console.log('A User Connected');

    socket.on('ballPosition', ballPosition => {
        socket.broadcast.emit('ballPosition', ballPosition);
    });

    socket.on('paddlePosition', paddlePosition => {
        socket.broadcast.emit('paddlePosition', paddlePosition);
    });

    socket.on('getPlayerId', () => {
        initialId += 1;
        socket.emit('recievePlayerId', initialId);
        if (initialId % 2 == 0) {
            socket.emit('startGame', true);
        }
    });

    socket.on('disconnect', () => {
        console.log('A User Disconnected');
    });
});

http.listen(5000, () => {
    console.log(`Server started on port ${5000}`);
});
