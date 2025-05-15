import { UserStatus, Role, User, UserRole } from '@/generated/prisma'
import type { Prisma } from '@/generated/prisma'

export const createMockRole = (override: Partial<Role> = {}): Role => ({
    id: 'role_123',
    name: 'USER',
    description: null,
    deletedAt: null,
    ...override
})

export const createMockUserRole = (override: Partial<UserRole> = {}): UserRole => ({
    id: 'user_role_123',
    userId: 'user_123',
    roleId: 'role_123',
    ...override
})

export const createMockUser = (override: Partial<User> = {}): User => ({
    id: 'user_123',
    email: null,
    password: null,
    emailVerified: null,
    lastLoginAt: null,
    preferredLanguage: null,
    timezone: null,
    isTwoFactorEnabled: false,
    status: UserStatus.ACTIVE,
    statusChangedAt: null,
    inactiveReason: null,
    suspensionReason: null,
    banReason: null,
    metadata: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override
})

export type MockUserWithRelations = Prisma.UserGetPayload<{
    include: {
        userRoles: {
            include: {
                role: true
            }
        }
    }
}>

export const createMockUserWithRelations = (override: Partial<MockUserWithRelations> = {}): MockUserWithRelations => {
    const mockRole = createMockRole()
    const mockUser = createMockUser()
    const mockUserRole = createMockUserRole()

    return {
        ...mockUser,
        userRoles: [
            {
                ...mockUserRole,
                role: mockRole
            }
        ],
        ...override
    }
} 