const { ValidationError } = require("../utils/error");

function validateBody(...requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missing.join(", ")}`,
      );
    }

    next();
  };
}

module.exports = validateBody;
