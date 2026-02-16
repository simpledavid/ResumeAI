import type { D1Database } from "@cloudflare/workers-types";

export type UserProfileRow = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: number; // Unix timestamp in D1
};

function normalizeAvatarUrlForDisplay(url: string | null) {
  if (!url) {
    return null;
  }
  const isLegacyQiniu = (() => {
    try {
      return new URL(url).host.endsWith(".clouddn.com");
    } catch {
      return false;
    }
  })();

  // qiniu was disabled in current deployment; hide legacy avatar and let user re-upload to COS.
  if (isLegacyQiniu && !process.env.QINIU_DOMAIN) {
    return null;
  }

  const domain = process.env.COS_DOMAIN || process.env.QINIU_DOMAIN;
  if (!domain || !domain.trim()) {
    return url;
  }
  try {
    const envUrl = new URL(
      domain.startsWith("http://") || domain.startsWith("https://")
        ? domain
        : `http://${domain}`,
    );
    const oldUrl = new URL(url);
    if (oldUrl.host === envUrl.host) {
      return `${envUrl.protocol}//${envUrl.host}${oldUrl.pathname}${oldUrl.search}`;
    }
    return url;
  } catch {
    return url;
  }
}

export async function getUserProfileById(userId: string, db: D1Database) {
  const result = await db
    .prepare('SELECT id, username, email, avatarUrl, createdAt FROM User WHERE id = ? LIMIT 1')
    .bind(userId)
    .first<UserProfileRow>();

  if (!result) {
    return null;
  }

  return {
    ...result,
    avatarUrl: normalizeAvatarUrlForDisplay(result.avatarUrl),
  };
}

export async function getUserAvatarUrlById(userId: string, db: D1Database) {
  const result = await db
    .prepare('SELECT avatarUrl FROM User WHERE id = ? LIMIT 1')
    .bind(userId)
    .first<{ avatarUrl: string | null }>();

  return normalizeAvatarUrlForDisplay(result?.avatarUrl ?? null);
}

export async function updateUserAvatarUrlById(
  userId: string,
  avatarUrl: string | null,
  db: D1Database,
) {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare('UPDATE User SET avatarUrl = ?, updatedAt = ? WHERE id = ?')
    .bind(avatarUrl, now, userId)
    .run();
}
