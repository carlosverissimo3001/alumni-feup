import { NextRequest } from 'next/server';
import { authMiddleware } from './middlewares/authMiddleware';
import { adminMiddleware } from './middlewares/adminMiddleware';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/reviews')) {
    return authMiddleware(request);
  }
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(request);
  }
  return;
}

export const config = {
  matcher: ['/reviews/:path*', '/admin/:path*'],
};
