import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
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

    if (!session && !isPublicPath) {
        // Redirect to signin page if trying to access protected route without session
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", request.url)
        return NextResponse.redirect(signInUrl)
    }

    if (session && request.nextUrl.pathname === "/auth/signin") {
        // Redirect to home if trying to access signin page with active session
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
} 