import { NextRequest } from "next/server";
import {
  authMiddleware,
  adminMiddleware,
  inviteOnlyMiddleware,
} from "./middlewares";
import getHypertune from "./lib/getHypertune";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  
  const hypertune = await getHypertune();
  // No need to check for this in dev
  const isInviteFlowEnabled =
    process.env.NODE_ENV === "production" &&
    hypertune.isInviteFlowEnabled({ fallback: false });

  if (isInviteFlowEnabled) {
    return inviteOnlyMiddleware(request);
  }

  if (request.nextUrl.pathname.startsWith("/reviews")) {
    return authMiddleware(request);
  }

  return;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|logos|fonts).*)",
  ],
};
