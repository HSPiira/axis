import { NextRequest, NextResponse } from 'next/server';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';
import type { ContractStatus } from '@prisma/client';

const provider = new ContractProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.string().transform(val => val?.toUpperCase() as ContractStatus).pipe(z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'])).optional(),
    clientId: z.string().optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    isRenewable: z.enum(['true', 'false']).optional(),
    endDateBefore: z.string().datetime().optional(),
    endDateAfter: z.string().datetime().optional(),
    sortBy: z.enum(['startDate', 'endDate', 'billingRate', 'status', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createContractSchema = z.object({
    clientId: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    billingRate: z.number().positive(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).default('ACTIVE'),
    isRenewable: z.boolean().default(false),
    isAutoRenew: z.boolean().default(false),
    paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
    paymentFrequency: z.string().optional(),
    paymentTerms: z.string().optional(),
    currency: z.string().optional(),
    documentUrl: z.string().url().optional(),
    notes: z.string().optional(),
});

const updateContractSchema = createContractSchema.partial();

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
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

        // Parse and validate query parameters
        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const {
            page,
            limit,
            search,
            status,
            clientId,
            paymentStatus,
            isRenewable,
            endDateBefore,
            endDateAfter,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                status: status || undefined,
                clientId: clientId || undefined,
                paymentStatus: paymentStatus || undefined,
                isRenewable: isRenewable ? isRenewable === 'true' : undefined,
                endDateBefore: endDateBefore ? (() => {
                    const date = new Date(endDateBefore);
                    return isNaN(date.valueOf()) ? undefined : date;
                })() : undefined,
                endDateAfter: endDateAfter ? (() => {
                    const date = new Date(endDateAfter);
                    return isNaN(date.valueOf()) ? undefined : date;
                })() : undefined,
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
        console.error('Error fetching contracts:', error);
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
        const validatedData = createContractSchema.parse(body);

        // Additional validation
        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);

        if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        if (startDate >= endDate) {
            return NextResponse.json(
                { error: 'Start date must be before end date' },
                { status: 400 }
            );
        }

        const result = await provider.create(validatedData);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating contract:', error);
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

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Contract ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateContractSchema.parse(body);

        // Validate dates if they exist
        if (validatedData.startDate && validatedData.endDate) {
            const startDate = new Date(validatedData.startDate);
            const endDate = new Date(validatedData.endDate);

            if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
                return NextResponse.json(
                    { error: 'Invalid date format' },
                    { status: 400 }
                );
            }

            if (startDate >= endDate) {
                return NextResponse.json(
                    { error: 'Start date must be before end date' },
                    { status: 400 }
                );
            }
        } else if (validatedData.startDate || validatedData.endDate) {
            // If only one date is provided, validate its format
            const dateToValidate = validatedData.startDate || validatedData.endDate;
            const date = new Date(dateToValidate!);
            if (isNaN(date.valueOf())) {
                return NextResponse.json(
                    { error: 'Invalid date format' },
                    { status: 400 }
                );
            }
        }

        const result = await provider.update(id, validatedData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating contract:', error);
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

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Contract ID is required' },
                { status: 400 }
            );
        }

        await provider.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contract:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 