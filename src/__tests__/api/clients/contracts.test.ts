import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/clients/[clientId]/contracts/route";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

// Mock the auth function
vi.mock("@/lib/auth", () => ({
    auth: vi.fn()
}));

// Mock the ContractProvider
vi.mock("@/lib/providers/contract-provider", () => ({
    ContractProvider: vi.fn().mockImplementation(() => ({
        findByClient: vi.fn(),
        create: vi.fn()
    }))
}));

describe("Contract API Routes", () => {
    let mockRequest: NextRequest;
    const mockClientId = "test-client-id";
    const mockSession = { user: { id: "test-user-id" } };

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Setup mock request
        mockRequest = new NextRequest("http://localhost:3000/api/clients/test-client-id/contracts");

        // Setup auth mock to return a valid session
        (auth as any).mockResolvedValue(mockSession);
    });

    describe("GET /api/clients/[clientId]/contracts", () => {
        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const response = await GET(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
        });

        it("should return contracts for a client", async () => {
            const mockContracts = [
                { id: "1", clientId: mockClientId, startDate: new Date() },
                { id: "2", clientId: mockClientId, startDate: new Date() }
            ];

            const contractProvider = new ContractProvider();
            (contractProvider.findByClient as any).mockResolvedValue(mockContracts);

            const response = await GET(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockContracts);
            expect(contractProvider.findByClient).toHaveBeenCalledWith(mockClientId);
        });

        it("should handle errors when fetching contracts", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.findByClient as any).mockRejectedValue(new Error("Database error"));

            const response = await GET(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Internal Server Error" });
        });
    });

    describe("POST /api/clients/[clientId]/contracts", () => {
        const mockContractData = {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            billingRate: 100,
            currency: "USD",
            paymentTerms: "NET30",
            isRenewable: true,
            isAutoRenew: true
        };

        beforeEach(() => {
            mockRequest = new NextRequest("http://localhost:3000/api/clients/test-client-id/contracts", {
                method: "POST",
                body: JSON.stringify(mockContractData)
            });
        });

        it("should return 401 if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const response = await POST(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
        });

        it("should create a new contract", async () => {
            const mockCreatedContract = {
                id: "new-contract-id",
                clientId: mockClientId,
                ...mockContractData
            };

            const contractProvider = new ContractProvider();
            (contractProvider.create as any).mockResolvedValue(mockCreatedContract);

            const response = await POST(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockCreatedContract);
            expect(contractProvider.create).toHaveBeenCalledWith({
                ...mockContractData,
                clientId: mockClientId
            });
        });

        it("should handle errors when creating contract", async () => {
            const contractProvider = new ContractProvider();
            (contractProvider.create as any).mockRejectedValue(new Error("Database error"));

            const response = await POST(mockRequest, { params: { clientId: mockClientId } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Internal Server Error" });
        });
    });
}); 