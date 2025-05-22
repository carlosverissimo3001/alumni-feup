import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NestAPI from "@/api";

export async function adminMiddleware(request: NextRequest) {
  const fallbackUrl = new URL("/analytics", request.url);
  const userCookie = request.cookies.get("user")?.value;

  if (!userCookie) {
    return NextResponse.redirect(fallbackUrl);
  }

  let userId: string | undefined;
  try {
    const user = JSON.parse(userCookie);
    userId = user.id;
  } catch (error) {
    console.error("❌ Error parsing user cookie:", error);
    return NextResponse.redirect(fallbackUrl);
  }

  if (!userId) {
    return NextResponse.redirect(fallbackUrl);
  }

  try {
    const {hasPermission} = await NestAPI.userControllerCheckPermission({
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
