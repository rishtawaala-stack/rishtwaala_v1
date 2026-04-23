const ApiError = require("../utils/api-error");

function parseBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function authMiddleware(req, res, next) {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication token is required."));
  }

  req.auth = {
    token,
    authUserId: "stub-auth-user-id",
    userId: "stub-user-id",
    profileId: "stub-profile-id",
    plan: {
      code: "free",
      expiresAt: null
    },
    adminRole: null
  };

  return next();
}

module.exports = authMiddleware;
