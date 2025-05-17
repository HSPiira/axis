import { NextRequest, NextResponse } from 'next/server';
import { ClientProvider } from '@/lib/providers/client-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { BaseStatus, ContactMethod, ActionType } from '@prisma/client';
import { Prisma } from '@prisma/client';

const provider = new ClientProvider();

// Validation schema for updating clients
const updateClientSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    industryId: z.string().optional(),
    status: z.nativeEnum(BaseStatus).optional(),
    isVerified: z.boolean().optional(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
    address: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    preferredContactMethod: z.nativeEnum(ContactMethod).optional().nullable(),
    timezone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    metadata: z.custom<Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue>().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        const result = await provider.get(id);
        if (!result) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // const limiter = await rateLimit.check(request, 50, '1m');
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
        const validatedData = updateClientSchema.parse(body);

        const { id } = await params;
        const result = await provider.update(id, validatedData);
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'Client',
                entityId: result.id,
                userId: session.user.id,
            },
        });
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        await provider.delete(id);
        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entityType: 'Client',
                entityId: id,
                userId: session.user.id,
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Additional endpoints for client-specific operations
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const actionSchema = z.object({
            action: z.enum(['verify', 'updateStatus']),
            status: z.nativeEnum(BaseStatus).optional(),
        });
        const { action, status } = actionSchema.parse(body);

        let result;
        let auditAction: ActionType;
        const { id } = await params;

        switch (action) {
            case 'verify':
                result = await provider.verifyClient(id);
                auditAction = ActionType.APPROVE;
                break;
            case 'updateStatus':
                if (!status) {
                    return NextResponse.json(
                        { error: 'Status is required' },
                        { status: 400 }
                    );
                }
                result = await provider.updateStatus(id, status);
                auditAction = ActionType.UPDATE;
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        await prisma.auditLog.create({
            data: {
                action: auditAction,
                entityType: 'Client',
                entityId: result.id,
                userId: session.user.id,
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error performing client action:', error);
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