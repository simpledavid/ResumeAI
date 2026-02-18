import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth";
import { getDb, nowUnix } from "@/lib/server/db";

type ResumeRow = {
  resume_json: string;
  avatar_url: string;
  template_id: string;
  updated_at: number;
};

type ResumeBody = {
  resume?: unknown;
  avatarUrl?: unknown;
  templateId?: unknown;
};

const MAX_RESUME_BYTES = 1024 * 1024;

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const user = await requireAuthUser(db, request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await db
      .prepare(
        "SELECT resume_json, avatar_url, template_id, updated_at FROM resumes WHERE user_id = ? LIMIT 1",
      )
      .bind(user.id)
      .first<ResumeRow>();

    if (!row) {
      return NextResponse.json({ user, resume: null });
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(row.resume_json);
    } catch {
      // Corrupted JSON in DB — return null resume so the editor starts fresh
    }
    return NextResponse.json({
      user,
      resume: parsed,
      avatarUrl: row.avatar_url,
      templateId: row.template_id,
      updatedAt: row.updated_at,
    });
  } catch {
    return NextResponse.json({ error: "读取简历失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb();
    const user = await requireAuthUser(db, request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as ResumeBody;
    const resume = body.resume;
    if (!resume || typeof resume !== "object" || Array.isArray(resume)) {
      return NextResponse.json({ error: "简历数据无效" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resume);
    if (new TextEncoder().encode(resumeJson).length > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: "简历内容过大" }, { status: 400 });
    }

    const avatarUrl =
      typeof body.avatarUrl === "string" ? body.avatarUrl.slice(0, 2048) : "";
    const templateId =
      typeof body.templateId === "string" && body.templateId.length <= 32
        ? body.templateId
        : "minimal";
    const now = nowUnix();

    await db
      .prepare(
        `INSERT INTO resumes (user_id, resume_json, avatar_url, template_id, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           resume_json = excluded.resume_json,
           avatar_url = excluded.avatar_url,
           template_id = excluded.template_id,
           updated_at = excluded.updated_at`,
      )
      .bind(user.id, resumeJson, avatarUrl, templateId, now)
      .run();

    return NextResponse.json({ ok: true, updatedAt: now });
  } catch {
    return NextResponse.json({ error: "保存失败，请稍后重试" }, { status: 500 });
  }
}
