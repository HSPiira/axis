import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authRoutes, protectedRoutes, publicRoutes, DEFAULT_LOGIN_REDIRECT } from '@/config/routes'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('authjs.session-token')?.value

    console.log('Auth Debug - Middleware:', {
        pathname,
        token: token ? 'exists' : 'missing',
        cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value ? 'exists' : 'missing' })),
        headers: Object.fromEntries(request.headers.entries())
    });

    // Skip middleware for API routes
    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    // If user is logged in and tries to access auth routes, redirect to dashboard
    if (token && authRoutes.includes(pathname)) {
        console.log('Auth Debug - Redirecting to dashboard:', { pathname, token: 'exists' });
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If user is not logged in and tries to access protected routes, redirect to login
    if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
        console.log('Auth Debug - Redirecting to login:', {
            pathname,
            token: 'missing',
            protectedRoutes: protectedRoutes.filter(route => pathname.startsWith(route))
        });
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 