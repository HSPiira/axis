import { NextRequest } from 'next/server';
import type { ClientModel } from '@/lib/providers/client-provider';

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

// Mock the ClientProvider inline and expose mock instance
jest.mock('@/lib/providers/client-provider', () => {
    const mockProvider = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    return {
        __esModule: true,
        ClientProvider: jest.fn(() => mockProvider),
        __mockProvider: mockProvider,
    };
});

// Import after mocks
import { ClientProvider, __mockProvider as mockProvider } from '@/lib/providers/client-provider';
import { auth } from '@/lib/auth';
import { GET, POST, PUT, DELETE } from '@/app/api/clients/route';

describe('Client API Routes', () => {
    let mockRequest: NextRequest;

    const createMockClient = (overrides = {}): ClientModel => ({
        id: '1',
        name: 'Test Client',
        email: 'test@example.com',
        phone: '1234567890',
        website: 'https://example.com',
        address: '123 Main St, Anytown, USA',
        billingAddress: '123 Main St, Anytown, USA',
        taxId: '1234567890',
        contactPerson: 'John Doe',
        contactEmail: 'john.doe@example.com',
        contactPhone: '1234567890',
        industry: {
            id: '1',
            name: 'Test Industry',
            code: 'IND001',
        },
        status: 'ACTIVE',
        preferredContactMethod: 'EMAIL',
        timezone: 'America/New_York',
        isVerified: true,
        notes: 'Test Notes',
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Object.values(mockProvider).forEach(mock => mock.mockReset());

        mockRequest = new NextRequest('http://localhost:3000/api/clients', {
            method: 'GET',
        });

        (auth as jest.Mock).mockResolvedValue({ user: { id: 'test-user' } });
    });

    describe('GET /api/clients', () => {
        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return paginated clients', async () => {
            const mockClients = {
                data: [
                    createMockClient({ id: '1', name: 'Client 1' }),
                    createMockClient({ id: '2', name: 'Client 2' }),
                ],
                total: 2,
                page: 1,
                limit: 10,
            };

            mockProvider.list.mockResolvedValue(mockClients);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockClients);
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
                status: 'ACTIVE',
                industryId: 'ind1',
                isVerified: 'true',
                page: '2',
                limit: '5',
            });

            mockRequest = new NextRequest(
                `http://localhost:3000/api/clients?${searchParams.toString()}`
            );

            const mockClients = {
                data: [createMockClient({ id: '1', name: 'Test Client' })],
                total: 1,
                page: 2,
                limit: 5,
            };

            mockProvider.list.mockResolvedValue(mockClients);

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
                    industryId: 'ind1',
                    isVerified: true,
                },
            });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.list.mockRejectedValue(new Error('Database error'));

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('POST /api/clients', () => {
        it('should create a new client', async () => {
            const newClient = createMockClient({
                id: '1',
                name: 'New Client',
                email: 'new@example.com',
            });

            mockProvider.create.mockResolvedValue(newClient);

            const request = new NextRequest('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Client',
                    email: 'new@example.com',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(newClient);
            expect(mockProvider.create).toHaveBeenCalledWith({
                name: 'New Client',
                email: 'new@example.com',
            });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Client' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.create.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Client' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('PUT /api/clients', () => {
        it('should update a client', async () => {
            const updatedClient = createMockClient({
                id: '1',
                name: 'Updated Client',
            });

            mockProvider.update.mockResolvedValue(updatedClient);

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: 'Updated Client',
                    }),
                }
            );

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedClient);
            expect(mockProvider.update).toHaveBeenCalledWith('1', {
                name: 'Updated Client',
            });
        });

        it('should return 400 if id is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/clients', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Client',
                }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Client ID is required' });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
                {
                    method: 'PUT',
                    body: JSON.stringify({ name: 'Updated Client' }),
                }
            );

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.update.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
                {
                    method: 'PUT',
                    body: JSON.stringify({ name: 'Updated Client' }),
                }
            );

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('DELETE /api/clients', () => {
        it('should delete a client', async () => {
            mockProvider.delete.mockResolvedValue({ success: true });

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
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
            const request = new NextRequest('http://localhost:3000/api/clients', {
                method: 'DELETE',
            });

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Client ID is required' });
        });

        it('should return 401 if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
                {
                    method: 'DELETE',
                }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should handle server errors gracefully', async () => {
            mockProvider.delete.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest(
                'http://localhost:3000/api/clients?id=1',
                {
                    method: 'DELETE',
                }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal Server Error' });
        });
    });
});

