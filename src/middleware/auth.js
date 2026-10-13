const config = require("../config/env");
const { UnauthorizedError } = require("../utils/error");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthorizedError(
      "Unauthorised: Missing or invalid token format",
    );
  }

  const token = authHeader.split(" ")[1];
  const user = config.TOKENS[token];

  if (!user) throw new UnauthorizedError("Unauthorized: Invalid Token");

  req.user = user;
  next();
}

module.exports = auth;
