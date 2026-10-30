import { Configuration, V1Api } from './index';

/**
 * API client for server-side-only code (middleware, server components).
 * Calls localhost directly instead of the public URL - the frontend and
 * API run on the same machine, so routing server-to-server calls out
 * through the public domain (and back in through the Cloudflare Tunnel)
 * is an unnecessary hairpin that can fail depending on tunnel/network
 * config. Never import this from client-side code; it has no browser-safe
 * default and isn't meant to be bundled into the client.
 */
const config = new Configuration({
  basePath: process.env.INTERNAL_API_URL || 'http://localhost:3010',
  credentials: 'include',
});

export const serverApi = new V1Api(config);
