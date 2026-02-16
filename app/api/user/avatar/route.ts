import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export const runtime = 'edge';

// TODO: Implement R2 storage for Cloudflare Pages
// Tencent COS SDK is not compatible with Edge Runtime

export async function POST() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "头像上传功能暂时不可用，即将迁移到 Cloudflare R2" },
    { status: 503 }
  );
}
