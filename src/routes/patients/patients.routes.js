const express = require("express");
const router = express.Router();
const validateId = require("../../middleware/validateId");
const validateBody = require("../../middleware/validateBody");
const patientsController = require("../../controllers/patients.controllers");
const authorize = require("../../middleware/authorize");
const appointmentsController = require("../../controllers/appointments.controller");
const vitalsController = require("../../controllers/vitals.controllers");

router.get("/", patientsController.getAllPatients);
router.get("/:id", validateId, patientsController.getPatientById);
router.get(
  "/:id/appointments",
  authorize("admin"),
  validateId,
  appointmentsController.getAppointmentsByPatientId,
);
router.post(
  "/",
  authorize("admin", "doctor"),
  validateBody("name", "age", "nationalId", "address", "gender", "diagnosis"),
  patientsController.createPatient,
);
router.patch(
  "/:id",
  authorize("admin"),
  validateId,
  patientsController.updatePatient,
);
router.delete(
  "/:id",
  authorize("admin"),
  validateId,
  patientsController.deletePatient,
);

router.post(
  "/:id/vitals",
  authorize("doctor", "nurse"),
  validateId,
  validateBody("HR", "BP", "SPO2"),
  vitalsController.createPatientVitals,
);

module.exports = router;
