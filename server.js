const config = require("./src/config/env");
const { pool } = require("./src/db/pool");
const app = require("./src/app");

process.on("uncaughtException", (err) => {
  console.error("─── UNCAUGHT EXCEPTION ──────────────────");
  console.error("This is a serious bug. The process will now exit.");
  console.error(err);
  console.error("──────────────────────────────────────────");

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("─── UNHANDLED REJECTION ─────────────────");
  console.error("Reason:", reason);
  console.error("──────────────────────────────────────────");

  process.exit(1);
});
const port = config.serverPort;

const server = app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
