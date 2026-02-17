import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSessionFromRequest,
} from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const db = await getDb();
    await deleteSessionFromRequest(db, request);
  } catch {
    // Clear cookie even if session deletion fails.
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
