const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const pool = require("../db/pool");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("SELECT 1");
      return res.status(200).json({ status: "healthy", database: "connected" });
    } catch (err) {
      throw err;
    } finally {
      client.release;
    }
  }),
);

module.exports = router;
