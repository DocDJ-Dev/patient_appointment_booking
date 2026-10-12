const crypto = require("crypto");

function generateRequestId(req, res, next) {
  const requestId = crypto.randomBytes(8).toString("hex");
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}

module.exports = generateRequestId;
