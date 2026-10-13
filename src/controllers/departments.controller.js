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

  res.status(200).json({
    success: true,
    departments: data.departments,
    count: data.count,
  });
});

module.exports = { getAllDepartments };
