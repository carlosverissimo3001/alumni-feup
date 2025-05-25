import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const response = NextResponse.json({ success: true });

    response.cookies.set("inviteToken", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days expiry
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Error setting invite cookie:", error);
    return NextResponse.json(
      { error: "Failed to set cookie" },
      { status: 400 }
    );
  }
}
