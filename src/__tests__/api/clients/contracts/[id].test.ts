import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "@/app/api/clients/[clientId]/contracts/[id]/route";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

// Mock the auth function
vi.mock("@/lib/auth", () => ({
    auth: vi.fn()
}));

// Mock the ContractProvider
vi.mock("@/lib/providers/contract-provider", () => ({
    ContractProvider: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }))
}));

describe("Individual Contract API Routes", () => {
    let mockRequest: NextRequest;
    const mockClientId = "test-client-id";
    const mockContractId = "test-contract-id";
    const mockSession = { user: { id: "test-user-id" } };
    const mockContract = {
        id: mockContractId,
        clientId: mockClientId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        billingRate: 100,
        currency: "USD",
        paymentTerms: "NET30",
        isRenewable: true,
        isAutoRenew: true
    };

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Setup mock request
        mockRequest = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`);

        // Setup auth mock to return a valid session
        (auth as any).mockResolvedValue(mockSession);
    });

    describe("GET /api/clients/[clientId]/contracts/[id]", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const response = await GET(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
        });

        it("should return 404 if contract not found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(null);

            const response = await GET(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Contract not found" });
        });

        it("should return 404 if contract belongs to different client", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue({
                ...mockContract,
                clientId: "different-client-id"
            });

            const response = await GET(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Contract not found" });
        });

        it("should return contract if found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(mockContract);

            const response = await GET(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContract);
            expect(contractProvider.get).toHaveBeenCalledWith(mockContractId);
        });
    });

    describe("PATCH /api/clients/[clientId]/contracts/[id]", () => {
        const updateData = {
            billingRate: 120,
            paymentTerms: "NET45",
            metadata: { customField: "value" }
        };

        beforeEach(() => {
            mockRequest = new NextRequest(
                `http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(updateData)
                }
            );
        });

        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const response = await PATCH(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
        });

        it("should return 404 if contract not found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(null);

            const response = await PATCH(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Contract not found" });
        });

        it("should update contract if found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(mockContract);
            (contractProvider.update as any).mockResolvedValue({
                ...mockContract,
                ...updateData
            });

            const response = await PATCH(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                ...mockContract,
                ...updateData
            });
            expect(contractProvider.update).toHaveBeenCalledWith(mockContractId, updateData);
        });

        it("should handle metadata updates", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(mockContract);
            (contractProvider.update as any).mockResolvedValue({
                ...mockContract,
                ...updateData
            });

            const response = await PATCH(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.metadata).toEqual(updateData.metadata);
            expect(contractProvider.update).toHaveBeenCalledWith(mockContractId, updateData);
        });

        it("should handle payment status updates", async () => {
            const paymentUpdateData = {
                paymentStatus: "PAID",
                lastBillingDate: new Date().toISOString()
            };

            mockRequest = new NextRequest(
                `http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(paymentUpdateData)
                }
            );

            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(mockContract);
            (contractProvider.update as any).mockResolvedValue({
                ...mockContract,
                ...paymentUpdateData
            });

            const response = await PATCH(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.paymentStatus).toBe(paymentUpdateData.paymentStatus);
            expect(data.lastBillingDate).toBe(paymentUpdateData.lastBillingDate);
            expect(contractProvider.update).toHaveBeenCalledWith(mockContractId, paymentUpdateData);
        });
    });

    describe("DELETE /api/clients/[clientId]/contracts/[id]", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const response = await DELETE(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
        });

        it("should return 404 if contract not found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(null);

            const response = await DELETE(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Contract not found" });
        });

        it("should delete contract if found", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.get as any).mockResolvedValue(mockContract);
            (contractProvider.delete as any).mockResolvedValue(mockContract);

            const response = await DELETE(mockRequest, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContract);
            expect(contractProvider.delete).toHaveBeenCalledWith(mockContractId);
        });
    });
}); 