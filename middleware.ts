import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withSecurityHeaders } from "./middleware/security"
import { rateLimit } from "./lib/rate-limit"

// Auth-specific rate limit configuration
const authRateLimit = {
    maxRequests: 5,    // 5 requests
    windowMs: 60000,   // per minute
}

export default async function middleware(request: NextRequest) {
    // Apply rate limiting for auth endpoints
    if (request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/api/auth')) {
        const rateLimitResult = await rateLimit(request, authRateLimit)
        if (rateLimitResult) return rateLimitResult
    }

    const session = await auth()

    // List of public paths that don't require authentication
    const publicPaths = [
        "/",
        "/auth/signin",
        "/auth/error",
        "/api/auth",
        "/_next",
        "/favicon.ico",
        "/logo.svg",
        "/microsoft.svg",
        "/file.svg",
        "/window.svg",
        "/globe.svg"
    ]

    // Check if the current path matches any of the public paths
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith(path + "/")
    )

    let response: NextResponse

    if (!session && !isPublicPath) {
        // Redirect to signin page if trying to access protected route without session
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", request.url)
        response = NextResponse.redirect(signInUrl)
    } else if (session && request.nextUrl.pathname === "/auth/signin") {
        // Redirect to home if trying to access signin page with active session
        response = NextResponse.redirect(new URL("/admin/dashboard", request.url))
    } else {
        response = NextResponse.next()
    }

    // Apply security headers to all responses
    return withSecurityHeaders(request, response)
}

// Configure which paths the middleware should run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
} 