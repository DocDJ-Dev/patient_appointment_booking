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

      const result = await client.query(query, [
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

  async getVitals(patientId) {
    const existing = await pool.query(
      "SELECT * FROM patients WHERE patient_id = $1",
      [patientId],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError(`Patient with Id ${patientId} not found.`);
    }

    const result = await pool.query(
      "SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC",
      [patientId],
    );

    if (result.rows.length === 0) {
      return { vitals: "No vitals recorded for this patient" };
    }

    return { vitals: result.rows };
  }

  async getLatestVitals(patientId) {
    const existing = await pool.query(
      "SELECT * FROM patients WHERE patient_id = $1",
      [patientId],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError(`Patient with Id ${patientId} not found.`);
    }

    const result = await pool.query(
      "SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 1",
      [patientId],
    );

    if (result.rows.length === 0) {
      return { vitals: "No vitals recorded for this patient" };
    }

    return { vitals: result.rows[0] };
  }
}

module.exports = new VitalRepository();
