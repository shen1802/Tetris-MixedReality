//import {Tetris} from './public/tetris.js'

const express = require("express");
const app = express();
const server = require('http').createServer(app);
const port = 3000;
const WebSocket = require('ws');

const wss = new WebSocket.Server({port:3001});

// establecer la conexión
wss.on('connection', function connection(ws) {
  
  console.log("Se ha conectado un nuevo usuario");
  ws.on('message', function message(data) {
    console.log('Server received: %s', data);
    if (data == 'mr') {
      
    } else if(data == 'start') {
      
    }
  });
  ws.send('Bienvenido al servidor del tetris');
});

app.use(express.static(__dirname + "/public"));


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/tetris.html");
});

app.listen(port, function () {
  console.log(`Tetris app listening on port ${port}`);
});


/*--FUNCIONA EL WEBSOCKET
//WebSocket
const { Server } = require('ws');

const sockserver = new Server({ port: 3001 });
sockserver.on('connection', (ws) => {
   console.log('New client connected!');
   ws.send("Welcome to the tetris server!");
   ws.on('close', () => console.log('Client has disconnected!'));
});

*/