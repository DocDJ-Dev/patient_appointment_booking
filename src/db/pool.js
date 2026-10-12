const dbDetails = require("../config/env");

const { Pool } = require("pg");

const pool = new Pool({
  user: dbDetails.dbUser,
  host: dbDetails.dbHost,
  database: dbDetails.dbName,
  password: dbDetails.dbPassword,
  port: dbDetails.dbPort,
});

module.exports = pool;
