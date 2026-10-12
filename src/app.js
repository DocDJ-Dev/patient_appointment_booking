const express = require("express");
const routes = require("./routes/health");
const helmet = require("helmet");
const cors = require("cors");
const requestId = require("./middleware/requestId");
const morgan = require("morgan");
const ratelimiter = require("./middleware/ratelimiter");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(requestId);

app.use(morgan("combined"));

app.use(ratelimiter);

app.use("/api", routes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
