import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

// Requires the API to stay under alumni-feup.com. On a different registrable
// domain the cookie becomes third-party, which Safari blocks and Firefox
// partitions — that is why this used to be 'none'.
const SAME_SITE = 'lax' as const;

export function getCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: SAME_SITE,
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
    path: '/',
  };
}

