import { notFound } from "next/navigation";
import ResumeEditorPage from "@/app/resume/page";
import { getDb } from "@/lib/server/db";

export default async function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = (rawUsername ?? "").trim().toLowerCase();

  if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
    notFound();
  }

  const db = await getDb();
  const row = await db
    .prepare("SELECT id FROM users WHERE username = ? LIMIT 1")
    .bind(username)
    .first<{ id: string }>();

  if (!row) {
    notFound();
  }

  return <ResumeEditorPage publicUsername={username} />;
}
