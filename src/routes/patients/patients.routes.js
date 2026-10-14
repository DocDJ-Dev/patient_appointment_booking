const express = require("express");
const router = express.Router();
const validateId = require("../../middleware/validateId");
const validateBody = require("../../middleware/validateBody");
const patientsController = require("../../controllers/patients.controllers");
const authorize = require("../../middleware/authorize");

router.get("/", patientsController.getAllPatients);
router.get("/:id", validateId, patientsController.getPatientById);
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

module.exports = router;
