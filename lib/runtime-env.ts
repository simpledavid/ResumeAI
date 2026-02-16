import { getRequestContext } from "@cloudflare/next-on-pages";

type EnvRecord = Record<string, unknown>;

/**
 * Read environment variables in Cloudflare Pages Functions and local Node runtimes.
 */
export function readRuntimeEnv(name: string): string | undefined {
  try {
    const context = getRequestContext();
    const env = context?.env as EnvRecord | undefined;
    const value = env?.[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  } catch {
    // getRequestContext is unavailable outside Cloudflare request handling.
  }

  if (typeof process !== "undefined") {
    const value = process.env?.[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}
