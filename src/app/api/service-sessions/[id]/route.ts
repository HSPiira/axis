import { NextRequest, NextResponse } from 'next/server';
import { ServiceSessionProvider } from '@/lib/providers/service-session-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SessionStatus } from '@prisma/client';

const provider = new ServiceSessionProvider();

// Validation schema for updating service sessions
const updateServiceSessionSchema = z.object({
    serviceId: z.string().optional(),
    providerId: z.string().optional(),
    scheduledAt: z.string().optional(),
    completedAt: z.string().optional().nullable(),
    status: z.nativeEnum(SessionStatus).optional(),
    notes: z.string().optional().nullable(),
    feedback: z.string().optional().nullable(),
    duration: z.number().optional().nullable(),
    location: z.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
    rescheduleCount: z.number().optional(),
    isGroupSession: z.boolean().optional(),
    staffId: z.string().optional().nullable(),
    beneficiaryId: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
});

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
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

        const result = await provider.getById(context.params.id);
        if (!result) {
            return NextResponse.json(
                { error: 'Service session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching service session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } }
) {
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
        const validatedData = updateServiceSessionSchema.parse(body);

        const result = await provider.update(context.params.id, validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'ServiceSession',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating service session:', error);
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

export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }
) {
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

        await provider.delete(context.params.id);
        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entityType: 'ServiceSession',
                entityId: context.params.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting service session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 