const departmentsRepo = require("../repositories/departments.repository");
const asyncHandler = require("../utils/asyncHandler");

const getAllDepartments = asyncHandler(async function (req, res, next) {
  const data = await departmentsRepo.findall();
  res.status(200).json({
    success: true,
    departments: data.departments,
    count: data.count,
  });
});

module.exports = { getAllDepartments };
