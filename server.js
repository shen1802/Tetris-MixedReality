const express = require("express");
const database = require("./database");
const session = require("express-session");
const app = express();
const server = require("http").createServer(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(server);
const mqtt = require("mqtt");
const tf = require("@tensorflow/tfjs");
const { query } = require("express");
require("@tensorflow/tfjs-node");

const client = mqtt.connect("mqtt://localhost");

let liveData = [];
let predictionDone = false;
let started = false;
let model;
const gestureClasses = [
  "izquierda",
  "derecha",
  "abajo",
  "espacio",
  "rotar",
  "reposo",
];

let numParametersRecorded = 6; // 6 values from board -> 3 accelerometer and 3 gyroscope;
let numLinesPerFile = 600;
let numValuesExpected = numParametersRecorded * numLinesPerFile; //total de valores por cada gesto

// cargar el modelo
const init = async () => {
  model = await tf.loadLayersModel("file://model/model.json");
};

client.on("connect", () => {
  client.subscribe("sensorData");
  //client.subscribe("Scanned");
});

client.on("message", (topic, message) => {
  if (topic === "sensorData") {
    const sensorData = JSON.parse(message.toString());

    let dataAvailable = sensorData;
    if (dataAvailable && !started) {
      console.log("ready");
    }
    const accelerometerX = sensorData.accelerometer.x;
    const accelerometerY = sensorData.accelerometer.y;
    const accelerometerZ = sensorData.accelerometer.z;
    const gyroscopeX = sensorData.gyroscope.x;
    const gyroscopeY = sensorData.gyroscope.y;
    const gyroscopeZ = sensorData.gyroscope.z;

    let data = {
      xAcc: sensorData.accelerometer.x,
      yAcc: sensorData.accelerometer.y,
      zAcc: sensorData.accelerometer.z,
      xGyro: sensorData.gyroscope.x,
      yGyro: sensorData.gyroscope.y,
      zGyro: sensorData.gyroscope.z,
    };

    if (liveData.length < numValuesExpected) {
      // rellenar liveData[] hasta recopilar todos los valores de un gesto
      predictionDone = false;
      liveData.push(
        data.xAcc,
        data.yAcc,
        data.zAcc,
        data.xGyro,
        data.yGyro,
        data.zGyro
      );
    } else {
      processSensorData(
        accelerometerX,
        accelerometerY,
        accelerometerZ,
        gyroscopeX,
        gyroscopeY,
        gyroscopeZ,
        sensorData.id
      );
    }

    started = true;
  }
});

const processSensorData = (
  accelerometerX,
  accelerometerY,
  accelerometerZ,
  gyroscopeX,
  gyroscopeY,
  gyroscopeZ,
  id
) => {
  // Perform TensorFlow.js processing on the accelerometer and gyroscope data
  // to extract relevant information for the Tetris game
  if (!predictionDone && liveData.length) {
    predictionDone = true;
    predict(model, liveData, id);
    liveData = []; //vaciar el array para el nuevo gesto
  }
};

const predict = (model, newSampleData, id) => {
  console.log("Dentro de predict");
  console.log(id);
  tf.tidy(() => {
    const inputData = newSampleData;

    const input = tf.tensor2d([inputData], [1, numValuesExpected]);
    const predictOut = model.predict(input);
    const logits = Array.from(predictOut.dataSync());
    const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];

    // Update the state of the Tetris game using the processed data
    let obj = new Object();
    obj.id = id;
    switch (winner) {
      case "izquierda":
        obj.action = "left";
        console.log("izquierda");
        break;
      case "derecha":
        obj.action = "right";
        console.log("derecha");
        break;
      case "abajo":
        obj.action = "down";
        console.log("abajo");
        break;
      case "espacio":
        obj.action = "space";
        console.log("espacio");
        break;
      case "rotar":
        obj.action = "up";
        console.log("rotar");
        break;
      default:
        obj.action = "default";
        console.log("default");
        break;
    }
    //io.to(socket.id)
    io.emit("message", obj);
  });
};

