const express = require("express");
const router = express.Router();
const validateId = require("../../middleware/validateId");
const validateBody = require("../../middleware/validateBody");
const appointmentsController = require("../../controllers/appointments.controller");
const authorize = require("../../middleware/authorize");

router.get("/", appointmentsController.getAllAppointments);
router.patch(
  "/:id/status",
  authorize("admin"),
  validateId,
  validateBody("status"),
  appointmentsController.updateAppointment,
);
router.post(
  "/",
  authorize("admin"),
  validateBody("doctorId", "patientId", "departmentId", "scheduledAt"),
  appointmentsController.createAppointment,
);

module.exports = router;
