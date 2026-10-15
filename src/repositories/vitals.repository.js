const pool = require("../db/pool");
const { NotFoundError } = require("../utils/error");

class VitalRepository {
  async create(params) {
    const client = await pool.connect();

    const { patientId, HR, BP, SPO2, alertLevel } = params;

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const existing = await client.query(
        "SELECT * FROM patients WHERE patient_id = $1 FOR UPDATE",
        [patientId],
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(`Patient with an id ${patientId} not found`);
      }

      const query =
        "INSERT INTO vitals (patient_id, heart_rate, blood_pressure, oxygen_level, alert_level) VALUES ($1, $2, $3, $4, $5) RETURNING *";

      const result = await pool.query(query, [
        patientId,
        HR,
        BP,
        SPO2,
        alertLevel,
      ]);

      await client.query("COMMIT");
      return { vitals: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      await client.release();
    }
  }
}

module.exports = new VitalRepository();
