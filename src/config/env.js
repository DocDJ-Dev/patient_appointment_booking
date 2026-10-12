const dotenv = require("dotenv");

dotenv.config();

function envValidator() {
  const requiredVar = [
    "DB_USER",
    "DB_HOST",
    "DB_NAME",
    "DB_PASSWORD",
    "DB_PORT",
  ];

  const missingVars = requiredVar.filter((key) => !process.env[key]);

  if (missingVars > 0) {
    throw new Error(
      `Missing required details about the database: ${missingVars.join(", ")}`,
    );
  }

  return {
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
    serverPort: process.env.PORT,
    environment: process.env.NODE_ENV,
  };
}

// console.log(envValidator());
module.exports = envValidator();
