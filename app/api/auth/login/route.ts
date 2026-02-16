import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/cloudflare";
import { ensureD1Schema } from "@/lib/d1-schema";

export const runtime = "edge";

const loginSchema = z.object({
  account: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(1, "请输入密码"),
});

function getInfraErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("AUTH_SECRET is not set")) {
    return "服务配置错误：AUTH_SECRET 未设置";
  }
  if (message.includes("D1 database binding not found")) {
    return "服务配置错误：未绑定 D1 数据库（DB）";
  }
  if (message.includes("no such table")) {
    return "数据库未初始化：请先执行 D1 migration";
  }

  return message ? `${fallback}: ${message}` : fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const { account, password } = parsed.data;
    await ensureD1Schema(req);
    const db = getDb(req);

    let user = await db.users.findUserByUsername(account);
    if (!user) {
      user = await db.users.findUserByEmail(account);
    }

    if (!user) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      email: user.email,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: getInfraErrorMessage(error, "登录失败，请稍后重试") },
      { status: 500 },
    );
  }
}
