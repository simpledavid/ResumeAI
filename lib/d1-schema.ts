import type { D1Database } from "@cloudflare/workers-types";
import { getEnv } from "@/lib/cloudflare";

let initPromise: Promise<void> | null = null;

async function ensureAvatarColumn(db: D1Database) {
  const info = await db.prepare('PRAGMA table_info("User")').all<{ name: string }>();
  const columns = info.results ?? [];
  const hasAvatarUrl = columns.some((col) => col.name === "avatarUrl");

  if (!hasAvatarUrl) {
    await db.prepare('ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT').run();
  }
}

async function applySchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS "UserDashboard" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "bio" TEXT,
        "widgets" TEXT,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      )`,
    )
    .run();

  await db
    .prepare('CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User" ("username")')
    .run();

  await db
    .prepare('CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email")')
    .run();

  await db
    .prepare(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UserDashboard_userId_key" ON "UserDashboard" ("userId")',
    )
    .run();

  await ensureAvatarColumn(db);
}

export async function ensureD1Schema(request?: Request) {
  if (initPromise) {
    return initPromise;
  }

  const db = getEnv(request).DB;
  initPromise = applySchema(db).catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}
