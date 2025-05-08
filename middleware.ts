import { auth } from "@/auth";
import {
  apiAuthPrefix,
  authRoutes,
  protectedRoutes,
  publicRoutes,
} from "@/config/routes";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE RUNNING", request.nextUrl.pathname);
  try {
    const session = await auth();
    const { pathname } = request.nextUrl;

    const isApiAuthRoute = apiAuthPrefix.startsWith(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Always allow API auth routes
    if (isApiAuthRoute) return NextResponse.next();

    // Check for session token in cookies
    const token = request.cookies.get("next-auth.session-token")?.value;

    // If user is logged in and tries to access auth routes, redirect to dashboard
    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not logged in and tries to access protected routes, redirect to login
    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
