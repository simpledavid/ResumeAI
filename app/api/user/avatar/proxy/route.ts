import { NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

export const runtime = "nodejs";

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

function getCosConfig() {
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;
  if (!secretId || !secretKey || !bucket || !region) {
    return null;
  }
  return { secretId, secretKey, bucket, region };
}

async function fetchFromCosBySdk(src: URL) {
  const cosCfg = getCosConfig();
  if (!cosCfg) {
    return null;
  }

  const key = decodeURIComponent(src.pathname.replace(/^\/+/, ""));
  if (!key) {
    return null;
  }

  const cos = new COS({
    SecretId: cosCfg.secretId,
    SecretKey: cosCfg.secretKey,
  });

  const data = await new Promise<{
    body: Buffer;
    contentType?: string;
  }>((resolve, reject) => {
    cos.getObject(
      {
        Bucket: cosCfg.bucket,
        Region: cosCfg.region,
        Key: key,
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        const body: unknown = result.Body;
        if (!body) {
          reject(new Error("empty body"));
          return;
        }

        let buf: Buffer;
        if (Buffer.isBuffer(body)) {
          buf = body;
        } else if (typeof body === "string") {
          buf = Buffer.from(body);
        } else if (body instanceof Uint8Array) {
          buf = Buffer.from(body);
        } else {
          reject(new Error("unsupported body type"));
          return;
        }

        resolve({
          body: buf,
          contentType:
            (result.headers?.["content-type"] as string | undefined) ||
            (result.headers?.["Content-Type"] as string | undefined),
        });
      },
    );
  });

  const headers = new Headers();
  headers.set("content-type", data.contentType || "application/octet-stream");
  headers.set("cache-control", "public, max-age=60");
  return new Response(new Uint8Array(data.body), { status: 200, headers });
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

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
  }

  if (!isAllowedHost(parsed.host)) {
    return NextResponse.json({ error: "forbidden host" }, { status: 403 });
  }

  // some qiniu test domains may have invalid https cert; force http when proxying them.
  if (parsed.protocol === "https:" && parsed.host.endsWith(".clouddn.com")) {
    parsed.protocol = "http:";
  }

  // For COS private-read bucket, fetch via SDK using server credentials.
  if (parsed.host.endsWith(".myqcloud.com")) {
    try {
      const cosResp = await fetchFromCosBySdk(parsed);
      if (cosResp) {
        return cosResp;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "cos sdk fetch failed";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
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
