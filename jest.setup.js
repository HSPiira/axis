// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

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
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => ({
            json: () => Promise.resolve(data),
            status: init?.status || 200,
        })),
    },
})) 