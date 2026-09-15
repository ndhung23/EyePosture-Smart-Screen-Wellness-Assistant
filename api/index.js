const { EyePostureApiServer } = require('../apps/api/dist/server.js');

let serverInstance = null;

function getServer() {
  if (!serverInstance) {
    serverInstance = new EyePostureApiServer();
  }
  return serverInstance;
}

module.exports = async function handler(req, res) {
  const server = getServer();
  return server.handleRequest(req, res);
};
