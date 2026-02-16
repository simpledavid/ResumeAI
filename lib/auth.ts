import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const SESSION_COOKIE_NAME = "resumio_session";

type SessionPayload = {
  sub: string;
  username: string;
  email: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET || getAuthSecretFromContext();
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

function getAuthSecretFromContext(): string | undefined {
  try {
    const context = getRequestContext();
    const env = context?.env as { AUTH_SECRET?: string } | undefined;
    return env?.AUTH_SECRET;
  } catch {
    return undefined;
  }
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionPayload;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookie() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
