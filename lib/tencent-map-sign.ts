import { createHash } from "node:crypto";

export function buildTencentMapSignedQuery(params: Record<string, string>, sk?: string) {
  const entries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  const rawQuery = entries.map(([k, v]) => `${k}=${v}`).join("&");
  const encodedQuery = entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

  if (!sk) {
    return encodedQuery;
  }

  return { rawQuery, encodedQuery };
}

export function buildTencentMapUrl(baseUrl: string, path: string, params: Record<string, string>, sk?: string) {
  const queryData = buildTencentMapSignedQuery(params, sk);
  if (typeof queryData === "string") {
    return `${baseUrl}${path}?${queryData}`;
  }

  const signSource = `${path}?${queryData.rawQuery}${sk}`;
  const sig = createHash("md5").update(signSource, "utf8").digest("hex").toLowerCase();
  return `${baseUrl}${path}?${queryData.encodedQuery}&sig=${sig}`;
}
