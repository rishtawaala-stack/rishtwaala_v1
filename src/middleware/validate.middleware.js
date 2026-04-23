const ApiError = require("../utils/api-error");

function formatIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

function validate(schema) {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    });

    if (!result.success) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "Invalid request payload.", formatIssues(result.error.issues))
      );
    }

    req.validated = result.data;
    return next();
  };
}

module.exports = validate;
