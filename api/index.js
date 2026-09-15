import { EyePostureApiServer } from '../apps/api/dist/server.js';

let serverInstance;

function getServer() {
  if (!serverInstance) {
    serverInstance = new EyePostureApiServer();
  }
  return serverInstance;
}

export default async function handler(req, res) {
  const server = getServer();
  return server.handleRequest(req, res);
}
