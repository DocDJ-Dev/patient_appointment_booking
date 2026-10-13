const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const healthRoutes = require("./health");
const departmentsRoutes = require("../routes/departments/departments.routes");

router.use("/health", healthRoutes);

router.use(auth);

router.use("/departments", departmentsRoutes);

module.exports = router;
