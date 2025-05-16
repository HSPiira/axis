import { NextRequest, NextResponse } from 'next/server';
import { StaffProvider } from '@/lib/providers/staff-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const provider = new StaffProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
    clientId: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createStaffSchema = z.object({
    profileId: z.string(),
    clientId: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    status: z.string().default('ACTIVE'),
    qualifications: z.array(z.string()).default([]),
    specializations: z.array(z.string()).default([]),
    preferredWorkingHours: z.record(z.any()).optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyContactEmail: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
});

const updateStaffSchema = createStaffSchema.partial();

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
            role,
            clientId,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                status: status || undefined,
                role: role || undefined,
                clientId: clientId || undefined,
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
        console.error('Error fetching staff:', error);
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
        const validatedData = createStaffSchema.parse(body);

        const result = await provider.create(validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entityType: 'Staff',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating staff:', error);
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
                { error: 'Staff ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateStaffSchema.parse(body);

        const result = await provider.update(id, validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'Staff',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating staff:', error);
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
                { error: 'Staff ID is required' },
                { status: 400 }
            );
        }

        await provider.delete(id);
        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entityType: 'Staff',
                entityId: id,
                userId: session.user.id,
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 