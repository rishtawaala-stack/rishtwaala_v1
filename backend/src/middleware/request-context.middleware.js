const { randomUUID } = require("crypto");
const { getIp } = require("../utils/request");

function requestContextMiddleware(req, res, next) {
  req.context = {
    requestId: req.headers["x-request-id"] || randomUUID(),
    startedAt: Date.now(),
    ipAddress: getIp(req)
  };

  res.setHeader("X-Request-Id", req.context.requestId);
  next();
}

module.exports = requestContextMiddleware;
