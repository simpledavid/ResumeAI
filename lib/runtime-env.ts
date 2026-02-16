export function readRuntimeEnv(name: string): string | undefined {
  // Avoid importing Cloudflare runtime helpers here: this file is used by Edge routes.
  const globalEnv = (globalThis as { __env?: Record<string, string> }).__env;
  if (globalEnv && typeof globalEnv[name] === "string" && globalEnv[name]) {
    return globalEnv[name];
  }

  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (proc?.env) {
    const value = proc.env[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}
