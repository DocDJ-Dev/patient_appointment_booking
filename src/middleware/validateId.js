const { ValidationError } = require("../utils/error");

function validateId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new ValidationError("ID is needed and must be a number");
  }

  req.validatedId = id;
  next();
}

module.exports = validateId;
