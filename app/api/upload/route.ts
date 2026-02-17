import { getCloudflareContext } from "@opennextjs/cloudflare";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
      customMetadata?: Record<string, string>;
    },
  ) => Promise<unknown>;
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const inferExtension = (file: File) => {
  const fromMime = MIME_EXTENSION_MAP[file.type];
  if (fromMime) return fromMime;

  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,8}$/.test(fromName)) return fromName;

  return "bin";
};

const buildPublicUrl = (baseUrl: string, key: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${normalizedBase}/${encodedKey}`;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Missing file." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image files are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Image size exceeds 5MB limit." }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as { RESUME_ASSETS?: R2BucketLike }).RESUME_ASSETS;

    if (!bucket) {
      return Response.json(
        { error: "R2 bucket binding RESUME_ASSETS is not configured." },
        { status: 500 },
      );
    }

    const key = `avatars/${Date.now()}-${crypto.randomUUID()}.${inferExtension(file)}`;
    const body = await file.arrayBuffer();

    await bucket.put(key, body, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name.slice(0, 120),
      },
    });

    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
    if (!publicBaseUrl) {
      return Response.json({ key }, { status: 201 });
    }

    return Response.json(
      { key, url: buildPublicUrl(publicBaseUrl, key) },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return Response.json({ error: message }, { status: 500 });
  }
}
