const vitalsRepo = require("../repositories/vitals.repository");
const asyncHandler = require("../utils/asyncHandler");
const determineAlertLevel = require("../utils/determineAlertLevel");
const { ValidationError } = require("../utils/error");

const createPatientVitals = asyncHandler(async (req, res, next) => {
  const { HR, BP, SPO2 } = req.body;

  if (Number.isNaN(Number(HR))) {
    throw new ValidationError("Heart Rate must be a number.");
  }

  if (Number.isNaN(Number(SPO2))) {
    throw new ValidationError("Oxygen Level must be a number.");
  }

  const parts = String(BP).split("/");

  if (
    parts.length !== 2 ||
    isNaN(Number(parts[0])) ||
    isNaN(Number(parts[1]))
  ) {
    throw new ValidationError(
      "BP must be in the form of systolic/diastolic (e.g 120/180)",
    );
  }

  const alertLevel = determineAlertLevel(HR, SPO2);
  const patientId = req.validatedId;

  const params = { patientId, HR, BP, SPO2, alertLevel };

  const data = await vitalsRepo.create(params);

  res.status(201).json({
    success: true,
    vitals: data.vitals,
    message: "patient vitals posted successfully",
  });
});

module.exports = { createPatientVitals };
