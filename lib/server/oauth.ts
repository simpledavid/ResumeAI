import {
  isReservedUsername,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
  type AuthUser,
} from "@/lib/server/auth";
import { nowUnix } from "@/lib/server/db";

export type OAuthProvider = "github" | "google";

type OAuthProfile = {
  providerUserId: string;
  email: string;
  usernameHint: string;
};

type OAuthConfig = {
  clientId: string;
  clientSecret: string;
};

type OAuthAccountRow = {
  id: string;
  username: string;
  email: string;
};

const PROVIDERS: OAuthProvider[] = ["github", "google"];

const getOAuthConfig = (provider: OAuthProvider): OAuthConfig => {
  if (provider === "github") {
    return {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    };
  }

  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  };
};

export const isOAuthProvider = (value: string): value is OAuthProvider =>
  PROVIDERS.includes(value as OAuthProvider);

export const buildOAuthRedirectUri = (origin: string, provider: OAuthProvider) =>
  `${origin}/api/auth/oauth/${provider}/callback`;

export const buildOAuthAuthorizeUrl = (
  provider: OAuthProvider,
  origin: string,
  state: string,
) => {
  const { clientId } = getOAuthConfig(provider);
  if (!clientId) {
    throw new Error(`${provider.toUpperCase()} OAuth is not configured.`);
  }

  const redirectUri = buildOAuthRedirectUri(origin, provider);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });

  if (provider === "github") {
    params.set("scope", "read:user user:email");
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  params.set("scope", "openid email profile");
  params.set("access_type", "online");
  params.set("prompt", "select_account");
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const getGithubProfile = async (
  code: string,
  redirectUri: string,
): Promise<OAuthProfile> => {
  const { clientId, clientSecret } = getOAuthConfig("github");
  if (!clientId || !clientSecret) {
    throw new Error("GITHUB OAuth env vars are missing.");
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenJson = (await tokenResponse.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description ?? "GitHub token exchange failed.");
  }

  const headers = {
    Authorization: `Bearer ${tokenJson.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "resumio-auth",
  };

  const profileResponse = await fetch("https://api.github.com/user", { headers });
  const profileJson = (await profileResponse.json().catch(() => ({}))) as {
    id?: number;
    login?: string;
    email?: string | null;
  };

  if (!profileResponse.ok || !profileJson.id) {
    throw new Error("Failed to load GitHub profile.");
  }

  let email = profileJson.email ?? "";
  if (!email) {
    const emailResponse = await fetch("https://api.github.com/user/emails", { headers });
    const emailJson = (await emailResponse.json().catch(() => [])) as Array<{
      email?: string;
      primary?: boolean;
      verified?: boolean;
    }>;

    const picked =
      emailJson.find((item) => item.primary && item.verified)?.email ??
      emailJson.find((item) => item.verified)?.email ??
      emailJson.find((item) => item.email)?.email ??
      "";

    email = picked;
  }

  if (!email) {
    email = `github_${profileJson.id}@users.noreply.resumio.local`;
  }

  return {
    providerUserId: String(profileJson.id),
    email: normalizeEmail(email),
    usernameHint: profileJson.login ?? `github_${profileJson.id}`,
  };
};

const getGoogleProfile = async (
  code: string,
  redirectUri: string,
): Promise<OAuthProfile> => {
  const { clientId, clientSecret } = getOAuthConfig("google");
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE OAuth env vars are missing.");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenResponse.json().catch(() => ({}))) as {
    access_token?: string;
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    throw new Error("Google token exchange failed.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
  });
  const profileJson = (await profileResponse.json().catch(() => ({}))) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  if (!profileResponse.ok || !profileJson.sub) {
    throw new Error("Failed to load Google profile.");
  }

  const email =
    normalizeEmail(profileJson.email ?? "") ||
    `google_${profileJson.sub}@users.noreply.resumio.local`;

  const usernameHint =
    (profileJson.email ? profileJson.email.split("@")[0] : "") ||
    profileJson.name ||
    `google_${profileJson.sub.slice(0, 10)}`;

  return {
    providerUserId: profileJson.sub,
    email,
    usernameHint,
  };
};

export const exchangeOAuthCodeForProfile = async (
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
) => {
  if (provider === "github") {
    return getGithubProfile(code, redirectUri);
  }
  return getGoogleProfile(code, redirectUri);
};

const sanitizeUsernameBase = (value: string) => {
  const normalized = normalizeUsername(value)
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  if (normalized.length >= 3) {
    return normalized.slice(0, 24);
  }

  return `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
};

const usernameExists = async (
  db: D1Database,
  username: string,
  excludeUserId?: string,
) => {
  const query = excludeUserId
    ? "SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1"
    : "SELECT id FROM users WHERE username = ? LIMIT 1";
  const row = await db
    .prepare(query)
    .bind(...(excludeUserId ? [username, excludeUserId] : [username]))
    .first<{ id: string }>();
  return Boolean(row);
};

const ensureUniqueUsername = async (
  db: D1Database,
  rawBase: string,
  excludeUserId?: string,
) => {
  const base = sanitizeUsernameBase(rawBase);

  for (let index = 0; index < 100; index += 1) {
    const suffix = index === 0 ? "" : `_${index + 1}`;
    const trimmedBase = base.slice(0, Math.max(3, 24 - suffix.length));
    const candidate = `${trimmedBase}${suffix}`;
    if (!isValidUsername(candidate) || isReservedUsername(candidate)) continue;
    if (!(await usernameExists(db, candidate, excludeUserId))) {
      return candidate;
    }
  }

  while (true) {
    const fallback = `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    if (!(await usernameExists(db, fallback, excludeUserId))) {
      return fallback;
    }
  }
};

const syncGithubUsername = async (
  db: D1Database,
  user: OAuthAccountRow,
  profile: OAuthProfile,
): Promise<OAuthAccountRow> => {
  const preferred = await ensureUniqueUsername(db, profile.usernameHint, user.id);
  if (preferred === user.username) return user;

  try {
    await db
      .prepare("UPDATE users SET username = ?, updated_at = ? WHERE id = ?")
      .bind(preferred, nowUnix(), user.id)
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/no such column: updated_at/i.test(message)) {
      throw error;
    }
    await db
      .prepare("UPDATE users SET username = ? WHERE id = ?")
      .bind(preferred, user.id)
      .run();
  }

  return {
    ...user,
    username: preferred,
  };
};

const getLinkedUser = async (
  db: D1Database,
  provider: OAuthProvider,
  providerUserId: string,
) =>
  db
    .prepare(
      `SELECT users.id, users.username, users.email
       FROM oauth_accounts
       INNER JOIN users ON users.id = oauth_accounts.user_id
       WHERE oauth_accounts.provider = ?
         AND oauth_accounts.provider_user_id = ?
       LIMIT 1`,
    )
    .bind(provider, providerUserId)
    .first<OAuthAccountRow>();

const getUserByEmail = async (db: D1Database, email: string) =>
  db
    .prepare("SELECT id, username, email FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first<OAuthAccountRow>();

const linkOAuthAccount = async (
  db: D1Database,
  provider: OAuthProvider,
  providerUserId: string,
  userId: string,
) => {
  await db
    .prepare(
      "INSERT OR IGNORE INTO oauth_accounts (provider, provider_user_id, user_id, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(provider, providerUserId, userId, nowUnix())
    .run();
};

export const findOrCreateOAuthUser = async (
  db: D1Database,
  provider: OAuthProvider,
  profile: OAuthProfile,
): Promise<AuthUser> => {
  const linked = await getLinkedUser(db, provider, profile.providerUserId);
  if (linked) {
    const normalizedLinked =
      provider === "github" ? await syncGithubUsername(db, linked, profile) : linked;
    return {
      id: normalizedLinked.id,
      username: normalizedLinked.username,
      email: normalizedLinked.email,
    };
  }

  const existingByEmail = await getUserByEmail(db, profile.email);
  if (existingByEmail) {
    const normalizedExisting =
      provider === "github"
        ? await syncGithubUsername(db, existingByEmail, profile)
        : existingByEmail;

    await linkOAuthAccount(db, provider, profile.providerUserId, existingByEmail.id);
    return {
      id: normalizedExisting.id,
      username: normalizedExisting.username,
      email: normalizedExisting.email,
    };
  }

  const username = await ensureUniqueUsername(db, profile.usernameHint);
  const userId = crypto.randomUUID();
  const now = nowUnix();

  try {
    await db
      .prepare(
        "INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(userId, username, profile.email, `oauth:${provider}`, now, now)
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/no column named updated_at/i.test(message)) {
      throw error;
    }
    await db
      .prepare(
        "INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(userId, username, profile.email, `oauth:${provider}`, now)
      .run();
  }

  await linkOAuthAccount(db, provider, profile.providerUserId, userId);

  return {
    id: userId,
    username,
    email: profile.email,
  };
};
