import type { NextResponse } from "next/server";
import { nowUnix } from "@/lib/server/db";

export const SESSION_COOKIE_NAME = "resumio_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH_BITS = 256;

type SessionRow = {
  id: string;
  username: string;
  email: string;
  expires_at: number;
};

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (value: string) => {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const offset = index * 2;
    const parsed = Number.parseInt(value.slice(offset, offset + 2), 16);
    if (Number.isNaN(parsed)) return null;
    bytes[index] = parsed;
  }
  return bytes;
};

const constantTimeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a[index] ^ b[index];
  }
  return result === 0;
};

const derivePasswordHash = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
) => {
  const saltBuffer = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength,
  ) as ArrayBuffer;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBuffer,
      iterations,
    },
    key,
    PBKDF2_HASH_BITS,
  );

  return new Uint8Array(bits);
};

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePasswordHash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
) => {
  const [algorithm, iterationsRaw, saltHex, hashHex] = storedHash.split("$");
  if (algorithm !== "pbkdf2") return false;

  const iterations = Number.parseInt(iterationsRaw ?? "", 10);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  const salt = fromHex(saltHex ?? "");
  const expected = fromHex(hashHex ?? "");
  if (!salt || !expected) return false;

  const derived = await derivePasswordHash(password, salt, iterations);
  return constantTimeEqual(derived, expected);
};

export const hashToken = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return toHex(new Uint8Array(digest));
};

const readCookie = (request: Request, name: string) => {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const chunks = cookie.split(";").map((item) => item.trim());
  for (const chunk of chunks) {
    const [key, ...rest] = chunk.split("=");
    if (key !== name) continue;
    return decodeURIComponent(rest.join("="));
  }

  return null;
};

export const normalizeUsername = (value: string) =>
  value.trim().toLowerCase();

export const isValidUsername = (value: string) =>
  /^[a-z0-9_-]{3,24}$/.test(value);

const RESERVED_USERNAME_SET = new Set([
  "api",
  "resume",
  "login",
  "register",
  "logout",
  "about",
  "privacy",
  "terms",
  "admin",
  "_next",
  "favicon.ico",
]);

export const isReservedUsername = (value: string) =>
  RESERVED_USERNAME_SET.has(value);

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const createSession = async (db: D1Database, userId: string) => {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const tokenHash = await hashToken(token);
  const now = nowUnix();
  const expiresAt = now + SESSION_TTL_SECONDS;

  await db
    .prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(tokenHash, userId, expiresAt, now)
    .run();

  return { token, expiresAt };
};

export const setSessionCookie = (
  response: NextResponse,
  token: string,
  expiresAt: number,
) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt * 1000),
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
};

export const deleteSessionFromRequest = async (
  db: D1Database,
  request: Request,
) => {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) return;

  const tokenHash = await hashToken(token);
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
};

export const requireAuthUser = async (
  db: D1Database,
  request: Request,
): Promise<AuthUser | null> => {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const row = await db
    .prepare(
      `SELECT users.id, users.username, users.email, sessions.expires_at
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?
       LIMIT 1`,
    )
    .bind(tokenHash)
    .first<SessionRow>();

  if (!row) return null;

  if (row.expires_at <= nowUnix()) {
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
  };
};
