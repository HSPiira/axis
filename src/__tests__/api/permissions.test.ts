import { GET } from '@/app/api/permissions/route';
import { PERMISSIONS, ROLES } from '@/lib/constants/roles';
import {
    mockAuth,
    mockPermissionMiddleware,
    createTestUser,
    mockUserRoles,
    createAuthenticatedRequest,
    testApiResponse,
    cleanupTestData,
    resetMocks
} from '../utils/test-utils';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

jest.mock('@/lib/db', () => ({
    prisma: {
        permission: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        user: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        userRole: {
            create: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            delete: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        }
    }
}));

// Setup mocks
mockAuth();
mockPermissionMiddleware();

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
    rateLimit: jest.fn().mockReturnValue({
        check: jest.fn().mockResolvedValue({ success: true })
    })
}));

// Mock audit log
jest.mock('@/lib/audit-log', () => ({
    auditLog: jest.fn().mockResolvedValue(undefined)
}));

describe('Permissions API', () => {
    let testUser: any;
    let authToken: string;

    beforeEach(() => {
        // Reset all mocks before each test
        resetMocks();
        jest.clearAllMocks();

        // Default mock for findMany to avoid undefined permissions
        (prisma.permission.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'perm1',
                name: 'permission:read',
                description: 'Read permissions'
            }
        ]);

        // Default mock for user creation
        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: 'test-user-id',
            email: 'test@test.com',
            name: 'Test User'
        });

        // Default mock for user role creation
        (prisma.userRole.create as jest.Mock).mockResolvedValue({
            userId: 'test-user-id',
            roleId: 'admin'
        });
    });

    beforeAll(async () => {
        const { testUser: user, authToken: token } = await createTestUser(ROLES.ADMIN, []);
        testUser = user;
        authToken = token;
    });

    afterAll(async () => {
        await cleanupTestData(testUser, [], 'permission');
    });

    describe('Permission Checks', () => {
        it('should deny access without authentication', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            request.headers.delete('Authorization');
            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: No token provided'
            });
        });

        it('should deny access without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);
            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            await testApiResponse(GET, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should allow access with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.PERMISSION_READ]);
            const mockPermissions = [
                {
                    id: 'perm1',
                    name: 'permission:read',
                    description: 'Read permissions'
                },
                {
                    id: 'perm2',
                    name: 'permission:write',
                    description: 'Write permissions'
                }
            ];
            (prisma.permission.findMany as jest.Mock).mockResolvedValue(mockPermissions);

            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            const { data } = await testApiResponse(GET, request, 200);
            expect(data).toEqual(mockPermissions);
            expect(auditLog).toHaveBeenCalledWith('PERMISSION_LIST', {
                count: mockPermissions.length
            });
        });

        it('should allow admin to access', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            const mockPermissions = [
                {
                    id: 'perm1',
                    name: 'permission:read',
                    description: 'Read permissions'
                }
            ];
            (prisma.permission.findMany as jest.Mock).mockResolvedValue(mockPermissions);

            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            const { data } = await testApiResponse(GET, request, 200);
            expect(data).toEqual(mockPermissions);
        });
    });

    describe('GET /api/permissions', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return permissions sorted by name', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.PERMISSION_READ]);
            const mockPermissions = [
                {
                    id: 'perm2',
                    name: 'permission:write',
                    description: 'Write permissions'
                },
                {
                    id: 'perm1',
                    name: 'permission:read',
                    description: 'Read permissions'
                }
            ];
            (prisma.permission.findMany as jest.Mock).mockResolvedValue(mockPermissions);

            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            await GET(request);

            expect(prisma.permission.findMany).toHaveBeenCalledWith({
                orderBy: { name: 'asc' }
            });
        });

        it('should handle rate limiting', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.PERMISSION_READ]);
            (rateLimit().check as jest.Mock).mockResolvedValueOnce({ success: false });

            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            await testApiResponse(GET, request, 429, {
                error: 'Too many requests'
            });
        });

        it('should handle database errors', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.PERMISSION_READ]);
            (prisma.permission.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const request = createAuthenticatedRequest('http://localhost:3000/api/permissions');
            await testApiResponse(GET, request, 500, {
                error: 'Failed to fetch permissions'
            });

            expect(auditLog).toHaveBeenCalledWith('PERMISSION_LIST_ERROR', {
                error: 'Database error'
            });
        });
    });
}); 