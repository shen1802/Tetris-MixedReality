const Verbs = {
    INITIALIZED : {
        "id": "http://adlnet.gov/expapi/verbs/initialized",
        "display": {
            "en-US": "initialized"
        }
    },
    LAUNCHED : {
        "id": "http://adlnet.gov/expapi/verbs/launched",
        "display": {
            "en-US": "launched"
        }
    },
    EXITED : {
        "id": "http://adlnet.gov/expapi/verbs/exited",
        "display": {
            "en-US": "exited"
        }
    },
    COMPLETED : {
        "id": "http://adlnet.gov/expapi/verbs/completed",
        "display": {
            "en-US": "completed"
        }
    },
    SUSPENDED : {
        "id": "http://adlnet.gov/expapi/verbs/suspended",
        "display": {
            "en-US": "suspended"
        }
    },
    RESUMED : {
        "id": "http://adlnet.gov/expapi/verbs/resumed",
        "display": {
            "en-US": "resumed"
        }
    },
    ACCESED : {
        "id": "https://w3id.org/xapi/seriousgames/verbs/accessed",
        "display": {
            "en-US": "accessed"
        }
    },
    INTERACTED : {
        "id": "https://w3id.org/xapi/seriousgames/verbs/interacted",
        "display": {
            "en-US": "interacted"
        }
    },
    PRESSED : {
        "id": "https://w3id.org/xapi/seriousgames/verbs/pressed",
        "display": {
            "en-US": "pressed"
        }
    },
     NEW_GAME : {
        id: "https://w3id.org/xapi/seriousgames/activity-types/new_game",
        definition: {
          name: {
            "en-US": "new_game"
          },
          type: "https://w3id.org/xapi/seriousgames/activity-types/controller"
        },
        objectType: "Activity"
      },
      HIGHSCORE: {
        id: "https://w3id.org/xapi/seriousgames/activity-types/highscore",
        definition: {
          name: {
            "en-US": "highscore"
          },
          type: "https://w3id.org/xapi/seriousgames/activity-types/controller"
        },
        objectType: "Activity"
      },
      PAUSE: {
        id: "https://w3id.org/xapi/seriousgames/activity-types/pause",
        definition: {
          name: {
            "en-US": "pause"
          },
          type: "https://w3id.org/xapi/seriousgames/activity-types/controller"
        },
        objectType: "Activity"
      },
      resume: {
        id: "https://w3id.org/xapi/seriousgames/activity-types/resume",
        definition: {
          name: {
            "en-US": "resume"
          },
          type: "https://w3id.org/xapi/seriousgames/activity-types/controller"
        },
        objectType: "Activity"
      },
      about: {
        id: "https://w3id.org/xapi/seriousgames/activity-types/about",
        definition: {
          name: {
            "en-US": "about"
          },
          type: "https://w3id.org/xapi/seriousgames/activity-types/controller"
        },
        objectType: "Activity"
      }
   

}

module.exports = Verbs;
