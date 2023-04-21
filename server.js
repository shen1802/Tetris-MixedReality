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
const { count } = require("console");
const fs = require("fs");
require("@tensorflow/tfjs-node");

const client = mqtt.connect("mqtt://localhost");

const ids = new Map();
let current_id_pos;
let numBoard = 0;
let predictionDone = [];
let numLinesRead = [];

let liveDatas = [];
//let predictionDone = false;
let started = false;
let model;
let threshold_gyro = 2000;
let threshold_acc = 6000;
const gestureClasses = [
  "izquierda",
  "derecha",
  "abajo",
  "espacio",
  "rotar",
  "reposo",
];

let numParametersRecorded = 6; // 6 values from board -> 3 accelerometer and 3 gyroscope;
let numLinesPerFile = 35;
let numValuesExpected = numParametersRecorded * numLinesPerFile; //total de valores por cada gesto
//let numLinesRead = numLinesPerFile;
let numFileWrite = 1;
let datafile ="";
// cargar el modelo
const init = async () => {
  model = await tf.loadLayersModel("file://model/model.json");
};

client.on("connect", () => {
  client.subscribe("sensorData");
  client.subscribe("Scanned");
});

client.on("message", (topic, message) => {
  if (topic === "sensorData") {
    const sensorData = JSON.parse(message.toString());

    let dataAvailable = sensorData;
    current_id_pos = ids.get(sensorData.id);

    if (dataAvailable && !started) {
      console.log("ready");
      numLinesRead[current_id_pos] = numLinesPerFile;
      predictionDone[current_id_pos] = false;
      liveDatas[current_id_pos] = [];
    }
    /*const accelerometerX = sensorData.accelerometer.x;
    const accelerometerY = sensorData.accelerometer.y;
    const accelerometerZ = sensorData.accelerometer.z;
    const gyroscopeX = sensorData.gyroscope.x;
    const gyroscopeY = sensorData.gyroscope.y;
    const gyroscopeZ = sensorData.gyroscope.z;*/

    let data = {
      xAcc: sensorData.accelerometer.x,
      yAcc: sensorData.accelerometer.y,
      zAcc: sensorData.accelerometer.z,
      xGyro: sensorData.gyroscope.x,
      yGyro: sensorData.gyroscope.y,
      zGyro: sensorData.gyroscope.z,
    };

    // sum up the absolutes
    if (numLinesRead[current_id_pos] == numLinesPerFile) {
      let aSum_G = Math.abs(data.xGyro) + Math.abs(data.yGyro) + Math.abs(data.zGyro);
      let aSum_A = Math.abs(data.xAcc) + Math.abs(data.yAcc) + Math.abs(data.zAcc);
      
    
      // check of it's above the threshold
      if (aSum_G >= threshold_gyro || aSum_A >= threshold_acc ) {
        numLinesRead[current_id_pos] = 0;
        //console.log("suma absoluto : "+aSum+" xG:"+data.xGyro+"  yG"+data.yGyro+"  zG"+data.zGyro);
        datafile ="sequence,AccelerometerX,AccelerometerY,AccelerometerZ,GyroscopeX,GyroscopeY,GyroscopeZ\n";
        
      }
    }

    if (numLinesRead[current_id_pos] < numLinesPerFile) {
      
      if (liveDatas[current_id_pos].length < numValuesExpected) {
        // rellenar liveData[] hasta recopilar todos los valores de un gesto
        predictionDone[current_id_pos] = false;
        liveDatas[current_id_pos].push(
          data.xAcc,
          data.yAcc,
          data.zAcc,
          data.xGyro,
          data.yGyro,
          data.zGyro
        );

        datafile +=
          numLinesRead[current_id_pos] +
          "," +
          data.xAcc +
          "," +
          data.yAcc +
          "," +
          data.zAcc +
          "," +
          data.xGyro +
          "," +
          data.yGyro +
          "," +
          data.zGyro +
          "\n";
          numLinesRead[current_id_pos] ++;
        //console.log("leyendo lineas: "+numLinesRead);
      }

      if (liveDatas[current_id_pos].length == numValuesExpected) {
        //console.log("Array: "+datafile);
        //console.log("liveData: "+liveData);
        /*let gesto = "izquierda";
              let filename = "./txt/prueba2_"+gesto+"_"+numFileWrite+".csv";
              //const writeStream = fs.createWriteStream('data.csv');
              const writeStream = fs.createWriteStream(filename);
              writeStream.write(datafile);
              numFileWrite++;*/
        processSensorData(
          data.xAcc,
          data.yAcc,
          data.zAcc,
          data.xGyro,
          data.yGyro,
          data.zGyro,
          sensorData.id
        );
      }
    }

    /*if (liveData.length < numValuesExpected) {
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
          }*/

    started = true;
  }
  if (topic === "Scanned") {
    const str = message.toString();
    const list = str.slice(1, -1).split("','");
    let lista = [];
    for (let i = 0; i < list.length; i++) {
      lista.push(extractNumberFromMAC(list[i]));
    }
    console.log("scanned");
    console.log(lista);
    let current_array = [];

    database.query("SELECT * FROM Cubo", function (SELECTerror, result) {
      if (SELECTerror) throw SELECTerror;
      else {
        current_array = result.map((item) => {
          return {
            id: item.id,
            ocupado: item.ocupado,
          };
        });

        for (let i = current_array.length - 1; i >= 0; i--) {
          if (current_array[i].ocupado == "no") {
            database.query(
              "DELETE FROM Cubo WHERE id = ? ",
              [current_array[i].id],
              function (error, result) {
                if (error) throw error;
              }
            );
            current_array.splice(i, 1);
          }
        }

        for (let i = 0; i < lista.length; i++) {
          let existe = new Boolean(false);
          console.log(current_array.length);
          for (let j = 0; j < current_array.length; j++) {
            if (current_array[j].id == lista[i]) {
              existe = true;
            }
          }

          console.log(existe);
          if (existe == false) {
            console.log("no existe y se inserta");
            database.query(
              "INSERT INTO Cubo (id, ocupado) VALUES (?, 'no')",
              [lista[i]],
              function (error, result) {
                if (error) throw error;
              }
            );
          }
        }
      }
    });
  }
});

