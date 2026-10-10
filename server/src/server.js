const app = require('./app');
const config = require('./config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Mini SaaS Template Store Backend Server`);
  console.log(` Port: ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Allowed Origin: ${config.clientOrigin}`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
