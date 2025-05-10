import '@testing-library/jest-dom';

// Mock Prisma client
jest.mock('@/lib/db', () => {
    const mockPrisma = {
        user: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        userRole: {
            create: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        organization: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        industry: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        contract: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    return {
        prisma: mockPrisma,
        __esModule: true,
        default: mockPrisma,
    };
});

// Mock auth module
jest.mock('@/auth', () => ({
    auth: jest.fn().mockResolvedValue({
        user: {
            id: 'test-user-id',
            email: 'test@test.com',
            name: 'Test User',
        }
    }),
    __esModule: true,
}));

// Mock jose module
jest.mock('jose', () => ({
    jwtVerify: jest.fn().mockResolvedValue({
        payload: {
            sub: 'test-user-id',
            email: 'test@test.com',
            name: 'Test User',
        }
    }),
    __esModule: true,
}));

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
})); 