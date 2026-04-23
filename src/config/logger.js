const pino = require("pino");
const env = require("./env");

const logger = pino({
  name: env.appName,
  level: env.logLevel,
  base: undefined,
  redact: {
    paths: [
      "req.headers.authorization",
      "authorization",
      "password",
      "token",
      "secret"
    ],
    censor: "[REDACTED]"
  }
});

module.exports = logger;
