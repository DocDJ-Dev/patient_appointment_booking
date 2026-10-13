const { ForbiddenError } = require("../utils/error");

function authorize(...requiredRoles) {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role))
      throw new ForbiddenError("Forbidden: Access Denied");

    next();
  };
}

module.exports = authorize;
