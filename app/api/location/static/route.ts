import { NextRequest, NextResponse } from "next/server";
import { buildTencentMapUrl } from "@/lib/tencent-map-sign";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const QQ_MAP_BASE_URL = "https://apis.map.qq.com";
const QQ_STATIC_MAP_PATH = "/ws/staticmap/v2";
const REQUEST_TIMEOUT_MS = 3500;

type TencentMapError = {
  status?: number;
  message?: string;
};

function getTencentMapKey() {
  return process.env.TENCENT_MAP_KEY || process.env.QQ_MAP_KEY || "";
}

function getTencentMapSk() {
  return process.env.TENCENT_MAP_SK || process.env.QQ_MAP_SK || "";
}

function toNumber(raw: string | null) {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function isValidCoord(lng: number, lat: number) {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const lng = toNumber(req.nextUrl.searchParams.get("lng"));
  const lat = toNumber(req.nextUrl.searchParams.get("lat"));

  if (lng === null || lat === null || !isValidCoord(lng, lat)) {
    return NextResponse.json({ error: "无效坐标" }, { status: 400 });
  }

  const key = getTencentMapKey();
  if (!key) {
    return NextResponse.json({ error: "未配置腾讯地图 Key（TENCENT_MAP_KEY）" }, { status: 500 });
  }

  const sk = getTencentMapSk();
  const center = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const url = await buildTencentMapUrl(
    QQ_MAP_BASE_URL,
    QQ_STATIC_MAP_PATH,
    {
      center,
      key,
      maptype: "roadmap",
      markers: center,
      size: "640*420",
      zoom: "12",
    },
    sk,
  );

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      return NextResponse.json({ error: "静态地图服务不可用" }, { status: 502 });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as TencentMapError;
      return NextResponse.json(
        { error: data.message || "腾讯静态地图返回错误，请检查 Key/SK 配置" },
        { status: 502 },
      );
    }

    const body = await response.arrayBuffer();
    const headers = new Headers();
    headers.set("content-type", contentType);
    headers.set("cache-control", "public, max-age=3600");

    return new Response(new Uint8Array(body), {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "静态地图请求超时" }, { status: 504 });
    }
    return NextResponse.json({ error: "静态地图请求失败" }, { status: 500 });
  }
}
