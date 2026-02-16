import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/cloudflare";

export const runtime = "edge";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少 3 位")
    .max(24, "用户名最多 24 位")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位").max(64, "密码最多 64 位"),
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

  return fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const { username, email, password } = parsed.data;
    const db = getDb(req);

    const existingUsername = await db.users.findUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    const existingEmail = await db.users.findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "邮箱已被注册" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.users.createUser({
      username,
      email,
      passwordHash,
    });

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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: getInfraErrorMessage(error, "注册失败，请稍后重试") },
      { status: 500 },
    );
  }
}
