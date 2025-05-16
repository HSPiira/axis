import { NextRequest, NextResponse } from 'next/server';
import { BeneficiaryProvider } from '@/lib/providers/beneficiary-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const provider = new BeneficiaryProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    relation: z.string().optional(),
    staffId: z.string().optional(),
    guardianId: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createBeneficiarySchema = z.object({
    profileId: z.string(),
    relation: z.string(),
    isStaffLink: z.boolean().default(false),
    staffId: z.string(),
    guardianId: z.string().optional().nullable(),
    userLinkId: z.string().optional().nullable(),
    status: z.string().default('ACTIVE'),
    preferredLanguage: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

const updateBeneficiarySchema = createBeneficiarySchema.partial();

export async function GET(request: NextRequest) {
    try {
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

        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const {
            page,
            limit,
            search,
            status,
            relation,
            staffId,
            guardianId,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                status: status || undefined,
                relation: relation || undefined,
                staffId: staffId || undefined,
                guardianId: guardianId || undefined,
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
        console.error('Error fetching beneficiaries:', error);
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
        const validatedData = createBeneficiarySchema.parse(body);

        const result = await provider.create(validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entityType: 'Beneficiary',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating beneficiary:', error);
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
                { error: 'Beneficiary ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateBeneficiarySchema.parse(body);

        const result = await provider.update(id, validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'Beneficiary',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating beneficiary:', error);
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
                { error: 'Beneficiary ID is required' },
                { status: 400 }
            );
        }

        await provider.delete(id);
        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entityType: 'Beneficiary',
                entityId: id,
                userId: session.user.id,
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting beneficiary:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 