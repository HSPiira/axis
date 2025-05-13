import { createId } from "@paralleldrive/cuid2";
import permissions from "./permissions.json";
import { Pool } from "pg";

// Validate that DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Validate permissions data
    for (const perm of permissions) {
      if (!perm.name || !perm.description) {
        throw new Error(`Invalid permission data: ${JSON.stringify(perm)}`);
      }

      // Check if permission already exists
      const existingPerm = await client.query(
        'SELECT id FROM "Permission" WHERE name = $1',
        [perm.name]
      );

      if (existingPerm.rows.length > 0) {
        console.log(`Permission "${perm.name}" already exists, skipping`);
        continue;
      }

      await client.query(
        'INSERT INTO "Permission" (id, name, description) VALUES ($1, $2, $3)',
        [createId(), perm.name, perm.description]
      );
    }
    console.log("Permissions seeded!");
  } finally {
    client.release();
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
