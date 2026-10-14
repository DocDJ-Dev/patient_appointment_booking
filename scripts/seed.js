const pool = require("../src/db/pool");
const config = require("../src/config/env");

if (config.environment === "production") {
  console.error("Refusing to seed a production database");
  process.exit(1);
}

const departments = [
  "Cardiology",
  "Endocrinology",
  "General Medicine",
  "Paediatrics",
  "Orthopaedics",
];

const doctors = [
  { name: "Dr. Tendai Moyo", age: 45, gender: "male", specialty: "Cardiology" },
  {
    name: "Dr. Rudo Chikwanha",
    age: 38,
    gender: "female",
    specialty: "Endocrinology",
  },
  {
    name: "Dr. Farai Ncube",
    age: 52,
    gender: "male",
    specialty: "General Medicine",
  },
  {
    name: "Dr. Nyasha Dube",
    age: 41,
    gender: "female",
    specialty: "Paediatrics",
  },
  {
    name: "Dr. Blessing Sibanda",
    age: 47,
    gender: "male",
    specialty: "Orthopaedics",
  },
  {
    name: "Dr. Chipo Mutasa",
    age: 36,
    gender: "female",
    specialty: "General Medicine",
  },
];

const patients = [
  {
    nationalId: "SEED-0001",
    name: "Tapiwa Chirwa",
    age: 34,
    gender: "male",
    address: "12 Samora Machel Ave, Harare",
    diagnosis: "Hypertension",
  },
  {
    nationalId: "SEED-0002",
    name: "Rutendo Ncube",
    age: 29,
    gender: "female",
    address: "8 Fife Ave, Harare",
    diagnosis: "Asthma",
  },
  {
    nationalId: "SEED-0003",
    name: "Tafadzwa Sibanda",
    age: 52,
    gender: "male",
    address: "45 Josiah Tongogara St, Harare",
    diagnosis: "Type 2 Diabetes",
  },
  {
    nationalId: "SEED-0004",
    name: "Nokuthula Dlamini",
    age: 41,
    gender: "female",
    address: "3 Borrowdale Rd, Harare",
    diagnosis: "Hypertension",
  },
  {
    nationalId: "SEED-0005",
    name: "Kudakwashe Banda",
    age: 7,
    gender: "male",
    address: "22 Mabelreign Rd, Harare",
    diagnosis: "Asthma",
  },
  {
    nationalId: "SEED-0006",
    name: "Chiedza Zhou",
    age: 6,
    gender: "female",
    address: "15 Avondale Rd, Harare",
    diagnosis: "Otitis media",
  },
  {
    nationalId: "SEED-0007",
    name: "Simbarashe Nyoni",
    age: 60,
    gender: "male",
    address: "9 Hatfield Rd, Harare",
    diagnosis: "Osteoarthritis",
  },
  {
    nationalId: "SEED-0008",
    name: "Memory Gumbo",
    age: 47,
    gender: "female",
    address: "31 Highfield Rd, Harare",
    diagnosis: "Type 2 Diabetes",
  },
  {
    nationalId: "SEED-0009",
    name: "Tinashe Mhlanga",
    age: 23,
    gender: "male",
    address: "5 Eastlea Rd, Harare",
    diagnosis: "Sprained ankle",
  },
  {
    nationalId: "SEED-0010",
    name: "Precious Mpofu",
    age: 38,
    gender: "female",
    address: "17 Greendale Rd, Harare",
    diagnosis: "Migraine",
  },
  {
    nationalId: "SEED-0011",
    name: "Lovemore Chuma",
    age: 68,
    gender: "male",
    address: "40 Waterfalls Rd, Harare",
    diagnosis: "Heart failure",
  },
  {
    nationalId: "SEED-0012",
    name: "Ruvimbo Hove",
    age: 31,
    gender: "female",
    address: "2 Msasa Rd, Harare",
    diagnosis: "Anaemia",
  },
];

// [patient national id, doctor, department, day offset from today, hour, status]
// Scheduled slots never repeat for the same doctor and time.
// SEED-0009 and SEED-0012 (patients) and Dr. Chipo Mutasa have NO appointments on purpose,
// to test empty lists and zero counts.
const appointments = [
  ["SEED-0001", "Dr. Tendai Moyo", "Cardiology", -21, 9, "completed"],
  ["SEED-0001", "Dr. Tendai Moyo", "Cardiology", 14, 9, "scheduled"],
  ["SEED-0002", "Dr. Farai Ncube", "General Medicine", -10, 10, "completed"],
  ["SEED-0002", "Dr. Farai Ncube", "General Medicine", 3, 11, "scheduled"],
  ["SEED-0003", "Dr. Rudo Chikwanha", "Endocrinology", -14, 9, "completed"],
  ["SEED-0003", "Dr. Rudo Chikwanha", "Endocrinology", 7, 14, "scheduled"],
  ["SEED-0004", "Dr. Tendai Moyo", "Cardiology", -5, 11, "cancelled"],
  ["SEED-0004", "Dr. Tendai Moyo", "Cardiology", 5, 10, "scheduled"],
  ["SEED-0005", "Dr. Nyasha Dube", "Paediatrics", -7, 9, "completed"],
  ["SEED-0006", "Dr. Nyasha Dube", "Paediatrics", 2, 10, "scheduled"],
  ["SEED-0007", "Dr. Blessing Sibanda", "Orthopaedics", -30, 15, "completed"],
  ["SEED-0007", "Dr. Blessing Sibanda", "Orthopaedics", 10, 9, "scheduled"],
  ["SEED-0008", "Dr. Rudo Chikwanha", "Endocrinology", -3, 10, "completed"],
  ["SEED-0010", "Dr. Farai Ncube", "General Medicine", 1, 9, "scheduled"],
  ["SEED-0011", "Dr. Tendai Moyo", "Cardiology", -40, 14, "completed"],
  ["SEED-0011", "Dr. Tendai Moyo", "Cardiology", 21, 14, "scheduled"],
];

