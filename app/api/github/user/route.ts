import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GithubUserResponse = {
  login?: string;
  name?: string;
  avatar_url?: string;
  public_repos?: number;
  followers?: number;
  html_url?: string;
  bio?: string;
  message?: string;
};

function isValidUsername(username: string) {
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username);
}

function buildContributionsUrl(username: string) {
  return `https://ghchart.rshah.org/22c55e/${encodeURIComponent(username)}`;
}

export async function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get("username") || "").trim().replace(/^@/, "");
  if (!username) {
    return NextResponse.json({ error: "请输入 GitHub 用户名" }, { status: 400 });
  }
  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Resumio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      method: "GET",
      cache: "no-store",
      headers,
    });

    const data = (await response.json()) as GithubUserResponse;

    if (response.status === 404) {
      return NextResponse.json({ error: "GitHub 用户不存在" }, { status: 404 });
    }
    if (!response.ok || !data.login) {
      return NextResponse.json(
        { error: data.message || "GitHub 请求失败，请稍后重试" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      username: data.login,
      name: data.name || data.login,
      avatarUrl: data.avatar_url || "",
      publicRepos: data.public_repos ?? 0,
      followers: data.followers ?? 0,
      profileUrl: data.html_url || `https://github.com/${data.login}`,
      bio: data.bio || "",
      contributionsUrl: buildContributionsUrl(data.login),
    });
  } catch {
    return NextResponse.json({ error: "GitHub 服务不可用，请稍后重试" }, { status: 500 });
  }
}
