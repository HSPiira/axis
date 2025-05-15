import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import type { PrismaClient } from '@/generated/prisma'

// Mock the environment variables
process.env.AUTH_MICROSOFT_ENTRA_ID_ID = 'test_client_id'
process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET = 'test_client_secret'
process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER = 'test_issuer'
process.env.NEXTAUTH_SECRET = 'test_secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock URL since it's not available in Node environment
if (typeof window !== 'undefined') {
    window.URL = URL
} else {
    global.URL = URL
}

// Create the mock client
const mockPrismaClient = {
    user: {
        findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
        create: jest.fn().mockImplementation(() => Promise.resolve({})),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
        upsert: jest.fn().mockImplementation(() => Promise.resolve({})),
    },
    account: {
        findFirst: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
    profile: {
        create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((operations) => {
        if (Array.isArray(operations)) {
            return Promise.all(operations)
        }
        return Promise.resolve([])
    }),
} as unknown as PrismaClient

// Mock the prisma module
jest.mock('@/lib/prisma', () => ({
    prisma: mockPrismaClient,
}))

// Export the mock client for use in tests
export { mockPrismaClient as prisma }

// Ensure proper cleanup after all tests
afterAll(async () => {
    if (mockPrismaClient.$disconnect) {
        await mockPrismaClient.$disconnect()
    }
}) 