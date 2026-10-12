const { TooManyRequestsError } = require("../utils/error");

const requestCounts = {};
const WINDOW_MS = 60000;
const MAX_REQUESTS = 10;

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 1, windowStart: now };
    return next();
  }

  const record = requestCounts[ip];
  const elapsed = now - record.windowStart;

  if (elapsed > WINDOW_MS) {
    record.count = 1;
    record.windowStart = now;
    return next();
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - elapsed) / 1000);
    throw new TooManyRequestsError(
      `Too many requests. Try again in ${retryAfter}s`,
    );
  }

  next();
}

module.exports = rateLimiter;
