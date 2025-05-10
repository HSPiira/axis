import { GET, POST } from '@/app/api/organization/route';
import { prisma } from '@/lib/db';
import { ORGANIZATION_PERMISSIONS, ROLES } from '@/lib/constants/roles';
import {
    mockAuth,
    mockPermissionMiddleware,
    createTestUser,
    mockUserRoles,
    createAuthenticatedRequest,
    testApiResponse,
    mockPaginationResponse,
    cleanupTestData
} from '../utils/test-utils';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
    prisma: {
        organization: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
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
    }
}));

// Setup mocks
mockAuth();
mockPermissionMiddleware();

describe('Organization API', () => {
    let testUser: any;
    let authToken: string;
    const createdOrganizationIds: string[] = [];

    beforeAll(async () => {
        const { testUser: user, authToken: token } = await createTestUser(ROLES.ADMIN, []);
        testUser = user;
        authToken = token;
    });

    afterAll(async () => {
        await cleanupTestData(testUser, createdOrganizationIds, 'organization');
    });

    describe('Permission Checks', () => {
        it('should deny access without authentication', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');
            request.headers.delete('Authorization');

            await testApiResponse(GET, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should deny access to GET /organization without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');
            await testApiResponse(GET, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should deny access to POST /organization without create permission', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should allow access to GET /organization with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            const mockOrganizations = [{
                id: '1',
                name: 'Test Org',
                email: 'test@org.com',
                createdAt: '2024-01-01T00:00:00.000Z',
                industry: { id: '1', name: 'Tech' }
            }];

            (prisma.organization.findMany as jest.Mock).mockResolvedValue(mockOrganizations);
            (prisma.organization.count as jest.Mock).mockResolvedValue(1);

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization?page=1&limit=10');
            const { data } = await testApiResponse(GET, request, 200);

            expect(data.organizations).toEqual(mockOrganizations);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10
            });
        });

        it('should allow access to POST /organization with create permission', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const mockOrganization = {
                id: '1',
                name: 'New Org',
                email: 'new@org.com',
                createdAt: '2024-01-01T00:00:00.000Z',
                industry: { id: '1', name: 'Tech' }
            };

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'New Org',
                    email: 'new@org.com',
                    industryId: '1'
                }
            );

            await testApiResponse(POST, request, 201, mockOrganization);
        });

        it('should allow admin to access all endpoints', async () => {
            mockUserRoles(ROLES.ADMIN, []);

            const mockOrganization = {
                id: '1',
                name: 'New Org',
                email: 'new@org.com',
                createdAt: '2024-01-01T00:00:00.000Z',
                industry: { id: '1', name: 'Tech' }
            };

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'New Org',
                    email: 'new@org.com',
                    industryId: '1'
                }
            );

            await testApiResponse(POST, request, 201, mockOrganization);
        });
    });

    describe('GET /api/organization', () => {
        it('should return organizations with pagination', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            const mockOrganizations = [
                {
                    id: '1',
                    name: 'Test Org',
                    email: 'test@org.com',
                    createdAt: new Date().toISOString(),
                    industry: { id: '1', name: 'Tech' },
                },
            ];

            (prisma.organization.findMany as jest.Mock).mockResolvedValue(mockOrganizations);
            (prisma.organization.count as jest.Mock).mockResolvedValue(1);

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization?page=1&limit=10');
            const { data } = await testApiResponse(GET, request, 200);

            expect(data.organizations).toEqual(mockOrganizations);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10,
            });
        });

        it('should handle search parameters', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization?search=test&status=ACTIVE');
            await GET(request);

            expect(prisma.organization.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
                            expect.objectContaining({ email: { contains: 'test', mode: 'insensitive' } }),
                        ]),
                        status: 'ACTIVE',
                    }),
                })
            );
        });
    });

    describe('POST /api/organization', () => {
        it('should create a new organization', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const mockOrganization = {
                id: '1',
                name: 'New Org',
                email: 'new@org.com',
                createdAt: new Date().toISOString(),
                industry: { id: '1', name: 'Tech' },
            };

            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'New Org',
                    email: 'new@org.com',
                    industryId: '1',
                }
            );

            await testApiResponse(POST, request, 201, mockOrganization);
        });

        it('should validate required fields', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    email: 'invalid@org.com',
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name is required'
            });
        });

        it('should validate email format', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'invalid-email',
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Invalid email format'
            });
        });

        it('should prevent duplicate organization names', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Existing Org',
                email: 'existing@org.com'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Existing Org',
                    email: 'new@org.com',
                }
            );

            await testApiResponse(POST, request, 409, {
                error: 'Organization with this name or email already exists'
            });
        });
    });
}); 