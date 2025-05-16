import { NextRequest } from 'next/server';
import type { ContractModel } from '@/lib/providers/contract-provider';
import type { ContractStatus, PaymentStatus } from '@prisma/client';

// Mock Response globally
const mockJsonResponse = (data: unknown, init?: ResponseInit) => {
    const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    // Add json method to Response instance
    response.json = async () => data;

    return response;
};

// Mock Next.js server components
jest.mock('next/server', () => {
    class MockHeaders {
        private headers: Map<string, string>;

        constructor(init?: Record<string, string>) {
            this.headers = new Map(Object.entries(init || {}));
        }

        entries() {
            return Array.from(this.headers.entries());
        }

        get(name: string) {
            return this.headers.get(name) || null;
        }

        set(name: string, value: string) {
            this.headers.set(name, value);
        }
    }

    class MockNextRequest {
        public readonly headers: MockHeaders;
        public readonly nextUrl: URL;
        private readonly method: string;
        private readonly bodyContent: unknown;

        constructor(input: string | Request | URL, init?: RequestInit) {
            const url = typeof input === 'string'
                ? input
                : input instanceof URL
                    ? input.toString()
                    : input.url;
            this.nextUrl = new URL(url, 'http://localhost');
            this.headers = new MockHeaders(init?.headers as Record<string, string>);
            this.method = init?.method || 'GET';
            this.bodyContent = init?.body ? JSON.parse(init.body as string) : undefined;
        }

        async json() {
            return this.bodyContent;
        }
    }

    return {
        NextRequest: MockNextRequest,
        NextResponse: {
            json: (data: unknown, init?: ResponseInit) => mockJsonResponse(data, init),
        },
    };
});

// Mock auth
jest.mock('@/lib/auth', () => ({
    auth: jest.fn(() => Promise.resolve({ user: { id: 'test-user' } })),
}));

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
    rateLimit: {
        check: jest.fn(() => Promise.resolve({ success: true, limit: 100, remaining: 99, reset: 0 })),
    },
}));

// Mock cache control
jest.mock('@/lib/cache', () => ({
    CacheControl: {
        withCache: jest.fn((response) => response),
    },
}));

// Import after mocks
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { GET, POST, PUT, DELETE } from '@/app/api/contracts/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/contracts/[id]/route';

