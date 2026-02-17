import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const silent = url.searchParams.get("silent") === "1";
    const db = await getDb();
    const user = await requireAuthUser(db, request);

    if (!user) {
      if (silent) {
        return NextResponse.json({ user: null });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
