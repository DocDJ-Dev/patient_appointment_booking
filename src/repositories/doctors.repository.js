const pool = require("../db/pool");
const { NotFoundError } = require("../utils/error");

class DoctorsRepository {
  async findall(searchParams) {
    let query = "SELECT * FROM doctors WHERE 1=1";

    const { name, gender, specialty } = searchParams;
    const params = [];

    if (name) {
      params.push(`%${searchParams.name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (gender) {
      params.push(`${searchParams.gender}`);
      query += ` AND gender = $${params.length}`;
    }

    if (specialty) {
      params.push(`%${searchParams.specialty}%`);
      query += ` AND specialty ILIKE $${params.length}`;
    }

    query += " ORDER BY doctor_id";
    const result = await pool.query(query, params);
    return { count: result.rows.length, doctors: result.rows };
  }

  async findById(doctorId) {
    const query = "SELECT * FROM doctors WHERE doctor_id=$1";
    let result = await pool.query(query, [doctorId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Doctor with id ${doctorId} not found`);
    }

    return { doctor: result.rows[0] };
  }

  async create(doctorName, doctorAge, doctorGender, doctorSpecialty) {
    const query =
      "INSERT INTO doctors (name, age, gender, specialty) VALUES ($1, $2, $3, $4) RETURNING *";

    const result = await pool.query(query, [
      doctorName,
      doctorAge,
      doctorGender,
      doctorSpecialty,
    ]);

    return { doctor: result.rows[0] };
  }

  async update(setClauses, values, paramIndex) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const existing = await client.query(
        "SELECT * FROM doctors WHERE doctor_id = $1 FOR UPDATE",
        [values[values.length - 1]],
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(
          `Doctor with id ${values[values.length - 1]} not found`,
        );
      }

      const query = `
        UPDATE doctors
        SET ${setClauses.join(", ")}
        WHERE doctor_id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query("COMMIT");
      return { doctor: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteById(doctorId) {
    const query = "DELETE FROM doctors WHERE doctor_id = $1 RETURNING *";
    const result = await pool.query(query, [doctorId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Doctor with id ${doctorId} not found`);
    }

    return { doctor: result.rows[0] };
  }
}

module.exports = new DoctorsRepository();
