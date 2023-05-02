const crypto = require('crypto');

function agent(name, email) {
    return {
        objectType: "Agent",
        name: name,
        mbox: `mailto:${email}`
      }
}

function creaUUID() {
    return crypto.randomUUID();
}

exports.agent = agent;
exports.creaUUID = creaUUID;
