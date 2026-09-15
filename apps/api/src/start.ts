import { EyePostureApiServer } from './server.js';

const port = Number(process.env.PORT || 8080);
const server = new EyePostureApiServer({ port });

server.listen(port).then((actualPort) => {
  console.log('====================================================');
  console.log('🚀 EyePosture API Server & Web Admin Dashboard');
  console.log(`👉 Web Admin UI:  http://localhost:${actualPort}/admin`);
  console.log(`👉 API Endpoints: http://localhost:${actualPort}/api/v1`);
  console.log('👉 SePay Webhook: http://localhost:' + actualPort + '/api/v1/billing/webhook/sepay');
  console.log('====================================================');
}).catch((err) => {
  console.error('Failed to start EyePosture API Server:', err);
  process.exit(1);
});
