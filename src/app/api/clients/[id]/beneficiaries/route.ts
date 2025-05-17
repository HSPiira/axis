import { NextRequest, NextResponse } from 'next/server';
import { BeneficiaryProvider } from '@/lib/providers/beneficiary-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { BaseStatus, RelationType, Language } from '@prisma/client';

const provider = new BeneficiaryProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(BaseStatus).optional(),
    relation: z.nativeEnum(RelationType).optional(),
    staffId: z.string().optional(),
    guardianId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'lastServiceDate', 'relation', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createBeneficiarySchema = z.object({
    profileId: z.string(),
    relation: z.nativeEnum(RelationType),
    isStaffLink: z.boolean().default(false),
    staffId: z.string(),
    guardianId: z.string().optional().nullable(),
    userLinkId: z.string().optional().nullable(),
    status: z.nativeEnum(BaseStatus).default(BaseStatus.ACTIVE),
    preferredLanguage: z.nativeEnum(Language).optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const {
            page,
            limit,
            search,
            status,
            relation,
            guardianId,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const { id } = await params;

        // First, get all staff members for this client
        const staffMembers = await prisma.staff.findMany({
            where: { clientId: id },
            select: { id: true },
        });
        const staffIds = staffMembers.map(staff => staff.id);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                staffId: staffIds.length > 0 ? { in: staffIds } : undefined,
                status: status || undefined,
                relation: relation || undefined,
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
        console.error('Error fetching client beneficiaries:', error);
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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
        const validatedData = createBeneficiarySchema.parse(body);

        const { id } = await params;

        // Verify that the staff member belongs to this client
        const staffMember = await prisma.staff.findFirst({
            where: {
                id: validatedData.staffId,
                clientId: id,
            },
        });

        if (!staffMember) {
            return NextResponse.json(
                { error: 'Staff member not found or does not belong to this client' },
                { status: 400 }
            );
        }

        const result = await provider.create(validatedData);

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entityType: 'Beneficiary',
                entityId: result.id,
                userId: session.user.id,
            },
        });

        return NextResponse.json(result);
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