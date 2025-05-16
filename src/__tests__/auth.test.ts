jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        auth: jest.fn(),
        handlers: {},
        signIn: jest.fn(),
        signOut: jest.fn(),
    })),
}));
jest.mock('next-auth/providers/microsoft-entra-id', () => ({
    __esModule: true,
    default: jest.fn(() => ({})),
}));
jest.mock('@auth/prisma-adapter', () => ({
    __esModule: true,
    PrismaAdapter: jest.fn(() => ({})),
}));

import { createConfig } from '../lib/auth/index';
import { prisma } from '@/lib/prisma';
import { NextAuthConfig } from 'next-auth';
import type { User, Account } from 'next-auth';

// Mock prisma client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        account: {
            create: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
        profile: {
            create: jest.fn(),
        },
    },
}));

describe('Auth Configuration', () => {
    let config: NextAuthConfig;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        config = createConfig();
    });

    describe('signIn callback', () => {
        it('should return false if user email is missing', async () => {
            const mockUser = {
                id: 'user123',
                email: '',
                emailVerified: new Date(),
            } as User;

            const mockAccount = {
                provider: 'microsoft-entra-id',
                type: 'oauth',
                providerAccountId: 'ms123',
            } as Account;

            const result = await config.callbacks?.signIn?.({
                user: mockUser,
                account: mockAccount,
                profile: {},
            });

            expect(result).toBe(false);
        });

        it('should link Microsoft account to existing user', async () => {
            const mockUser = {
                id: 'user123',
                email: 'test@example.com',
                emailVerified: new Date(),
            } as User;

            const mockExistingUser = {
                id: 'user123',
                email: 'test@example.com',
                accounts: [],
            };

            // Mock prisma responses
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
            (prisma.account.create as jest.Mock).mockResolvedValue({});
            (prisma.user.update as jest.Mock).mockResolvedValue({});
            (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

            const result = await config.callbacks?.signIn?.({
                user: mockUser,
                account: {
                    provider: 'microsoft-entra-id',
                    type: 'oauth',
                    providerAccountId: 'ms123',
                    access_token: 'token123',
                } as Account,
                profile: {},
            });

            expect(result).toBe(true);
            expect(prisma.account.create).toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalled();
            expect(prisma.auditLog.create).toHaveBeenCalled();
        });

        it('should create new user if user does not exist', async () => {
            const mockUser = {
                id: 'newuser123',
                email: 'new@example.com',
                name: 'New User',
                emailVerified: new Date(),
            } as User;

            // Mock prisma responses
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: 'newuser123',
                email: 'new@example.com',
            });
            (prisma.profile.create as jest.Mock).mockResolvedValue({});
            (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

            const result = await config.callbacks?.signIn?.({
                user: mockUser,
                account: {
                    provider: 'microsoft-entra-id',
                    type: 'oauth',
                    providerAccountId: 'ms123',
                    access_token: 'token123',
                } as Account,
                profile: {},
            });

            expect(result).toBe(true);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(prisma.profile.create).toHaveBeenCalled();
            expect(prisma.auditLog.create).toHaveBeenCalled();
        });
    });
}); 