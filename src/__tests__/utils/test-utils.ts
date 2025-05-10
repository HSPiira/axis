import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import jwt from 'jsonwebtoken';

type SupportedModel = 'user' | 'organization' | 'industry' | 'role' | 'permission' | 'userRole';

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
            create: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
    };

    return {
        prisma: mockPrisma,
        __esModule: true,
        default: mockPrisma,
    };
});

// Create test roles if they don't exist
const ensureTestRoles = async () => {
    const roles = Object.values(ROLES);
    for (const role of roles) {
        (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: role, name: role });
    }
};

// Mock the auth function
export const mockAuth = () => {
    jest.mock('@/auth', () => ({
        auth: jest.fn().mockResolvedValue(null)
    }));
};

// Mock the permission middleware
export const mockPermissionMiddleware = () => {
    const mockCheckPermission = jest.fn(async (request: Request, permission: string) => {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return false;

        const token = authHeader.substring(7);
        const userRoles = await prisma.userRole.findMany({
            where: { userId: token },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        // Admin role has access to everything
        if (userRoles.some(userRole => userRole.role.name === ROLES.ADMIN)) {
            return true;
        }

        // Check if user has the required permission through any of their roles
        return userRoles.some(userRole =>
            userRole.role.permissions.some(
                rolePermission => rolePermission.permission.name === permission
            )
        );
    });

    jest.mock('@/middleware/check-permission', () => {
        return {
            withPermission: (permission: string) => (handler: Function) => async (request: Request) => {
                const hasPermission = await mockCheckPermission(request, permission);
                if (!hasPermission) {
                    return NextResponse.json(
                        { error: 'Unauthorized: Insufficient permissions' },
                        { status: 403 }
                    );
                }
                return handler(request);
            }
        };
    });

    return mockCheckPermission;
};

// Create a test user with specified role and permissions
export const createTestUser = async (role: string, permissions: string[]) => {
    await ensureTestRoles();

    const mockUser = {
        id: 'test-user-id',
        email: 'test@test.com',
        name: 'Test User',
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userRole.create as jest.Mock).mockResolvedValue({
        userId: mockUser.id,
        roleId: role,
    });

    // Create JWT token
    const authToken = jwt.sign({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
    }, 'test-secret', { expiresIn: '24h' });

    return { testUser: mockUser, authToken };
};

// Mock user roles for permission testing
export const mockUserRoles = (role: string, permissions: string[]) => {
    (prisma.userRole.findMany as jest.Mock).mockResolvedValue([{
        role: {
            name: role,
            permissions: permissions.map(permission => ({
                permission: { name: permission }
            }))
        }
    }]);
};

// Create a test request with authentication
export const createAuthenticatedRequest = (
    url: string,
    method: string = 'GET',
    body?: any,
    headers: Record<string, string> = {}
) => {
    const request = new NextRequest(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
            ...headers
        },
        ...(body && { body: JSON.stringify(body) })
    });
    return request;
};

// Test API response helper
export const testApiResponse = async (
    handler: Function,
    request: NextRequest,
    expectedStatus: number,
    expectedData?: any
) => {
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(expectedStatus);
    if (expectedData) {
        expect(data).toEqual(expectedData);
    }

    return { response, data };
};

// Mock pagination response
export const mockPaginationResponse = (data: any[], total: number, page: number = 1, limit: number = 10) => {
    return {
        data,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        }
    };
};

// Clean up test data
export const cleanupTestData = async (testUser: any, createdIds: string[], model: SupportedModel) => {
    try {
        if (createdIds.length > 0) {
            const modelClient = prisma[model] as { deleteMany: (args: any) => Promise<any> };
            await modelClient.deleteMany({
                where: {
                    id: {
                        in: createdIds
                    }
                }
            });
        }

        if (testUser?.id) {
            await prisma.userRole.deleteMany({
                where: { userId: testUser.id }
            });
            await prisma.user.delete({
                where: { id: testUser.id }
            });
        }
    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
}; 