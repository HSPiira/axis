import { NextRequest } from "next/server";
import { POST } from "../route";
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
        renew: vi.fn(),
        transform: vi.fn()
    }))
}));

describe("Contract Renewal API", () => {
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

    it("should return 401 if not authenticated", async () => {
        (auth as any).mockResolvedValue(null);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(401);
    });

    it("should return 404 if contract not found", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue(null);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(404);
    });

    it("should return 404 if contract belongs to different client", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue({
            ...mockContract,
            clientId: "different-client"
        });

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(404);
    });

    it("should return 400 if new end date is missing", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue(mockContract);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({})
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(400);
    });

    it("should return 400 if contract is not renewable", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue({
            ...mockContract,
            isRenewable: false
        });

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(400);
    });

    it("should return 400 if contract is terminated", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue({
            ...mockContract,
            status: "TERMINATED"
        });

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(400);
    });

    it("should successfully renew a contract", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue(mockContract);
        const renewedContract = {
            ...mockContract,
            endDate: new Date("2025-12-31").toISOString(),
            updatedAt: new Date("2024-01-02").toISOString()
        };
        (provider.renew as any).mockResolvedValue(renewedContract);

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(renewedContract);
        expect(provider.renew).toHaveBeenCalledWith(mockContractId, { endDate: "2025-12-31" });
    });

    it("should handle errors during renewal", async () => {
        const provider = new ContractProvider();
        (provider.get as any).mockResolvedValue(mockContract);
        (provider.renew as any).mockRejectedValue(new Error("Renewal failed"));

        const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts/${mockContractId}/renew`, {
            method: "POST",
            body: JSON.stringify({ endDate: "2025-12-31" })
        });
        const response = await POST(request, { params: { clientId: mockClientId, id: mockContractId } });

        expect(response.status).toBe(500);
    });
}); 