import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverApi } from "@/sdk/server-client";

const SESSION_COOKIE_NAME = "alumniFeup_session";

export async function adminMiddleware(request: NextRequest) {
  const fallbackUrl = new URL("/analytics", request.url);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return NextResponse.redirect(fallbackUrl);
  }

  let userId: string | undefined;
  try {
    // Server-to-server call: forward the session cookie explicitly, the
    // way a browser's `credentials: 'include'` would - fetch() here runs
    // on the server, so it has no ambient cookie jar of its own.
    const user = await serverApi.authControllerMe({
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}` },
    });
    userId = user.id;
  } catch (error) {
    console.error("❌ Could not resolve user from session:", error);
    return NextResponse.redirect(fallbackUrl);
  }

  if (!userId) {
    return NextResponse.redirect(fallbackUrl);
  }

  try {
    const {hasPermission} = await serverApi.userControllerCheckPermission({
      checkPermissionDto: {
        userId,
        resource: "admin",
        action: "read",
      },
    });

    if (hasPermission !== true) {
      return NextResponse.redirect(fallbackUrl);
    }
  } catch (error) {
    console.error("❌ Permission check failed:", error);
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.next();
}
