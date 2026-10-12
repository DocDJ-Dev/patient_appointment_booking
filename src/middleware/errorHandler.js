const config = require("../config/env");

function errorHandler(err, req, res, next) {
  console.error("=====Error====");
  console.error(`Message: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error("=====Error====");

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body!",
      code: "INVALID_JSON",
    });
  }

  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";

  const isProduction = config.environment === "production";

  let message =
    err.isOperational || !isProduction
      ? err.message
      : "Something went wrong. Please try again later.";

  if (err.code === "28P01") {
    statusCode = 503;
    code = "INCORRECT_PASSWORD";
    message = "DB Password authentication failed";
  }

  if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
    statusCode = 503;
    code = "CONNECTION_FAILED";
    message = "DB connection failed";
  }
  if (err.code === "23505") {
    let fieldName = "field";
    let fieldValue = "";

    if (err.detail) {
      const match = err.detail.match(/Key \((.*?)\)/);
      if (match) {
        fieldName = match[1];
        fieldValue = match[2];
      }
    }
    statusCode = 409;
    code = "DUPLICATION_ERROR";
    message = `A record with ${fieldName} '${fieldValue}' already exist`;
  }

  if (err.code === "23503") {
    let detailMsg = "Referenced related record does not exist.";

    if (err.detail) {
      const match = err.detail.match(
        /Key \((.*?)\)=\((.*?)\ is not present in the table '(.*?)'(?:[.,].*)?/,
      );

      if (match) {
        const field = match[1];
        const table = match[3];
        detailMsg = `The provided ${field} does not exist in the ${table} table`;
      }
    }
    statusCode = 400;
    code = "FOREIGN_KEY_VIOLATION";
    message = detailMsg;
  }

  const response = {
    error: message,
    code,
  };

  if (err.retryAfter) {
    response.retryAfter = err.retryAfter;
  }

  if (err.details) {
    response.details = err.details;
  }

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
