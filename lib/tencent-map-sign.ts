function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function md5Hex(input: string) {
  // Edge runtime does not support node:crypto, use Web Crypto digest.
  const data = new TextEncoder().encode(input);

  try {
    const hash = await crypto.subtle.digest("MD5", data);
    return toHex(new Uint8Array(hash));
  } catch {
    // Fallback: if MD5 is unavailable in runtime, return empty signature.
    return "";
  }
}

export function buildTencentMapSignedQuery(
  params: Record<string, string>,
  sk?: string,
) {
  const entries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  const rawQuery = entries.map(([k, v]) => `${k}=${v}`).join("&");
  const encodedQuery = entries
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  if (!sk) {
    return encodedQuery;
  }

  return { rawQuery, encodedQuery };
}

export async function buildTencentMapUrl(
  baseUrl: string,
  path: string,
  params: Record<string, string>,
  sk?: string,
) {
  const queryData = buildTencentMapSignedQuery(params, sk);
  if (typeof queryData === "string") {
    return `${baseUrl}${path}?${queryData}`;
  }

  const signSource = `${path}?${queryData.rawQuery}${sk}`;
  const sig = await md5Hex(signSource);
  if (!sig) {
    return `${baseUrl}${path}?${queryData.encodedQuery}`;
  }

  return `${baseUrl}${path}?${queryData.encodedQuery}&sig=${sig}`;
}
