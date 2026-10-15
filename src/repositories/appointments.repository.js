const pool = require("../db/pool");
const { NotFoundError, ConflictError } = require("../utils/error");

class AppointmentsClass {
  async findall(searchParams) {
    let query =
      "SELECT a.appointment_id, d.name AS doctor, p.name AS patient, dp.name AS department, a.scheduled_at AS time, a.status FROM appointments AS a INNER JOIN doctors AS d ON a.doctor_id = d.doctor_id INNER JOIN patients AS p ON a.patient_id = p.patient_id INNER JOIN departments AS dp ON a.department_id = dp.department_id WHERE 1=1";

    const { doctor, patient, status, from, upto, department } = searchParams;
    const params = [];

    if (doctor) {
      params.push(`%${searchParams.doctor}%`);
      query += ` AND d.name ILIKE $${params.length}`;
    }

    if (patient) {
      params.push(`%${searchParams.patient}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }

    if (status) {
      params.push(`${searchParams.status}`);
      query += ` AND a.status =  $${params.length}`;
    }

    if (from) {
      params.push(`${searchParams.from}`);
      query += ` AND a.scheduled_at >=  $${params.length}`;
    }

    if (upto) {
      params.push(`${searchParams.upto}`);
      query += ` AND a.scheduled_at <= $${params.length}`;
    }

    if (department) {
      params.push(`%${searchParams.department}%`);
      query += ` AND dp.name ILIKE $${params.length}`;
    }

    query += " ORDER BY a.scheduled_at DESC LIMIT 50 ";
    const result = await pool.query(query, params);
    return { count: result.rows.length, appointments: result.rows };
  }

  async findByPatientId(patientId) {
    const existing = await pool.query(
      "SELECT * FROM patients WHERE patient_id = $1",
      [patientId],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError(`No patient with id: ${patientId}`);
    }

    const query =
      "SELECT a.appointment_id, d.name AS doctor, p.name AS patient, dp.name AS department, a.scheduled_at AS time, a.status FROM appointments AS a INNER JOIN doctors AS d ON a.doctor_id = d.doctor_id INNER JOIN patients AS p ON a.patient_id = p.patient_id INNER JOIN departments AS dp ON a.department_id = dp.department_id WHERE p.patient_id = $1";

    let result = await pool.query(query, [patientId]);

    return { count: result.rows.length, appointments: result.rows };
  }

  async create(patientId, doctorId, departmentId, scheduledAt) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const patient = await client.query(
        "SELECT * FROM patients WHERE patient_id = $1 FOR UPDATE",
        [patientId],
      );

      if (patient.rows.length <= 0) {
        throw new NotFoundError(`Patient with id ${patientId} not found.`);
      }

      const doctor = await client.query(
        "SELECT * FROM doctors WHERE doctor_id = $1 FOR UPDATE",
        [doctorId],
      );

      if (doctor.rows.length <= 0) {
        throw new NotFoundError(`Doctor with id ${doctorId} not found.`);
      }

      const department = await client.query(
        "SELECT * FROM departments WHERE department_id = $1 FOR UPDATE",
        [departmentId],
      );

      if (department.rows.length <= 0) {
        throw new NotFoundError(
          `Department with id ${departmentId} not found.`,
        );
      }

      const time = await client.query(
        "SELECT * FROM appointments WHERE scheduled_at = $1",
        [scheduledAt],
      );

      if (time.rows.length > 0) {
        throw new ConflictError(
          `Date and Time already scheduled for another appointment`,
        );
      }
      const query =
        "INSERT INTO appointments (doctor_id, patient_id, department_id, scheduled_at) VALUES ($1, $2, $3, $4) RETURNING *";

      const result = await client.query(query, [
        doctorId,
        patientId,
        departmentId,
        scheduledAt,
      ]);

      await client.query("COMMIT");

      return { appointment: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      await client.release();
    }
  }

  async update(appointmentId, status) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ");

      const existing = await client.query(
        "SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE",
        [appointmentId],
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError(
          `Appointment with id ${appointmentId} not found`,
        );
      }

      if (existing.rows[0].status !== "scheduled") {
        throw new ConflictError(
          `Status of a ${existing.rows[0].status} appointment cannot be changed.`,
        );
      }

      const query = `
        UPDATE appointments
        SET status = $2
        WHERE appointment_id = $1
        RETURNING *
      `;

      const result = await client.query(query, [appointmentId, status]);

      await client.query("COMMIT");
      return { department: result.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AppointmentsClass();
