import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import {
  buildOAuthRedirectUri,
  exchangeOAuthCodeForProfile,
  findOrCreateOAuthUser,
  isOAuthProvider,
  type OAuthProvider,
} from "@/lib/server/oauth";

const getStateCookieName = (provider: OAuthProvider) =>
  `resumio_oauth_state_${provider}`;

const clearStateCookie = (response: NextResponse, provider: OAuthProvider) => {
  response.cookies.set({
    name: getStateCookieName(provider),
    value: "",
    path: "/",
    expires: new Date(0),
  });
};

const redirectHome = (
  request: NextRequest,
  provider: OAuthProvider,
  error?: string,
) => {
  const url = new URL("/", request.url);
  if (error) {
    url.searchParams.set("error", error);
  }
  const response = NextResponse.redirect(url);
  clearStateCookie(response, provider);
  return response;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerRaw } = await params;
  if (!isOAuthProvider(providerRaw)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  }

  const provider = providerRaw;
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const code = request.nextUrl.searchParams.get("code") ?? "";

  if (!state || !code) {
    return redirectHome(request, provider, "oauth_missing_code");
  }

  const storedState = request.cookies.get(getStateCookieName(provider))?.value ?? "";
  if (!storedState || storedState !== state) {
    return redirectHome(request, provider, "oauth_state_mismatch");
  }

  try {
    const redirectUri = buildOAuthRedirectUri(request.nextUrl.origin, provider);
    const profile = await exchangeOAuthCodeForProfile(provider, code, redirectUri);
    const db = await getDb();
    const user = await findOrCreateOAuthUser(db, provider, profile);
    const { token, expiresAt } = await createSession(db, user.id);

    const response = NextResponse.redirect(new URL(`/${user.username}`, request.url));
    clearStateCookie(response, provider);
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch {
    return redirectHome(request, provider, "oauth_failed");
  }
}
