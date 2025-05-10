import { POST, GET as GET_LIST } from '@/app/api/contracts/route';
import { GET as GET_ONE, PATCH, PUT, DELETE } from '@/app/api/contracts/[id]/route';
import { prisma } from '@/lib/db';
import { ContractStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
import { createAuthenticatedRequest, testApiResponse, mockPermissionMiddleware, mockUserRoles, mockPaginationResponse } from '../utils/test-utils';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

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

describe('Contract API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPermissionMiddleware(); // Mock the permission middleware
        mockUserRoles('admin', ['create_contract', 'view_contracts', 'update_contract', 'delete_contract']); // Mock user as admin with all contract permissions
    });

    describe('Contract Creation', () => {
        const mockContract = {
            id: 'test-contract-id',
            organizationId: 'test-org-id',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            billingRate: 1000.00,
            isRenewable: true,
            status: ContractStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should create a new contract with valid data', async () => {
            // Mock the prisma contract create
            const mockContractWithStrings = {
                ...mockContract,
                startDate: mockContract.startDate.toISOString(),
                endDate: mockContract.endDate.toISOString(),
                createdAt: mockContract.createdAt.toISOString(),
                updatedAt: mockContract.updatedAt.toISOString(),
            };
            (prisma.contract.create as jest.Mock).mockResolvedValue(mockContractWithStrings);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts',
                'POST',
                {
                    organizationId: mockContract.organizationId,
                    startDate: mockContract.startDate.toISOString(),
                    endDate: mockContract.endDate.toISOString(),
                    billingRate: mockContract.billingRate,
                    isRenewable: mockContract.isRenewable,
                }
            );

            const { data } = await testApiResponse(POST, request, 201, mockContractWithStrings);
            expect(prisma.contract.create).toHaveBeenCalledWith({
                data: {
                    organizationId: mockContract.organizationId,
                    startDate: mockContract.startDate,
                    endDate: mockContract.endDate,
                    billingRate: mockContract.billingRate,
                    isRenewable: mockContract.isRenewable,
                    status: ContractStatus.ACTIVE,
                    currency: 'USD',
                },
            });
            expect(auditLog).toHaveBeenCalledWith('CONTRACT_CREATE', {
                contractId: mockContract.id,
                organizationId: mockContract.organizationId,
                status: mockContract.status
            });
        });

        it('should validate required fields', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts',
                'POST',
                {}
            );

            const { data } = await testApiResponse(POST, request, 400, { error: 'Required' });
            expect(prisma.contract.create).not.toHaveBeenCalled();
        });

        it('should validate date ranges', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts',
                'POST',
                {
                    organizationId: 'test-org-id',
                    startDate: new Date('2024-12-31').toISOString(),
                    endDate: new Date('2024-01-01').toISOString(),
                    billingRate: 1000.00,
                    isRenewable: true,
                }
            );

            await testApiResponse(POST, request, 400, { error: 'End date must be after start date' });
            expect(prisma.contract.create).not.toHaveBeenCalled();
        });

        it('should validate billing rate is positive', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts',
                'POST',
                {
                    organizationId: 'test-org-id',
                    startDate: new Date('2024-01-01').toISOString(),
                    endDate: new Date('2024-12-31').toISOString(),
                    billingRate: -1000.00,
                    isRenewable: true,
                }
            );

            await testApiResponse(POST, request, 400, { error: 'Billing rate must be positive' });
            expect(prisma.contract.create).not.toHaveBeenCalled();
        });
    });

    describe('Contract Retrieval', () => {
        const mockContracts = [
            {
                id: 'contract-1',
                organizationId: 'org-1',
                startDate: new Date('2024-01-01').toISOString(),
                endDate: new Date('2024-12-31').toISOString(),
                billingRate: 1000.00,
                isRenewable: true,
                status: ContractStatus.ACTIVE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                organization: { id: 'org-1', name: 'Test Org 1' },
                Document: []
            },
            {
                id: 'contract-2',
                organizationId: 'org-1',
                startDate: new Date('2024-02-01').toISOString(),
                endDate: new Date('2024-12-31').toISOString(),
                billingRate: 2000.00,
                isRenewable: false,
                status: ContractStatus.EXPIRED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                organization: { id: 'org-1', name: 'Test Org 1' },
                Document: []
            },
            {
                id: 'contract-3',
                organizationId: 'org-2',
                startDate: new Date('2024-01-01').toISOString(),
                endDate: new Date('2024-12-31').toISOString(),
                billingRate: 3000.00,
                isRenewable: true,
                status: ContractStatus.ACTIVE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                organization: { id: 'org-2', name: 'Test Org 2' },
                Document: []
            }
        ];

        beforeEach(() => {
            (prisma.contract.findMany as jest.Mock).mockResolvedValue(mockContracts);
            (prisma.contract.count as jest.Mock).mockResolvedValue(mockContracts.length);
            (prisma.contract.findUnique as jest.Mock).mockImplementation((args) => {
                const contract = mockContracts.find(c => c.id === args.where.id);
                return Promise.resolve(contract || null);
            });
        });

        it('should get a single contract by id', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/contract-1',
                'GET'
            );

            await testApiResponse(GET_ONE, request, 200, mockContracts[0], { params: { id: 'contract-1' } });
            expect(prisma.contract.findUnique).toHaveBeenCalledWith({
                where: { id: 'contract-1' },
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                }
            });
            expect(auditLog).toHaveBeenCalledWith('CONTRACT_LIST', { contractId: 'contract-1' });
        });

        it('should return 404 for non-existent contract', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/non-existent',
                'GET'
            );

            await testApiResponse(GET_ONE, request, 404, { error: 'Contract not found' }, { params: { id: 'non-existent' } });
        });

        it('should list all contracts with pagination', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts?page=1&limit=2',
                'GET'
            );

            const paginatedContracts = mockContracts.slice(0, 2);
            (prisma.contract.findMany as jest.Mock).mockResolvedValue(paginatedContracts);
            (prisma.contract.count as jest.Mock).mockResolvedValue(mockContracts.length);

            const expectedResponse = {
                contracts: paginatedContracts,
                pagination: {
                    total: mockContracts.length,
                    pages: 1, // API minimum limit is 10, so only 1 page
                    page: 1,
                    limit: 10
                }
            };

            await testApiResponse(GET_LIST, request, 200, expectedResponse);
            expect(prisma.contract.findMany).toHaveBeenCalledWith({
                where: { AND: [{}, {}] },
                skip: 0,
                take: 10,
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });

        it('should list contracts by organization', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts?organizationId=org-1',
                'GET'
            );

            const orgContracts = mockContracts.filter(c => c.organizationId === 'org-1');
            (prisma.contract.findMany as jest.Mock).mockResolvedValue(orgContracts);
            (prisma.contract.count as jest.Mock).mockResolvedValue(orgContracts.length);

            const expectedResponse = {
                contracts: orgContracts,
                pagination: {
                    total: orgContracts.length,
                    pages: Math.ceil(orgContracts.length / 10),
                    page: 1,
                    limit: 10
                }
            };

            await testApiResponse(GET_LIST, request, 200, expectedResponse);
            expect(prisma.contract.findMany).toHaveBeenCalledWith({
                where: { AND: [{ organizationId: 'org-1' }, {}] },
                skip: 0,
                take: 10,
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });

        it('should list contracts by status', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts?status=ACTIVE',
                'GET'
            );

            const activeContracts = mockContracts.filter(c => c.status === ContractStatus.ACTIVE);
            (prisma.contract.findMany as jest.Mock).mockResolvedValue(activeContracts);
            (prisma.contract.count as jest.Mock).mockResolvedValue(activeContracts.length);

            const expectedResponse = {
                contracts: activeContracts,
                pagination: {
                    total: activeContracts.length,
                    pages: Math.ceil(activeContracts.length / 10),
                    page: 1,
                    limit: 10
                }
            };

            await testApiResponse(GET_LIST, request, 200, expectedResponse);
            // Accept either order of AND array
            const callArgs = (prisma.contract.findMany as jest.Mock).mock.calls[0][0];
            const andArray = callArgs.where.AND;
            expect(
                (JSON.stringify(andArray) === JSON.stringify([{ status: ContractStatus.ACTIVE }, {}])) ||
                (JSON.stringify(andArray) === JSON.stringify([{}, { status: ContractStatus.ACTIVE }]))
            ).toBe(true);
        });
    });

    describe('Contract Update', () => {
        const mockContract = {
            id: 'test-contract-id',
            organizationId: 'test-org-id',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            billingRate: 1000.00,
            isRenewable: true,
            status: ContractStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            organization: { id: 'test-org-id', name: 'Test Org' },
            Document: []
        };

        beforeEach(() => {
            (prisma.contract.update as jest.Mock).mockResolvedValue(mockContract);
            (prisma.contract.findUnique as jest.Mock).mockResolvedValue(mockContract);
        });

        it('should update a contract with PATCH', async () => {
            const updateData = {
                billingRate: 1500.00,
                isRenewable: false
            };

            const mockUpdatedContract = {
                ...mockContract,
                ...updateData,
                startDate: mockContract.startDate.toISOString(),
                endDate: mockContract.endDate.toISOString(),
                createdAt: mockContract.createdAt.toISOString(),
                updatedAt: mockContract.updatedAt.toISOString()
            };

            (prisma.contract.update as jest.Mock).mockResolvedValue(mockUpdatedContract);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/test-contract-id',
                'PATCH',
                updateData
            );

            await testApiResponse(PATCH, request, 200, mockUpdatedContract, { params: { id: 'test-contract-id' } });
            expect(prisma.contract.update).toHaveBeenCalledWith({
                where: { id: 'test-contract-id' },
                data: updateData,
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                }
            });
        });

        it('should update a contract with PUT', async () => {
            const updateData = {
                organizationId: 'test-org-id',
                startDate: new Date('2024-01-01').toISOString(),
                endDate: new Date('2024-12-31').toISOString(),
                billingRate: 1500.00,
                isRenewable: false,
                status: ContractStatus.ACTIVE
            };

            const mockUpdatedContract = {
                ...mockContract,
                ...updateData,
                startDate: new Date(updateData.startDate).toISOString(),
                endDate: new Date(updateData.endDate).toISOString(),
                createdAt: mockContract.createdAt.toISOString(),
                updatedAt: mockContract.updatedAt.toISOString()
            };

            (prisma.contract.update as jest.Mock).mockResolvedValue(mockUpdatedContract);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/test-contract-id',
                'PUT',
                updateData
            );

            await testApiResponse(PUT, request, 200, mockUpdatedContract, { params: { id: 'test-contract-id' } });
            expect(prisma.contract.update).toHaveBeenCalledWith({
                where: { id: 'test-contract-id' },
                data: {
                    organization: { connect: { id: 'test-org-id' } },
                    startDate: new Date(updateData.startDate),
                    endDate: new Date(updateData.endDate),
                    billingRate: updateData.billingRate,
                    isRenewable: updateData.isRenewable,
                    status: updateData.status,
                    currency: 'USD'
                },
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                }
            });
        });

        it('should return 404 for non-existent contract update', async () => {
            (prisma.contract.findUnique as jest.Mock).mockResolvedValue(null);
            // Mock PrismaClientKnownRequestError
            const error = Object.assign(new Error('Not found'), { code: 'P2025', name: 'PrismaClientKnownRequestError' });
            (prisma.contract.update as jest.Mock).mockRejectedValue(error);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/non-existent',
                'PATCH',
                { billingRate: 1500.00 }
            );

            await testApiResponse(PATCH, request, 404, { error: 'Contract not found' }, { params: { id: 'non-existent' } });
            expect(prisma.contract.update).toHaveBeenCalledWith({
                where: { id: 'non-existent' },
                data: { billingRate: 1500.00 },
                include: {
                    organization: { select: { id: true, name: true } },
                    Document: true
                }
            });
        });
    });

    describe('Contract Deletion', () => {
        beforeEach(() => {
            (prisma.contract.delete as jest.Mock).mockResolvedValue({ id: 'test-contract-id' });
            (prisma.contract.findUnique as jest.Mock).mockResolvedValue({ id: 'test-contract-id' });
        });

        it('should delete a contract', async () => {
            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/test-contract-id',
                'DELETE'
            );

            await testApiResponse(DELETE, request, 200, { success: true }, { params: { id: 'test-contract-id' } });
            expect(prisma.contract.delete).toHaveBeenCalledWith({
                where: { id: 'test-contract-id' }
            });
        });

        it('should return 404 for non-existent contract deletion', async () => {
            (prisma.contract.findUnique as jest.Mock).mockResolvedValue(null);
            // Mock PrismaClientKnownRequestError
            const error = Object.assign(new Error('Not found'), { code: 'P2025', name: 'PrismaClientKnownRequestError' });
            (prisma.contract.delete as jest.Mock).mockRejectedValue(error);

            const request = createAuthenticatedRequest(
                'http://localhost:3000/api/contracts/non-existent',
                'DELETE'
            );

            await testApiResponse(DELETE, request, 404, { error: 'Contract not found' }, { params: { id: 'non-existent' } });
            expect(prisma.contract.delete).toHaveBeenCalledWith({
                where: { id: 'non-existent' }
            });
        });
    });
}); 