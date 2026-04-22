function prefersHtml(req) {
  return req.accepts(["html", "json"]) === "html";
}

function getIp(req) {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

module.exports = {
  prefersHtml,
  getIp
};
