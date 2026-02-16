// Cloudflare Workers Runtime helpers
import type { D1Database } from "@cloudflare/workers-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDbServices } from "./db";

// Type for Cloudflare environment bindings
export interface Env {
  DB: D1Database;
  AUTH_SECRET?: string;
  [key: string]: unknown;
}

type RequestWithEnv = Request & { env?: Env };

function resolveEnv(request?: Request): Env {
  const requestEnv = (request as RequestWithEnv | undefined)?.env;
  if (requestEnv?.DB) {
    return requestEnv;
  }

  try {
    const context = getRequestContext();
    const contextEnv = context?.env as Env | undefined;
    if (contextEnv?.DB) {
      return contextEnv;
    }
  } catch {
    // getRequestContext is only available in Cloudflare runtime.
  }

  throw new Error(
    "D1 database binding not found. Configure DB in Cloudflare Pages Functions."
  );
}

// Get database services from Cloudflare request/context bindings.
export function getDb(request?: Request): ReturnType<typeof getDbServices> {
  return getDbServices(resolveEnv(request).DB);
}

// Get Cloudflare environment bindings.
export function getEnv(request?: Request): Env {
  return resolveEnv(request);
}

// Helper to check if we're running in Cloudflare Workers
export function isCloudflareWorkers(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent?.includes("Cloudflare-Workers")
  );
}
