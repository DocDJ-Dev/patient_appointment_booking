const pool = require("../src/db/pool");

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed a production database");
  process.exit(1);
}

const PATIENT_TARGET = 10000;
const APPOINTMENT_TARGET = 30000;
const VITALS_TARGET = 30000;

async function count(client, table) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM ${table}`,
  );
  return rows[0].n;
}

async function main() {
  const client = await pool.connect();
  try {
    if (
      (await count(client, "doctors")) === 0 ||
      (await count(client, "departments")) === 0
    ) {
      throw new Error(
        'No doctors or departments found. Run "npm run seed" first.',
      );
    }

    await client.query("BEGIN");

    // Patients: only inserts the BULK ids that don't exist yet
    await client.query(
      `INSERT INTO patients (name, age, national_id, address, gender, diagnosis)
       SELECT
         'Bulk Patient ' || i,
         1 + floor(random() * 90)::int,
         'BULK-' || LPAD(i::text, 6, '0'),
         'Address ' || i,
         CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
         (ARRAY['Hypertension','Type 2 Diabetes','Asthma','Anaemia','Migraine','Osteoarthritis'])[1 + floor(random() * 6)::int]
       FROM generate_series(1, $1::int) AS i
       WHERE NOT EXISTS (
         SELECT 1 FROM patients p WHERE p.national_id = 'BULK-' || LPAD(i::text, 6, '0')
       )`,
      [PATIENT_TARGET],
    );

    // Appointments: doctor and slot come from the row number, so no doctor is ever
    // double-booked; patient and department are picked randomly PER ROW.
    // Past slots become completed/cancelled, future slots become scheduled.
    const existingAppointments = await count(client, "appointments");
    if (existingAppointments < APPOINTMENT_TARGET) {
      await client.query(
        `WITH d AS (SELECT array_agg(doctor_id ORDER BY doctor_id) AS ids FROM doctors),
              p AS (SELECT array_agg(patient_id ORDER BY patient_id) AS ids FROM patients),
              dep AS (SELECT array_agg(department_id ORDER BY department_id) AS ids FROM departments)
         INSERT INTO appointments (doctor_id, patient_id, department_id, scheduled_at, status)
         SELECT
           d.ids[1 + (i % array_length(d.ids, 1))],
           p.ids[1 + floor(random() * array_length(p.ids, 1))::int],
           dep.ids[1 + floor(random() * array_length(dep.ids, 1))::int],
           slot.slot_time,
           CASE WHEN slot.slot_time > NOW() THEN 'scheduled'
                WHEN random() < 0.9 THEN 'completed'
                ELSE 'cancelled' END
         FROM generate_series(1, $1::int) AS i, d, p, dep,
              LATERAL (
                SELECT date_trunc('day', NOW()) - INTERVAL '1 year' + INTERVAL '17 minutes'
                       + (i / array_length(d.ids, 1)) * INTERVAL '3 hours' AS slot_time
              ) AS slot`,
        [APPOINTMENT_TARGET - existingAppointments],
      );
    }

    // Vitals: random readings over the last 90 days, alert level computed in SQL
    const existingVitals = await count(client, "vitals");
    if (existingVitals < VITALS_TARGET) {
      await client.query(
        `WITH p AS (SELECT array_agg(patient_id ORDER BY patient_id) AS ids FROM patients),
              readings AS (
                SELECT
                  p.ids[1 + floor(random() * array_length(p.ids, 1))::int] AS patient_id,
                  (35 + floor(random() * 96))::int AS heart_rate,
                  (84 + floor(random() * 17))::int AS oxygen_level,
                  ((100 + floor(random() * 61))::int)::text || '/' || ((60 + floor(random() * 41))::int)::text AS blood_pressure,
                  NOW() - random() * INTERVAL '90 days' AS recorded_at
                FROM generate_series(1, $1::int), p
              )
         INSERT INTO vitals (patient_id, heart_rate, blood_pressure, oxygen_level, alert_level, recorded_at)
         SELECT patient_id, heart_rate, blood_pressure, oxygen_level,
                CASE
                  WHEN heart_rate < 30 OR oxygen_level < 85 THEN 'codeBlue'
                  WHEN heart_rate < 40 OR heart_rate > 120 OR oxygen_level < 90 THEN 'critical'
                  WHEN heart_rate < 60 OR heart_rate > 100 OR oxygen_level <= 94 THEN 'warning'
                  ELSE 'normal'
                END,
                recorded_at
         FROM readings`,
        [VITALS_TARGET - existingVitals],
      );
    }

    await client.query("COMMIT");

    // fresh statistics so the query planner sees the real table sizes (Part C)
    for (const table of ["patients", "appointments", "vitals"]) {
      await pool.query(`ANALYZE ${table}`);
    }

    for (const table of ["patients", "appointments", "vitals"]) {
      console.log(`${table}: ${await count(client, table)}`);
    }
    console.log("Bulk seed complete");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error("Bulk seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
