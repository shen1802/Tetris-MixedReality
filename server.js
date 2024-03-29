const bcrypt = require('bcrypt');
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
const { count, group } = require("console");
const fs = require("fs");
require("@tensorflow/tfjs-node");
const NodeCache = require('node-cache');
let cache = new NodeCache();
let userNicla = new NodeCache();
let socketUser = new NodeCache();
//--------XAPI----------------------------------
let xapiTraces = []; // Array principal para almacenar las trazas xAPI
let copyOfTraces = []; // Array secundario para la copia y guardado en la base de datos
let isCopying = false; // Variable de control para indicar si se está realizando el copiado y guardado

require('dotenv').config()
const XAPI = require("@xapi/xapi");
const funciones = require('./xapi/xapi-tetris');
const endpoint = process.env.LRS_ENDPOINT || "https://my-lms.com/endpoint";
const username = process.env.LRS_USERNAME || "";
const password = process.env.LRS_PASSWORD || "";
const auth = XAPI.toBasicAuth(username, password);
const xapi = new XAPI({
  endpoint: endpoint,
  auth: auth
});

function guardarTrazaXAPI(classid, userid, traza) {
  if (isCopying) {
    
    copyOfTraces.push({ classid, userid, traza });
  } else {
    xapiTraces.push({ classid, userid, traza });
  }

}

setInterval(() => {


  isCopying = true; // Establecer la variable de control en true para indicar que se está realizando el copiado y guardado

  // Realizar el guardado en la tabla xapi
  guardarEnTablaXAPI(xapiTraces);

  xapiTraces = [];
  isCopying = false; // Restablecer la variable de control en false para permitir el siguiente copiado y guardado

  // Realizar el guardado en la tabla xapi
  guardarEnTablaXAPI(copyOfTraces);

  copyOfTraces = [];
}, 1 * 60 * 1000);


function guardarEnTablaXAPI(xapiArray) {
  // Verificar si hay trazas para enviar
  if (xapiArray.length === 0) {
    return;
  }

  const statements = xapiArray.map(({ classid, userid, traza }) => (traza));

  xapi.sendStatement({
    statement: statements
  });

 // Consulta SQL para insertar los valores en la tabla xapi
const query = "INSERT INTO xapi (userId, classId, traza) VALUES ?";

// Tamaño máximo de cada lote
const batchSize = 50; // Puedes ajustar este valor según tus necesidades

// Dividir los valores en lotes más pequeños
for (let i = 0; i < xapiArray.length; i += batchSize) {
  const batchValues = xapiArray.slice(i, Math.min(i + batchSize, xapiArray.length)).map(({ classid, userid, traza }) => [
    userid,
    classid,
    JSON.stringify(traza)
  ]);

  // Ejecutar la consulta con el lote actual de valores
  database.query(query, [batchValues], (error, result) => {
    if (error) {
      console.error("Error al guardar los datos en la tabla xapi:", error);
    } else {
      console.log("Datos guardados correctamente en la tabla xapi");
    }
  });
}
}

//----------------------------------------------

const client = mqtt.connect("mqtt://localhost");

