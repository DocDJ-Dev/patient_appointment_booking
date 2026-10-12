# Architecture & Database design decisions:

## 1. Timestamp Handling

**Choice:** TIMESTAMPTZ (Timestamp with Time Zone) for scheduling and record Timestamp. Not affected by location dependent timezones.

## 2. Referential Integrity and Deletion Behaviour

**CASCADE**: Allow automatic deletion of vitals upon deletion of related patient. Prevents ophaned medical metrics lingering in the system.
**RESTRICT**: Restrict deletion of a patient with history of and/or pending appointments. This protects critical clinical scheduling audit trails from accidental deletions. Admin must explicitly handle or clear appointments first.

## 3. Unique Patient Identification

**UNIQUE CONSTRAINT**: ON patient_id column. Prevents duplicate entries and data integrity across patient lookups, appointments and medical histroy.

# Environment Loading module, called and run whenever the environmental variable is needed in the program.
