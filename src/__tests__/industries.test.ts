import { NextRequest } from 'next/server';
import type { IndustryModel } from '@/lib/providers/industry-provider';
import { IndustryProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';
import { GET, POST, PUT, DELETE } from '@/app/api/industries/route';
import { GET as getRootIndustries } from '@/app/api/industries/root/route';
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
jest.mock('@/lib/providers/industry-provider', () => {
    const mockProvider = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByExternalId: jest.fn(),
    };

    return {
        IndustryProvider: jest.fn(() => mockProvider),
    };
});

describe('Industry API Routes', () => {
    const mockIndustry = {
        id: '1',
        name: 'Test Industry',
        code: 'IND001',
        description: 'Test Description',
        status: 'Active',
        parentId: null,
        parent: null,
        externalId: null,
        metadata: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockIndustries = {
        data: [mockIndustry],
        pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
        },
    };

    let provider: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset provider instance
        const { IndustryProvider } = require('@/lib/providers/industry-provider');
        provider = new IndustryProvider();

        // Setup mock methods with proper resolved values
        provider.list.mockResolvedValue({ data: [], pagination: { total: 0 } });
        provider.create.mockResolvedValue(mockIndustry);
        provider.update.mockResolvedValue(mockIndustry);
        provider.delete.mockResolvedValue(true);
        provider.findByExternalId.mockResolvedValue(null);
    });

    describe('GET /api/industries', () => {
        it('should return paginated industries', async () => {
            const searchParams = new URLSearchParams();
            const mockRequest = new NextRequest(`http://localhost/api/industries?${searchParams.toString()}`);

            provider.list.mockResolvedValueOnce(mockIndustries);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustries);
            expect(provider.list).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: '',
                filters: {
                    parentId: undefined,
                    externalId: undefined,
                    status: undefined,
                },
                sort: {
                    field: 'name',
                    direction: 'asc',
                },
            });
        });

        it('should handle search and filters', async () => {
            const searchParams = new URLSearchParams({
                page: '2',
                limit: '5',
                search: 'test',
                status: 'Active',
            });
            const mockRequest = new NextRequest(`http://localhost/api/industries?${searchParams.toString()}`);

            provider.list.mockResolvedValueOnce(mockIndustries);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustries);
            expect(provider.list).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                search: 'test',
                filters: {
                    parentId: undefined,
                    externalId: undefined,
                    status: 'Active',
                },
                sort: {
                    field: 'name',
                    direction: 'asc',
                },
            });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            const mockRequest = new NextRequest('http://localhost/api/industries');
            const response = await GET(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Rate limit exceeded' });
        });
    });

    describe('POST /api/industries', () => {
        it('should create a new industry', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Industry',
                    status: 'Active',
                }),
            });

            provider.create.mockResolvedValueOnce(mockIndustry);
            provider.findByExternalId.mockResolvedValueOnce(null);

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockIndustry);
            expect(provider.create).toHaveBeenCalledWith({
                name: 'New Industry',
                status: 'Active',
            });
        });

        it('should handle validation errors', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries', {
                method: 'POST',
                body: JSON.stringify({
                    name: '',
                    status: 'Invalid',
                }),
            });
            const response = await POST(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data.error).toBe('Validation Error');
            expect(data.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: expect.any(String) }),
                ])
            );
        });

        it('should handle duplicate external ID', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Industry',
                    status: 'Active',
                    externalId: 'existing-id',
                }),
            });

            // Mock the findByExternalId to return an existing industry
            provider.findByExternalId
                .mockReset()
                .mockResolvedValueOnce(mockIndustry);

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Industry with this external ID already exists' });
            expect(provider.findByExternalId).toHaveBeenCalledWith('existing-id');
            expect(provider.create).not.toHaveBeenCalled();
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            const mockRequest = new NextRequest('http://localhost/api/industries', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Rate limit exceeded' });
        });
    });

    describe('PUT /api/industries', () => {
        it('should update an industry', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries?id=1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Industry',
                    status: 'Active',
                }),
            });

            provider.update.mockResolvedValueOnce(mockIndustry);
            provider.findByExternalId.mockResolvedValueOnce(null);

            const response = await PUT(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustry);
            expect(provider.update).toHaveBeenCalledWith('1', {
                name: 'Updated Industry',
                status: 'Active',
            });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            const mockRequest = new NextRequest('http://localhost/api/industries?id=1', {
                method: 'PUT',
                body: JSON.stringify({}),
            });
            const response = await PUT(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Rate limit exceeded' });
        });
    });

    describe('DELETE /api/industries', () => {
        it('should delete an industry', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries?id=1', {
                method: 'DELETE',
            });

            provider.list.mockResolvedValueOnce({ data: [], pagination: { total: 0 } });
            provider.delete.mockResolvedValueOnce(true);

            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(provider.delete).toHaveBeenCalledWith('1');
        });

        it('should return 400 when industry has children', async () => {
            const mockRequest = new NextRequest('http://localhost/api/industries?id=1', {
                method: 'DELETE',
            });

            provider.list.mockResolvedValueOnce({
                data: [{ id: '2', name: 'Child Industry' }],
                pagination: { total: 1 },
            });

            const response = await DELETE(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Cannot delete industry with child industries' });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 50, remaining: 0, reset: 0 });
            const mockRequest = new NextRequest('http://localhost/api/industries?id=1', {
                method: 'DELETE',
            });
            const response = await DELETE(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Rate limit exceeded' });
        });
    });

    describe('GET /api/industries/root', () => {
        it('should return root industries', async () => {
            const mockRootIndustries = {
                data: [
                    { ...mockIndustry, name: 'Root Industry 1' },
                    { ...mockIndustry, id: '2', name: 'Root Industry 2' },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    pages: 1,
                },
            };

            provider.list.mockResolvedValueOnce(mockRootIndustries);

            const searchParams = new URLSearchParams();
            const mockRequest = new NextRequest(`http://localhost/api/industries/root?${searchParams.toString()}`);
            const response = await getRootIndustries(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockRootIndustries);
            expect(provider.list).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: '',
                filters: {
                    parentId: null,
                },
                sort: {
                    field: 'name',
                    direction: 'asc',
                },
            });
        });

        it('should return 429 when rate limit exceeded', async () => {
            (rateLimit.check as jest.Mock).mockResolvedValueOnce({ success: false, limit: 100, remaining: 0, reset: 0 });
            const mockRequest = new NextRequest('http://localhost/api/industries/root');
            const response = await getRootIndustries(mockRequest);
            const data = await response.json();
            expect(response.status).toBe(429);
            expect(data).toEqual({ error: 'Rate limit exceeded' });
        });
    });
});
