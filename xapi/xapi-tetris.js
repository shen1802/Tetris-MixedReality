
const Activities = require('./activities');
const Verbs = require('./verbs');
const { agent } = require('./xapi-utils');

const IRI_PREFIX = 'https://www.tetris.com/';
//funciones auxiliares para paramtrizar una funcion que genera trazas y usarla para varias trazas
function actividadFicha(ficha){
    let fichaId;
    switch(ficha) {
        case 'T':
            fichaId = Activities.FICHA_T;
            break;
        case 'L':
            fichaId = Activities.FICHA_L;
            break;
        case 'S':
            fichaId = Activities.FICHA_S;
            break;
        case 'Z':
            fichaId = Activities.FICHA_Z;
            break;
        case 'J':
            fichaId = Activities.FICHA_J;
            break;
        case 'O':
            fichaId = Activities.FICHA_O;
            break;
        case 'I':
            fichaId = Activities.FICHA_I;
            break;
        default:
            fichaId = Activities.FICHA;
    }

    return fichaId;
}


function actividadMovimientoArrow(movimiento){
    let fichaId;
    switch(movimiento) {
        case 'izq':
            fichaId = Activities.LEFT_ARROW;
            break;
        case 'der':
            fichaId = Activities.RIGHT_ARROW;
            break;
        case 'down':
            fichaId = Activities.DOWN_ARROW;
            break;
        case 'up':
            fichaId = Activities.UP_ARROW;
            break;
        default:
            fichaId = null;
    }

    return fichaId;
}


function botonPresionadoActivity(boton){
    let fichaId;
    switch(boton) {
        case 'new_game':
            fichaId = Activities.NEW_GAME_BUTTON;
            break;
        case 'resume':
            fichaId = Activities.RESUME_BUTTON;
            break;
        case 'pause':
            fichaId = Activities.PAUSE_BUTTON;
            break;
        case 'highscore':
            fichaId = Activities.HIGHSCORE_BUTTON;
            break;
        case 'about':
            fichaId = Activities.ABOUT_BUTTON;
            break;
        default:
            fichaId = null;
    }

    return fichaId;
}
function actividadClase(classId) {
    return {
        "id": `${IRI_PREFIX}/class/${classId}`,
        "objectType": "Activity"
    }
}

function extensionesComunes(extensions) {
    const ext = {};
    for(let extension in extensions) {
        ext[`${IRI_PREFIX}${extension}`] = extensions[extension];
    }
    return ext;
}

function iniciaPartida({user, email, sessionId, classId, niclaId}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.INITIALIZED,
        object: Activities.TETRISS,
        "result": {
          "score": {
              "raw": 0
          },
          "extensions": extensionesComunes({
            attempt: 1,
            level: 1,
            lines: 0,
            apm: 0,
            time: 0
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.TETRISS]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}

function finalizaPartida({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.COMPLETED,
        object: Activities.TETRISS,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.TETRISS]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}

function pausaPartida({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.SUSPENDED,
        object: Activities.TETRISS,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.TETRISS]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}

function resumePartida({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.RESUMED,
        object: Activities.TETRISS,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.TETRISS]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}


function accessHighscore({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.ACCESED,
        object: Activities.HIGHSCORE,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.HIGHSCORE]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}


function accessAbout({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.ACCESED,
        object: Activities.ABOUT,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.ABOUT]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}




function iraJuego({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.ACCESED,
        object: Activities.PLAY,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.PLAY]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}



function ficha({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee,ficha,accion, iduser,puntosMAx}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.INTERACTED,
        object: actividadFicha(ficha),
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            "figure/movement" : accion ,
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee ,
            highscore : [{
                "id": iduser,
                "score": puntosMAx
            }]
            
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                actividadFicha(ficha)]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}



function destruyeFila({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee,roww, iduser,puntosMAx}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.INTERACTED,
        object: Activities.DESTROY_ROW,
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            row: roww ,
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee ,
            highscore : [{
                "id": iduser,
                "score": puntosMAx
            }]
            
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                    Activities.DESTROY_ROW]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}




function arrow({user, email, sessionId, classId, niclaId, puntosPartida,attemptt,levell,liness,apmm,timee,movimiento, iduser,puntosMAx}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.PRESSED,
        object: actividadMovimientoArrow(movimiento),
        "result": {
          "score": {
              "raw": puntosPartida
          },
          "extensions": extensionesComunes({
            attempt: attemptt,
            level: levell,
            lines: liness,
            apm: apmm,
            time: timee ,
            highscore : [{
                "id": iduser,
                "score": puntosMAx
            }]
            
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                    actividadMovimientoArrow(movimiento)]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}



function interfaz({user, email, sessionId, classId, niclaId, boton}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.PRESSED,
        object: botonPresionadoActivity(boton),
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                    botonPresionadoActivity(boton)]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}



function abrirWeb({user, email}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.LAUNCHED,
        object: Activities.TETRIS,
        timestamp : new Date().toISOString()
    };

    return myStatement;
}
function salirPaginaWeb({ user, email}) {
    const myStatement = {
      actor: agent(user, email),
      verb: Verbs.EXITED,
      object: Activities.TETRIS,
      timestamp: new Date().toISOString()
    };
  
    return myStatement;
  }
  
  function gyroAndAccel({user, email, sessionId, classId, niclaId, gyrox, gyroy, gyroz , accx, accy, accz}) {
    const myStatement = {
        actor: agent(user, email),
        verb: Verbs.INTERACTED,
        object: Activities.NICLA,
        "result": {
          "extensions": extensionesComunes({
            accelerometer_x: accx,
            accelerometer_y: accy , 
            accelerometer_z: accz ,
            gyroscope_x : gyrox  ,
            gyroscope_y: gyroy  ,
            gyroscope_z: gyroz

            
          }),
        },
        "context": {
            "registration": sessionId,
            "contextActivities": {
                "parent": [actividadClase(classId),
                Activities.TETRISS]
            },
            "extensions": {
                "https://example.com/niclaID": niclaId
            }
        },
        timestamp : new Date().toISOString()
    };

    return myStatement;
}
  
  
  
module.exports = {
    iniciaPartida,
    finalizaPartida,
    pausaPartida,
    resumePartida,
    accessHighscore,
    accessAbout,
    iraJuego,
    ficha,
    destruyeFila,
    arrow,
    interfaz,
    abrirWeb,
    salirPaginaWeb,
    gyroAndAccel,
  };