let liveData = new Map();
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
let numLinesRead = numLinesPerFile;
let numFileWrite = 1;
let datafile = "";
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
    let userr = userNicla.get(sensorData.id);
    if (userr != null && userr != undefined) {
      let dtt = cache.get(userr);
      if (dtt.enJuego == "si") {
        
        let dataAvailable = sensorData;
        if (dataAvailable && !started) {
          console.log("STARTED");
        }

        let data = {
          xAcc: sensorData.accelerometer.x,
          yAcc: sensorData.accelerometer.y,
          zAcc: sensorData.accelerometer.z,
          xGyro: sensorData.gyroscope.x,
          yGyro: sensorData.gyroscope.y,
          zGyro: sensorData.gyroscope.z,
        };
        //---generacion traza xapi


        const myStatement = funciones.gyroAndAccel({
          user: userr,
          email: dtt.email,
          sessionId: dtt.sessionId,
          classId: dtt.classId,
          niclaId: dtt.niclaId,
          gyrox: data.xGyro,
          gyroy: data.yGyro,
          gyroz: data.zGyro,
          accx: data.xAcc,
          accy: data.yAcc,
          accz: data.zAcc

        });
        // Send your statement
        guardarTrazaXAPI(dtt.classId, userr, myStatement);
        //--------------------------



        if (liveData.has(sensorData.id)) {
        } else {
          let content = {
            values: [],
            predictionDone: false,
            numLinesRead: 35,
          };
          liveData.set(sensorData.id, content);
        }
        // sum up the absolutes
        if (liveData.get(sensorData.id).numLinesRead == numLinesPerFile) {
          let aSum_G =
            Math.abs(data.xGyro) + Math.abs(data.yGyro) + Math.abs(data.zGyro);
          let aSum_A =
            Math.abs(data.xAcc) + Math.abs(data.yAcc) + Math.abs(data.zAcc);

          // check of it's above the threshold
          if (aSum_G >= threshold_gyro || aSum_A >= threshold_acc) {
            let content = liveData.get(sensorData.id);
            content.numLinesRead = 0;
            liveData.set(sensorData.id, content);
            //console.log("suma absoluto : "+aSum+" xG:"+data.xGyro+"  yG"+data.yGyro+"  zG"+data.zGyro);
            datafile =
              "sequence,AccelerometerX,AccelerometerY,AccelerometerZ,GyroscopeX,GyroscopeY,GyroscopeZ\n";
          }
        }

        if (liveData.get(sensorData.id).numLinesRead < numLinesPerFile) {
          if (liveData.get(sensorData.id).values.length < numValuesExpected) {
            // rellenar liveData[] hasta recopilar todos los valores de un gesto
            let content = liveData.get(sensorData.id);
            content.values.push(
              data.xAcc,
              data.yAcc,
              data.zAcc,
              data.xGyro,
              data.yGyro,
              data.zGyro
            );
            content.predictionDone = false;

            datafile +=
              numLinesRead +
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
            content.numLinesRead++;
            liveData.set(sensorData.id, content);
            //console.log("leyendo lineas: "+numLinesRead);
          }

          if (liveData.get(sensorData.id).values.length == numValuesExpected) {
            //console.log(liveData.get(sensorData.id));
            //console.log("liveData: "+liveData);
            /*let gesto = "izquierda";
                  let filename = "./txt/prueba2_"+gesto+"_"+numFileWrite+".csv";
                  //const writeStream = fs.createWriteStream('data.csv');
                  const writeStream = fs.createWriteStream(filename);
                  writeStream.write(datafile);
                  numFileWrite++;*/
            processSensorData(sensorData.id);
          }
        }

        started = true;
      }
    }
  }
  if (topic === "Scanned") {
    const str = message.toString();
    const list = str.replace(/'/g, "").split(", ");
   
    let lista = [];
    for (let i = 0; i < list.length; i++) {
      lista.push(extractNumberFromMAC(list[i]));
    }
    
    let current_array = [];

    database.query("SELECT * FROM board", function (SELECTerror, result) {
      if (SELECTerror) throw SELECTerror;
      else {
        current_array = result.map((item) => {
          return {
            id: item.id,
            ocupado: item.taken,
          };
        });

        for (let i = current_array.length - 1; i >= 0; i--) {
          if (current_array[i].ocupado == "no") {
            database.query(
              "DELETE FROM board WHERE id = ? ",
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
          
          for (let j = 0; j < current_array.length; j++) {
            if (current_array[j].id == lista[i]) {
              existe = true;
            }
          }

          
          if (existe == false) {
            
            database.query(
              "INSERT INTO board (id, taken) VALUES (?, 'no')",
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
  return result;
}

const processSensorData = (id) => {
  // Perform TensorFlow.js processing on the accelerometer and gyroscope data
  // to extract relevant information for the Tetris game
  let content = liveData.get(id);
  if (content.predictionDone == false && content.values.length) {
    content.predictionDone = true;
    predict(model, content.values, id);
    content.values = []; //vaciar el array para el nuevo gesto
    liveData.set(id, content);
  }
};

const predict = (model, newSampleData, id) => {
  
  
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
        
        break;
      case "derecha":
        obj.action = "right";
        
        break;
      case "abajo":
        obj.action = "down";
        
        break;
      case "espacio":
        obj.action = "space";
        
        break;
      case "rotar":
        obj.action = "up";
        
        break;
      default:
        obj.action = "default";
        
        break;
    }
    //io.to(socket.id)
    io.emit("message", obj);
    //console.log(id+"message"+obj.action)
  });
};

init();

//View engine setup
app.set("view engine", "ejs");

//----get maxima puntuacion user
function getHighscore() {
  const query = "SELECT username, SUM(session_score) AS total_score FROM session GROUP BY username ORDER BY total_score DESC LIMIT 1";

  return new Promise((resolve, reject) => {
    database.query(query, [], function (error, result) {
      if (error) {
        console.log(error.message);
        reject(error);
      } else {
        let highscore;
        if (result.length > 0) {
          highscore = {
            username: result[0].username,
            puntos: result[0].total_score
          };
        } else {
          highscore = {
            username: ".",
            puntos: 0
          };
        }
        resolve(highscore);
      }
    });
  });
}



//-----------------------



//socket.io

io.on("connection", (socket) => {
  console.log("Nuevo usuario contado con ID: " + socket.id);
  //console.log(socket.request);
  socket.on("abrirWeb", function (data) {
    let dtt = cache.get(data.user);
    if(dtt!=undefined){
    socketUser.set(socket.id, data.user);
    const myStatement = funciones.abrirWeb({
      user: data.user,
      email: dtt.email,
      });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, data.user, myStatement);
    }

  });

  socket.on("start", function (data) {

    let dtt = cache.get(data.user);
    if (dtt != undefined) {
      dtt.enJuego = "si";
    
    cache.set(data.user, dtt);
    const myStatement = funciones.iniciaPartida({
      user: data.user,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, data.user, myStatement);
  }
  });


  socket.on("button-menu", function (data) {

    let dtt = cache.get(data.user);
    if(dtt!=undefined){
    const myStatement = funciones.interfaz({
      user: data.user,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      boton: data.button
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, data.user, myStatement);
  }
  });

  socket.on("game_over", function (game) {
   
    let dtt = cache.get(game.username);
    if (dtt != undefined) {
      dtt.enJuego = "no";
    

    cache.set(game.username, dtt);
    const myStatement = funciones.finalizaPartida({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
    database.query(
      "INSERT INTO session (id, username, id_board, session_score) VALUES (NULL, ?, ?, ?)",
      [game.username, game.board, game.score]
    ),
      function (error, result) {
        if (error) throw error;
      };
  });


  socket.on("paused", function (game) {
    let dtt = cache.get(game.username);
    if (dtt != undefined) {
      dtt.enJuego = "no";
    
    cache.set(game.username, dtt);
    const myStatement = funciones.pausaPartida({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });
  socket.on("reanudado", function (game) {
    let dtt = cache.get(game.username);
    if (dtt != undefined) {
      dtt.enJuego = "si";
    
    cache.set(game.username, dtt);
    const myStatement = funciones.resumePartida({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });
  socket.on("accessHighscore", function (game) {
    let dtt = cache.get(game.username);
    if(dtt!=undefined){
    const myStatement = funciones.accessHighscore({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });

  socket.on("volverAjuego", function (game) {
    let dtt = cache.get(game.username);
    if(dtt!=undefined){
    const myStatement = funciones.iraJuego({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });



  socket.on("about", function (game) {
    let dtt = cache.get(game.username);
    if(dtt!=undefined) {
    const myStatement = funciones.accessAbout({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });



  socket.on("key", function (game) {
    let dtt = cache.get(game.username);
    if(dtt!=undefined){

    const myStatement = funciones.arrow({
      user: game.username,
      email: dtt.email,
      sessionId: dtt.sessionId, // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
      classId: dtt.classId, // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
      niclaId: dtt.niclaId, // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
      puntosPartida: game.score,
      attemptt: game.attempt,
      levell: game.level,
      liness: game.lines,
      apmm: game.apm,
      timee: game.time,
      movimiento: game.key
    });
    // Send your statement
    guardarTrazaXAPI(dtt.classId, game.username, myStatement);
  }
  });



  socket.on("fichaGenerada", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "generated");

  });
  socket.on("fichaColocada", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "released");

  });
  socket.on("fichaIzq", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "left");

  });
  socket.on("fichaDer", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "right");

  });
  socket.on("fichaAbajo", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "down");

  });
  socket.on("fichaRotar", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "rotate");

  });
  socket.on("fichaEspacioAbajo", function (game) {
    let dtt = cache.get(game.username);
    fichasTrazaComun(game, dtt, "forcedown");

  });
  function fichasTrazaComun(game, dtt, accionn) {
    if(dtt!=undefined){
    getHighscore().then((highscore) => {
      const maxPuntos = highscore;
      
      const myStatement = funciones.ficha({
        user: game.username,
        email: dtt.email,
        sessionId: dtt.sessionId,
        classId: dtt.classId,
        niclaId: dtt.niclaId,
        puntosPartida: game.score,
        attemptt: game.attempt,
        levell: game.level,
        liness: game.lines,
        apmm: game.apm,
        timee: game.time,
        ficha: game.ficha,
        accion: accionn,
        iduser: maxPuntos.username,
        puntosMAx: maxPuntos.puntos
      });

      guardarTrazaXAPI(dtt.classId, game.username, myStatement);

    }).catch((error) => {
      console.error(error);
    });
  }
  }
  socket.on("removelines", function (game) {
    let dtt = cache.get(game.username);
    if(dtt!=undefined){
    getHighscore().then((highscore) => {
      const maxPuntos = highscore;
  
      
      const myStatement = funciones.destruyeFila({
        user: game.username,
        email: dtt.email,
        sessionId: dtt.sessionId,
        classId: dtt.classId,
        niclaId: dtt.niclaId,
        puntosPartida: game.score,
        attemptt: game.attempt,
        levell: game.level,
        liness: game.lines,
        apmm: game.apm,
        timee: game.time,
        roww: game.removedRow,
        iduser: maxPuntos.username,
        puntosMAx: maxPuntos.puntos
      });

      guardarTrazaXAPI(dtt.classId, game.username, myStatement);

    }).catch((error) => {
      console.error(error);
    });
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
    
    let usuarioname= socketUser.get(socket.id);
    if(usuarioname!=undefined){
    let dtt = cache.get(usuarioname);
    if(dtt!=undefined){
    
    const myStatement = funciones.salirPaginaWeb({
      user: usuarioname,
      email: dtt.email,
      });
    // Send your statement
    guardarTrazaXAPI(dtt.classId,usuarioname, myStatement);
    }
    }
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
  if (req.session.loggedin && req.session.role === 3) { //si es el usuario, vamos al juego
    if (req.session.board === undefined) {
      database.query("SELECT * FROM board", function (error, data) {
        if (error) throw error;
        res.render("board", {
          boards: data,
          user: req.session.username,
        });
      });
    } else {
      res.render("tetris", {
        datos: { board: req.session.board, user: req.session.username },
      });
    }
  } else if (req.session.loggedin && req.session.role === 2) { //si es el profesor, vamos al panel del profesor
    database.query("SELECT u.*, i.name AS institution_name, r.description AS role_description, g.name AS study_group_name FROM user u JOIN institution i ON u.institution_id = i.id JOIN role r ON u.role = r.id LEFT JOIN study_group g ON g.id = u.study_group_id WHERE u.institution_id = ?", [req.session.institution_id], function (error, user_data) {
      if (error) throw error;
      else {
        database.query("SELECT * FROM study_group where institution_id = ?", [req.session.institution_id], function (error, group_data) {
          if (error) throw error;
          else res.render("professor", { user_list: user_data, user: req.session.username, group_list: group_data });
        });
      }
    });
  }
  else if (req.session.loggedin && req.session.role === 1) { //si es el admin, vamos al panel de admin
    database.query("SELECT u.*, i.name AS institution, r.description AS role_description, sg.name AS study_group_name FROM user u JOIN institution i ON u.institution_id = i.id JOIN role r ON u.role = r.id LEFT JOIN study_group sg ON sg.id = u.study_group_id AND sg.institution_id = u.institution_id", function (error, user_data) {
      if (error) throw error;
      else {
        database.query("SELECT * FROM board", function (error, board_data) {
          if (error) throw error;
          else {
            database.query("SELECT institution.*, COUNT(study_group.id) as num_group FROM institution LEFT JOIN study_group ON institution.id = study_group.institution_id GROUP BY institution.id", function (error, institution_data) {
              if (error) throw error;
              else {
                database.query("SELECT * FROM role", function (error, role_data) {
                  if (error) throw error;
                  else {
                    database.query("SELECT * FROM study_group", function (error, group_data) {
                      if (error) throw error;
                      else {
                        res.render("admin", { user: req.session.username, user_list: user_data, board_list: board_data, institution_list: institution_data, role_list: role_data, group_list: group_data });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  else { //si no hemos iniciado sesion redireccionar a login
    res.render("login");
  }
});

//muestra la lista de instituciones disponibles a la hora de registrarse
app.get("/register", function (req, res) {
  if (req.session.loggedin) { //si ya he iniciado sesión, redirigir a la pantalla correspondiente
    res.redirect("/board");
  } else { //sino, redirigir a la pantalla del registro
    database.query("SELECT institution.*, COUNT(study_group.id) AS num_group FROM institution JOIN study_group ON institution.id = study_group.institution_id GROUP BY institution.id HAVING COUNT(study_group.id) > 0;", function (error, data) {
      if (error) {
        console.log(error.message);
        res.status(500).send('Se ha producido un error al recuperar las instituciones de la base de datos');
      }
      else res.render("register", { institution_list: data });
    });
  }
});

app.get("/board", function (req, res) {
  if (req.session.role === 3) { //si soy usuario redirigir al juego
    if (req.session.board === undefined) {
      database.query("SELECT * FROM board", function (error, data) {
        if (error) throw error;
        res.render("board", { boards: data, user: req.session.username });
      });
    } else {
      res.render("tetris", {
        datos: { board: req.session.board, user: req.session.username },
      });
    }
  } else if (req.session.role === 2) { //si soy profesor, mostrar panel de profesor
    database.query("SELECT u.*, i.name AS institution_name, r.description AS role_description, g.name AS study_group_name FROM user u JOIN institution i ON u.institution_id = i.id JOIN role r ON u.role = r.id LEFT JOIN study_group g ON g.id = u.study_group_id WHERE u.institution_id = ?", [req.session.institution_id], function (error, user_data) {
      if (error) throw error;
      else {
        database.query("SELECT * FROM study_group where institution_id = ?", [req.session.institution_id], function (error, group_data) {
          if (error) throw error;
          else res.render("professor", { user_list: user_data, user: req.session.username, group_list: group_data });
        });
      }
    });
  } else if (req.session.role === 1) { //si soy admin, mostrar panel del admin
    database.query("SELECT u.*, i.name AS institution, r.description AS role_description, sg.name AS study_group_name FROM user u JOIN institution i ON u.institution_id = i.id JOIN role r ON u.role = r.id LEFT JOIN study_group sg ON sg.id = u.study_group_id AND sg.institution_id = u.institution_id", function (error, user_data) {
      if (error) throw error;
      else {
        database.query("SELECT * FROM board", function (error, board_data) {
          if (error) throw error;
          else {
            database.query("SELECT institution.*, COUNT(study_group.id) as num_group FROM institution LEFT JOIN study_group ON institution.id = study_group.institution_id GROUP BY institution.id", function (error, institution_data) {
              if (error) throw error;
              else {
                database.query("SELECT * FROM role", function (error, role_data) {
                  if (error) throw error;
                  else {
                    database.query("SELECT * FROM study_group", function (error, group_data) {
                      if (error) throw error;
                      else {
                        res.render("admin", { user: req.session.username, user_list: user_data, board_list: board_data, institution_list: institution_data, role_list: role_data, group_list: group_data });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } else {
    res.render("login");
  }
});

//endpoint que recupera las placas
app.get("/get_boards", function (req, res) {
  if (req.session.loggedin && req.session.role === 3 && req.session.board === undefined) {
    searchForBoard(res);
  } else {
    res.redirect("/board");
  }
});

function searchForBoard(res) {
  database.query("SELECT * FROM board", function (error, result) {
    if (error) throw error;
    else {
      if (result.length > 0) {
        res.status(200).send(result);
      } else {
        // Si no se encuentra ningún elemento, esperar 1 segundo y realizar otra búsqueda
        setTimeout(function () {
          searchForBoard(res);
        }, 1000);
      }
    }
  });
}
//endpoint que sirve para redirigir al la pantalla correspondiente en caso de que el usuario quiera hacer bypass con la URI
app.get("/tetris", function (req, res) {
  res.redirect("/board");
});

//endpoint para las peticiones GET que no existen
app.get('*', function (req, res) {
  res.render("404");
});

//endpoint que sirve para actualizar el estado de una placa
app.post("/tetris", function (req, res) {
  //mostrar tetris
  req.session.board = req.body.board;
  //console.log(req.session.board);
  //actualizar en la base de datos el estado de la placa
  database.query(
    "UPDATE board SET taken = 'si' WHERE id = ?",
    [req.body.board],
    function (error, result) { 
      if (error) throw error;
    }
  );
  //mantener cache con los usuarios que tienen iniciado sesion
  let dat = cache.get(req.session.username);
  dat.niclaId = req.session.board;
  cache.set(req.session.username, dat);
  userNicla.set(req.session.board, req.session.username);
  res.render("tetris", {
    datos: { board: req.session.board, user: req.session.username },
  });
});

app.post("/delete_user", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const role = data.get('role');
  const username = data.get('username');
  const isadmin = data.get('admin');
  if (role === "1" || (role === "2" && isadmin === 'false')) {
    res.status(200).json({ message: "Operation not allowed" });
  } else {
    database.query("DELETE from user WHERE username = ?", [username], function (error, result) {
      if (error) throw error;
      else {
        res.redirect("/board");
      }
    });
  }
});

app.post("/delete_institution", function (req, res) {
  let id = req.body.institution_id;
  if (id.trim() === "0") {
    res.status(500).send("Is not possible to delete the admin institution");
  } else {
    database.query("DELETE from institution WHERE id = ?", [id.trim()], function (error, result) {
      if (error) {
        console.log(error.message);
        res.status(500).send(error.message);
      }
      else {
        res.redirect("/board");
      }
    });
  }
});

app.post("/delete_group", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const id = data.get('study_group_id');
  database.query("DELETE from study_group WHERE id = ?", [id], function (error, result) {
    if (error) {
      console.log(error.message);
      res.status(500).send("No se puede borrar el grupo porque hay usuarios pertenencientes a el");
    }
    else {
      res.redirect("/board");
    }
  });
});

app.post("/update_group", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const id = data.get('study_group_id');
  const name = data.get('study_group_name');
  database.query("UPDATE study_group SET name = ? WHERE id = ?", [name, id], function (error, result) {
    if (error) {
      console.log(error.message);
      res.status(500).send("Se ha producido un error al actualizar el nombre del grupo");
    }
    else {
      res.redirect("/board");
    }
  });
});

app.post("/update_user", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const name = data.get('name');
  const surname = data.get('surname');
  const age = data.get('age');
  const role = data.get('role');
  const institution = data.get('institution');
  const username = data.get('username');
  const study_group = data.get('study_group_id');
  if (study_group === '') {
    database.query("UPDATE user SET name = ?, surname = ?, age = ?, role = ?, institution_id = ? WHERE username = ?", [name, surname, age, role, institution, username], function (error, result) {
      if (error) {
        console.log(error.message);
        res.status(500).send("Se ha producido un error al actualizar el usuario seleccionado");
      }
      else {
        res.redirect("/board");
      }
    });
  } else {
    database.query("UPDATE user SET name = ?, surname = ?, age = ?, role = ?, institution_id = ?, study_group_id = ? WHERE username = ?", [name, surname, age, role, institution, study_group, username], function (error, result) {
      if (error) {
        console.log(error.message);
        res.status(500).send("Se ha producido un error al actualizar el usuario seleccionado");
      }
      else {
        res.redirect("/board");
      }
    });
  }
});

app.post("/study_group", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const institution_id = data.get('institution');
  database.query("SELECT id, name FROM study_group WHERE institution_id = ?", [institution_id], function (error, result) {
    if (error) {
      console.log(error.message);
      res.status(500).send("Se ha producido un problema a la hora de buscar los grupos disponibles");
    } else {
      res.status(200).send(result);
    }
  });
});

app.post("/stats", function (req, res) {
  if (req.session.loggedin && req.session.role === 2){
    const data = new URLSearchParams(req.body.data);
    const study_group_id = data.get('study_group_id');
    if (study_group_id.length > 4) {
      database.query("SELECT * FROM xapi WHERE classId = ?", [study_group_id], function (error, result) {
        if (error) {
          console.log(error.message);
          res.status(500).send("Se ha producido un problema a la hora de recuperar datos xApi");
        } else {
          res.status(200).send(result);
        }
      });
    } else {
      database.query("SELECT * FROM xapi WHERE classid IN (SELECT DISTINCT id FROM study_group WHERE study_group.institution_id = ?)", [study_group_id], function (error, result) {
        if (error) {
          console.log(error.message);
          res.status(500).send("Se ha producido un problema a la hora de recuperar datos xApi");
        } else {
          res.status(200).send(result);
        }
      });
    }
  }else {
    res.redirect("/board");
  }
});

app.post("/auth", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const username = data.get('user');
  const password = data.get('pass');
  //board = request.body.board;
  //let ocupado = false;
  //comprobación de registro
  if (username && password) {
    database.query(
      "SELECT * FROM user WHERE username = ?",
      [username],
      function (error, result) {
        // If there is an issue with the query, output the error
        if (error) {
          console.log(error.message);
          res.status(500).send("No se ha encontrado en usuario con el username especificado");
        }
        // If the account exists
        if (result.length > 0) {
          //[Bcrypt] Comprobamos si las contraseñas coinciden
          bcrypt.compare(password, result[0].password, function (error) {
            if (error) {
              console.log(error.message);
              res.status(500).send("La contraseña es errónea");
            } else {
              // password is valid => Authenticate the user
              req.session.loggedin = true; //existe una sesión iniciada
              req.session.username = result[0].username; //nombre del usuario
              req.session.role = result[0].role; //role del usuario
              req.session.institution_id = result[0].institution_id; //institutción del usuario
              
              ///-----
              cache.set(result[0].username, { sessionId: req.sessionID, classId: result[0].study_group_id, niclaId: "", enJuego: "no" ,email: result[0].email});

              //-------
              res.status(200).send("/board");
            }
          });
        } else {
          console.log("User does not exist in the database");
          res.status(500).send("Usuario erróneo o password incorrecto");
        }
      }
    );
  } else {
    console.log("Usename or password fields not valid");
    res.status(500).send("Uno de los campos introducidos no es válido");
  }
});

app.post("/new_institution", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const institution = data.get('institution');
  database.query("SELECT id FROM institution", function (error, institutions_id) {
    if (error) throw error;
    else {
      let val = Math.floor(1000 + Math.random() * 9000);
      while (institutions_id.some(e => e.id === val)) {
        val = Math.floor(1000 + Math.random() * 9000);
      }
      database.query("INSERT INTO institution (id, name) VALUES (?, ?)", [val, institution], function (error, result) {
        if (error) {
          console.log(error.message);
          res.status(500).send(error.message);
        }
        else res.redirect("/board")
      });
    }
  });
});

app.post("/new_group", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const institution_id = data.get('institution_id');
  const group = data.get('group');
  database.query("SELECT id FROM study_group", function (error, groups_id) {
    if (error) {
      console.log(error.message);
      res.status(500).send("Se ha producido un error al recuperar los ids de la base de datos");
    }
    else {
      let val = Math.floor(10000000 + Math.random() * 90000000);
      while (groups_id.some(e => e.id === val)) {
        val = Math.floor(10000000 + Math.random() * 90000000);
      }
      database.query("INSERT INTO study_group (id, name, institution_id) VALUES (?, ?, ?)", [val, group, institution_id], function (error, result) {
        if (error) {
          console.log(error.message);
          res.status(500).send("El id del grupo ya existe, por favor, reintente de nuevo");
        }
        else res.redirect("/board")
      });
    }
  });
});

app.post("/new", function (req, res) {
  const data = new URLSearchParams(req.body.data);
  const admin = data.get('admin');
  const email = data.get('email');
  let password_verification = data.get('pass2');
  const username = data.get('username');
  const name = data.get('name');
  const surname = data.get('surname');
  const age = data.get('age');
  const password = data.get('pass');
  const institution = data.get('institution');
  const study_group_id = data.get('study_group_id');
  if (admin === "true") {
    password_verification = password;
  }

  if (username && name && surname && age && password && password_verification && institution && email) {
    if (password === password_verification) {
      //check if username is already taken or exist on the database
      database.query(
        "SELECT username FROM user WHERE username = ?",
        [username],
        function (error, result) {
          if (error) {
            console.log(error.message);
            res.status(500).send("El username o el email ya existe");
          }
          else {
            //[Bycript] Ciframos la contraseña con un salt=10
            bcrypt.hash(password, 10, function (error, hash) {
              if (error) {
                console.log(error.message);
                res.status(500).send("Se ha producido un error al cifrar la contraseña");
              } else {
                //insert the new username into the database
                database.query(
                  "INSERT INTO user (username, email, name, surname, age, password, role, institution_id, study_group_id) VALUES (?, ?, ?, ?, ?, ?,'3', ?, ?)",
                  [username, email, name, surname, age, hash, institution, study_group_id],
                  function (error) {
                    // If there is an issue with the query, output the error
                    if (error) {
                      console.log(error.message);
                      res.status(500).send("El nombre de usuario ya existe");
                    }
                    else if (admin === "true") {
                      res.redirect("/board");
                    } else {
                      res.status(200).send("Usuario registrado con éxito");
                    }
                  }
                );
              }
            });
          }
        }
      );
    } else {
      console.log("Las contraseñas no coinciden");
      res.status(500).send("Las contraseñas no coinciden");
    }
  } else {
    console.log("Alguno de los campos introducidos no es válido");
    res.status(500).send("Se ha producido un error en alguno de los campos introducidos");
  }
});

app.post("/logout", function (req, res) {
  if (req.session) {
    if (req.session.board) {
      database.query(
        "UPDATE board SET taken = 'no' WHERE id = ?",
        [req.session.board],
        function (error, result) {
          if (error) throw error;
        }
      );
      if(req.session.board!=undefined){
      userNicla.del(req.session.board);
      }
    }
    if(req.session.username!=undefined){
    cache.del(req.session.username);
    }
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
      } else {
        res.render("login");
      }
    });

  } else {
    res.end("{'message': 'no se ha iniciado sesion previamente'}");
  }
});

server.listen(port, function () {
  console.log(`Tetris app listening on port ${port}`);
});
