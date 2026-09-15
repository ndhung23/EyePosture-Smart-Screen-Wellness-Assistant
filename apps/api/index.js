const serverModule = require('./dist/server.js');

const EyePostureApiServer = serverModule.EyePostureApiServer || serverModule;
let serverInstance = null;

function getServer() {
  if (!serverInstance) {
    serverInstance = new EyePostureApiServer();
  }
  return serverInstance;
}

// Vercel Serverless Function entry point
function handler(req, res) {
  if (typeof serverModule.handleServerless === 'function') {
    return serverModule.handleServerless(req, res);
  }
  if (typeof serverModule === 'function') {
    return serverModule(req, res);
  }
  const server = getServer();
  return server.handleRequest(req, res);
}

module.exports = handler;
module.exports.default = handler;
