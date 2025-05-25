import { NextRequest, NextResponse } from "next/server";

export function inviteOnlyMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/invite-flow")) {
    return NextResponse.next();
  }

  const inviteToken = request.cookies.get("inviteToken")?.value;
  if (!inviteToken) {
    return NextResponse.redirect(new URL("/invite-flow", request.url));
  }

  return NextResponse.next();
}
