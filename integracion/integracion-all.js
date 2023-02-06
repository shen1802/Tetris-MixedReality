const express = require('express');
const app = express();
const mqtt = require('mqtt');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const client = mqtt.connect('mqtt://test.mosquitto.org');


let liveData = [];
let predictionDone = false;
let started = false;
let model;
const gestureClasses = ['izquierda', 'derecha', 'abajo', 'espacio', 'rotar', 'reposo'];

let numParametersRecorded = 6; // 6 values from board -> 3 accelerometer and 3 gyroscope; 
let numLinesPerFile = 600;
let numValuesExpected = numParametersRecorded * numLinesPerFile; //total de valores por cada gesto

// cargar el modelo
const init = async () => {
  model = await tf.loadLayersModel('file://model/model.json');
}


client.on('connect', () => {
  client.subscribe('sensorData');
});

client.on('message', (topic, message) => {
  if (topic === 'sensorData') {
    const sensorData = JSON.parse(message.toString());

    let dataAvailable = sensorData;
    if(dataAvailable && !started){
      console.log('ready')
    }
    /*const accelerometerX = tf.tensor1d(sensorData.accelerometer.x);
    const accelerometerY = tf.tensor1d(sensorData.accelerometer.y);
    const accelerometerZ = tf.tensor1d(sensorData.accelerometer.z);
    const gyroscopeX = tf.tensor1d(sensorData.gyroscope.x);
    const gyroscopeY = tf.tensor1d(sensorData.gyroscope.y);
    const gyroscopeZ = tf.tensor1d(sensorData.gyroscope.z);*/

    let data = {xAcc: sensorData.accelerometer.x,
      yAcc: sensorData.accelerometer.y,
      zAcc: sensorData.accelerometer.z,
      xGyro: sensorData.gyroscope.x,
      yGyro: sensorData.gyroscope.y,
      zGyro: sensorData.gyroscope.z,
    };

    if (liveData.length < numValuesExpected){ // rellenar liveData[] hasta recopilar todos los valores de un gesto
        predictionDone = false;
        liveData.push(data.xAcc, data.yAcc, data.zAcc, data.xGyro, data.yGyro, data.zGyro)
    }
    else{
        processSensorData(accelerometerX, accelerometerY, accelerometerZ, gyroscopeX, gyroscopeY, gyroscopeZ); 
    }

    started = true;
  }
});

const processSensorData = (accelerometerX, accelerometerY, accelerometerZ, gyroscopeX, gyroscopeY, gyroscopeZ) => {
  // Perform TensorFlow.js processing on the accelerometer and gyroscope data
  // to extract relevant information for the Tetris game
    if(!predictionDone && liveData.length){
        predictionDone = true;
        predict(model, liveData, socket);
        liveData = []; //vaciar el array para el nuevo gesto
    }

}


const predict = (model, newSampleData, socket) => {
  tf.tidy(() => {
      const inputData = newSampleData;

      const input = tf.tensor2d([inputData], [1, numValuesExpected]);
      const predictOut = model.predict(input);
      const logits = Array.from(predictOut.dataSync());
      const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];
      
      // Update the state of the Tetris game using the processed data
      switch(winner){
          case 'izquierda':
              socket.emit('gesture', winner)
              break;
          case 'derecha':
              socket.emit('gesture', winner)
              break;
          case 'abajo':
              socket.emit('gesture', winner)
              break;
          case 'espacio':
              socket.emit('gesture', winner)
              break;
          case 'rotar':
              socket.emit('gesture', winner)
              break;
          default:
              break;
      }
  });
}

init();

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
