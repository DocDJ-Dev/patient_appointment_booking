const fs = require("fs");
const path = require("path");
const pool = require("./pool");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function up() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const appliedResult = await client.query(
      "SELECT name FROM schema_migrations",
    );
    const applied = appliedResult.rows.map((row) => row.name);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".up.sql"))
      .sort();

    const pending = files.filter((file) => !applied.includes(file));

    if (pending.length === 0) {
      console.log("Database is up to date");
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`Applied: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`FAILED: ${file}: ${err.message}`);
        throw err;
      }
    }

    async function down() {
      const client = await pool.connect();
      try {
        await ensureMigrationsTable(client);

        const latest = await client.query(
          "SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1",
        );

        if (latest.rows.length === 0) {
          console.log("Nothing to roll back");
          return;
        }

        const upFile = latest.rows[0].name;
        const downFile = upFile.replace(".up.sql", ".down.sql");
        const sql = fs.readFileSync(
          path.join(MIGRATIONS_DIR, downFile),
          "utf8",
        );

        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query("DELETE FROM schema_migrations WHERE name = $1", [
            upFile,
          ]);
          await client.query("COMMIT");
          console.log(`Rolled back: ${upFile}`);
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        }
      } finally {
        client.release();
      }
    }
  } finally {
    client.release();
  }
}

const command = process.argv[2];
const action = command === "down" ? down : up;

action()
  .catch((err) => {
    process.exitCode = 1;
  })
  .finally(() => pool.end());
