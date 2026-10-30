import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/cookies";

// Presence only; the backend validates. Every admin.controller.ts route is
// already guarded by UserAuthGuard + @RequirePermission("admin", ...), so
// this is just a fast UX redirect for the obviously-signed-out case, not
// the actual security boundary.
export async function adminMiddleware(request: NextRequest) {
  const fallbackUrl = new URL("/analytics", request.url);

  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.next();
}
