import { unlink } from "node:fs/promises";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";

type UploadAvatarInput = {
  userId: string;
  fileName?: string;
  mimeType: string;
  buffer: Buffer;
  oldAvatarUrl?: string | null;
};

type UploadAvatarResult = {
  avatarUrl: string;
};

function getExtFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function normalizeDomain(domain: string) {
  const trimmed = domain.replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getCosConfig() {
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;
  const domainRaw = process.env.COS_DOMAIN;

  if (!secretId || !secretKey || !bucket || !region) {
    throw new Error("腾讯云 COS 配置不完整：请检查 SecretId/SecretKey/Bucket/Region");
  }

  const domain =
    domainRaw && domainRaw.trim()
      ? normalizeDomain(domainRaw)
      : `https://${bucket}.cos.${region}.myqcloud.com`;

  return {
    secretId,
    secretKey,
    bucket,
    region,
    domain,
  };
}

function parseCosKeyFromAvatarUrl(avatarUrl: string, cosDomain: string) {
  try {
    const oldUrl = new URL(avatarUrl);
    const domainUrl = new URL(cosDomain);
    if (oldUrl.host !== domainUrl.host) {
      return null;
    }
    return decodeURIComponent(oldUrl.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

async function deleteLocalIfNeeded(oldAvatarUrl?: string | null) {
  if (!oldAvatarUrl?.startsWith("/uploads/avatars/")) {
    return;
  }
  const oldPath = path.join(process.cwd(), "public", oldAvatarUrl);
  await unlink(oldPath).catch(() => {});
}

export async function uploadAvatar(
  input: UploadAvatarInput,
): Promise<UploadAvatarResult> {
  const cfg = getCosConfig();
  const ext =
    getExtFromMime(input.mimeType) ||
    path.extname(input.fileName ?? "") ||
    ".png";
  const key = `avatars/${input.userId}/${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}${ext}`;

  const cos = new COS({
    SecretId: cfg.secretId,
    SecretKey: cfg.secretKey,
  });

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: cfg.bucket,
        Region: cfg.region,
        Key: key,
        Body: input.buffer,
        ContentLength: input.buffer.length,
        ContentType: input.mimeType,
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      },
    );
  });

  if (input.oldAvatarUrl) {
    const oldKey = parseCosKeyFromAvatarUrl(input.oldAvatarUrl, cfg.domain);
    if (oldKey) {
      await new Promise<void>((resolve) => {
        cos.deleteObject(
          {
            Bucket: cfg.bucket,
            Region: cfg.region,
            Key: oldKey,
          },
          () => resolve(),
        );
      });
    } else {
      await deleteLocalIfNeeded(input.oldAvatarUrl);
    }
  }

  return {
    avatarUrl: `${cfg.domain}/${key}`,
  };
}
