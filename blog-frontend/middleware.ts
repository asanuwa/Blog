import { NextResponse, type NextRequest } from "next/server";
import { authRoutes, isProtectedRoute } from "@/lib/auth-routes";

const AUTH_ENFORCEMENT_ENABLED = false;
const ACCESS_TOKEN_COOKIE = "blog.accessToken";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!AUTH_ENFORCEMENT_ENABLED || !isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    return NextResponse.next();
  }

  const signInUrl = request.nextUrl.clone();
  signInUrl.pathname = authRoutes.signIn;
  signInUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/blogs/create", "/blogs/edit/:path*"],
};
