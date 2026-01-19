import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_USER_ID = "00000000-0000-0000-0000-000000000001";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;

  // Allow login, auth API, static files
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for valid session
  if (!sessionId || sessionId !== ALLOWED_USER_ID) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
