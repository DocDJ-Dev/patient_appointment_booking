const express = require("express");
const router = express.Router();
const validateId = require("../../middleware/validateId");
const validateBody = require("../../middleware/validateBody");
const doctorsController = require("../../controllers/doctors.controllers");
const authorize = require("../../middleware/authorize");

router.get("/", doctorsController.getAllDoctors);
router.get("/:id", validateId, doctorsController.getDoctorById);
router.post(
  "/",
  authorize("admin"),
  validateBody("name"),
  doctorsController.createDoctor,
);
router.patch(
  "/:id",
  authorize("admin"),
  validateId,
  validateBody("name"),
  doctorsController.updateDoctor,
);
router.delete(
  "/:id",
  authorize("admin"),
  validateId,
  doctorsController.deleteDoctor,
);

module.exports = router;
