const config = require("../config/env");
const { UnauthorizedError } = require("../utils/error");

const TOKENS = {
  "admin-token-123": { role: "admin", name: "Mr James" },
  "doctor-token-456": { role: "doctor", name: "Dr Desire" },
  "nurse-token-789": { role: "nurse", name: "Sister Ndleve" },
};

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthorizedError(
      "Unauthorised: Missing or invalid token format",
    );
  }

  const token = authHeader.split(" ")[1];
  const user = TOKENS[token];

  if (!user) throw new UnauthorizedError("Unauthorized: Invalid Token");

  req.user = user;
  next();
}

module.exports = auth;
