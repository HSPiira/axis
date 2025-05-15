import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { JWT } from '@auth/core/jwt'
import type { Session, Account } from 'next-auth'
import type { NextRequest } from 'next/server'
import type { AdapterUser, AdapterSession } from '@auth/core/adapters'
import type { UserStatus, Language, ActionType } from '@/generated/prisma'
import type { JsonValue } from '@/generated/prisma/runtime/library'
import { prismaMock } from './singleton'

type MockUser = {
    id: string;
    email: string | null;
    password: string | null;
    emailVerified: Date | null;
    lastLoginAt: Date | null;
    preferredLanguage: Language | null;
    timezone: string | null;
    isTwoFactorEnabled: boolean;
    status: UserStatus;
    statusChangedAt: Date | null;
    inactiveReason: string | null;
    suspensionReason: string | null;
    banReason: string | null;
    metadata: JsonValue | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    name?: string | null;
    image?: string | null;
}

// Import the config after mocking
import { createConfig } from '@/lib/auth'

// Create a test config with the mocked prisma client
const config = createConfig(prismaMock)

describe('Authentication', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks()
    })

    describe('Sign In', () => {
        it('should create audit log on successful sign in', async () => {
            const mockUser: MockUser = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: new Date(),
                image: null,
                status: 'ACTIVE' as UserStatus,
                lastLoginAt: new Date(),
                password: null,
                preferredLanguage: null,
                timezone: null,
                isTwoFactorEnabled: false,
                statusChangedAt: null,
                inactiveReason: null,
                suspensionReason: null,
                banReason: null,
                metadata: null,
                deletedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const mockAccount = {
                provider: 'microsoft-entra-id',
                type: 'oauth',
                providerAccountId: 'account123',
            } as Account

            // Mock user upsert
            prismaMock.user.upsert.mockResolvedValue(mockUser)
            // Mock audit log create
            prismaMock.auditLog.create.mockResolvedValue({} as { id: string; userId: string | null; ipAddress: string | null; userAgent: string | null; action: ActionType; entityType: string | null; entityId: string | null; data: JsonValue; timestamp: Date })

            // Test the signIn event
            await config.events?.signIn!({
                user: mockUser as AdapterUser,
                account: mockAccount,
                profile: { ...mockUser, [Symbol.iterator]: undefined },
                isNewUser: false,
            })

            // Verify upsert was called with correct parameters
            expect(prismaMock.user.upsert).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                create: expect.objectContaining({
                    id: mockUser.id,
                    email: mockUser.email,
                    status: 'ACTIVE',
                    emailVerified: expect.any(Date),
                    lastLoginAt: expect.any(Date),
                }),
                update: expect.objectContaining({
                    lastLoginAt: expect.any(Date),
                }),
            })

            // Verify audit log was created
            expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
                data: {
                    action: 'LOGIN',
                    entityType: 'User',
                    entityId: mockUser.id,
                    userId: mockUser.id,
                    data: {
                        isNewUser: false,
                        provider: mockAccount.provider,
                        email: mockUser.email,
                    },
                },
            })
        })

        it('should create profile for new users', async () => {
            const mockUser: MockUser = {
                id: 'newuser123',
                email: 'newuser@example.com',
                name: 'New User',
                image: 'https://example.com/avatar.jpg',
                emailVerified: new Date(),
                status: 'ACTIVE' as UserStatus,
                lastLoginAt: new Date(),
                password: null,
                preferredLanguage: null,
                timezone: null,
                isTwoFactorEnabled: false,
                statusChangedAt: null,
                inactiveReason: null,
                suspensionReason: null,
                banReason: null,
                metadata: null,
                deletedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const mockAccount = {
                provider: 'microsoft-entra-id',
                type: 'oauth',
                providerAccountId: 'account123',
            } as Account

            // Mock user upsert and profile create
            prismaMock.user.upsert.mockResolvedValue(mockUser)
            prismaMock.profile.create.mockResolvedValue({
                id: 'profile123',
                userId: mockUser.id,
                fullName: mockUser.name ?? '',
                email: mockUser.email ?? null,
                image: mockUser.image ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                preferredLanguage: null,
                metadata: null,
                preferredContactMethod: null,
                preferredName: null,
                dob: null,
                gender: null,
                phone: null,
                address: null,
                emergencyContactName: null,
                emergencyContactPhone: null,
                emergencyContactEmail: null,
            })

            // Test the signIn event for a new user
            await config.events?.signIn!({
                user: mockUser as AdapterUser,
                account: mockAccount,
                profile: { ...mockUser, [Symbol.iterator]: undefined },
                isNewUser: true,
            })

            // Verify profile was created
            expect(prismaMock.profile.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: mockUser.id,
                    fullName: mockUser.name,
                    email: mockUser.email,
                    image: mockUser.image,
                }),
            })
        })
    })

    describe('Sign Out', () => {
        it('should create audit log on sign out', async () => {
            const mockUser: MockUser = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: new Date(),
                image: null,
                status: 'ACTIVE' as UserStatus,
                lastLoginAt: new Date(),
                password: null,
                preferredLanguage: null,
                timezone: null,
                isTwoFactorEnabled: false,
                statusChangedAt: null,
                inactiveReason: null,
                suspensionReason: null,
                banReason: null,
                metadata: null,
                deletedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            // Mock user findUnique
            prismaMock.user.findUnique.mockResolvedValue(mockUser)

            // Test the signOut event
            await config.events?.signOut!({
                token: { id: mockUser.id },
            })

            // Verify audit log was created
            expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    action: 'LOGOUT',
                    entityType: 'User',
                    entityId: mockUser.id,
                    userId: mockUser.id,
                    data: {
                        email: mockUser.email,
                    },
                }),
            })
        })
    })

    describe('JWT Handling', () => {
        it('should include user roles in JWT token', async () => {
            const mockUser: AdapterUser = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: new Date(),
                image: null,
            }

            const mockAccount = {
                provider: 'microsoft-entra-id',
                type: 'oauth',
                providerAccountId: 'account123',
            } as Account

            const token: JWT = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
            }

            const result = await config.callbacks?.jwt!({
                token,
                user: mockUser,
                account: mockAccount,
                trigger: 'signIn',
            })

            expect(result).toBeDefined()
            expect(result).toHaveProperty('id', token.id)
            expect(result).toHaveProperty('email', token.email)
        })
    })

    describe('Session Handling', () => {
        it('should include user ID and roles in session', () => {
            const mockUser: AdapterUser = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: new Date(),
                image: null,
            }

            const token: JWT = {
                id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                roles: ['USER', 'ADMIN'],
            }

            const mockSession = {
                user: {
                    ...mockUser,
                    emailVerified: new Date(),
                } as AdapterUser,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                sessionToken: 'mock-session-token',
                userId: mockUser.id,
            } as unknown as Session & AdapterSession & { user: AdapterUser }

            const sessionResult = config.callbacks?.session!({
                session: mockSession,
                token,
                trigger: 'update',
                user: mockUser as AdapterUser,
                newSession: mockSession,
            })
            return Promise.resolve(sessionResult).then(result => {
                expect(result?.user?.id).toBe(token.id)
                expect(result?.user?.roles).toEqual(token.roles)
            })
        })
    })

    describe('Authorization', () => {
        it('should allow authenticated users to access dashboard', () => {
            const mockRequest = {
                nextUrl: new URL('http://localhost:3000/dashboard'),
                cookies: {
                    get: () => ({ value: 'valid-session-token' }),
                },
            } as unknown as NextRequest

            const mockUser: AdapterUser = {
                id: 'user123',
                email: 'test@example.com',
                emailVerified: new Date(),
                image: null,
                name: null,
            }

            const mockSession = {
                user: mockUser,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }

            const result = config.callbacks?.authorized!({
                auth: mockSession,
                request: mockRequest,
            })

            expect(result).toBe(true)
        })

        it('should deny unauthenticated users from accessing dashboard', () => {
            const mockRequest = {
                nextUrl: new URL('http://localhost:3000/admin/dashboard'),
                cookies: {
                    get: () => null,
                },
            } as unknown as NextRequest

            const result = config.callbacks?.authorized!({
                auth: null,
                request: mockRequest,
            })

            expect(result).toBe(false)
        })
    })
}) 