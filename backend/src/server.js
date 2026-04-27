const http = require("http");
const createApp = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");

const app = createApp();
const server = http.createServer(app);

function shutdown(signal) {
  logger.info({ signal }, "Shutdown signal received");

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Error while closing server");
      process.exit(1);
    }

    logger.info("HTTP server closed cleanly");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

server.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      env: env.nodeEnv
    },
    "Server started"
  );
});
