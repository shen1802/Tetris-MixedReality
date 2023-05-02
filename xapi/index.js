require('dotenv').config()
const XAPI = require("@xapi/xapi");
const { iniciaPartida } = require('./xapi-tetris');
const { creaUUID } = require('./xapi-utils');

const endpoint = process.env.LRS_ENDPOINT || "https://my-lms.com/endpoint";
const username = process.env.LRS_USERNAME || "";
const password = process.env.LRS_PASSWORD || "";
const auth = XAPI.toBasicAuth(username, password);
const xapi = new XAPI({
  endpoint: endpoint,
  auth: auth
});

// Create your statement
const myStatement = iniciaPartida({
  user: 'FDI',
  email: 'fdi@ucm.example.com',
  sessionId : creaUUID(), // Esto es de ejemplo, tendréis que ver cuando se crea y cuando se reutiliza el id de la sesión actual del usuario 
  classId: creaUUID(), // Esto es un ejemplo, debería de venir directamente de la clase en la que haya entrado el usuario. 
  niclaId: creaUUID(), // Esto es un ejemplo, debe de sustituirse por el ID real (del tipo que sea) de la nicla que sostiene el usuario
});  
// Send your statement
xapi.sendStatement({
  statement: myStatement
});