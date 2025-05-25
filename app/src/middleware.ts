import { NextRequest } from "next/server";
import {
  authMiddleware,
  adminMiddleware,
  inviteOnlyMiddleware,
} from "./middlewares";
import getHypertune from "./lib/getHypertune";

export async function middleware(request: NextRequest) {
  const hypertune = await getHypertune();
  const isInviteFlowEnabled = hypertune.isInviteFlowEnabled({ fallback: false });

  if (isInviteFlowEnabled) {
    return inviteOnlyMiddleware(request);
  }

  if (request.nextUrl.pathname.startsWith("/reviews")) {
    return authMiddleware(request);
  }
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }

  return;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
