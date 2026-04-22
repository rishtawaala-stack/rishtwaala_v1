const { prefersHtml } = require("../utils/request");

function notFoundMiddleware(req, res) {
  if (prefersHtml(req)) {
    return res.redirect(302, "/errors/404");
  }

  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found."
    }
  });
}

module.exports = notFoundMiddleware;
