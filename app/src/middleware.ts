import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  adminMiddleware,
} from "./middlewares";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  if (request.nextUrl.pathname.startsWith("/reviews")) {
    return authMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|logos|fonts).*)",
  ],
};
