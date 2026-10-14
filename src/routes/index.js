const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const healthRoutes = require("./health");
const departmentsRoutes = require("../routes/departments/departments.routes");
const doctorsRoutes = require("./doctors/doctors.routes");
const patientsRoutes = require("./patients/patients.routes");

router.use("/health", healthRoutes);

router.use(auth);

router.use("/departments", departmentsRoutes);

router.use("/doctors", doctorsRoutes);

router.use("/patients", patientsRoutes);

module.exports = router;
