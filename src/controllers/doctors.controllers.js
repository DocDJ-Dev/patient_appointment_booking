const doctorsRepo = require("../repositories/doctors.repository");
const asyncHandler = require("../utils/asyncHandler");
const { ValidationError } = require("../utils/error");

const getAllDoctors = asyncHandler(async (req, res, next) => {
  const { name, gender, specialty } = req.query;

  const queries = {};
  if (name) {
    queries.name = name;
  }

  if (gender) {
    queries.gender = gender;
  }

  if (specialty) {
    queries.specialty = specialty;
  }

  const data = await doctorsRepo.findall(queries);

  if (data.count === 0) {
    return res.status(200).json({
      success: true,
      doctors: "No doctors recorded yet",
      count: data.count,
    });
  }

  res.json({
    success: true,
    doctors: data.doctors,
    count: data.count,
  });
});

const getDoctorById = asyncHandler(async (req, res, next) => {
  const data = await doctorsRepo.findById(req.validatedId);

  res.json({ success: true, doctor: data.doctor });
});

const createDoctor = asyncHandler(async (req, res, next) => {
  const { name, age, gender, specialty } = req.body;

  if (typeof age !== "number" || age < 0 || age > 150) {
    throw new ValidationError("age must be a number between 0 and 150");
  }

  const data = await doctorsRepo.create(name, age, gender, specialty);

  res.status(201).json({
    success: true,
    doctor: data.doctor,
    message: "doctor created successfully",
  });
});

const updateDoctor = asyncHandler(async (req, res, next) => {
  const allowedFields = ["name", "age", "gender", "specialty"];
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

  const data = await doctorsRepo.update(setClauses, values, paramIndex);

  res.status(201).json({
    success: true,
    doctor: data.doctor,
    message: "Doctor updated successfully",
  });
});

const deleteDoctor = asyncHandler(async (req, res, next) => {
  const data = await doctorsRepo.deleteById(req.validatedId);

  res.json({
    success: true,
    doctor: data.doctor,
    message: "Doctor deleted successfully",
  });
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