function extractNumberFromMAC(mac) {
  let result = 0;
  let count = 0;
  for (let i = mac.length - 1; i >= 0; i--) {
    if (/\d/.test(mac[i])) {
      result += (mac[i] - "0") * Math.pow(10, count);
      count++;
      if (count === 4) {
        break;
      }
    }
  }

  // insert board id into position array
  if (ids.has(result)==false){
    ids.set(result,numBoard);
    numBoard++;
  }

  return result;
}

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
if (!predictionDone[current_id_pos] && liveDatas[current_id_pos].length) {
    predictionDone[current_id_pos] = true;
    predict(model, liveDatas[current_id_pos], id);
    liveDatas[current_id_pos] = []; //vaciar el array para el nuevo gesto
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

  socket.on("game_over", function (game) {
    database.query(
      "INSERT INTO Sesion (id, username, id_cubo, puntos_sesion) VALUES (NULL, ?, ?, ?)",
      [game.username, game.board, game.score]
    ),
      function (error, result) {
        if (error) throw error;
      };
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
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});
/*----- express.json and express.urlencode: is for passing data when the client send an PUT-PATCH */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  //si ya habíamos iniciado sesión redireccionar a la pantalla correspondiente
  if (req.session.loggedin) {
    if (req.session.board == undefined) {
      database.query("SELECT * FROM Cubo", function (error, data) {
        if (error) throw error;
        res.render("board", {
          datos: { boards: data, user: req.session.username },
        });
      });
    } else {
      res.render("tetris", {
        datos: { board: req.session.board, user: req.session.username },
      });
    }
  } else {
    //si no hemos iniciado sesion redireccionar a login
    res.render("login");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/board", function (req, res) {
  database.query("SELECT * FROM Cubo", function (error, data) {
    if (error) throw error;
    res.render("board", {
      datos: { boards: data, user: req.session.username },
    });
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
  //console.log(req.session.board);
  //actualizar en la base de datos el estado de la placa
  database.query(
    "UPDATE Cubo SET ocupado = 'si' WHERE id = ?",
    [req.body.board],
    function (error, result) {
      if (error) throw error;
    }
  );
  res.render("tetris", {
    datos: { board: req.session.board, user: req.session.username },
  });
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
          response.redirect("/board");
        } else {
          response.render("login_error");
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
  let password_verification = request.body.pass2;

  if (username && name && surname && age && password && password_verification) {
    if (password == password_verification) {
      database.query(
        "SELECT username FROM Usuario WHERE username = ?",
        [username],
        function (error, result) {
          if (result) {
            alert("El usuario ya existe");
            response.render("register");
          }
        }
      );
      database.query(
        "INSERT INTO Usuario (username, nombre, apellidos, edad, password, puntos) VALUES (?, ?, ?, ?, ?, ?)",
        [username, name, surname, age, password, 0],
        function (error, results) {
          // If there is an issue with the query, output the error
          if (error) response.render("login_error");
          else response.redirect("/");
          response.end();
        }
      );
    } else {
      response.render("password_error");
    }
  }
});

app.post("/logout", function (req, res) {
  if (req.session) {
    if (req.session?.board) {
      database.query(
        "UPDATE Cubo SET ocupado = 'no' WHERE id = ?",
        [req.session.board],
        function (error, result) {
          if (error) throw error;
        }
      );
    }
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
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
