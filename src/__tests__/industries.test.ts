import { NextRequest } from 'next/server';
import type { IndustryModel } from '@/lib/providers/industry-provider';

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

    return {
        NextRequest: MockNextRequest,
        NextResponse: {
            json: (body: any, init?: ResponseInit) => {
                return new Response(JSON.stringify(body), {
                    ...init,
                    headers: {
                        'content-type': 'application/json',
                        ...(init?.headers || {}),
                    },
                });
            },
        },
    };
});

// Mock the auth function
jest.mock('@/lib/auth', () => ({
    auth: jest.fn(),
}));

// Mock the IndustryProvider inline and expose mock instance
jest.mock('@/lib/providers/industry-provider', () => {
    const mockProvider = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findRootIndustries: jest.fn(),
    };
    return {
        __esModule: true,
        IndustryProvider: jest.fn(() => mockProvider),
        __mockProvider: mockProvider,
    };
});

// Import after mocks
import { IndustryProvider, __mockProvider as mockProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';
import { GET, POST, PUT, DELETE } from '@/app/api/industries/route';
import { GET as getRootIndustries } from '@/app/api/industries/root/route';

describe('Industry API Routes', () => {
    let mockRequest: NextRequest;

    const createMockIndustry = (overrides = {}): IndustryModel => ({
        id: '1',
        name: 'Test Industry',
        code: 'IND001',
        description: 'Test Description',
        parentId: null,
        parent: null,
        externalId: null,
        metadata: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Object.values(mockProvider).forEach(mock => mock.mockReset());

        mockRequest = new NextRequest('http://localhost:3000/api/industries', {
            method: 'GET',
        });

        (auth as jest.Mock).mockResolvedValue({ user: { id: 'test-user' } });
    });

    describe('GET /api/industries', () => {
        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return paginated industries', async () => {
            const mockIndustries = {
                data: [
                    createMockIndustry({ id: '1', name: 'Industry 1' }),
                    createMockIndustry({ id: '2', name: 'Industry 2' }),
                ],
                pagination: {
                    total: 2,
                    pages: 1,
                    page: 1,
                    limit: 10,
                },
            };

            mockProvider.list.mockResolvedValue(mockIndustries);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustries);
            expect(mockProvider.list).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: '',
                filters: {},
            });
        });

        it('should handle search and filters', async () => {
            const searchParams = new URLSearchParams({
                search: 'test',
                parentId: 'parent1',
                externalId: 'ext1',
                page: '2',
                limit: '5',
            });

            mockRequest = new NextRequest(
                `http://localhost:3000/api/industries?${searchParams.toString()}`
            );

            const mockIndustries = {
                data: [createMockIndustry({ id: '1', name: 'Test Industry' })],
                pagination: {
                    total: 1,
                    pages: 1,
                    page: 2,
                    limit: 5,
                },
            };

            mockProvider.list.mockResolvedValue(mockIndustries);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustries);
            expect(mockProvider.list).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                search: 'test',
                filters: {
                    parentId: 'parent1',
                    externalId: 'ext1',
                },
            });
        });
    });

    describe('POST /api/industries', () => {
        it('should create a new industry', async () => {
            const mockIndustry = createMockIndustry({
                id: '1',
                name: 'New Industry',
                code: 'IND001',
            });

            mockProvider.create.mockResolvedValue(mockIndustry);

            const request = new NextRequest('http://localhost:3000/api/industries', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Industry',
                    code: 'IND001',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockIndustry);
            expect(mockProvider.create).toHaveBeenCalledWith({
                name: 'New Industry',
                code: 'IND001',
            });
        });
    });

    describe('PUT /api/industries', () => {
        it('should update an industry', async () => {
            const mockIndustry = createMockIndustry({
                id: '1',
                name: 'Updated Industry',
                code: 'IND001',
            });

            mockProvider.update.mockResolvedValue(mockIndustry);

            const request = new NextRequest(
                'http://localhost:3000/api/industries?id=1',
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: 'Updated Industry',
                    }),
                }
            );

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockIndustry);
            expect(mockProvider.update).toHaveBeenCalledWith('1', {
                name: 'Updated Industry',
            });
        });

        it('should return 400 if id is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/industries', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Industry',
                }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Industry ID is required' });
        });
    });

    describe('DELETE /api/industries', () => {
        it('should delete an industry', async () => {
            const mockIndustry = createMockIndustry();
            mockProvider.delete.mockResolvedValue(mockIndustry);

            const request = new NextRequest(
                'http://localhost:3000/api/industries?id=1',
                {
                    method: 'DELETE',
                }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockProvider.delete).toHaveBeenCalledWith('1');
        });

        it('should return 400 if id is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/industries', {
                method: 'DELETE',
            });

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Industry ID is required' });
        });
    });

    describe('GET /api/industries/root', () => {
        it('should return root industries', async () => {
            const mockRootIndustries = [
                createMockIndustry({ id: '1', name: 'Root Industry 1' }),
                createMockIndustry({ id: '2', name: 'Root Industry 2' }),
            ];

            mockProvider.findRootIndustries.mockResolvedValue(mockRootIndustries);

            const response = await getRootIndustries(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockRootIndustries);
            expect(mockProvider.findRootIndustries).toHaveBeenCalled();
        });
    });
});
