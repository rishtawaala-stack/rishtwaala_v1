const env = require("../config/env");
const logger = require("../config/logger");
const { prefersHtml } = require("../utils/request");

function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_ERROR";
  const message =
    statusCode >= 500 && env.isProduction
      ? "An unexpected error occurred."
      : error.message || "An unexpected error occurred.";

  logger.error(
    {
      err: error,
      requestId: req.context?.requestId,
      path: req.originalUrl,
      method: req.method
    },
    "Request failed"
  );

  if (res.headersSent) {
    return next(error);
  }

  if (statusCode >= 500 && prefersHtml(req)) {
    return res.redirect(302, env.error500Redirect);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: error.details || undefined,
      requestId: req.context?.requestId
    }
  });
}

module.exports = errorMiddleware;
