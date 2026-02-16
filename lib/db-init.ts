import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDb() {
  if (initialized) {
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "avatarUrl" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"
    ON "User" ("username")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
    ON "User" ("email")
  `);

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `PRAGMA table_info("User")`,
  );
  const hasAvatarUrl = columns.some((c) => c.name === "avatarUrl");
  if (!hasAvatarUrl) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT`,
    );
  }

  initialized = true;
}
