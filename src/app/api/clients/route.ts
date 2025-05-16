import { NextRequest, NextResponse } from 'next/server';
import { ClientProvider } from '@/lib/providers/client-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';

const provider = new ClientProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    industryId: z.string().optional(),
    isVerified: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['name', 'status', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createClientSchema = z.object({
    name: z.string().min(1).max(255),
    industryId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('PENDING'),
    isVerified: z.boolean().default(false),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
    address: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'OTHER']).optional().nullable(),
    timezone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

const updateClientSchema = createClientSchema.partial();

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const limiter = await rateLimit.check(request, 100, '1m');
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429 }
            );
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate query parameters
        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const {
            page,
            limit,
            search,
            status,
            industryId,
            isVerified,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                status: status || undefined,
                industryId: industryId || undefined,
                isVerified: isVerified ? isVerified === 'true' : undefined,
            },
            sort: {
                field: sortBy,
                direction: sortOrder,
            },
        });

        const response = NextResponse.json(result);
        return CacheControl.withCache(response, result, {
            maxAge: 10,
            staleWhileRevalidate: 59,
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const limiter = await rateLimit.check(request, 50, '1m');
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429 }
            );
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createClientSchema.parse(body);

        const result = await provider.create(validatedData);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Rate limiting
        const limiter = await rateLimit.check(request, 50, '1m');
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429 }
            );
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateClientSchema.parse(body);

        const result = await provider.update(id, validatedData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating client:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Rate limiting
        const limiter = await rateLimit.check(request, 50, '1m');
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429 }
            );
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            );
        }

        await provider.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

