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
    cleanupTestData,
    mockIndustryReference,
    mockOrganizationCreation,
    resetMocks
} from '../utils/test-utils';
import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => {
    const mockCheck = jest.fn().mockResolvedValue({ success: true });
    return {
        rateLimit: jest.fn().mockReturnValue({
            check: mockCheck
        })
    };
});

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
        industry: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    }
}));

// Setup mocks
mockAuth();
mockPermissionMiddleware();

describe('Organization API', () => {
    beforeEach(() => {
        // Reset all mocks
        resetMocks();

        // Mock rate limiter to allow all requests by default
        (rateLimit as jest.Mock).mockReturnValue({
            check: jest.fn().mockResolvedValue({ success: true })
        });

        // Setup default mocks
        (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.organization.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.organization.count as jest.Mock).mockResolvedValue(0);
        (prisma.organization.create as jest.Mock).mockImplementation(async (data: any) => {
            return {
                id: 'test-org-id',
                name: data.data.name,
                email: data.data.email,
                industryId: data.data.industryId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        });
        (prisma.industry.findUnique as jest.Mock).mockImplementation(async ({ where }) => {
            if (where.id === '1') {
                return { id: '1', name: 'Tech' };
            }
            return null;
        });
    });

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
            const request = new NextRequest('http://localhost:3000/api/organization');
            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: No token provided'
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

            // Use a unique industryId and organization name/email for this test
            const industryId = 'unique-industry-1';
            mockIndustryReference(industryId);

            const uniqueOrgName = `New Org ${Date.now()}`;
            const uniqueOrgEmail = `new${Date.now()}@org.com`;

            const mockOrganization = {
                id: '1',
                name: uniqueOrgName,
                email: uniqueOrgEmail,
                createdAt: '2024-01-01T00:00:00.000Z',
                industry: { id: industryId, name: 'Tech' }
            };

            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: uniqueOrgName,
                    email: uniqueOrgEmail,
                    industryId
                }
            );

            await testApiResponse(POST, request, 201, mockOrganization);
        });

        it('should allow admin to access all endpoints', async () => {
            mockUserRoles(ROLES.ADMIN, []);

            // Use a unique industryId and organization name/email for this test
            const industryId = 'unique-industry-2';
            mockIndustryReference(industryId);

            const uniqueOrgName = `Admin Org ${Date.now()}`;
            const uniqueOrgEmail = `admin${Date.now()}@org.com`;

            const mockOrganization = {
                id: '2',
                name: uniqueOrgName,
                email: uniqueOrgEmail,
                createdAt: '2024-01-01T00:00:00.000Z',
                industry: { id: industryId, name: 'Tech' }
            };

            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: uniqueOrgName,
                    email: uniqueOrgEmail,
                    industryId
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
            await GET(request, { params: {} });

            expect(prisma.organization.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
                            expect.objectContaining({ email: { contains: 'test', mode: 'insensitive' } })
                        ]),
                        status: 'ACTIVE'
                    })
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

            // Use a unique industryId and organization name/email for this test
            const industryId = 'unique-industry-3';
            mockIndustryReference(industryId);

            const uniqueOrgName = `Created Org ${Date.now()}`;
            const uniqueOrgEmail = `created${Date.now()}@org.com`;

            const mockOrganization = {
                id: '3',
                name: uniqueOrgName,
                email: uniqueOrgEmail,
                createdAt: new Date().toISOString(),
                industry: { id: industryId, name: 'Tech' },
            };

            (prisma.organization.create as jest.Mock).mockResolvedValue(mockOrganization);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: uniqueOrgName,
                    email: uniqueOrgEmail,
                    industryId
                }
            );

            await testApiResponse(POST, request, 201, mockOrganization);
        });

        it('should validate required fields', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name cannot be empty'
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
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Mock the create function to throw a unique constraint error
            (prisma.organization.create as jest.Mock).mockRejectedValue({
                code: 'P2002',
                message: 'Unique constraint violation'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 409, {
                error: 'Organization with this name or email already exists'
            }, { params: {} });
        });

        it('should handle special characters in organization name', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Use a unique email for this test
            const uniqueOrgEmail = `special${Date.now()}@org.com`;

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org!@#$%^&*()',
                    email: uniqueOrgEmail
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '4',
                name: 'Test Org!@#$%^&*()',
                email: uniqueOrgEmail,
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });

        it('should trim whitespace from input fields', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Use a unique email for this test
            const uniqueOrgEmail = `trim${Date.now()}@org.com`;

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: '  Test Org  ',
                    email: `  ${uniqueOrgEmail}  `
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '5',
                name: 'Test Org',
                email: uniqueOrgEmail,
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });

        it('should handle case sensitivity in email', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Use a unique email for this test
            const uniqueOrgEmail = `casesensitive${Date.now()}@org.com`;

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: uniqueOrgEmail.toUpperCase()
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '6',
                name: 'Test Org',
                email: uniqueOrgEmail,
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });

        it('should handle unicode characters in organization name', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Use a unique email for this test
            const uniqueOrgEmail = `unicode${Date.now()}@org.com`;

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org 测试',
                    email: uniqueOrgEmail
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '7',
                name: 'Test Org 测试',
                email: uniqueOrgEmail,
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });
    });

    describe('Authentication & Authorization', () => {
        it('should reject invalid tokens', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');
            request.headers.set('Authorization', 'Bearer invalid-token');
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: Invalid or expired token'
            }, { params: {} });
        });

        it('should reject expired tokens', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');
            request.headers.set('Authorization', 'Bearer expired-token');
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: Invalid or expired token'
            }, { params: {} });
        });
    });

    describe('Input Validation', () => {
        it('should enforce field length limits', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'a'.repeat(256), // Assuming 255 is max length
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name must be less than 255 characters'
            });
        });

        it('should handle empty strings vs null values', async () => {
            mockUserRoles(ROLES.MANAGER, [
                ORGANIZATION_PERMISSIONS.READ,
                ORGANIZATION_PERMISSIONS.CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: '',
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name cannot be empty'
            });
        });

        it('should handle case sensitivity in email', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'TEST@ORG.COM'
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Test Org',
                email: 'test@org.com',
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });

        it('should handle unicode characters in organization name', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org 测试',
                    email: 'test@org.com'
                }
            );

            (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.organization.create as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Test Org 测试',
                email: 'test@org.com',
                createdAt: new Date().toISOString()
            });

            await testApiResponse(POST, request, 201);
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            (prisma.organization.findMany as jest.Mock).mockRejectedValue({
                code: 'P1001',
                message: 'Connection timed out'
            });

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');
            await testApiResponse(GET, request, 503, {
                error: 'Service temporarily unavailable'
            });
        });

        it('should handle unique constraint violations', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock organization creation to fail with unique constraint
            (prisma.organization.create as jest.Mock).mockRejectedValue({
                code: 'P2002',
                message: 'Unique constraint violation'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com'
                }
            );
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(POST, request, 409, {
                error: 'Organization with this name or email already exists'
            }, { params: {} });
        });

        it('should handle foreign key constraint violations', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock organization creation to fail with foreign key constraint
            (prisma.organization.create as jest.Mock).mockRejectedValue({
                code: 'P2003',
                message: 'Foreign key constraint failed on the field: (`industryId`)',
                field_name: 'industryId'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com',
                    industryId: 'invalid-id'
                }
            );
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(POST, request, 400, {
                error: 'Invalid industry ID'
            }, { params: {} });
        });

        it('should handle database connection timeouts', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            // Mock organization findMany to fail with connection timeout
            (prisma.organization.findMany as jest.Mock).mockRejectedValue({
                code: 'P1001',
                message: 'Connection timed out'
            });

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');

            const response = await GET(request, { params: {} });
            expect(response.status).toBe(503);
            const data = await response.json();
            expect(data.error).toBe('Service temporarily unavailable');
        });
    });

    describe('Rate Limiting & Performance', () => {
        it('should enforce rate limiting on multiple requests', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            // Mock rate limiter to reject after 10 requests
            let count = 0;
            const mockCheck = jest.fn().mockImplementation(() => {
                count++;
                return Promise.resolve({
                    success: count <= 10
                });
            });
            (rateLimit as jest.Mock).mockReturnValue({
                check: mockCheck
            });

            const responses = await Promise.all(
                Array(11).fill(null).map(() =>
                    GET(createAuthenticatedRequest('http://localhost:3000/api/organization'), { params: {} })
                )
            );

            // The 11th request should be rate limited
            expect(responses[10].status).toBe(429);
            expect(await responses[10].json()).toEqual({
                error: 'Too many requests'
            });
        });

        it('should handle concurrent create requests', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);

            // Use a unique name/email for this test
            const uniqueOrgName = `Concurrent Org ${Date.now()}`;
            const uniqueOrgEmail = `concurrent${Date.now()}@org.com`;

            // Mock rate limiter to allow all requests
            (rateLimit as jest.Mock).mockReturnValue({
                check: jest.fn().mockResolvedValue({ success: true })
            });

            // Mock the create function to succeed for the first request and fail for others
            let firstRequest = true;
            (prisma.organization.create as jest.Mock).mockImplementation(() => {
                if (firstRequest) {
                    firstRequest = false;
                    return Promise.resolve({
                        id: '8',
                        name: uniqueOrgName,
                        email: uniqueOrgEmail,
                        createdAt: new Date().toISOString()
                    });
                }
                return Promise.reject({
                    code: 'P2002',
                    message: 'Unique constraint violation'
                });
            });

            const responses = await Promise.all(
                Array(3).fill(null).map(() =>
                    POST(createAuthenticatedRequest(
                        'http://localhost:3000/api/organization',
                        'POST',
                        {
                            name: uniqueOrgName,
                            email: uniqueOrgEmail
                        }
                    ), { params: {} })
                )
            );

            // Only one request should succeed, others should get conflict
            const successCount = responses.filter(r => r.status === 201).length;
            expect(successCount).toBe(1);
            expect(responses.filter(r => r.status === 409).length).toBe(2);
        });
    });

    describe('Edge Cases', () => {
        beforeEach(() => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock rate limiter to allow all requests
            (rateLimit as jest.Mock).mockReturnValue({
                check: jest.fn().mockResolvedValue({ success: true })
            });
        });

        it('should handle SQL injection attempts', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: "'; DROP TABLE organizations; --",
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Invalid input: SQL injection attempt detected'
            });
        });

        it('should handle XSS attempts', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: '<script>alert("xss")</script>',
                    email: 'test@org.com'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Invalid input: XSS attempt detected'
            });
        });

        it('should handle maximum pagination limits', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);
            const request = createAuthenticatedRequest('http://localhost:3000/api/organization?limit=1000');

            await testApiResponse(GET, request, 400, {
                error: 'Invalid pagination parameters'
            });
        });

        it('should handle invalid pagination parameters', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);
            const request = createAuthenticatedRequest('http://localhost:3000/api/organization?page=-1');

            await testApiResponse(GET, request, 400, {
                error: 'Invalid pagination parameters'
            });
        });

        it('should handle malformed JSON in request body', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/organization',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    },
                    body: 'invalid json'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Invalid JSON in request body'
            });
        });

        it('should handle missing content type header', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/organization',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer test-token'
                    },
                    body: JSON.stringify({
                        name: 'Test Org',
                        email: 'test@org.com'
                    })
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Content-Type header must be application/json'
            });
        });
    });

    describe('Database Error Handling', () => {
        beforeEach(() => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock rate limiter to allow all requests
            (rateLimit as jest.Mock).mockReturnValue({
                check: jest.fn().mockResolvedValue({ success: true })
            });
        });

        it('should handle unique constraint violations', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock organization creation to fail with unique constraint
            (prisma.organization.create as jest.Mock).mockRejectedValue({
                code: 'P2002',
                message: 'Unique constraint violation'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com'
                }
            );
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(POST, request, 409, {
                error: 'Organization with this name or email already exists'
            }, { params: {} });
        });

        it('should handle foreign key constraint violations', async () => {
            mockUserRoles(ROLES.MANAGER, [ORGANIZATION_PERMISSIONS.CREATE]);
            // Mock organization creation to fail with foreign key constraint
            (prisma.organization.create as jest.Mock).mockRejectedValue({
                code: 'P2003',
                message: 'Foreign key constraint failed on the field: (`industryId`)',
                field_name: 'industryId'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/organization',
                'POST',
                {
                    name: 'Test Org',
                    email: 'test@org.com',
                    industryId: 'invalid-id'
                }
            );
            globalThis.__TEST_REQUEST__ = request;

            await testApiResponse(POST, request, 400, {
                error: 'Invalid industry ID'
            }, { params: {} });
        });

        it('should handle database connection timeouts', async () => {
            mockUserRoles(ROLES.STAFF, [ORGANIZATION_PERMISSIONS.READ]);

            // Mock organization findMany to fail with connection timeout
            (prisma.organization.findMany as jest.Mock).mockRejectedValue({
                code: 'P1001',
                message: 'Connection timed out'
            });

            const request = createAuthenticatedRequest('http://localhost:3000/api/organization');

            const response = await GET(request, { params: {} });
            expect(response.status).toBe(503);
            const data = await response.json();
            expect(data.error).toBe('Service temporarily unavailable');
        });
    });
}); 