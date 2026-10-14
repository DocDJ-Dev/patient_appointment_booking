const pool = require("../db/pool");
const { NotFoundError } = require("../utils/error");

class PatentsRepository {
  async findall(searchParams) {
    let query = "SELECT * FROM patients WHERE 1=1";

    const {
      name,
      age,
      minAge,
      maxAge,
      national_id,
      address,
      gender,
      diagnosis,
    } = searchParams;
    const params = [];

    if (name) {
      params.push(`%${searchParams.name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (age) {
      params.push(`%${searchParams.age}%`);
      query += ` AND age = $${params.length}`;
    }

    if (minAge) {
      params.push(`%${searchParams.minAge}%`);
      query += ` AND age >=  $${params.length}`;
    }

    if (maxAge) {
      params.push(`%${searchParams.maxAge}%`);
      query += ` AND age <=  $${params.length}`;
    }

    if (national_id) {
      params.push(`%${searchParams.national_id}%`);
      query += ` AND national_id ILIKE $${params.length}`;
    }

    if (gender) {
      params.push(`${searchParams.gender}`);
      query += ` AND gender = $${params.length}`;
    }

    if (address) {
      params.push(`%${searchParams.address}%`);
      query += ` AND address ILIKE $${params.length}`;
    }

    if (diagnosis) {
      params.push(`%${searchParams.diagnosis}%`);
      query += ` AND diagnosis ILIKE $${params.length}`;
    }

    query += " ORDER BY patient_id LIMIT 50 ";
    const result = await pool.query(query, params);
    return { count: result.rows.length, patients: result.rows };
  }

  async findById(patientId) {
    const query = "SELECT * FROM patients WHERE patient_id=$1";
    let result = await pool.query(query, [patientId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Patient with id ${patientId} not found`);
    }

    return { patient: result.rows[0] };
  }

  async create(name, age, national_id, address, gender, diagnosis) {
    const query =
      "INSERT INTO patients (name, age, national_id, address, gender, diagnosis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

    const result = await pool.query(query, [
      name,
      age,
      national_id,
      address,
      gender,
      diagnosis,
    ]);

    return { patient: result.rows[0] };
  }

  async update(setClauses, values, paramIndex) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const existing = await client.query(
        "SELECT * FROM patients WHERE patient_id = $1 FOR UPDATE",
        [values[values.length - 1]],
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(
          `Patient with id ${values[values.length - 1]} not found`,
        );
      }

      const query = `
        UPDATE patients
        SET ${setClauses.join(", ")}
        WHERE patient_id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query("COMMIT");
      return { patient: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteById(patientId) {
    const query = "DELETE FROM patients WHERE patient_id = $1 RETURNING *";
    const result = await pool.query(query, [patientId]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Patient with id ${patientId} not found`);
    }

    return { patient: result.rows[0] };
  }
}

module.exports = new PatentsRepository();
