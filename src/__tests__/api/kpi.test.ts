import { GET, POST } from '@/app/api/kpi/route';
import { PERMISSIONS, ROLES } from '@/lib/constants/roles';
import {
    mockAuth,
    mockPermissionMiddleware,
    createTestUser,
    mockUserRoles,
    createAuthenticatedRequest,
    testApiResponse,
    resetMocks
} from '../utils/test-utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require('@/lib/db');

jest.mock('@/lib/db');
jest.mock('@/lib/rate-limit', () => ({
    rateLimit: jest.fn().mockReturnValue({
        check: jest.fn().mockResolvedValue({ success: true })
    })
}));
jest.mock('@/lib/audit-log', () => ({
    auditLog: jest.fn().mockResolvedValue(undefined)
}));

mockAuth();
mockPermissionMiddleware();

describe('KPI API', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
    });

    describe('Permission Checks', () => {
        it('should deny access without authentication', async () => {
            const request = createAuthenticatedRequest('http://localhost:3000/api/kpi');
            request.headers.delete('Authorization');
            await testApiResponse(GET, request, 401, {
                error: 'Unauthorized: No token provided'
            });
        });

        it('should deny access to GET /kpi without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);
            const request = createAuthenticatedRequest('http://localhost:3000/api/kpi');
            await testApiResponse(GET, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });

        it('should deny access to POST /kpi without create permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.KPI_READ]);
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi',
                'POST',
                {
                    name: 'Test KPI',
                    type: 'Performance',
                    unit: '%',
                }
            );
            await testApiResponse(POST, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });
    });

    describe('GET /api/kpi', () => {
        it('should return a list of KPIs with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.KPI_READ]);
            (prisma.kPI.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'kpi1',
                    name: 'Test KPI',
                    description: 'desc',
                    type: 'Performance',
                    unit: '%',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assignments: [],
                    Organization: null,
                    Contract: null
                }
            ]);
            (prisma.kPI.count as jest.Mock).mockResolvedValue(1);
            const request = createAuthenticatedRequest('http://localhost:3000/api/kpi?page=1&limit=10');
            const { data } = await testApiResponse(GET, request, 200);
            expect(data.data[0].name).toBe('Test KPI');
            expect(data.pagination.total).toBe(1);
        });
    });

    describe('POST /api/kpi', () => {
        it('should create a KPI with create permission', async () => {
            mockUserRoles(ROLES.ADMIN, [PERMISSIONS.KPI_CREATE]);
            (prisma.kPI.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.kPI.create as jest.Mock).mockResolvedValue({
                id: 'kpi1',
                name: 'Test KPI',
                description: 'desc',
                type: 'Performance',
                unit: '%',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                assignments: [],
                Organization: null,
                Contract: null
            });
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi',
                'POST',
                {
                    name: 'Test KPI',
                    type: 'Performance',
                    unit: '%',
                }
            );
            const { data } = await testApiResponse(POST, request, 201);
            expect(data.name).toBe('Test KPI');
        });

        it('should return 409 if KPI with same name exists', async () => {
            mockUserRoles(ROLES.ADMIN, [PERMISSIONS.KPI_CREATE]);
            (prisma.kPI.findFirst as jest.Mock).mockResolvedValue({ id: 'kpi1' });
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi',
                'POST',
                {
                    name: 'Test KPI',
                    type: 'Performance',
                    unit: '%',
                }
            );
            await testApiResponse(POST, request, 409, {
                error: 'KPI with this name already exists'
            });
        });
    });
}); 