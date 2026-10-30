import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/cookies";

export function authMiddleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/analytics", request.url));
  }
  return NextResponse.next();
}
