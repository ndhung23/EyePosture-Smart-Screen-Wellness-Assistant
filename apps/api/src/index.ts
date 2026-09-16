import { handleServerless, EyePostureApiServer } from './server.js';

export * from './server.js';
export default handleServerless;

const modRef = typeof (globalThis as any).module !== 'undefined' ? (globalThis as any).module : null;
if (modRef && modRef.exports) {
  modRef.exports = handleServerless;
  modRef.exports.default = handleServerless;
  modRef.exports.handleServerless = handleServerless;
  modRef.exports.EyePostureApiServer = EyePostureApiServer;
}

