CREATE TABLE
    IF NOT EXISTS departments (department_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);


CREATE TABLE
    IF NOT EXISTS doctors (doctor_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, age INT, gender VARCHAR(20), specialty VARCHAR(100));


CREATE TABLE
    IF NOT EXISTS patients (patient_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, age INT, national_id VARCHAR(50) UNIQUE, address VARCHAR(255), gender VARCHAR(20), diagnosis VARCHAR(255));


CREATE TABLE
    IF NOT EXISTS appointments (appointment_id SERIAL PRIMARY KEY, doctor_id INT REFERENCES doctors (doctor_id), patient_id INT REFERENCES patients (patient_id), department_id INT REFERENCES departments (department_id), scheduled_at TIMESTAMPTZ NOT NULL, STATUS VARCHAR(20) DEFAULT 'scheduled');


CREATE TABLE
    IF NOT EXISTS vitals (vital_id SERIAL PRIMARY KEY, patient_id INT NOT NULL REFERENCES patients (patient_id) ON DELETE CASCADE, heart_rate INT NOT NULL, blood_pressure VARCHAR(20) NOT NULL, oxygen_level INT NOT NULL, alert_level VARCHAR(20) NOT NULL, recorded_at TIMESTAMP NOT NULL DEFAULT NOW ());