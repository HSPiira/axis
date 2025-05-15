// Mock auth and ContractProvider at the very top
vi.mock("@/lib/auth", () => ({
    auth: vi.fn()
}));
vi.mock("@/lib/providers/contract-provider", () => {
    const findByClient = vi.fn();
    const create = vi.fn();
    return {
        ContractProvider: vi.fn().mockImplementation(() => ({
            findByClient,
            create,
            transform: vi.fn()
        })),
        __esModule: true
    };
});

import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";
import { vi } from "vitest";

const { findByClient, create } = (ContractProvider as any).mock.instances?.[0] || {};

describe("Contract API", () => {
    const mockClientId = "client-123";
    const mockContracts = [
        {
            id: "contract-1",
            clientId: mockClientId,
            startDate: "2024-01-01T00:00:00.000Z",
            endDate: "2024-12-31T00:00:00.000Z",
            billingRate: 100,
            isRenewable: true,
            isAutoRenew: false,
            paymentStatus: "PAID",
            status: "ACTIVE",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({ user: { id: "user-123" } });
    });

    describe("GET /api/clients/[clientId]/contracts", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`);
            const response = await GET(request, { params: { clientId: mockClientId } });

            expect(response.status).toBe(401);
        });

        it("should return contracts for a client", async () => {
            // Use the mock instance for findByClient
            (ContractProvider as any).mock.instances[0].findByClient.mockResolvedValue(mockContracts);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`);
            const response = await GET(request, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContracts);
            expect((ContractProvider as any).mock.instances[0].findByClient).toHaveBeenCalledWith(mockClientId);
        });

        it("should handle errors when fetching contracts", async () => {
            (ContractProvider as any).mock.instances[0].findByClient.mockRejectedValue(new Error("Database error"));

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`);
            const response = await GET(request, { params: { clientId: mockClientId } });

            expect(response.status).toBe(500);
        });
    });

    describe("POST /api/clients/[clientId]/contracts", () => {
        const mockNewContract = {
            startDate: "2024-01-01T00:00:00.000Z",
            endDate: "2024-12-31T00:00:00.000Z",
            billingRate: 100,
            isRenewable: true,
            isAutoRenew: false,
            paymentStatus: "PAID",
            status: "ACTIVE"
        };

        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`, {
                method: "POST",
                body: JSON.stringify(mockNewContract)
            });
            const response = await POST(request, { params: { clientId: mockClientId } });

            expect(response.status).toBe(401);
        });

        it("should create a new contract", async () => {
            const createdContract = {
                id: "contract-1",
                clientId: mockClientId,
                ...mockNewContract,
                createdAt: "2024-01-01T00:00:00.000Z",
                updatedAt: "2024-01-01T00:00:00.000Z"
            };
            (ContractProvider as any).mock.instances[0].create.mockResolvedValue(createdContract);

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`, {
                method: "POST",
                body: JSON.stringify(mockNewContract)
            });
            const response = await POST(request, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(createdContract);
            expect((ContractProvider as any).mock.instances[0].create).toHaveBeenCalledWith({
                ...mockNewContract,
                clientId: mockClientId
            });
        });

        it("should handle errors when creating a contract", async () => {
            (ContractProvider as any).mock.instances[0].create.mockRejectedValue(new Error("Database error"));

            const request = new NextRequest(`http://localhost:3000/api/clients/${mockClientId}/contracts`, {
                method: "POST",
                body: JSON.stringify(mockNewContract)
            });
            const response = await POST(request, { params: { clientId: mockClientId } });

            expect(response.status).toBe(500);
        });
    });
}); 