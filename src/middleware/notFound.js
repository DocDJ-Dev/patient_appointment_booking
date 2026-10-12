function notFound(req, res, next) {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.path,
    suggestion: "Check the URL and HTTP method",
  });
}

module.exports = notFound;
