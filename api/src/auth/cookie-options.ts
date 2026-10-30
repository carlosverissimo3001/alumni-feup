import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

// Requires the API to stay under alumni-feup.com. On a different registrable
// domain the cookie becomes third-party, which Safari blocks and Firefox
// partitions — that is why this used to be 'none'.
const SAME_SITE = 'lax' as const;

// Unset, a cookie is scoped to the exact host that set it - since this API
// lives on api.alumni-feup.com, that would mean the frontend's own server-side
// code (www.alumni-feup.com, e.g. Next.js middleware) never sees it, even
// though the browser correctly sends it on direct client-side calls to the
// API itself. Sharing it across the whole alumni-feup.com family fixes that.
const COOKIE_DOMAIN = isProd ? '.alumni-feup.com' : undefined;

export function getCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: SAME_SITE,
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  };
}

export function getClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    // Must match getCookieOptions or the clear will not match the cookie.
    sameSite: SAME_SITE,
    domain: COOKIE_DOMAIN,
    path: '/',
  };
}

