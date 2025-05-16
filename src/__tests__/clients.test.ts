import { NextRequest } from 'next/server';
import type { ClientModel } from '@/lib/providers/client-provider';
import { ClientProvider } from '@/lib/providers/client-provider';
import { auth } from '@/lib/auth';
import { GET, POST, PUT, DELETE } from '@/app/api/clients/route';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';

// Mock Response globally
const mockJsonResponse = (data: any, init?: ResponseInit) => {
    const responseInit = {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    };

    const response = {
        headers: new Headers(responseInit.headers),
        status: init?.status || 200,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        json: async () => Promise.resolve(data),
        text: async () => Promise.resolve(JSON.stringify(data)),
    };

    return response as Response;
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
        private readonly bodyContent: any;

        constructor(input: string | URL, init?: RequestInit) {
            this.nextUrl = new URL(input.toString());
            this.headers = new MockHeaders(init?.headers as Record<string, string>);
            this.method = init?.method || 'GET';
            this.bodyContent = init?.body;
        }

        async json() {
            return this.bodyContent ? JSON.parse(this.bodyContent.toString()) : null;
        }
    }

    const NextResponse = {
        json: (data: any, init?: ResponseInit) => {
            return mockJsonResponse(data, init);
        },
    };

    return {
        NextRequest: MockNextRequest,
        NextResponse,
    };
});

// Mock dependencies
jest.mock('@/lib/auth', () => ({
    auth: jest.fn(() => Promise.resolve({ user: { id: 'test-user' } })),
}));

jest.mock('@/lib/rate-limit', () => ({
    rateLimit: {
        check: jest.fn(() => Promise.resolve({ success: true, limit: 100, remaining: 99, reset: 0 })),
    },
}));

jest.mock('@/lib/cache', () => ({
    CacheControl: {
        withCache: jest.fn((response) => response),
    },
}));

// Mock database functions
jest.mock('@/lib/providers/client-provider', () => {
    const mockProvider = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    return {
        ClientProvider: jest.fn(() => mockProvider),
    };
});

describe('Client API Routes', () => {
    const mockClient = {
        id: '1',
        name: 'Test Client',
        email: 'test@example.com',
        status: 'ACTIVE',
        isVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockClients = {
        data: [mockClient],
        pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
        },
    };

    let mockProvider: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset provider instance
        const { ClientProvider } = require('@/lib/providers/client-provider');
        mockProvider = new ClientProvider();

        // Setup mock methods with proper resolved values
        mockProvider.list.mockResolvedValue(mockClients);
        mockProvider.create.mockResolvedValue(mockClient);
        mockProvider.update.mockResolvedValue(mockClient);
        mockProvider.delete.mockResolvedValue(true);
    });

    describe('GET /api/clients', () => {
        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = new NextRequest('http://localhost/api/clients');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });

            const mockRequest = new NextRequest('http://localhost/api/clients');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Too Many Requests' });
        });

        it('should return paginated clients', async () => {
            const searchParams = new URLSearchParams();
            const mockRequest = new NextRequest(`http://localhost/api/clients?${searchParams.toString()}`);

            mockProvider.list.mockResolvedValueOnce(mockClients);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockClients);
            expect(mockProvider.list).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: undefined,
                filters: {
                    status: undefined,
                    industryId: undefined,
                    isVerified: undefined,
                },
                sort: {
                    field: 'createdAt',
                    direction: 'desc',
                },
            });
        });

        it('should handle search and filters', async () => {
            const searchParams = new URLSearchParams({
                page: '2',
                limit: '5',
                search: 'test',
                status: 'ACTIVE',
                industryId: '123',
                isVerified: 'true',
            });
            const mockRequest = new NextRequest(`http://localhost/api/clients?${searchParams.toString()}`);

            mockProvider.list.mockResolvedValueOnce(mockClients);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockClients);
            expect(mockProvider.list).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                search: 'test',
                filters: {
                    status: 'ACTIVE',
                    industryId: '123',
                    isVerified: true,
                },
                sort: {
                    field: 'createdAt',
                    direction: 'desc',
                },
            });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.list.mockRejectedValueOnce(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost/api/clients');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('POST /api/clients', () => {
        const newClient = {
            name: 'New Client',
            email: 'new@example.com',
            status: 'PENDING',
            isVerified: false,
        };

        it('should create a new client', async () => {
            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Client',
                    email: 'new@example.com',
                }),
            });

            mockProvider.create.mockResolvedValueOnce(newClient);

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(newClient);
            expect(mockProvider.create).toHaveBeenCalledWith({
                name: 'New Client',
                email: 'new@example.com',
                status: 'PENDING',
                isVerified: false,
            });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });

            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Too Many Requests' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.create.mockRejectedValueOnce(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Client',
                    email: 'new@example.com',
                }),
            });
            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('PUT /api/clients', () => {
        it('should update a client', async () => {
            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Client',
                }),
            });

            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockClient);
            expect(mockProvider.update).toHaveBeenCalledWith('1', {
                name: 'Updated Client',
            });
        });

        it('should return 400 if id is missing', async () => {
            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Client ID is required' });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Too Many Requests' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.update.mockRejectedValueOnce(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Client',
                }),
            });
            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('DELETE /api/clients', () => {
        it('should delete a client', async () => {
            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockProvider.delete).toHaveBeenCalledWith('1');
        });

        it('should return 400 if id is missing', async () => {
            const mockRequest = new NextRequest('http://localhost/api/clients', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Client ID is required' });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Too Many Requests' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.delete.mockRejectedValueOnce(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost/api/clients?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });
});

