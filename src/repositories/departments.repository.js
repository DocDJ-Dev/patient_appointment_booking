const pool = require("../db/pool");

class DepartmentsRepository {
  async findall() {
    let query = "SELECT * FROM departments";
    query += " ORDER BY department_id";
    const result = await pool.query(query);
    return { count: result.rows.length, departments: result.rows };
  }
}

module.exports = new DepartmentsRepository();
