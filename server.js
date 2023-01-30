const express = require("express");
const app = express();
const server = require('http').createServer(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(server);

//socket.io

io.on('connection', (socket) => {
  console.log('Un nuevo usuario se ha conectado');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('mensaje', function(mensaje){
    console.log('mensaje: ' + mensaje);
    io.emit('mensaje', mensaje);

});
});

//express

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/tetris.html");
});

server.listen(port, function () {
  console.log(`Tetris app listening on port ${port}`);
});

