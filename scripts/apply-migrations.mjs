/**
 * Apply supabase/migrations/*.sql to the linked remote Postgres database.
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_DB_PASSWORD  (Project Settings → Database → database password)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const migrationsDir = path.join(root, "supabase", "migrations");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function getDatabaseUrl() {
  if (process.env.SUPABASE_DB_URL?.trim()) {
    return process.env.SUPABASE_DB_URL.trim();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();

  if (!supabaseUrl || !password) {
    throw new Error(
      "Set SUPABASE_DB_PASSWORD in .env.local (or SUPABASE_DB_URL). " +
        "Password: Supabase Dashboard → Project Settings → Database.",
    );
  }

  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  const user = process.env.SUPABASE_DB_USER?.trim() || "postgres";
  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${ref}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT?.trim() || "5432";
  const database = process.env.SUPABASE_DB_NAME?.trim() || "postgres";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function createPgClient(connectionString) {
  return new pg.Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
    // Supabase uses a chain Node may not trust locally; safe for one-off migrations.
    ssl: { rejectUnauthorized: false },
  });
}

async function main() {
  loadEnvLocal();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No migration files in ${migrationsDir}`);
  }

  const connectionString = getDatabaseUrl();
  const client = createPgClient(connectionString);

  console.log(`Connecting and applying ${files.length} migration(s)...`);
  await client.connect();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`→ ${file}`);
      await client.query(sql);
    }
    console.log("Done. All migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