init();

//View engine setup
app.set("view engine", "ejs");

//socket.io

io.on("connection", (socket) => {
  console.log("Nuevo usuario contado con ID: " + socket.id);
  //console.log(socket.request);

  socket.on("game_over", function(game) {
    database.query("INSERT INTO Sesion (id, username, id_cubo, puntos_sesion) VALUES (NULL, ?, ?, ?)", 
    [game.username, game.board, game.score]), function (error, result) {
      if (error) throw error;
    }
  });

  socket.on("disconnect", (response) => {
    //console.log(response);
    /*database.query(
      "UPDATE Cubo SET ocupado = 'no' WHERE id = ?",
      [board_id],
      function (error, result) {
        if (error) throw error;
      }
    );*/
    console.log(socket.id + " has disconnected");
  });

  socket.on("message", function (obj) {
    //console.log('message: ' + obj.id);
    io.emit("message", obj);
  });
});

//express
app.use(
  session({
    secret: "tetristfg",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});
/*----- express.json and express.urlencode: is for passing data when the client send an PUT-PATCH */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  //si no hemos iniciado sesion redireccionar a login
  if (req.session.loggedin) {
    if (req.session.board == undefined) {
      database.query("SELECT * FROM Cubo", function (error, data) {
        if (error) throw error;
        res.render("board", { datos: {boards: data, user: req.session.username}});
      });
    } else {
      res.render("tetris", { datos: {board: req.session.board, user: req.session.username} });
    }
  } else{
    res.render("login");
  }
  /*
  database.query("SELECT * FROM Cubo", function (error, data) {
    if (error) throw error;
    res.render("login", { boards: data });
  });
  */
  //res.sendFile(__dirname + "/public/login.html");
});

app.get("/register", function (req, res){
  res.render("register");
});

app.get("/board", function(req, res){
  database.query("SELECT * FROM Cubo", function (error, data) {
    if (error) throw error;
    res.render("board", { datos: {boards: data, user: req.session.username}});
  });
});

app.get("/user_error", function (req, res) {
  //console.log(req);
  res.render("user_error");
  //res.sendFile(__dirname + "/public/user_error.html");
});

app.post("/tetris", function (req, res) {
  //mostrar tetris
  req.session.board = req.body.board;
  console.log(req.session.board);
  res.render("tetris", { datos: {board: req.session.board, user: req.session.username} });
});

app.post("/auth", function (request, response, next) {
  //recibir credenciales e iniciar sesion
  let username = request.body.user;
  let password = request.body.pass;
  //board = request.body.board;
  //let ocupado = false;
  //comprobación de registro
  if (username && password) {
    database.query(
      "SELECT * FROM Usuario WHERE username = ? and password = ?",
      [username, password],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          // Authenticate the user
          request.session.loggedin = true;
          request.session.username = username;
          //console.log(request.session);
          //let string = encodeURIComponent(board);
          // Redirect to home page
          //response.render("/tetris", {board_id: board});
          response.redirect("/board");
          //response.render("tetris", { board_id: board });
        } else {
          response.render("user_error");
        }
        response.end();
      }
    );
  }
});

app.post("/new", function (request, response, next) {
  let username = request.body.user;
  let name = request.body.name;
  let surname = request.body.surname;
  let age = parseInt(request.body.age);
  let password = request.body.pass;

  if (username && name && surname && age && password) {
    database.query(
      "INSERT INTO Usuario (username, nombre, apellidos, edad, password, puntos) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, surname, age, password, 0],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) response.redirect("user_error");
        else response.redirect("/");
        response.end();
      }
    );
  }
});

app.post("/logout", function (req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.render("login");
      }
    });
  } else {
    res.end();
  }
});

server.listen(port, function () {
  console.log(`Tetris app listening on port ${port}`);
});
