import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(request: NextRequest) {
  const userCookie = request.cookies.get("user")?.value;
  if (!userCookie) {
    return NextResponse.redirect(new URL("/analytics", request.url));
  }
  return NextResponse.next();
}
