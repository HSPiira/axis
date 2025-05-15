import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/clients/[clientId]/contracts/[id]/renew/route';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth');
vi.mock('@/lib/providers/contract-provider');

describe('Contract Renewal API', () => {
    const mockClientId = 'test-client-id';
    const mockContractId = 'test-contract-id';
    const mockContract = {
        id: mockContractId,
        clientId: mockClientId,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        billingRate: 100,
        currency: 'USD',
        paymentTerms: 'Net 30',
        isRenewable: true,
        isAutoRenew: true,
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
    };

    const mockRenewedContract = {
        ...mockContract,
        endDate: '2025-12-31T23:59:59.999Z',
        status: 'RENEWED',
        renewalDate: '2024-12-31T23:59:59.999Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({ user: { id: 'test-user-id' } });
    });

    it('should return 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: 'POST',
            body: JSON.stringify({ newEndDate: '2025-12-31T23:59:59.999Z' })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(401);
    });

    it('should renew a contract', async () => {
        const contractProvider = new ContractProvider();
        (contractProvider.get as any).mockResolvedValue(mockContract);
        (contractProvider.renew as any).mockResolvedValue(mockRenewedContract);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: 'POST',
            body: JSON.stringify({ newEndDate: '2025-12-31T23:59:59.999Z' })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockRenewedContract);
        expect(contractProvider.renew).toHaveBeenCalledWith(mockContractId, new Date('2025-12-31T23:59:59.999Z'));
    });

    it('should handle errors when renewing contract', async () => {
        const contractProvider = new ContractProvider();
        (contractProvider.get as any).mockResolvedValue(mockContract);
        (contractProvider.renew as any).mockRejectedValue(new Error('Test error'));

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: 'POST',
            body: JSON.stringify({ newEndDate: '2025-12-31T23:59:59.999Z' })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(500);
    });
}); 