// [patient national id, heart rate, blood pressure, oxygen, hours ago]
const vitals = [
  ["SEED-0001", 72, "120/80", 97, 48],
  ["SEED-0001", 88, "135/85", 95, 24],
  ["SEED-0001", 104, "150/95", 93, 2],
  ["SEED-0003", 76, "128/82", 96, 30],
  ["SEED-0003", 118, "160/100", 90, 4],
  ["SEED-0011", 45, "100/60", 92, 20],
  ["SEED-0011", 28, "70/40", 82, 1],
];

function alertLevel(heartRate, oxygenLevel) {
  if (heartRate < 30 || oxygenLevel < 85) return "codeBlue";
  if (heartRate < 40 || heartRate > 120 || oxygenLevel < 90) return "critical";
  if (heartRate < 60 || heartRate > 100 || oxygenLevel <= 94) return "warning";
  return "normal";
}

// table names come only from literals in this file, never from user input
async function isEmpty(client, table) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM ${table}`,
  );
  return rows[0].n === 0;
}

async function seedReferenceData(client) {
  for (const name of departments) {
    await client.query(
      `INSERT INTO departments (name)
       SELECT $1::varchar
       WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = $1::varchar)`,
      [name],
    );
  }

  for (const d of doctors) {
    await client.query(
      `INSERT INTO doctors (name, age, gender, specialty)
       SELECT $1::varchar, $2::int, $3::varchar, $4::varchar
       WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE name = $1::varchar)`,
      [d.name, d.age, d.gender, d.specialty],
    );
  }

  for (const p of patients) {
    await client.query(
      `INSERT INTO patients (name, age, national_id, address, gender, diagnosis)
       SELECT $1::varchar, $2::int, $3::varchar, $4::varchar, $5::varchar, $6::varchar
       WHERE NOT EXISTS (SELECT 1 FROM patients WHERE national_id = $3::varchar)`,
      [p.name, p.age, p.nationalId, p.address, p.gender, p.diagnosis],
    );
  }
}

async function seedAppointments(client) {
  if (!(await isEmpty(client, "appointments"))) {
    console.log("appointments already has data, skipping");
    return;
  }

  for (const [
    nationalId,
    doctorName,
    departmentName,
    dayOffset,
    hour,
    status,
  ] of appointments) {
    await client.query(
      `INSERT INTO appointments (patient_id, doctor_id, department_id, scheduled_at, status)
       SELECT p.patient_id, d.doctor_id, dep.department_id,
              date_trunc('day', NOW()) + make_interval(days => $4::int, hours => $5::int),
              $6::varchar
       FROM patients p, doctors d, departments dep
       WHERE p.national_id = $1 AND d.name = $2 AND dep.name = $3`,
      [nationalId, doctorName, departmentName, dayOffset, hour, status],
    );
  }
}

async function seedVitals(client) {
  if (!(await isEmpty(client, "vitals"))) {
    console.log("vitals already has data, skipping");
    return;
  }

  for (const [
    nationalId,
    heartRate,
    bloodPressure,
    oxygenLevel,
    hoursAgo,
  ] of vitals) {
    await client.query(
      `INSERT INTO vitals (patient_id, heart_rate, blood_pressure, oxygen_level, alert_level, recorded_at)
       SELECT patient_id, $2::int, $3::varchar, $4::int, $5::varchar,
              NOW() - make_interval(hours => $6::int)
       FROM patients WHERE national_id = $1`,
      [
        nationalId,
        heartRate,
        bloodPressure,
        oxygenLevel,
        alertLevel(heartRate, oxygenLevel),
        hoursAgo,
      ],
    );
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedReferenceData(client);
    await seedAppointments(client);
    await seedVitals(client);
    await client.query("COMMIT");

    for (const table of [
      "departments",
      "doctors",
      "patients",
      "appointments",
      "vitals",
    ]) {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS n FROM ${table}`,
      );
      console.log(`${table}: ${rows[0].n}`);
    }
    console.log("Seed complete");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
