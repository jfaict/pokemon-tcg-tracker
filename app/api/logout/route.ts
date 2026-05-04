import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({}, { status: 200 });
  res.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
