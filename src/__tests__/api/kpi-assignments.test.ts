import { GET as GET_ASSIGNMENTS, POST as POST_ASSIGNMENT } from '@/app/api/kpi/assignments/route';
import { PATCH, DELETE } from '@/app/api/kpi/assignments/[id]/route';
import { PERMISSIONS, ROLES } from '@/lib/constants/roles';
import {
    mockAuth,
    mockPermissionMiddleware,
    mockUserRoles,
    createAuthenticatedRequest,
    testApiResponse,
    resetMocks
} from '../utils/test-utils';
import { prisma } from '@/lib/db';

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

describe('KPI Assignments API', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
    });

    describe('Permission Checks', () => {
        it('should deny access to GET /kpi/assignments without read permission', async () => {
            mockUserRoles(ROLES.STAFF, []);
            const request = createAuthenticatedRequest('http://localhost:3000/api/kpi/assignments');
            await testApiResponse(GET_ASSIGNMENTS, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });
        it('should deny access to POST /kpi/assignments without assign permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.KPI_READ]);
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi/assignments',
                'POST',
                {
                    kpiId: 'kpi1',
                    contractId: 'contract1',
                    frequency: 'MONTHLY',
                    status: 'ONGOING',
                    startDate: new Date().toISOString()
                }
            );
            await testApiResponse(POST_ASSIGNMENT, request, 403, {
                error: 'Unauthorized: Insufficient permissions'
            });
        });
    });

    describe('GET /api/kpi/assignments', () => {
        it('should return a list of assignments with read permission', async () => {
            mockUserRoles(ROLES.STAFF, [PERMISSIONS.KPI_READ]);
            (prisma.kPIAssignment.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'assign1',
                    kpiId: 'kpi1',
                    contractId: 'contract1',
                    frequency: 'MONTHLY',
                    status: 'ONGOING',
                    notes: '',
                    targetValue: '10',
                    startDate: new Date().toISOString(),
                    endDate: null,
                    kpi: {},
                    contract: {},
                    Organization: null
                }
            ]);
            (prisma.kPIAssignment.count as jest.Mock).mockResolvedValue(1);
            const request = createAuthenticatedRequest('http://localhost:3000/api/kpi/assignments');
            const { data } = await testApiResponse(GET_ASSIGNMENTS, request, 200);
            expect(data.data[0].id).toBe('assign1');
            expect(data.pagination.total).toBe(1);
        });
    });

    describe('POST /api/kpi/assignments', () => {
        it('should create an assignment with assign permission', async () => {
            mockUserRoles(ROLES.ADMIN, [PERMISSIONS.KPI_ASSIGN]);
            (prisma.kPI.findUnique as jest.Mock).mockResolvedValue({ id: 'kpi1' });
            (prisma.contract.findUnique as jest.Mock).mockResolvedValue({ id: 'contract1' });
            (prisma.kPIAssignment.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.kPIAssignment.create as jest.Mock).mockResolvedValue({
                id: 'assign1',
                kpiId: 'kpi1',
                contractId: 'contract1',
                frequency: 'MONTHLY',
                status: 'ONGOING',
                notes: '',
                targetValue: '10',
                startDate: new Date().toISOString(),
                endDate: null,
                kpi: {},
                contract: {},
                Organization: null
            });
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi/assignments',
                'POST',
                {
                    kpiId: 'kpi1',
                    contractId: 'contract1',
                    frequency: 'MONTHLY',
                    status: 'ONGOING',
                    startDate: new Date().toISOString()
                }
            );
            const { data } = await testApiResponse(POST_ASSIGNMENT, request, 201);
            expect(data.id).toBe('assign1');
        });
    });

    describe('PATCH /api/kpi/assignments/[id]', () => {
        it('should update an assignment with update permission', async () => {
            mockUserRoles(ROLES.ADMIN, [PERMISSIONS.KPI_UPDATE]);
            (prisma.kPIAssignment.findUnique as jest.Mock).mockResolvedValue({
                id: 'assign1',
                kpiId: 'kpi1',
                contractId: 'contract1',
                kpi: {},
                contract: {}
            });
            (prisma.kPIAssignment.update as jest.Mock).mockResolvedValue({
                id: 'assign1',
                kpiId: 'kpi1',
                contractId: 'contract1',
                frequency: 'MONTHLY',
                status: 'ONGOING',
                notes: '',
                targetValue: '10',
                startDate: new Date().toISOString(),
                endDate: null,
                kpi: {},
                contract: {},
                Organization: null
            });
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi/assignments/assign1',
                'PATCH',
                {
                    frequency: 'MONTHLY',
                    status: 'ONGOING'
                }
            );
            const { data } = await testApiResponse(PATCH, request, 200, undefined, { params: { id: 'assign1' } });
            expect(data.id).toBe('assign1');
        });
    });

    describe('DELETE /api/kpi/assignments/[id]', () => {
        it('should delete an assignment with delete permission', async () => {
            mockUserRoles(ROLES.ADMIN, [PERMISSIONS.KPI_DELETE]);
            (prisma.kPIAssignment.findUnique as jest.Mock).mockResolvedValue({
                id: 'assign1',
                kpiId: 'kpi1',
                contractId: 'contract1',
                kpi: {},
                contract: {}
            });
            (prisma.kPIAssignment.delete as jest.Mock).mockResolvedValue({});
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/kpi/assignments/assign1',
                'DELETE'
            );
            await testApiResponse(DELETE, request, 204, undefined, { params: { id: 'assign1' } });
        });
    });
}); 