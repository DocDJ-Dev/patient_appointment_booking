const express = require("express");
const router = express.Router();
const departmentsController = require("../../controllers/departments.controller");

router.get("/", departmentsController.getAllDepartments);

module.exports = router;
