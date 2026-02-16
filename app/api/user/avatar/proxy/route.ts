import { NextResponse } from "next/server";

export const runtime = "edge";

function extractHost(raw: string | undefined) {
  if (!raw) {
    return "";
  }
  try {
    const u = new URL(
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`,
    );
    return u.host;
  } catch {
    return "";
  }
}

function isAllowedHost(host: string) {
  const allowSet = new Set(
    [extractHost(process.env.COS_DOMAIN), extractHost(process.env.QINIU_DOMAIN)].filter(Boolean),
  );
  if (allowSet.has(host)) {
    return true;
  }
  return host.endsWith(".clouddn.com") || host.endsWith(".myqcloud.com");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "missing src" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return NextResponse.json({ error: "invalid src" }, { status: 400 });
  }

  if (![
    "http:",
    "https:",
  ].includes(parsed.protocol)) {
    return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
  }

  if (!isAllowedHost(parsed.host)) {
    return NextResponse.json({ error: "forbidden host" }, { status: 403 });
  }

  // Some qiniu test domains may have invalid https cert; force http when proxying them.
  if (parsed.protocol === "https:" && parsed.host.endsWith(".clouddn.com")) {
    parsed.protocol = "http:";
  }

  const upstream = await fetch(parsed.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      {
        error: `upstream fetch failed: ${upstream.status}`,
      },
      { status: 502 },
    );
  }

  const headers = new Headers();
  headers.set(
    "content-type",
    upstream.headers.get("content-type") || "application/octet-stream",
  );
  headers.set("cache-control", "public, max-age=60");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
