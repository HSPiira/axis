import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from "next/server";
import { POST } from "@/app/api/clients/[clientId]/contracts/[id]/terminate/route";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth");
vi.mock("@/lib/providers/contract-provider", () => ({
    ContractProvider: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        terminate: vi.fn()
    }))
}));

describe("Contract Termination API", () => {
    let mockRequest: NextRequest;
    const mockClientId = "test-client-id";
    const mockContractId = "test-contract-id";
    const mockSession = { user: { id: "test-user-id" } };

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

    const mockTerminatedContract = {
        ...mockContract,
        status: 'TERMINATED',
        terminationReason: 'Client request',
        endDate: '2024-03-15T00:00:00.000Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = new NextRequest("http://localhost:3000/api/clients/test-client-id/contracts/test-contract-id/terminate");
        (auth as any).mockResolvedValue(mockSession);
    });

    it("should return 401 if not authenticated", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await POST(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should terminate a contract", async () => {
        const contractProvider = new ContractProvider();
        (contractProvider.get as any).mockResolvedValue(mockContract);
        (contractProvider.terminate as any).mockResolvedValue(mockTerminatedContract);

        const response = await POST(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockTerminatedContract);
        expect(contractProvider.terminate).toHaveBeenCalledWith(mockContractId, 'Client request');
    });

    it("should handle errors when terminating contract", async () => {
        const contractProvider = new ContractProvider();
        (contractProvider.get as any).mockResolvedValue(mockContract);
        (contractProvider.terminate as any).mockRejectedValue(new Error("Test error"));

        const response = await POST(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Internal Server Error" });
    });
}); 