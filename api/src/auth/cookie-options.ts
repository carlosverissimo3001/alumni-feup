import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export function getCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  };
}

export function getClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };
}

export function getUserCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  };
}

export function getClearUserCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };
}
