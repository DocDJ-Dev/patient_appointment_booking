const pool = require("../db/pool");
const { NotFoundError } = require("../utils/error");

class DepartmentsRepository {
  async findall() {
    let query = "SELECT * FROM departments";
    query += " ORDER BY department_id";
    const result = await pool.query(query);
    return { count: result.rows.length, departments: result.rows };
  }

  async findById(departmentId) {
    const query = "SELECT * FROM departments WHERE department_id=$1";
    let result = await pool.query(query, [departmentId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Department with id ${departmentId} not found`);
    }

    return { department: result.rows[0] };
  }

  async create(departmentName) {
    const query = "INSERT INTO departments (name) VALUES ($1) RETURNING *";

    const result = await pool.query(query, [departmentName]);

    return { department: result.rows[0] };
  }

  async update(departmentId, departmentName) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const existing = await client.query(
        "SELECT * FROM departments WHERE department_id = $1 FOR UPDATE",
        [departmentId],
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(`Department with id ${departmentId} not found`);
      }

      const query = `
        UPDATE departments
        SET name = $2
        WHERE department_id = $1
        RETURNING *
      `;

      const result = await client.query(query, [departmentId, departmentName]);

      await client.query("COMMIT");
      return { department: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteById(departmentId) {
    const query =
      "DELETE FROM departments WHERE department_id = $1 RETURNING *";
    const result = await pool.query(query, [departmentId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Department with id ${departmentId} not found`);
    }

    return { department: result.rows[0] };
  }
}

module.exports = new DepartmentsRepository();
