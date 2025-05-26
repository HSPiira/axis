import { NextRequest, NextResponse } from 'next/server';
import { ServiceSessionProvider } from '@/lib/providers/service-session-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SessionStatus } from '@prisma/client';

const provider = new ServiceSessionProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(SessionStatus).optional(),
    serviceId: z.string().optional(),
    providerId: z.string().optional(),
    staffId: z.string().optional(),
    beneficiaryId: z.string().optional(),
    isGroupSession: z.boolean().optional(),
    scheduledAt: z.object({
        start: z.string(),
        end: z.string()
    }).optional(),
    sortBy: z.string().default('scheduledAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createServiceSessionSchema = z.object({
    serviceId: z.string(),
    providerId: z.string(),
    scheduledAt: z.string(),
    completedAt: z.string().optional().nullable(),
    status: z.nativeEnum(SessionStatus).default(SessionStatus.SCHEDULED),
    notes: z.string().optional().nullable(),
    feedback: z.string().optional().nullable(),
    duration: z.number().optional().nullable(),
    location: z.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
    rescheduleCount: z.number().default(0),
    isGroupSession: z.boolean().default(false),
    staffId: z.string().optional().nullable(),
    beneficiaryId: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
});

export async function GET(request: NextRequest) {
    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
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
            serviceId,
            providerId,
            staffId,
            beneficiaryId,
            isGroupSession,
            scheduledAt,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                status: status || undefined,
                serviceId: serviceId || undefined,
                providerId: providerId || undefined,
                staffId: staffId || undefined,
                beneficiaryId: beneficiaryId || undefined,
                isGroupSession: isGroupSession || undefined,
                scheduledAt: scheduledAt || undefined,
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
        console.error('Error fetching service sessions:', error);
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
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
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
        const validatedData = createServiceSessionSchema.parse(body);

        const result = await provider.create(validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entityType: 'ServiceSession',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating service session:', error);
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