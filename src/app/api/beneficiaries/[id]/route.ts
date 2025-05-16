import { NextRequest, NextResponse } from 'next/server';
import { BeneficiaryProvider } from '@/lib/providers/beneficiary-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const provider = new BeneficiaryProvider();

const updateBeneficiarySchema = z.object({
    profileId: z.string().optional(),
    relation: z.string().optional(),
    isStaffLink: z.boolean().optional(),
    staffId: z.string().optional(),
    guardianId: z.string().optional().nullable(),
    userLinkId: z.string().optional().nullable(),
    status: z.string().optional(),
    preferredLanguage: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const limiter = await rateLimit.check(request, 100, '1m');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = params;
        const beneficiary = await provider.getById(id);
        if (!beneficiary) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }
        return NextResponse.json(beneficiary);
    } catch (error) {
        console.error('Error fetching beneficiary:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const limiter = await rateLimit.check(request, 50, '1m');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = params;
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
            return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const limiter = await rateLimit.check(request, 50, '1m');
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = params;
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 