function render404Page(req, res) {
  res.status(404).type("html").send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>404 Not Found</title></head>
<body>
  <h1>404</h1>
  <p>The page you requested was not found.</p>
</body>
</html>`);
}

function render500Page(req, res) {
  res.status(500).type("html").send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>500 Server Error</title></head>
<body>
  <h1>500</h1>
  <p>Something went wrong on the server.</p>
</body>
</html>`);
}

module.exports = {
  render404Page,
  render500Page
};