describe('Contract API Routes', () => {
    let mockRequest: NextRequest;

    const createMockContract = (overrides = {}): ContractModel => ({
        id: '1',
        clientId: 'client-1',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        renewalDate: null,
        billingRate: 100,
        isRenewable: true,
        isAutoRenew: false,
        paymentStatus: 'PENDING' as PaymentStatus,
        paymentFrequency: 'MONTHLY',
        paymentTerms: 'Net 30',
        currency: 'UGX',
        lastBillingDate: null,
        nextBillingDate: null,
        documentUrl: null,
        status: 'ACTIVE' as ContractStatus,
        signedBy: null,
        signedAt: null,
        terminationReason: null,
        notes: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        client: {
            id: 'client-1',
            name: 'Test Client',
        },
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts');
            const response = await GET(mockRequest);
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts');
            const response = await GET(mockRequest);
            expect(response.status).toBe(429);
        });

        it('should list contracts with pagination and filters', async () => {
            const mockContracts = [createMockContract()];
            jest.spyOn(ContractProvider.prototype, 'list').mockResolvedValueOnce({
                data: mockContracts,
                total: 1,
                page: 1,
                limit: 10,
            });

            mockRequest = new NextRequest(
                'http://localhost/api/contracts?page=1&limit=10&search=test&status=Active'
            );
            const response = await GET(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.data).toEqual(mockContracts);
            expect(result.total).toBe(1);
            expect(CacheControl.withCache).toHaveBeenCalled();
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest(
                'http://localhost/api/contracts?page=0&limit=1000'
            );
            const response = await GET(mockRequest);
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest);
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest);
            expect(response.status).toBe(429);
        });

        it('should create a new contract', async () => {
            const mockContract = createMockContract();
            jest.spyOn(ContractProvider.prototype, 'create').mockResolvedValueOnce(
                mockContract
            );

            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'POST',
                body: JSON.stringify({
                    clientId: 'client-1',
                    startDate: '2024-01-01T00:00:00.000Z',
                    endDate: '2024-12-31T23:59:59.999Z',
                    billingRate: 100,
                }),
            });
            const response = await POST(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(201);
            expect(result).toEqual(mockContract);
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'POST',
                body: JSON.stringify({
                    startDate: 'invalid-date',
                    endDate: 'invalid-date',
                    billingRate: -100,
                }),
            });
            const response = await POST(mockRequest);
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            expect(response.status).toBe(429);
        });

        it('should return 400 when contract ID is missing', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            expect(response.status).toBe(400);
        });

        it('should update a contract', async () => {
            const mockContract = createMockContract({ notes: 'Updated notes' });
            jest.spyOn(ContractProvider.prototype, 'update').mockResolvedValueOnce(
                mockContract
            );

            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'PUT',
                body: JSON.stringify({ notes: 'Updated notes' }),
            });
            const response = await PUT(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result).toEqual(mockContract);
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'PUT',
                body: JSON.stringify({
                    startDate: 'invalid-date',
                    endDate: 'invalid-date',
                    billingRate: -100,
                }),
            });
            const response = await PUT(mockRequest);
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            expect(response.status).toBe(429);
        });

        it('should return 400 when contract ID is missing', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            expect(response.status).toBe(400);
        });

        it('should delete a contract', async () => {
            jest.spyOn(ContractProvider.prototype, 'delete').mockResolvedValueOnce(
                undefined
            );

            mockRequest = new NextRequest('http://localhost/api/contracts?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result).toEqual({ success: true });
        });
    });

    describe('GET /api/contracts/[id]', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts/1?action=expiring');
            const response = await GET_BY_ID(mockRequest);
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts/1?action=expiring');
            const response = await GET_BY_ID(mockRequest);
            expect(response.status).toBe(429);
        });

        it('should return expiring contracts', async () => {
            const mockContracts = [createMockContract()];
            jest.spyOn(ContractProvider.prototype, 'findExpiring').mockResolvedValueOnce(
                mockContracts
            );

            mockRequest = new NextRequest('http://localhost/api/contracts/1?action=expiring&days=30');
            const response = await GET_BY_ID(mockRequest);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result).toEqual(mockContracts);
            expect(CacheControl.withCache).toHaveBeenCalled();
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts/1?action=invalid');
            const response = await GET_BY_ID(mockRequest);
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/contracts/[id]', () => {
        const mockParams = { id: '1' };

        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/contracts/1', {
                method: 'PATCH',
                body: JSON.stringify({}),
            });
            const response = await PATCH(mockRequest, { params: mockParams });
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/contracts/1', {
                method: 'PATCH',
                body: JSON.stringify({}),
            });
            const response = await PATCH(mockRequest, { params: mockParams });
            expect(response.status).toBe(429);
        });

        it('should update contract status', async () => {
            const mockContract = createMockContract({ status: 'TERMINATED' });
            jest.spyOn(ContractProvider.prototype, 'updateStatus').mockResolvedValueOnce(
                mockContract
            );

            mockRequest = new NextRequest('http://localhost/api/contracts/1', {
                method: 'PATCH',
                body: JSON.stringify({
                    action: 'updateStatus',
                    status: 'TERMINATED',
                }),
            });
            const response = await PATCH(mockRequest, { params: mockParams });
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result).toEqual(mockContract);
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest('http://localhost/api/contracts/1', {
                method: 'PATCH',
                body: JSON.stringify({
                    action: 'invalid',
                }),
            });
            const response = await PATCH(mockRequest, { params: mockParams });
            expect(response.status).toBe(400);
        });
    });
}); 