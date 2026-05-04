import { NextRequest, NextResponse } from "next/server";
import { verify } from "./lib/auth";

const SESSION_COOKIE = "session";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const sessionId = verify(cookieValue);

  if (!sessionId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
