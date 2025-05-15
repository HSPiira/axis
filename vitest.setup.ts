import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '',
            query: {},
            asPath: '',
            push: vi.fn(),
            replace: vi.fn(),
        }
    },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
        }
    },
    usePathname() {
        return ''
    },
    useSearchParams() {
        return new URLSearchParams()
    },
}))

// Mock next/server
class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(input, init)
    }
}

vi.mock('next/server', () => ({
    NextRequest,
    NextResponse: {
        json: vi.fn((data, init) => ({
            json: () => Promise.resolve(data),
            status: init?.status || 200,
        })),
        redirect: (url: string) => new Response(null, { status: 302, headers: { Location: url } }),
    },
})) 