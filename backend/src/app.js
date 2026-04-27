const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const env = require("./config/env");
const logger = require("./config/logger");
const requestContextMiddleware = require("./middleware/request-context.middleware");
const { defaultRateLimiter } = require("./middleware/rate-limit.middleware");
const notFoundMiddleware = require("./middleware/not-found.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const routes = require("./routes");

function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
    credentials: true
  };
}

function createApp() {
  const app = express();

  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");

  app.use(requestContextMiddleware);
  if (env.nodeEnv === 'development') {
    app.use(morgan("dev"));
  } else {
    app.use(
      morgan("combined", {
        stream: {
          write(message) {
            logger.info({ http: message.trim() }, "HTTP request");
          }
        }
      })
    );
  }
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(cors(createCorsOptions()));
  app.use(hpp());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(defaultRateLimiter);

  app.use(routes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
