import { NextRequest, NextResponse } from "next/server";
import { buildTencentMapUrl } from "@/lib/tencent-map-sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QQ_MAP_BASE_URL = "https://apis.map.qq.com";
const QQ_PLACE_SEARCH_PATH = "/ws/place/v1/search";
const REQUEST_TIMEOUT_MS = 3500;

type TencentPlaceResponse = {
  status?: number;
  message?: string;
  count?: number;
  data?: Array<{
    title?: string;
    address?: string;
    location?: {
      lat?: number;
      lng?: number;
    };
    ad_info?: {
      district?: string;
      city?: string;
      province?: string;
    };
  }>;
};

function getTencentMapKey() {
  return process.env.TENCENT_MAP_KEY || process.env.QQ_MAP_KEY || "";
}

function getTencentMapSk() {
  return process.env.TENCENT_MAP_SK || process.env.QQ_MAP_SK || "";
}

function isValidCoord(lng: number, lat: number) {
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
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

function pickShortName(
  result: NonNullable<TencentPlaceResponse["data"]>[number],
  fallback: string,
) {
  return (
    result.ad_info?.district ||
    result.ad_info?.city ||
    result.ad_info?.province ||
    result.title ||
    fallback
  );
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ error: "请输入至少 2 个字的地点" }, { status: 400 });
  }

  const key = getTencentMapKey();
  if (!key) {
    return NextResponse.json({ error: "未配置腾讯地图 Key（TENCENT_MAP_KEY）" }, { status: 500 });
  }
  const sk = getTencentMapSk();
  const url = buildTencentMapUrl(
    QQ_MAP_BASE_URL,
    QQ_PLACE_SEARCH_PATH,
    {
      boundary: "region(中国,1)",
      key,
      keyword: query,
      output: "json",
      page_index: "1",
      page_size: "1",
    },
    sk,
  );

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      return NextResponse.json({ error: "腾讯地理服务暂时不可用" }, { status: 502 });
    }

    const data = (await response.json()) as TencentPlaceResponse;
    if (data.status === 120) {
      return NextResponse.json(
        { error: "腾讯位置服务请求过于频繁，请稍后再试" },
        { status: 429 },
      );
    }
    if (data.status === 121) {
      return NextResponse.json(
        { error: "腾讯位置服务当日配额已用完，请在控制台升级配额或明天再试" },
        { status: 429 },
      );
    }
    if (data.status !== 0) {
      return NextResponse.json(
        { error: data.message || "腾讯地点搜索失败，请检查 Key、SK 与 WebServiceAPI 配置" },
        { status: 502 },
      );
    }

    const place = data.data?.[0];
    if (!place || !data.count) {
      return NextResponse.json({ error: "未找到该地点，请换个关键词" }, { status: 404 });
    }

    const lat = Number(place.location?.lat);
    const lng = Number(place.location?.lng);
    if (!isValidCoord(lng, lat)) {
      return NextResponse.json({ error: "地点坐标解析失败" }, { status: 502 });
    }

    const shortName = pickShortName(place, query);
    const displayName = place.address || place.title || shortName;

    const mapImageUrl =
      `/api/location/static?lng=${lng.toFixed(6)}` +
      `&lat=${lat.toFixed(6)}` +
      `&name=${encodeURIComponent(shortName)}`;
    const mapLink = `https://map.qq.com/?marker=coord:${lat.toFixed(6)},${lng.toFixed(6)};title:${encodeURIComponent(displayName)}`;

    return NextResponse.json({
      shortName,
      displayName,
      lat,
      lon: lng,
      mapImageUrl,
      mapLink,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "地点搜索超时，请重试" }, { status: 504 });
    }
    return NextResponse.json({ error: "地点搜索失败，请稍后重试" }, { status: 500 });
  }
}
