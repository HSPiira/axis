import { NextRequest, NextResponse } from 'next/server';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';

const provider = new ContractProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    isRenewable: z.enum(['true', 'false']).optional(),
    endDateBefore: z.string().datetime().optional(),
    endDateAfter: z.string().datetime().optional(),
    sortBy: z.enum(['startDate', 'endDate', 'billingRate', 'status', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createContractSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    billingRate: z.number().positive(),
    isRenewable: z.boolean().optional(),
    isAutoRenew: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    paymentFrequency: z.string().optional(),
    paymentTerms: z.string().optional(),
    currency: z.string().optional(),
    documentUrl: z.string().url().optional(),
    notes: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
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
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse and validate query parameters
        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const {
            page,
            limit,
            search,
            status,
            paymentStatus,
            isRenewable,
            endDateBefore,
            endDateAfter,
            sortBy,
            sortOrder,
        } = listQuerySchema.parse(searchParams);

        const { clientId } = await params;

        const result = await provider.list({
            page,
            limit,
            search,
            filters: {
                clientId,
                status: status || undefined,
                paymentStatus: paymentStatus || undefined,
                isRenewable: isRenewable ? isRenewable === 'true' : undefined,
                endDateBefore: endDateBefore ? new Date(endDateBefore) : undefined,
                endDateAfter: endDateAfter ? new Date(endDateAfter) : undefined,
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
        console.error('Error fetching client contracts:', error);
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
    { params }: { params: Promise<{ clientId: string }> }
) {
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
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createContractSchema.parse(body);

        // Additional validation
        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);

        if (startDate >= endDate) {
            return NextResponse.json(
                { error: 'Start date must be before end date' },
                { status: 400 }
            );
        }

        const { clientId } = await params;

        const contractData = {
            ...validatedData,
            clientId,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
        };

        const result = await provider.create(contractData);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating client contract:', error);
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