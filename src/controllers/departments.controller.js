const departmentsRepo = require("../repositories/departments.repository");
const asyncHandler = require("../utils/asyncHandler");

const getAllDepartments = asyncHandler(async (req, res, next) => {
  const data = await departmentsRepo.findall();

  if (data.count === 0) {
    return res.status(200).json({
      success: true,
      departments: "No departments recorded yet",
      count: data.count,
    });
  }

  res.json({
    success: true,
    departments: data.departments,
    count: data.count,
  });
});

const getDepartmentById = asyncHandler(async (req, res, next) => {
  const data = await departmentsRepo.findById(req.validatedId);

  res.json({ success: true, department: data.department });
});

const createDepartment = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const data = await departmentsRepo.create(name);

  res.status(201).json({
    success: true,
    department: data.department,
    message: "Department created successfully",
  });
});

const updateDepartment = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const data = await departmentsRepo.update(req.validatedId, name);

  res.status(201).json({
    success: true,
    department: data.department,
    message: "Department updated successfully",
  });
});

const deleteDepartment = asyncHandler(async (req, res, next) => {
  const data = await departmentsRepo.deleteById(req.validatedId);

  res.json({
    success: true,
    department: data.department,
    message: "Department deleted successfully",
  });
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
