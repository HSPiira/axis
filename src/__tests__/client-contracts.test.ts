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
import { GET, POST } from '@/app/api/clients/[id]/contracts/route';
import { GET as GET_SUMMARY } from '@/app/api/clients/[id]/contracts/summary/route';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';

describe('Client Contracts API Routes', () => {
    let mockRequest: NextRequest;
    const mockParams = { id: 'client-1' };

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

    describe('GET /api/clients/[id]/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts');
            const response = await GET(mockRequest, { params: mockParams });
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts');
            const response = await GET(mockRequest, { params: mockParams });
            expect(response.status).toBe(429);
        });

        it('should list client contracts with pagination and filters', async () => {
            const mockContracts = [createMockContract()];
            jest.spyOn(ContractProvider.prototype, 'list').mockResolvedValueOnce({
                data: mockContracts,
                total: 1,
                page: 1,
                limit: 10,
            });

            mockRequest = new NextRequest(
                'http://localhost/api/clients/client-1/contracts?page=1&limit=10&search=test&status=ACTIVE'
            );
            const response = await GET(mockRequest, { params: mockParams });
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.data).toEqual(mockContracts);
            expect(result.total).toBe(1);
            expect(CacheControl.withCache).toHaveBeenCalled();

            expect(ContractProvider.prototype.list).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.objectContaining({
                        clientId: 'client-1',
                        status: 'ACTIVE',
                    }),
                })
            );
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest(
                'http://localhost/api/clients/client-1/contracts?page=0&limit=1000'
            );
            const response = await GET(mockRequest, { params: mockParams });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/clients/[id]/contracts', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest, { params: mockParams });
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest, { params: mockParams });
            expect(response.status).toBe(429);
        });

        it('should create a new contract for the client', async () => {
            const mockContract = createMockContract();
            jest.spyOn(ContractProvider.prototype, 'create').mockResolvedValueOnce(
                mockContract
            );

            const contractData = {
                startDate: '2024-01-01T00:00:00.000Z',
                endDate: '2024-12-31T23:59:59.999Z',
                billingRate: 100,
            };

            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts', {
                method: 'POST',
                body: JSON.stringify(contractData),
            });
            const response = await POST(mockRequest, { params: mockParams });
            const result = await response.json();

            expect(response.status).toBe(201);
            expect(result).toEqual(mockContract);

            expect(ContractProvider.prototype.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...contractData,
                    clientId: 'client-1',
                })
            );
        });

        it('should handle validation errors', async () => {
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts', {
                method: 'POST',
                body: JSON.stringify({
                    startDate: '2024-01-01T00:00:00.000Z',
                    endDate: '2023-12-31T23:59:59.999Z',
                    billingRate: -100,
                    paymentStatus: 'INVALID',
                    documentUrl: 'not-a-url',
                }),
            });
            const response = await POST(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Validation Error');
            expect(data.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: expect.any(String) }),
                ])
            );
        });
    });

    describe('GET /api/clients/[id]/contracts/summary', () => {
        it('should return 401 when not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts/summary');
            const response = await GET_SUMMARY(mockRequest, { params: mockParams });
            expect(response.status).toBe(401);
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts/summary');
            const response = await GET_SUMMARY(mockRequest, { params: mockParams });
            expect(response.status).toBe(429);
        });

        it('should return contract summary', async () => {
            const mockSummary = {
                total: 1,
                active: 1,
                expiringSoon: 0,
                byStatus: { ACTIVE: 1 },
                byPaymentStatus: { PENDING: 1 },
                totalValue: 100,
                averageValue: 100,
                upcomingRenewals: [],
            };

            jest.spyOn(ContractProvider.prototype, 'getClientSummary').mockResolvedValueOnce(mockSummary);

            mockRequest = new NextRequest('http://localhost/api/clients/client-1/contracts/summary');
            const response = await GET_SUMMARY(mockRequest, { params: mockParams });
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result).toEqual(mockSummary);
            expect(CacheControl.withCache).toHaveBeenCalled();
        });
    });
}); 