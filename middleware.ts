import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_BASE_PATH, ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { verifySessionToken } from "@/lib/admin/session";

const PUBLIC_PATHS = [`${ADMIN_BASE_PATH}/login`, `${ADMIN_BASE_PATH}/setup`];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_BASE_PATH)) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `${ADMIN_BASE_PATH}/login`;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vercel/partners/:path*"],
};
