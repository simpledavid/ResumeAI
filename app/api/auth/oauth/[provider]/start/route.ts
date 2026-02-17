import { NextRequest, NextResponse } from "next/server";
import {
  buildOAuthAuthorizeUrl,
  isOAuthProvider,
  type OAuthProvider,
} from "@/lib/server/oauth";

const getStateCookieName = (provider: OAuthProvider) =>
  `resumio_oauth_state_${provider}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerRaw } = await params;
  if (!isOAuthProvider(providerRaw)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  }

  try {
    const provider = providerRaw;
    const state = crypto.randomUUID();
    const authorizeUrl = buildOAuthAuthorizeUrl(
      provider,
      request.nextUrl.origin,
      state,
    );

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set({
      name: getStateCookieName(provider),
      value: state,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
