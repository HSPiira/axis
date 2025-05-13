import { GET, POST } from '@/app/api/industries/route';
import { prisma } from '@/lib/db';
import { INDUSTRY_PERMISSIONS, ROLES } from '@/lib/constants/roles';
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
import { NextRequest } from 'next/server';
import { Prisma } from '@/generated/prisma';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
    prisma: {
        industry: {
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

describe('Industries API', () => {
    let testUser: any;
    let authToken: string;
    const createdIndustryIds: string[] = [];

    beforeAll(async () => {
        const { testUser: user, authToken: token } = await createTestUser(ROLES.ADMIN, []);
        testUser = user;
        authToken = token;
    });

    afterAll(async () => {
        await cleanupTestData(testUser, createdIndustryIds, 'industry');
    });

    describe('Permission Checks', () => {
        it('should deny access without authentication', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/industries');
            request.headers.delete('Authorization');

            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: No token provided'
            });
        });

        it('should deny access to GET /industries without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries');
            await testApiResponse(GET, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should deny access to POST /industries without create permission', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Test Industry',
                    code: 'TEST'
                }
            );

            await testApiResponse(POST, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should allow access to GET /industries with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const mockIndustries = [{
                id: '1',
                name: 'Test Industry',
                code: 'TEST',
                createdAt: '2024-01-01T00:00:00.000Z'
            }];

            (prisma.industry.findMany as jest.Mock).mockResolvedValue(mockIndustries);
            (prisma.industry.count as jest.Mock).mockResolvedValue(1);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?page=1&limit=10');
            const { data } = await testApiResponse(GET, request, 200);

            expect(data.data).toEqual(mockIndustries);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10
            });
        });

        it('should allow access to POST /industries with create permission', async () => {
            mockUserRoles(ROLES.MANAGER, [
                INDUSTRY_PERMISSIONS.READ,
                INDUSTRY_PERMISSIONS.CREATE
            ]);

            const mockIndustry = {
                id: '1',
                name: 'New Industry',
                code: 'NEW',
                createdAt: '2024-01-01T00:00:00.000Z'
            };

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.industry.create as jest.Mock).mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'New Industry',
                    code: 'NEW'
                }
            );

            await testApiResponse(POST, request, 201, mockIndustry);
        });

        it('should allow admin to access all endpoints', async () => {
            mockUserRoles(ROLES.ADMIN, []);

            const mockIndustry = {
                id: '1',
                name: 'New Industry',
                code: 'NEW',
                createdAt: '2024-01-01T00:00:00.000Z'
            };

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.industry.create as jest.Mock).mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'New Industry',
                    code: 'NEW'
                }
            );

            await testApiResponse(POST, request, 201, mockIndustry);
        });
    });

    describe('GET /api/industries', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return industries with pagination', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const mockIndustries = [
                {
                    id: '1',
                    name: 'Test Industry',
                    code: 'TEST',
                    description: 'Test description',
                    createdAt: new Date().toISOString(),
                    parent: null,
                },
            ];

            (prisma.industry.findMany as jest.Mock).mockResolvedValue(mockIndustries);
            (prisma.industry.count as jest.Mock).mockResolvedValue(1);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?page=1&limit=10');
            const { data } = await testApiResponse(GET, request, 200);

            expect(data.data).toEqual(mockIndustries);
            expect(data.pagination).toEqual({
                total: 1,
                pages: 1,
                page: 1,
                limit: 10
            });
        });

        it('should handle search parameters', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?search=test');
            await GET(request);

            expect(prisma.industry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
                            expect.objectContaining({ code: { contains: 'test', mode: 'insensitive' } }),
                        ]),
                    }),
                })
            );
        });

        it('should handle special characters in search with results', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const mockIndustries = [{
                id: '1',
                name: 'Test Industry',
                code: 'TEST',
                createdAt: new Date('2025-05-10T02:21:57.933Z').toISOString(),
                parent: null,
                description: null
            }];

            (prisma.industry.findMany as jest.Mock).mockResolvedValue(mockIndustries);
            (prisma.industry.count as jest.Mock).mockResolvedValue(1);

            const request = createAuthenticatedRequest(`http://localhost:3000/api/industries?search=${encodeURIComponent('%$#@!')}`);
            await testApiResponse(GET, request, 200, {
                data: mockIndustries,
                pagination: {
                    total: 1,
                    pages: 1,
                    page: 1,
                    limit: 10
                }
            });

            expect(prisma.industry.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { name: { contains: '%$#@!', mode: 'insensitive' } },
                        { code: { contains: '%$#@!', mode: 'insensitive' } }
                    ]
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                },
                orderBy: { name: 'asc' },
                take: 10,
                skip: 0
            });
        });

        it('should handle special characters in search with no results', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            (prisma.industry.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.industry.count as jest.Mock).mockResolvedValue(0);

            const request = createAuthenticatedRequest(`http://localhost:3000/api/industries?search=${encodeURIComponent('%$#@!')}`);
            await testApiResponse(GET, request, 200, {
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 10
                }
            });

            expect(prisma.industry.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { name: { contains: '%$#@!', mode: 'insensitive' } },
                        { code: { contains: '%$#@!', mode: 'insensitive' } }
                    ]
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                },
                orderBy: { name: 'asc' },
                take: 10,
                skip: 0
            });
        });

        it('should handle maximum pagination limits', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);
            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?limit=1000');
            const { data } = await testApiResponse(GET, request, 200);
            expect(data.pagination.limit).toBe(100); // Should cap at 100
        });

        it('should handle zero/negative pagination values', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);
            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?page=0&limit=0');
            const { data } = await testApiResponse(GET, request, 200);
            expect(data.pagination.page).toBe(1);
            expect(data.pagination.limit).toBe(10);
        });

        it('should handle extremely long search queries', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);
            const longSearch = 'a'.repeat(1000);
            const request = createAuthenticatedRequest(`http://localhost:3000/api/industries?search=${encodeURIComponent(longSearch)}`);
            await testApiResponse(GET, request, 400, {
                error: 'Search query too long'
            });
        });

        it('should handle multiple consecutive special characters in search', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);
            const request = createAuthenticatedRequest(`http://localhost:3000/api/industries?search=${encodeURIComponent('!@#$%^&*()')}`);
            await testApiResponse(GET, request, 200);
            expect(prisma.industry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({
                                name: { contains: '!@#$%^&*()', mode: 'insensitive' }
                            })
                        ])
                    })
                })
            );
        });
    });

    describe('POST /api/industries', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create a new industry', async () => {
            mockUserRoles(ROLES.MANAGER, [
                INDUSTRY_PERMISSIONS.READ,
                INDUSTRY_PERMISSIONS.CREATE
            ]);

            const mockIndustry = {
                id: '1',
                name: 'New Industry',
                code: 'NEW',
                description: 'New industry description',
                createdAt: new Date().toISOString(),
                parent: null,
            };

            (prisma.industry.create as jest.Mock).mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'New Industry',
                    code: 'NEW',
                    description: 'New industry description'
                }
            );

            await testApiResponse(POST, request, 201, mockIndustry);
        });

        it('should validate required fields', async () => {
            mockUserRoles(ROLES.MANAGER, [
                INDUSTRY_PERMISSIONS.READ,
                INDUSTRY_PERMISSIONS.CREATE
            ]);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    code: 'TEST'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name is required'
            });
        });

        it('should prevent duplicate industry names', async () => {
            mockUserRoles(ROLES.MANAGER, [
                INDUSTRY_PERMISSIONS.READ,
                INDUSTRY_PERMISSIONS.CREATE
            ]);

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue({
                id: '1',
                name: 'Existing Industry',
                code: 'EXIST'
            });

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Existing Industry',
                    code: 'NEW'
                }
            );

            await testApiResponse(POST, request, 409, {
                error: 'Industry with this name or code already exists'
            });
        });

        it('should sanitize whitespace in inputs', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);
            const mockIndustry = {
                id: '1',
                name: 'Test Industry',
                code: 'TEST',
                description: 'Description',
                createdAt: new Date().toISOString(),
                parent: null
            };

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.industry.create as jest.Mock).mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: '  Test Industry  ',
                    code: '  TEST  ',
                    description: '  Description  '
                }
            );
            await testApiResponse(POST, request, 201, mockIndustry);
            expect(prisma.industry.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Test Industry',
                        code: 'TEST',
                        description: 'Description'
                    })
                })
            );
        });

        it('should validate code format', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Test Industry',
                    code: 'invalid code with spaces'
                }
            );
            await testApiResponse(POST, request, 400, {
                error: 'Code must contain only letters, numbers, and underscores'
            });
        });

        it('should validate parent industry exists', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);
            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            prisma.industry.findUnique = jest.fn().mockResolvedValue(null);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Test Industry',
                    code: 'TEST',
                    parentId: 'non-existent-id'
                }
            );
            await testApiResponse(POST, request, 400, {
                error: 'Parent industry not found'
            });
        });

        it('should prevent circular parent references', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);
            const mockIndustry = {
                id: '1',
                name: 'Test Industry',
                code: 'TEST',
                createdAt: new Date(),
                updatedAt: new Date(),
                description: null,
                parentId: null,
                parent: {
                    id: '2',
                    name: 'Parent Industry',
                    code: 'PARENT',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    description: null,
                    parentId: null,
                    parent: null
                }
            };

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            prisma.industry.findUnique = jest.fn().mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Child Industry',
                    code: 'CHILD',
                    parentId: '1'
                }
            );
            await testApiResponse(POST, request, 400, {
                error: 'Invalid parent industry reference'
            });
        });

        it('should handle deep parent-child relationships', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);
            const mockParent = {
                id: '1',
                name: 'Parent Industry',
                code: 'PARENT',
                createdAt: new Date(),
                updatedAt: new Date(),
                description: null,
                parentId: null,
                parent: null
            };

            const mockChild = {
                id: '2',
                name: 'Child Industry',
                code: 'CHILD',
                createdAt: new Date(),
                updatedAt: new Date(),
                description: null,
                parentId: '1',
                parent: mockParent
            };

            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            prisma.industry.findUnique = jest.fn().mockResolvedValue(mockParent);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Grandchild Industry',
                    code: 'GRANDCHILD',
                    parentId: '2'
                }
            );
            await testApiResponse(POST, request, 201);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should handle malformed JSON in request body', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);

            const request = new NextRequest('http://localhost:3000/api/industries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                },
                body: 'invalid-json{'
            });

            await testApiResponse(POST, request, 400, {
                error: 'Invalid request body'
            });
        });

        it('should handle invalid pagination parameters', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries?page=-1&limit=invalid');
            const { data } = await testApiResponse(GET, request, 200);

            // Should default to page 1 and limit 10
            expect(data.pagination).toEqual({
                total: expect.any(Number),
                pages: expect.any(Number),
                page: 1,
                limit: 10
            });
        });

        it('should handle special characters in search', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            (prisma.industry.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.industry.count as jest.Mock).mockResolvedValue(0);

            const request = createAuthenticatedRequest(`http://localhost:3000/api/industries?search=${encodeURIComponent('%$#@!')}`);
            await testApiResponse(GET, request, 200, {
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 10
                }
            });

            expect(prisma.industry.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { name: { contains: '%$#@!', mode: 'insensitive' } },
                        { code: { contains: '%$#@!', mode: 'insensitive' } }
                    ]
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                },
                orderBy: { name: 'asc' },
                take: 10,
                skip: 0
            });
        });

        it('should handle database errors gracefully', async () => {
            mockUserRoles(ROLES.STAFF, [INDUSTRY_PERMISSIONS.READ]);

            (prisma.industry.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries');
            await testApiResponse(GET, request, 500, {
                error: 'Failed to fetch industries'
            });
        });
    });

    describe('Security', () => {
        it('should reject invalid JWT tokens', async () => {
            // Mock auth to return null for invalid token
            mockAuth();
            mockUserRoles(ROLES.STAFF, []);

            const request = createAuthenticatedRequest('http://localhost:3000/api/industries');
            request.headers.set('Authorization', 'Bearer invalid-token');

            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: Invalid or expired token'
            });
        });

        it('should handle large request bodies', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);

            const largeName = 'a'.repeat(1000); // Create a very large string
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: largeName,
                    code: 'TEST'
                }
            );

            await testApiResponse(POST, request, 400, {
                error: 'Name exceeds maximum length'
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values in optional fields', async () => {
            mockUserRoles(ROLES.MANAGER, [
                INDUSTRY_PERMISSIONS.READ,
                INDUSTRY_PERMISSIONS.CREATE
            ]);

            const mockIndustry = {
                id: '1',
                name: 'Test Industry',
                code: null,
                description: null,
                parentId: null,
                createdAt: new Date().toISOString()
            };

            // Mock findFirst to return null (no existing industry)
            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.industry.create as jest.Mock).mockResolvedValue(mockIndustry);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Test Industry',
                    code: null,
                    description: null,
                    parentId: null
                }
            );

            await testApiResponse(POST, request, 201, mockIndustry);
        });

        it('should handle concurrent modifications', async () => {
            mockUserRoles(ROLES.MANAGER, [INDUSTRY_PERMISSIONS.CREATE]);

            // Simulate a race condition where the industry is created between our check and creation
            (prisma.industry.findFirst as jest.Mock).mockResolvedValue(null);
            const error = new Prisma.PrismaClientKnownRequestError('Unique constraint violation', {
                code: 'P2002',
                clientVersion: '5.0.0',
                meta: { target: ['name'] }
            });
            (prisma.industry.create as jest.Mock).mockRejectedValue(error);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/industries',
                'POST',
                {
                    name: 'Test Industry',
                    code: 'TEST'
                }
            );

            await testApiResponse(POST, request, 409, {
                error: 'Industry with this name or code already exists'
            });
        });
    });
}); 