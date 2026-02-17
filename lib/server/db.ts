import { getCloudflareContext } from "@opennextjs/cloudflare";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)",
  `CREATE TABLE IF NOT EXISTS oauth_accounts (
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (provider, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id)",
  `CREATE TABLE IF NOT EXISTS resumes (
    user_id TEXT PRIMARY KEY,
    resume_json TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT '',
    template_id TEXT NOT NULL DEFAULT 'classic',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
];

const schemaReadyMap = new WeakMap<D1Database, Promise<void>>();

const ensureSchema = (db: D1Database) => {
  const existing = schemaReadyMap.get(db);
  if (existing) return existing;

  const next = (async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await db.prepare(statement).run();
    }
  })();
  schemaReadyMap.set(db, next);
  return next;
};

export const getDb = async () => {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { DB?: D1Database }).DB;

  if (!db) {
    throw new Error("D1 binding `DB` is not configured.");
  }

  await ensureSchema(db);
  return db;
};

export const nowUnix = () => Math.floor(Date.now() / 1000);
