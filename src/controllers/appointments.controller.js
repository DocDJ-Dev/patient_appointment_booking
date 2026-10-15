const appointmentsRepo = require("../repositories/appointments.repository");
const asyncHandler = require("../utils/asyncHandler");
const { ValidationError } = require("../utils/error");

const getAllAppointments = asyncHandler(async (req, res, next) => {
  const { doctor, patient, status, from, upto, department } = req.query;

  const queries = {};
  if (doctor) {
    queries.doctor = doctor;
  }

  if (patient) {
    queries.patient = patient;
  }

  if (status) {
    queries.status = status;
  }

  if (from) {
    queries.from = from;
  }

  if (upto) {
    queries.upto = upto;
  }

  if (department) {
    queries.department = department;
  }

  const data = await appointmentsRepo.findall(queries);

  if (data.count === 0) {
    return res.status(200).json({
      success: true,
      patients: "No appointments recorded yet",
      count: data.count,
    });
  }

  res.json({
    success: true,
    appointments: data.appointments,
    count: data.count,
  });
});

const getAppointmentsByPatientId = asyncHandler(async (req, res, next) => {
  const data = await appointmentsRepo.findByPatientId(req.validatedId);

  if (data.count === 0) {
    return res.status(200).json({
      success: true,
      patients: "No appointments recorded yet",
      count: data.count,
    });
  }

  res.json({
    success: true,
    appointments: data.appointments,
    count: data.count,
  });
});

const createAppointment = asyncHandler(async (req, res, next) => {
  const { patientId, doctorId, departmentId, scheduledAt } = req.body;

  if (!Number.isInteger(patientId) && patientId < 0) {
    throw new ValidationError(
      "Invalid: Patient id must be a positive interger.",
    );
  }

  if (!Number.isInteger(doctorId) && doctorId < 0) {
    throw new ValidationError(
      "Invalid: Doctor id must be a positive interger.",
    );
  }

  if (!Number.isInteger(departmentId) && departmentId < 0) {
    throw new ValidationError(
      "Invalid: Department id must be a positive interger",
    );
  }

  if (typeof scheduledAt !== "string") {
    throw new ValidationError("scheduled at should be a string.");
  }

  const date = new Date(scheduledAt);
  const isValidDate = !isNaN(date.getTime()) && scheduledAt.includes("T");
  const isFuture = date > new Date();

  if (!isValidDate) {
    throw new ValidationError("Invalid Date");
  }

  if (!isFuture) {
    throw new ValidationError("Cannot appoint on a date that has passed.");
  }
  const data = await appointmentsRepo.create(
    patientId,
    doctorId,
    departmentId,
    scheduledAt,
  );

  res.status(201).json({
    success: true,
    Appointment: data.appointment,
    message: "Appointment created successfully.",
  });
});

const updateAppointment = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (status !== "completed" || "cancelled") {
    throw new ValidationError(`${status} is an incompartible status`);
  }

  const data = await appointmentsRepo.update(req.validatedId, status);

  res.status(201).json({
    success: true,
    appointment: data.appointment,
    message: "Appointment status updated successfully",
  });
});

module.exports = {
  getAllAppointments,
  getAppointmentsByPatientId,
  createAppointment,
  updateAppointment,
};
