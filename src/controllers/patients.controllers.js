const patientsRepo = require("../repositories/patients.repositories");
const asyncHandler = require("../utils/asyncHandler");
const { ValidationError } = require("../utils/error");

const getAllPatients = asyncHandler(async (req, res, next) => {
  const { name, age, minAge, maxAge, nationalId, address, gender, diagnosis } =
    req.query;

  const queries = {};
  if (name) {
    queries.name = name;
  }

  if (age) {
    queries.age = age;
  }

  if (minAge) {
    queries.minAge = minAge;
  }

  if (maxAge) {
    queries.maxAge = maxAge;
  }

  if (nationalId) {
    queries.national_id = nationalId;
  }

  if (address) {
    queries.address = address;
  }

  if (gender) {
    queries.gender = gender;
  }

  if (diagnosis) {
    queries.diagnosis = diagnosis;
  }

  const data = await patientsRepo.findall(queries);

  if (data.count === 0) {
    return res.status(200).json({
      success: true,
      patients: "No patients recorded yet",
      count: data.count,
    });
  }

  res.json({
    success: true,
    patients: data.patients,
    count: data.count,
  });
});

const getPatientById = asyncHandler(async (req, res, next) => {
  const data = await patientsRepo.findById(req.validatedId);

  res.json({ success: true, patient: data.patient });
});

const createPatient = asyncHandler(async (req, res, next) => {
  const { name, age, nationalId, address, gender, diagnosis } = req.body;

  if (typeof age !== "number" || age < 0 || age > 150) {
    throw new ValidationError("age must be a number between 0 and 150");
  }

  const data = await patientsRepo.create(
    name,
    age,
    nationalId,
    address,
    gender,
    diagnosis,
  );

  res.status(201).json({
    success: true,
    patient: data.patient,
    message: "patient created successfully",
  });
});

const updatePatient = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    "name",
    "age",
    "national_id",
    "address",
    "gender",
    "diagnosis",
  ];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex}`);
      values.push(req.body[field]);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    throw new ValidationError("No valid fields provided to update");
  }

  if (req.body.age !== undefined) {
    if (
      typeof req.body.age !== "number" ||
      req.body.age < 0 ||
      req.body.age > 150
    ) {
      throw new ValidationError("age must be a number between 0 and 150");
    }
  }

  values.push(req.validatedId);

  const data = await patientsRepo.update(setClauses, values, paramIndex);

  res.status(201).json({
    success: true,
    patient: data.patient,
    message: "Patient updated successfully",
  });
});

const deletePatient = asyncHandler(async (req, res, next) => {
  const data = await patientsRepo.deleteById(req.validatedId);

  res.json({
    success: true,
    patient: data.patient,
    message: "Patient deleted successfully",
  });
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
