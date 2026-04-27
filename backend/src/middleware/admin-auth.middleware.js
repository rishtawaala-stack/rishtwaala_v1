const ApiError = require("../utils/api-error");

function adminAuthMiddleware(req, res, next) {
  if (!req.auth) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication token is required."));
  }

  if (!req.headers["x-admin-role"]) {
    return next(new ApiError(403, "FORBIDDEN", "Admin access is required."));
  }

  req.auth.adminRole = req.headers["x-admin-role"];
  return next();
}

module.exports = adminAuthMiddleware;
