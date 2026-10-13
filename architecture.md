# Architecture & Database design decisions:

## 1. Timestamp Handling

**Choice:** TIMESTAMPTZ (Timestamp with Time Zone) for scheduling and record Timestamp. Not affected by location dependent timezones.

## 2. Referential Integrity and Deletion Behaviour

**CASCADE**: Allow automatic deletion of vitals upon deletion of related patient. Prevents ophaned medical metrics lingering in the system.
**RESTRICT**: Restrict deletion of a patient with history of and/or pending appointments. This protects critical clinical scheduling audit trails from accidental deletions. Admin must explicitly handle or clear appointments first.

## 3. Unique Patient Identification

**UNIQUE CONSTRAINT**: ON patient_id column. Prevents duplicate entries and data integrity across patient lookups, appointments and medical histroy.

# Environment Loading module, called and run whenever the environmental variable is needed in the program.

# pool.js module. Utilise pg library Pool class to create an object with persistantly opened connections.

# migrate.js module. Runs even before the program. To set up the database based on schemas.

## Error handling foundations:

# error.js module has errors classes; Runs whenever an error is thrown using a class in it.

# asyncHandler module; Wraps route handlers into promises; Calls next(err) if the promise reject;

# notFound module; handles errors for routes not matching. Runs after all routes middlewares.

# errorHandler module; Handles all errors that calls next; Is the last middleware to run.

# requestId module; generate random requestId; runs on every request and attach it to req.requestId.

# rateLimiter module; Counts number of request from every client; throw TooManyRequestsError if exceed 10 and waits reset after 60 seconds;

# app module. Has all the middlewares in the order of exercution;

# server module; initiate the program; Address uncaughtException and unhandledRejection errors; Ensure graceful shutdown of the server on termination or restart.

# auth module; runs for every route except /health; checks the authorisation from req headers; compare with already stored tokens; if matches, it attaches user object with role to req;

# authorize module; Checks the require roles, compare with req.user.role; Its a selective gate for allowed roles.

# validateId module; Ensure valid presence and type of id and attach to req as validatedId;

# validateBody module; Validate parsed body checking for the presence of required fields; Its a gate for valid body only;

# the departments pipeline: route >>>controller >>> repository >>>> database and reverse; Applies for all routes endpoints; For scalabily;
