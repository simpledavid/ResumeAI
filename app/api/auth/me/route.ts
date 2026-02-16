import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getUserProfileById } from "@/lib/user-profile";
import { getEnv } from "@/lib/cloudflare";
import { ensureD1Schema } from "@/lib/d1-schema";

export const runtime = "edge";

function getInfraErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("D1 database binding not found")) {
    return "服务配置错误：未绑定 D1 数据库（DB）";
  }
  if (message.includes("no such table")) {
    return "数据库未初始化：请先执行 D1 migration";
  }

  return fallback;
}

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const env = getEnv(req);
    await ensureD1Schema(req);
    const user = await getUserProfileById(session.sub, env.DB);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      {
        user: null,
        error: getInfraErrorMessage(error, "获取当前用户失败"),
      },
      { status: 500 },
    );
  }
}
