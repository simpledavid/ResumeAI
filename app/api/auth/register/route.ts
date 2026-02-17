import { NextResponse } from "next/server";
import {
  createSession,
  hashPassword,
  isReservedUsername,
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
  setSessionCookie,
} from "@/lib/server/auth";
import { getDb, nowUnix } from "@/lib/server/db";

type RegisterBody = {
  username?: string;
  email?: string;
  password?: string;
  code?: string;
};

const insertUserCompat = async (
  db: D1Database,
  userId: string,
  username: string,
  email: string,
  passwordHash: string,
  now: number,
) => {
  try {
    await db
      .prepare(
        "INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(userId, username, email, passwordHash, now, now)
      .run();
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/no column named updated_at/i.test(message)) {
      throw error;
    }
  }

  await db
    .prepare(
      "INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(userId, username, email, passwordHash, now)
    .run();
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RegisterBody;
    const username = normalizeUsername(body.username ?? "");
    const providedEmail = normalizeEmail(body.email ?? "");
    const email = providedEmail || `${username}@users.resumio.local`;
    const password = body.password ?? "";

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "用户名需为 3-24 位，仅支持小写字母、数字、下划线、连字符(-)" },
        { status: 400 },
      );
    }

    if (isReservedUsername(username)) {
      return NextResponse.json({ error: "该用户名不可用，请换一个" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
    }

    const db = await getDb();
    const existed = await db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1")
      .bind(username, email)
      .first<{ id: string }>();

    if (existed) {
      return NextResponse.json({ error: "用户名或邮箱已被占用" }, { status: 409 });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = nowUnix();
    await insertUserCompat(db, userId, username, email, passwordHash, now);

    const { token, expiresAt } = await createSession(db, userId);
    const response = NextResponse.json(
      {
        user: {
          id: userId,
          username,
          email,
        },
      },
      { status: 201 },
    );
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败";
    if (/UNIQUE constraint failed/i.test(message)) {
      return NextResponse.json({ error: "用户名或邮箱已被占用" }, { status: 409 });
    }
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
