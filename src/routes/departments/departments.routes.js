const express = require("express");
const router = express.Router();
const validateId = require("../../middleware/validateId");
const validateBody = require("../../middleware/validateBody");
const departmentsController = require("../../controllers/departments.controller");
const authorize = require("../../middleware/authorize");

router.get("/", departmentsController.getAllDepartments);
router.get("/:id", validateId, departmentsController.getDepartmentById);
router.post(
  "/",
  authorize("admin", "doctor"),
  validateBody("name"),
  departmentsController.createDepartment,
);
router.patch(
  "/:id",
  authorize("admin", "doctor"),
  validateId,
  validateBody("name"),
  departmentsController.updateDepartment,
);
router.delete(
  "/:id",
  authorize("admin"),
  validateId,
  departmentsController.deleteDepartment,
);

module.exports = router;
