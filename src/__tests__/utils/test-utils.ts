import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ROLES } from '@/lib/constants/roles';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { rateLimit } from '@/lib/rate-limit';

type SupportedModel = 'user' | 'organization' | 'industry' | 'role' | 'permission' | 'userRole';

// Set test environment
// process.env.NODE_ENV = 'test';

// Mock Prisma client
jest.mock('@/lib/db', () => {
    const createMockMethod = () => {
        const mock = jest.fn().mockResolvedValue(null);
        mock.mockImplementation = (impl: (...args: any[]) => any) => {
            mock.mockImplementationOnce(impl);
            return mock;
        };
        return mock;
    };

    const createMockModel = (methods: string[]) => {
        const model: { [key: string]: jest.Mock } = {};
        methods.forEach(method => {
            model[method] = createMockMethod();
        });
        return model;
    };

    type MockPrisma = {
        user: { [key: string]: jest.Mock };
        role: { [key: string]: jest.Mock };
        userRole: { [key: string]: jest.Mock };
        organization: { [key: string]: jest.Mock };
        industry: { [key: string]: jest.Mock };
        permission: { [key: string]: jest.Mock };
        rolePermission: { [key: string]: jest.Mock };
        kPI: { [key: string]: jest.Mock };
        kPIAssignment: { [key: string]: jest.Mock };
        contract: { [key: string]: jest.Mock };
        $transaction: jest.Mock;
        $connect: jest.Mock;
        $disconnect: jest.Mock;
    };

    const mockPrisma: MockPrisma = {
        user: createMockModel(['create', 'delete', 'findUnique', 'findMany']),
        role: createMockModel(['findUnique', 'create', 'findMany', 'findFirst', 'update', 'delete', 'deleteMany', 'count']),
        userRole: createMockModel(['create', 'findMany', 'deleteMany', 'delete']),
        organization: createMockModel(['findMany', 'findFirst', 'create', 'deleteMany', 'count', 'findUnique', 'update']),
        industry: createMockModel(['findMany', 'findFirst', 'findUnique', 'create', 'update', 'delete']),
        permission: createMockModel(['findMany', 'findUnique']),
        rolePermission: createMockModel(['createMany', 'deleteMany']),
        kPI: createMockModel(['findMany', 'findFirst', 'findUnique', 'create', 'update', 'delete', 'count']),
        kPIAssignment: createMockModel(['findMany', 'findFirst', 'findUnique', 'create', 'update', 'delete', 'count']),
        contract: createMockModel(['findUnique']),
        $transaction: jest.fn((callback) => callback(mockPrisma)),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };

    return {
        prisma: mockPrisma,
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

// Create test roles if they don't exist
const ensureTestRoles = async () => {
    const roles = Object.values(ROLES);
    if (prisma.role && prisma.role.findUnique) {
        (prisma.role.findUnique as jest.Mock).mockImplementation((args) => {
            const roleName = args.where.name;
            return Promise.resolve({
                id: roleName,
                name: roleName,
                description: `${roleName} role`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                permissions: [],
                users: []
            });
        });
    }

    // Mock findMany for roles
    if (prisma.role && prisma.role.findMany) {
        (prisma.role.findMany as jest.Mock).mockImplementation(() => {
            return Promise.resolve(roles.map(roleName => ({
                id: roleName,
                name: roleName,
                description: `${roleName} role`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                permissions: [],
                users: []
            })));
        });
    }
};

// Add type for globalThis.__TEST_REQUEST__
declare global {
    // eslint-disable-next-line no-var
    var __TEST_REQUEST__: Request | undefined;
}

// Mock the auth function
export const mockAuth = (isValid: boolean = true) => {
    jest.mock('@/auth', () => ({
        auth: jest.fn().mockImplementation(async () => {
            // Check for invalid/expired token in the global fetch context
            if (globalThis.__TEST_REQUEST__ && globalThis.__TEST_REQUEST__.headers) {
                const authHeader = globalThis.__TEST_REQUEST__.headers.get('authorization');
                if (authHeader && (authHeader.includes('invalid-token') || authHeader.includes('expired-token'))) {
                    return null;
                }
            }
            return isValid ? {
                id: 'test-user-id',
                email: 'test@test.com',
                name: 'Test User',
            } : null;
        })
    }));
};

// Mock the permission middleware
export const mockPermissionMiddleware = () => {
    const mockCheckPermission = jest.fn(async (request: Request, permission: string) => {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { authorized: false, error: 'Unauthorized: No token provided' };
        }

        const token = authHeader.substring(7);
        if (token === 'invalid-token' || token === 'expired-token') {
            return { authorized: false, error: 'Unauthorized: Invalid or expired token' };
        }

        // Mock user roles and permissions
        (prisma.userRole.findMany as jest.Mock).mockResolvedValue([{
            id: 'ur-1',
            userId: 'test-user-id',
            roleId: 'admin',
            role: {
                id: 'admin',
                name: 'admin',
                description: 'Admin role',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                permissions: [{
                    id: 'rp-1',
                    roleId: 'admin',
                    permissionId: 'perm-1',
                    permission: {
                        id: 'perm-1',
                        name: permission,
                        description: `${permission} permission`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                }],
                users: []
            }
        }]);

        const userRoles = await prisma.userRole.findMany({
            where: { userId: 'test-user-id' },
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
            return { authorized: true };
        }

        // Check if user has the required permission through any of their roles
        const hasPermission = userRoles.some(userRole =>
            userRole.role.permissions.some(
                rolePermission => rolePermission.permission.name === permission
            )
        );

        return {
            authorized: hasPermission,
            error: hasPermission ? undefined : 'Unauthorized: Insufficient permissions'
        };
    });

    jest.mock('@/middleware/check-permission', () => {
        return {
            withPermission: (permission: string) => (handler: Function) => async (request: Request, context?: any) => {
                const result = await mockCheckPermission(request, permission);
                if (!result.authorized) {
                    // Return 401 for invalid/expired token, 403 otherwise
                    const is401 = result.error === 'Unauthorized: Invalid or expired token';
                    return NextResponse.json(
                        { error: result.error },
                        { status: is401 ? 401 : 403 }
                    );
                }
                return handler(request, context);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Mock user creation with unique constraint handling
    (prisma.user.create as jest.Mock).mockImplementation(async (data) => {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: data.data.email } });
        if (existingUser) {
            throw { code: 'P2002', message: 'Unique constraint violation' };
        }
        return mockUser;
    });

    // Mock user role creation
    (prisma.userRole.create as jest.Mock).mockImplementation(async (data) => {
        // Check if role assignment already exists
        const existingRole = await prisma.userRole.findMany({
            where: {
                userId: data.data.userId,
                roleId: data.data.roleId
            }
        });
        if (existingRole.length > 0) {
            throw { code: 'P2002', message: 'Unique constraint violation' };
        }
        return {
            id: `ur-${mockUser.id}-${role}`,
            userId: mockUser.id,
            roleId: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: {
                id: role,
                name: role,
                description: `${role} role`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                permissions: permissions.map(permission => ({
                    id: `rp-${permission}`,
                    roleId: role,
                    permissionId: `perm-${permission}`,
                    permission: {
                        id: `perm-${permission}`,
                        name: permission,
                        description: `${permission} permission`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                })),
                users: []
            }
        };
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
        id: `ur-${role}`,
        userId: 'test-user-id',
        roleId: role,
        role: {
            id: role,
            name: role,
            description: `${role} role`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            permissions: permissions.map(permission => ({
                id: `rp-${permission}`,
                roleId: role,
                permissionId: `perm-${permission}`,
                permission: {
                    id: `perm-${permission}`,
                    name: permission,
                    description: `${permission} permission`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            })),
            users: []
        }
    }]);

    // Also mock the role.findUnique to return the same role data
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: role,
        name: role,
        description: `${role} role`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: permissions.map(permission => ({
            id: `rp-${permission}`,
            roleId: role,
            permissionId: `perm-${permission}`,
            permission: {
                id: `perm-${permission}`,
                name: permission,
                description: `${permission} permission`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })),
        users: []
    });
};

type TestRequest = {
    request: NextRequest;
    context?: { params: Record<string, string> };
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
    console.log('Created request:', {
        url,
        method,
        headers: request.headers,
        body: body ? JSON.stringify(body) : undefined
    });
    return request;
};

// Test API response helper
export const testApiResponse = async (
    handler: Function,
    request: NextRequest,
    expectedStatus: number,
    expectedData?: any,
    context?: { params: Record<string, string> }
) => {
    // Set the global test request for mockAuth
    globalThis.__TEST_REQUEST__ = request;
    let response;
    try {
        response = await handler(request, context);
    } catch (err) {
        console.error('Handler threw error:', err);
        throw err;
    }
    // Clean up after test
    globalThis.__TEST_REQUEST__ = undefined;

    // Don't try to parse JSON for 204 No Content responses
    let data;
    if (response.status !== 204) {
        data = await response.json();
    }

    if (response.status !== expectedStatus || (expectedData && JSON.stringify(data) !== JSON.stringify(expectedData))) {
        // Print debug info if the test fails
        console.error('--- TEST DEBUG ---');
        console.error('Expected status:', expectedStatus);
        console.error('Actual status:', response.status);
        console.error('Expected data:', expectedData);
        console.error('Actual data:', data);
        console.error('------------------');
    }

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
        },
    };
};

// Clean up test data
export const cleanupTestData = async (testUser: any, createdIds: string[], model: SupportedModel) => {
    if (testUser) {
        await prisma.userRole.deleteMany({ where: { userId: testUser.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
    }

    if (createdIds.length > 0) {
        const modelDeleteMany = prisma[model]?.deleteMany as (args: any) => Promise<any>;
        if (typeof modelDeleteMany === 'function') {
            await modelDeleteMany({
                where: { id: { in: createdIds } },
            });
        }
    }
};

// Mock industry references
export const mockIndustryReference = (industryId: string) => {
    const mock = (args: any) => {
        if (args.where.id === industryId) {
            return Promise.resolve({ id: industryId, name: 'Test Industry' });
        }
        return Promise.resolve(null);
    };

    if (prisma.industry && prisma.industry.findUnique) {
        (prisma.industry.findUnique as jest.Mock).mockImplementation(mock);
    }
};

// Mock organization creation with industry reference handling
export const mockOrganizationCreation = () => {
    const createdOrganizations = new Map();

    (prisma.organization.create as jest.Mock).mockImplementation(async (data) => {
        // Check for unique constraints
        const existingOrg = Array.from(createdOrganizations.values()).find(
            org => org.name === data.data.name || org.email === data.data.email
        );
        if (existingOrg) {
            throw new PrismaClientKnownRequestError('Unique constraint violation', {
                code: 'P2002',
                meta: { target: ['name', 'email'] },
                clientVersion: '2.0.0'
            });
        }

        // Check for foreign key constraints
        if (data.data.industryId) {
            const industry = await prisma.industry.findUnique({
                where: { id: data.data.industryId }
            });
            if (!industry) {
                throw new PrismaClientKnownRequestError('Foreign key constraint failed', {
                    code: 'P2003',
                    meta: { field_name: 'industryId' },
                    clientVersion: '2.0.0'
                });
            }
        }

        const newOrg = {
            id: `org-${Date.now()}`,
            name: data.data.name,
            email: data.data.email,
            industryId: data.data.industryId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        createdOrganizations.set(newOrg.id, newOrg);
        return newOrg;
    });

    (prisma.organization.findMany as jest.Mock).mockImplementation(async () => {
        return Array.from(createdOrganizations.values());
    });

    (prisma.organization.findFirst as jest.Mock).mockImplementation(async ({ where }) => {
        return Array.from(createdOrganizations.values()).find(org =>
            org.id === where.id ||
            org.name === where.name ||
            org.email === where.email
        );
    });

    (prisma.organization.count as jest.Mock).mockImplementation(async () => {
        return createdOrganizations.size;
    });
};

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
    rateLimit: jest.fn().mockReturnValue({
        check: jest.fn().mockResolvedValue({ success: true })
    })
}));

// Reset all mocks before each test
export const resetMocks = () => {
    // Reset all mock implementations
    Object.values(prisma).forEach(model => {
        if (typeof model === 'object') {
            Object.values(model).forEach(method => {
                if (typeof method === 'function' && 'mockReset' in method) {
                    (method as jest.Mock).mockReset();
                }
            });
        }
    });

    // Reset rate limiter mock
    jest.clearAllMocks();
    (rateLimit as jest.Mock).mockReturnValue({
        check: jest.fn().mockResolvedValue({ success: true })
    });

    // Reset auth mock
    mockAuth(true);

    // Reset permission middleware
    mockPermissionMiddleware();
}; 