const os = require("os");

function getHealthStatus() {
  return {
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };
}

function getReadinessStatus() {
  return {
    status: "ready",
    services: {
      api: "ok",
      database: "not-configured",
      redis: "not-configured",
      queue: "not-configured"
    },
    host: os.hostname(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getHealthStatus,
  getReadinessStatus
};
