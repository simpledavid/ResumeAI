// Server-side database access for Server Components
// This works in both development and Cloudflare Pages environments

import type { D1Database } from '@cloudflare/workers-types';
import { getDbServices } from './db';

// For Cloudflare Pages, getRequestContext provides access to env bindings
import { getRequestContext } from '@cloudflare/next-on-pages';

interface Env {
  DB: D1Database;
  [key: string]: unknown;
}

/**
 * Get database services for server components
 * Works in both development (with local D1) and production (Cloudflare Pages)
 */
export function getServerDb() {
  try {
    // In Cloudflare Pages environment
    const context = getRequestContext();
    if (context && context.env && 'DB' in context.env) {
      const env = context.env as Env;
      return getDbServices(env.DB);
    }
  } catch {
    // getRequestContext might not be available in all environments
  }

  // Fallback: throw error if no database is available
  throw new Error(
    'Database not available. Make sure you are running in Cloudflare Workers environment or using wrangler dev.'
  );
}
