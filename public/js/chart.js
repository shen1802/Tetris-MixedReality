// const xValues = [100,200,300,400,500,600,700,800,900,1000];

// new Chart("myChart", {
//   type: "polarArea",
//   data: {
//     labels: xValues,
//     datasets: [{
//       data: [860,1140,1060,1060,1070,1110,1330,2210,7830,2478],
//       borderColor: "red",
//       fill: false
//     },{
//       data: [1600,1700,1700,1900,2000,2700,4000,5000,6000,7000],
//       borderColor: "green",
//       fill: false
//     },{
//       data: [300,700,2000,5000,6000,4000,2000,1000,200,100],
//       borderColor: "blue",
//       fill: false
//     }]
//   },
//   options: {
//     legend: {display: false}
//   }
// });

const jsonData = {
  "id": "8c64bc42-18c2-4bbf-ba0b-3cbd676edb00",
  "verb": {
    "id": "https://w3id.org/xapi/seriousgames/verbs/interacted",
    "display": {
      "en-US": "interacted"
    }
  },
  "actor": {
    "mbox": "mailto:mm@ucm.es",
    "name": "player",
    "objectType": "Agent"
  },
  "object": {
    "id": "http://adlnet.gov/expapi/figure/ficha_Z",
    "definition": {
      "name": {
        "en-US": "ficha_Z"
      },
      "type": "http://www.example.com/types/game-object"
    },
    "objectType": "Activity"
  },
  "result": {
    "score": {
      "raw": 216
    },
    "extensions": {
      "https://www.tetris.com/apm": 580,
      "https://www.tetris.com/time": 3,
      "https://www.tetris.com/level": 1,
      "https://www.tetris.com/lines": 0,
      "https://www.tetris.com/attempt": 1,
      "https://www.tetris.com/highscore": [
        {
          "id": "siao",
          "score": 66
        }
      ],
      "https://www.tetris.com/figure/movement": "released"
    }
  },
  "stored": "2023-05-16T19:21:04.341313+00:00",
  "context": {
    "extensions": {
      "https://example.com/niclaID": "1"
    },
    "registration": "0ffe5958-808a-b228-b402-a310f671af43",
    "contextActivities": {
      "parent": [
        {
          "id": "https://www.tetris.com//class/42525681",
          "objectType": "Activity"
        },
        {
          "id": "http://adlnet.gov/expapi/figure/ficha_Z",
          "definition": {
            "name": {
              "en-US": "ficha_Z"
            },
            "type": "http://www.example.com/types/game-object"
          },
          "objectType": "Activity"
        }
      ]
    }
  },
  "version": "1.0.0",
  "authority": {
    "mbox": "mailto:xapi-tools@adlnet.gov",
    "name": "xapi-tools",
    "objectType": "Agent"
  },
  "timestamp": "2023-05-16T19:20:49.385Z"
};

// Extract the extension values
const extensions = jsonData.result.extensions;
const extensionLabels = Object.keys(extensions);
const extensionValues = Object.values(extensions);

// Create a chart using Chart.js
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'bar', 
  data: {
    labels: extensionLabels,
    datasets: [{
      label: 'Extension Values',
      data: extensionValues,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
    
  }
});
