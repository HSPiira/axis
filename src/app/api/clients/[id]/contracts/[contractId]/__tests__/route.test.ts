import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "../route";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";
import { vi } from "vitest";

// Mock auth
vi.mock("@/lib/auth", () => ({
    auth: vi.fn()
}));

// Mock the ContractProvider
vi.mock("@/lib/providers/contract-provider", () => ({
    ContractProvider: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        transform: vi.fn()
    }))
}));

describe("Individual Contract API", () => {
    const mockClientId = "client-123";
    const mockContractId = "contract-123";
    const mockContract = {
        id: mockContractId,
        clientId: mockClientId,
        startDate: new Date("2024-01-01").toISOString(),
        endDate: new Date("2024-12-31").toISOString(),
        billingRate: 100,
        isRenewable: true,
        isAutoRenew: false,
        paymentStatus: "PAID",
        status: "ACTIVE",
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-01").toISOString()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({ user: { id: "user-123" } });
    });

    describe("GET /api/clients/[clientId]/contracts/[id]", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`);
            const response = await GET(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(401);
        });

        it("should return 404 if contract not found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`);
            const response = await GET(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(404);
        });

        it("should return 404 if contract belongs to different client", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue({
                ...mockContract,
                clientId: "different-client"
            });

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`);
            const response = await GET(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(404);
        });

        it("should return contract if found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(mockContract);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`);
            const response = await GET(request, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContract);
            expect(provider.get).toHaveBeenCalledWith(mockContractId);
        });
    });

    describe("PATCH /api/clients/[clientId]/contracts/[id]", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "PATCH",
                body: JSON.stringify({ billingRate: 150 })
            });
            const response = await PATCH(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(401);
        });

        it("should return 404 if contract not found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "PATCH",
                body: JSON.stringify({ billingRate: 150 })
            });
            const response = await PATCH(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(404);
        });

        it("should update contract if found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(mockContract);
            const updatedContract = {
                ...mockContract,
                billingRate: 150,
                updatedAt: new Date("2024-01-02").toISOString()
            };
            (provider.update as any).mockResolvedValue(updatedContract);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "PATCH",
                body: JSON.stringify({ billingRate: 150 })
            });
            const response = await PATCH(request, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedContract);
            expect(provider.update).toHaveBeenCalledWith(mockContractId, { billingRate: 150 });
        });

        it("should handle metadata updates", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(mockContract);
            const updateData = {
                metadata: { key: "value" }
            };
            const updatedContract = {
                ...mockContract,
                ...updateData,
                updatedAt: new Date("2024-01-02").toISOString()
            };
            (provider.update as any).mockResolvedValue(updatedContract);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "PATCH",
                body: JSON.stringify(updateData)
            });
            const response = await PATCH(request, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.metadata).toEqual(updateData.metadata);
            expect(provider.update).toHaveBeenCalledWith(mockContractId, updateData);
        });
    });

    describe("DELETE /api/clients/[clientId]/contracts/[id]", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "DELETE"
            });
            const response = await DELETE(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(401);
        });

        it("should return 404 if contract not found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "DELETE"
            });
            const response = await DELETE(request, { params: { clientId: mockClientId, id: mockContractId } });

            expect(response.status).toBe(404);
        });

        it("should delete contract if found", async () => {
            const provider = new ContractProvider();
            (provider.get as any).mockResolvedValue(mockContract);
            (provider.delete as any).mockResolvedValue(mockContract);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}`, {
                method: "DELETE"
            });
            const response = await DELETE(request, { params: { clientId: mockClientId, id: mockContractId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContract);
            expect(provider.delete).toHaveBeenCalledWith(mockContractId);
        });
    });
}); 