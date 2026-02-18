import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

type PublicResumeRow = {
  id: string;
  username: string;
  resume_json: string | null;
  avatar_url: string | null;
  template_id: string | null;
  updated_at: number | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username: rawUsername } = await params;
    const username = (rawUsername ?? "").trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT users.id, users.username, resumes.resume_json, resumes.avatar_url, resumes.template_id, resumes.updated_at
         FROM users
         LEFT JOIN resumes ON resumes.user_id = users.id
         WHERE users.username = ?
         LIMIT 1`,
      )
      .bind(username)
      .first<PublicResumeRow>();

    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let resume: unknown = null;
    try {
      if (typeof row.resume_json === "string" && row.resume_json.trim()) {
        resume = JSON.parse(row.resume_json);
      }
    } catch {
      // Corrupted JSON — serve empty resume
    }

    return NextResponse.json({
      user: {
        id: row.id,
        username: row.username,
      },
      resume,
      avatarUrl: row.avatar_url ?? "",
      templateId: row.template_id ?? "minimal",
      updatedAt: row.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load public resume" }, { status: 500 });
  }
}
