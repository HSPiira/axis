import { GET as GET_LIST, POST } from '@/app/api/roles/route';
import { GET as GET_ONE, PATCH, DELETE } from '../../app/api/roles/[id]/route';
import { PERMISSIONS, ROLES } from '@/lib/constants/roles';
import {
    mockAuth,
    mockPermissionMiddleware,
    createTestUser,
    mockUserRoles,
    createAuthenticatedRequest,
    testApiResponse,
    mockPaginationResponse,
    cleanupTestData,
    resetMocks
} from '../utils/test-utils';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

jest.mock('@/lib/db', () => ({
    prisma: {
        role: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
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
        permission: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
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

describe('Roles API', () => {
    let testUser: any;
    let authToken: string;
    const createdRoleIds: string[] = [];

    beforeEach(() => {
        // Reset all mocks before each test
        resetMocks();
        jest.clearAllMocks();

        // Default mock for findMany to avoid undefined permissions
        (prisma.role.findMany as jest.Mock).mockResolvedValue([
            {
                id: 'default-id',
                name: 'Default Role',
                description: '',
                createdAt: new Date().toISOString(),
                users: [],
                permissions: []
            }
        ]);

        // Robust default mock for all tests
        (prisma.role.findUnique as jest.Mock).mockResolvedValue({
            id: 'default-id',
            name: 'Default Role',
            description: '',
            createdAt: new Date().toISOString(),
            users: [],
            permissions: []
        });
        (prisma.role.findFirst as jest.Mock).mockResolvedValue({
            id: 'default-id',
            name: 'Default Role',
            description: '',
            createdAt: new Date().toISOString(),
            users: [],
            permissions: []
        });
        (prisma.role.update as jest.Mock).mockImplementation(() => ({
            id: 'default-id',
            name: 'Default Role',
            description: '',
            createdAt: new Date().toISOString(),
            users: [],
            permissions: []
        }));
    });

    beforeAll(async () => {
        const { testUser: user, authToken: token } = await createTestUser(ROLES.ADMIN, []);
        testUser = user;
        authToken = token;
    });

    afterAll(async () => {
        await cleanupTestData(testUser, createdRoleIds, 'role');
    });

    describe('Permission Checks', () => {
        it('should deny access without authentication', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles');
            request.headers.delete('Authorization');
            await testApiResponse(GET_LIST, request, 401, {
                error: 'Unauthorized: No token provided'
            });
        });

        it('should deny access to GET /roles without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles');
            await testApiResponse(GET_LIST, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should deny access to POST /roles without create permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'Test Role',
                    description: 'Test Description',
                    permissionIds: ['perm1']
                }
            );
            await testApiResponse(POST, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should allow access to GET /roles with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);
            const prismaMockRoles = [{
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            }];
            (prisma.role.findMany as jest.Mock).mockResolvedValue(prismaMockRoles);
            (prisma.role.count as jest.Mock).mockResolvedValue(1);
            const expectedRoles = [{
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            }];
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles?page=1&limit=10');
            const { data } = await testApiResponse(GET_LIST, request, 200);
            expect(data.data).toEqual(expectedRoles);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10
            });
        });

        it('should allow access to POST /roles with create permission', async () => {
            mockUserRoles(ROLES.MANAGER, [PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_CREATE]);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
            const prismaMockRole = {
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.create as jest.Mock).mockResolvedValue(prismaMockRole);
            (prisma.permission.findMany as jest.Mock).mockResolvedValue([{ id: 'perm1', name: 'role:read', description: 'Read roles' }]);
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'New Role',
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );
            const { data } = await testApiResponse(POST, request, 201);
            expect(data).toEqual({
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            });
        });

        it('should allow admin to access all endpoints', async () => {
            mockUserRoles(ROLES.ADMIN, []);

            const prismaMockRole = {
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };

            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.role.create as jest.Mock).mockResolvedValue(prismaMockRole);
            (prisma.permission.findMany as jest.Mock).mockResolvedValue([{ id: 'perm1', name: 'role:read' }]);
            (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({ count: 1 });

            const expectedRole = {
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            };

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'New Role',
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );

            await testApiResponse(POST, request, 201, expectedRole);
        });
    });

    describe('GET /api/roles', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return roles with pagination', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);

            const prismaMockRoles2 = [
                {
                    id: '1',
                    name: 'Test Role',
                    description: 'Test Description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    users: [],
                    permissions: [{
                        permission: {
                            id: 'perm1',
                            name: 'role:read',
                            description: 'Read roles'
                        }
                    }]
                },
            ];
            (prisma.role.findMany as jest.Mock).mockResolvedValue(prismaMockRoles2);
            (prisma.role.count as jest.Mock).mockResolvedValue(1);

            const expectedRoles2 = [
                {
                    id: '1',
                    name: 'Test Role',
                    description: 'Test Description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    users: [],
                    usersCount: 0,
                    permissions: [{
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }]
                },
            ];

            const request = createAuthenticatedRequest('http://localhost:3000/api/roles?page=1&limit=10');
            const { data } = await testApiResponse(GET_LIST, request, 200);

            expect(data.data).toEqual(expectedRoles2);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10
            });
        });

        it('should handle search parameters', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);

            (prisma.role.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.role.count as jest.Mock).mockResolvedValue(0);

            const request = createAuthenticatedRequest('http://localhost:3000/api/roles?search=test');
            await GET_LIST(request);

            expect(prisma.role.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
                            expect.objectContaining({ description: { contains: 'test', mode: 'insensitive' } }),
                        ]),
                    }),
                })
            );
        });

        it('should handle special characters in search', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);

            const prismaMockRoles3 = [{
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            }];
            (prisma.role.findMany as jest.Mock).mockResolvedValue(prismaMockRoles3);
            (prisma.role.count as jest.Mock).mockResolvedValue(1);

            const expectedRoles3 = [{
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            }];

            const request = createAuthenticatedRequest(`http://localhost:3000/api/roles?search=${encodeURIComponent('%$#@!')}`);
            await testApiResponse(GET_LIST, request, 200, {
                data: expectedRoles3,
                pagination: {
                    total: 1,
                    pages: 1,
                    page: 1,
                    limit: 10
                }
            });
        });
    });

    describe('POST /api/roles', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create a new role', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_CREATE
            ]);

            const prismaMockRole3 = {
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.role.create as jest.Mock).mockResolvedValue(prismaMockRole3);
            (prisma.permission.findMany as jest.Mock).mockResolvedValue([{ id: 'perm1', name: 'role:read' }]);

            const expectedRole3 = {
                id: '1',
                name: 'New Role',
                description: 'New Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            };

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'New Role',
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );

            await testApiResponse(POST, request, 201, expectedRole3);
        });

        it('should validate required fields', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name is required'
            });
        });

        it('should validate field lengths', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'a'.repeat(51),
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name exceeds maximum length'
            });
        });

        it('should prevent duplicate role names', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_CREATE
            ]);

            (prisma.role.findFirst as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Existing Role'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles',
                'POST',
                {
                    name: 'Existing Role',
                    description: 'New Description',
                    permissionIds: ['perm1']
                }
            );

            await testApiResponse(POST, request, 409, {
                error: 'Role with this name already exists'
            });
        });
    });

    describe('GET /api/roles/[id]', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return a specific role', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);
            const prismaMockRole = {
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(prismaMockRole);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'GET');
            const context = { params: { id: '1' } };
            const { data } = await testApiResponse(GET_ONE, request, 200, undefined, context);
            expect(data).toEqual({
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            });
        });

        it('should return 404 for non-existent role', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/999', 'GET');
            const context = { params: { id: '999' } };
            await testApiResponse(GET_ONE, request, 404, { error: 'Role not found' }, context);
        });
    });

    describe('PATCH /api/roles/[id]', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should update a role', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_UPDATE
            ]);

            const prismaMockRole = {
                id: '1',
                name: 'Updated Role',
                description: 'Updated Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(prismaMockRole);
            (prisma.role.update as jest.Mock).mockResolvedValue(prismaMockRole);
            (prisma.permission.findMany as jest.Mock).mockResolvedValue([{ id: 'perm1', name: 'role:read' }]);
            (prisma.rolePermission.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);

            const expectedRole = {
                id: '1',
                name: 'Updated Role',
                description: 'Updated Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            };

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles/1',
                'PATCH',
                {
                    name: 'Updated Role',
                    description: 'Updated Description',
                    permissionIds: ['perm1']
                }
            );
            const context = { params: { id: '1' } };
            const { data } = await testApiResponse(PATCH, request, 200, undefined, context);
            expect(data).toEqual(expectedRole);
            expect(auditLog).toHaveBeenCalledWith('ROLE_UPDATE', {
                roleId: '1',
                name: 'Updated Role',
                permissionCount: 1
            });
        });

        it('should return 404 for non-existent role', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_UPDATE
            ]);

            (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/roles/999',
                'PATCH',
                {
                    name: 'Updated Role',
                    description: 'Updated Description',
                    permissionIds: ['perm1']
                }
            );
            const context = { params: { id: '999' } };
            const { data } = await testApiResponse(PATCH, request, 404, undefined, context);
            expect(data).toEqual({ error: 'Role not found' });
        });

        it('should validate required fields', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_UPDATE
            ]);
            const mockRole = {
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: []
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'PATCH', {
                name: '',
                description: 'Updated Description',
                permissionIds: ['perm1']
            });
            const context = { params: { id: '1' } };
            await testApiResponse(PATCH, request, 400, { error: 'Role name cannot be empty' }, context);
        });

        it('should validate field lengths', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_UPDATE
            ]);
            const mockRole = {
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: []
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'PATCH', {
                name: 'a'.repeat(256),
                description: 'Updated Description',
                permissionIds: ['perm1']
            });
            const context = { params: { id: '1' } };
            await testApiResponse(PATCH, request, 400, { error: 'Role name cannot exceed 50 characters' }, context);
        });

        it('should prevent duplicate role names', async () => {
            mockUserRoles(ROLES.MANAGER, [
                PERMISSIONS.ROLE_READ,
                PERMISSIONS.ROLE_UPDATE
            ]);
            const mockRole = {
                id: '1',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: []
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            const error = new Error('Unique constraint failed');
            // @ts-ignore
            error.code = 'P2002';
            (prisma.role.update as jest.Mock).mockImplementation(() => { throw error; });
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'PATCH', {
                name: 'Existing Role',
                description: 'Updated Description',
                permissionIds: ['perm1']
            });
            const context = { params: { id: '1' } };
            await testApiResponse(PATCH, request, 400, { error: 'A role with this name already exists' }, context);
        });
    });

    describe('DELETE /api/roles/[id]', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should delete a role', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            const prismaMockRole = {
                id: '1',
                name: 'Test Role',
                users: []
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(prismaMockRole);
            (prisma.role.delete as jest.Mock).mockResolvedValue(prismaMockRole);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'DELETE');
            const context = { params: { id: '1' } };
            const { data } = await testApiResponse(DELETE, request, 200, { message: 'Role deleted successfully' }, context);
            expect(auditLog).toHaveBeenCalledWith('ROLE_DELETE', {
                roleId: '1',
                name: 'Test Role'
            });
        });

        it('should return 404 for non-existent role', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/999', 'DELETE');
            const context = { params: { id: '999' } };
            await testApiResponse(DELETE, request, 404, undefined, context);
        });

        it('should prevent deleting admin role', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            (prisma.role.findUnique as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'admin',
                users: []
            });
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'DELETE');
            const context = { params: { id: '1' } };
            await testApiResponse(DELETE, request, 400, undefined, context);
        });

        it('should prevent deleting roles with assigned users', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            (prisma.role.findUnique as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Test Role',
                users: [{ id: 'user1' }]
            });
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/1', 'DELETE');
            const context = { params: { id: '1' } };
            await testApiResponse(DELETE, request, 400, undefined, context);
        });
    });

    describe('Role Operations', () => {
        it('should get a role by ID', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.ROLE_READ]);
            const mockRole = {
                id: 'test-role-id',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/test-role-id', 'GET');
            const context = { params: { id: 'test-role-id' } };
            const response = await GET_ONE(request, context);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data).toEqual({
                id: 'test-role-id',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            });
        });

        it('should update a role', async () => {
            mockUserRoles(ROLES.MANAGER, [PERMISSIONS.ROLE_UPDATE]);
            const mockRole = {
                id: 'test-role-id',
                name: 'Updated Role',
                description: 'Updated Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: [{
                    permission: {
                        id: 'perm1',
                        name: 'role:read',
                        description: 'Read roles'
                    }
                }]
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            (prisma.role.update as jest.Mock).mockResolvedValue(mockRole);
            (prisma.permission.findMany as jest.Mock).mockResolvedValue([{
                id: 'perm1',
                name: 'role:read',
                description: 'Read roles'
            }]);
            (prisma.role.findFirst as jest.Mock).mockResolvedValue(null); // No duplicate name
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/test-role-id', 'PATCH', {
                name: 'Updated Role',
                description: 'Updated Description',
                permissionIds: ['perm1']
            });
            const context = { params: { id: 'test-role-id' } };
            const response = await PATCH(request, context);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data).toEqual({
                id: 'test-role-id',
                name: 'Updated Role',
                description: 'Updated Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                usersCount: 0,
                permissions: [{
                    id: 'perm1',
                    name: 'role:read',
                    description: 'Read roles'
                }]
            });
        });

        it('should delete a role', async () => {
            mockUserRoles(ROLES.ADMIN, []);
            const mockRole = {
                id: 'test-role-id',
                name: 'Test Role',
                description: 'Test Description',
                createdAt: '2024-01-01T00:00:00.000Z',
                users: [],
                permissions: []
            };
            (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
            (prisma.role.delete as jest.Mock).mockResolvedValue(mockRole);
            const request = createAuthenticatedRequest('http://localhost:3000/api/roles/test-role-id', 'DELETE');
            const context = { params: { id: 'test-role-id' } };
            const { data, response } = await testApiResponse(DELETE, request, 200, { message: 'Role deleted successfully' }, context);
            expect(response.status).toBe(200);
            expect(data).toEqual({ message: 'Role deleted successfully' });
        });
    });
}); 