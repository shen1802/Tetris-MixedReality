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
function generateUUID(sessionId) {
    const hash = crypto.createHash('sha256');
    hash.update(sessionId);
    const digest = hash.digest('hex');
  
    // Construir el UUID utilizando los primeros 16 bytes del hash
    const uuid = digest.substr(0, 32);
    return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }
exports.agent = agent;
exports.generateUUID = generateUUID;
exports.creaUUID = creaUUID;
