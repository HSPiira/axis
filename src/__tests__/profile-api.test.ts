import { GET } from '@/app/api/auth/profile/route';
import { prisma } from '@/lib/prisma';
import getServerSession from 'next-auth';
import { NextRequest } from 'next/server';

jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({
    prisma: {
        profile: {
            findUnique: jest.fn(),
        },
    },
}));

describe('/api/auth/profile API', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = new NextRequest('http://localhost:3000/api/auth/profile');
    });

    it('returns 401 if not authenticated', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);
        const res = await GET(mockRequest);
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('returns 404 if profile not found', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
        (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);
        const res = await GET(mockRequest);
        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe('Profile not found');
    });

    it('returns profile data if found', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
        (prisma.profile.findUnique as jest.Mock).mockResolvedValue({ fullName: 'Test User', image: 'avatar.png' });
        const res = await GET(mockRequest);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({ fullName: 'Test User', image: 'avatar.png' });
    });
}); 