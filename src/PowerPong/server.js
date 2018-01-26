const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    return res.json({
        message: 'Hello World'
    });
});

io.on('connection', socket => {
    socket.on('ballPosition', ballPosition => {
        console.log(ballPosition);
    });

    socket.on('paddlePosition', paddlePosition => {
        console.log(paddlePosition);
    });
});

http.listen(5000, () => {
    console.log(`Server started on port ${5000}`);
});
