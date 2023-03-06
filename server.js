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

const client = mqtt.connect("mqtt://public.mqtthq.com");

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
    var obj = new Object();
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
    io.emit("message", obj);
  });
};

init();

//View engine setup
app.set("view engine", "ejs");

//socket.io
var sessions = [];

io.on("connection", (socket) => {
  console.log( +"se ha conectado");

  //asignación de id-tetris
  if (sessions.length != 0) {
    //tetris_id = players_id.shift(); //eliminar el primer elemento del array
    console.log(sessions);
  }

  socket.on("disconnect", (request) => {
    //console.log(sessions);
    //console.log(players_id);
    console.log(request.session);
    //database.query("UPDATE Cubo SET ocupado = 'no' WHERE id = ")
    console.log("user disconnected");
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

/*----- express.json and express.urlencode: is for passing data when the client send an PUT-PATCH */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  //si no hemos iniciado sesion redireccionar a login
  database.query("SELECT * FROM Cubo", function (error, data) {
    if (error) throw error;
    res.render("login", { boards: data });
  });
  //res.sendFile(__dirname + "/public/login.html");
});

app.get("/tetris", function (req, res) {
  //mostrar formulario de login
  res.sendFile(__dirname + "/public/tetris.html");
});

app.get("/user_error", function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/user_error.html");
});

app.post("/auth", function (request, response, next) {
  //recibir credenciales e iniciar sesion
  var username = request.body.user;
  var password = request.body.pass;
  var board = request.body.board;
  var ocupado = false;

  //comprobación de la placa
  database.query(
    "SELECT ocupado FROM Cubo where id = ?",
    [board],
    function (error, result) {
      if (error) throw error;
      else {
        if (result[0].ocupado == "no") {
          database.query("UPDATE Cubo SET ocupado = 'si' WHERE id = ? ", [
            board,
          ]);
        } else {
          ocupado = true;
        }
      }
    }
  );
  //comprobación de registro
  if (username && password) {
    database.query(
      "SELECT * FROM Usuario WHERE username = ? and password = ?",
      [username, password],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0 && !ocupado) {
          var session = Object.create(null);
          // Authenticate the user
          //request.session.loggedin = true;
          request.session.username = username;
          session["user"] = username;
          session["board"] = board;
          sessions.push(session);
          //console.log(request.session);
          var string = encodeURIComponent(board);
          // Redirect to home page
          response.redirect("/tetris?id=" + string);
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
  var username = request.body.user;
  var name = request.body.name;
  var surname = request.body.surname;
  var age = parseInt(request.body.age);
  var password = request.body.pass;

  if (username && name && surname && age && password) {
    database.query(
      "INSERT INTO Usuario (username, nombre, apellidos, edad, password, puntos) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, surname, age, password, 0],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        else response.redirect("/");
        response.end();
      }
    );
  }
});

server.listen(port, function () {
  console.log(`Tetris app listening on port ${port}`);
});
