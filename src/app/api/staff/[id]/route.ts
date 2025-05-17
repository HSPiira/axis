import { NextRequest, NextResponse } from 'next/server';
import { StaffProvider } from '@/lib/providers/staff-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { StaffRole, WorkStatus } from '@prisma/client';

const provider = new StaffProvider();

const updateStaffSchema = z.object({
    profileId: z.string().optional(),
    clientId: z.string().optional(),
    role: z.nativeEnum(StaffRole).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().nullable(),
    status: z.nativeEnum(WorkStatus).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.record(z.any()).optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyContactEmail: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const staff = await provider.get(id);
        if (!staff) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }
        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const validatedData = updateStaffSchema.parse(body);
        const { id } = await params;
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
            return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
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
                entityType: 'Staff',
                entityId: id,
                userId: session.user.id,
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 