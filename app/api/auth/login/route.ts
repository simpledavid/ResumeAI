import { NextResponse } from "next/server";
import {
  createSession,
  normalizeEmail,
  normalizeUsername,
  setSessionCookie,
  verifyPassword,
} from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

type LoginBody = {
  identifier?: string;
  password?: string;
};

type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as LoginBody;
    const identifier = (body.identifier ?? "").trim();
    const password = body.password ?? "";

    if (!identifier || !password) {
      return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
    }

    const isEmail = identifier.includes("@");
    const normalized = isEmail
      ? normalizeEmail(identifier)
      : normalizeUsername(identifier);

    const db = await getDb();
    const user = await db
      .prepare(
        isEmail
          ? "SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1"
          : "SELECT id, username, email, password_hash FROM users WHERE username = ? LIMIT 1",
      )
      .bind(normalized)
      .first<UserRow>();

    if (!user) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(db, user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch {
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
