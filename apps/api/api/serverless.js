const { EyePostureApiServer } = require('../src/server.ts');

let serverInstance = null;

function getServer() {
  if (!serverInstance) {
    serverInstance = new EyePostureApiServer();
  }
  return serverInstance;
}

async function handler(req, res) {
  const server = getServer();
  return server.handleRequest(req, res);
}

handler.default = handler;
module.exports = handler;
module.exports.default = handler;
