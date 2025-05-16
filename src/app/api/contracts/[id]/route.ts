import { NextRequest, NextResponse } from 'next/server';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';

const provider = new ContractProvider();

// Validation schemas
const actionSchema = z.object({
    action: z.enum(['updateStatus', 'updatePaymentStatus', 'terminate', 'renew']),
    status: z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    reason: z.string().min(1).optional(),
    newEndDate: z.string().datetime().optional(),
});

const querySchema = z.object({
    action: z.enum(['expiring']),
    days: z.coerce.number().int().positive().default(30),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = actionSchema.parse(body);
        const { action, ...data } = validatedData;

        let result;
        switch (action) {
            case 'updateStatus':
                if (!data.status) {
                    return NextResponse.json(
                        { error: 'Status is required' },
                        { status: 400 }
                    );
                }
                result = await provider.updateStatus(params.id, data.status);
                break;

            case 'updatePaymentStatus':
                if (!data.paymentStatus) {
                    return NextResponse.json(
                        { error: 'Payment status is required' },
                        { status: 400 }
                    );
                }
                result = await provider.updatePaymentStatus(
                    params.id,
                    data.paymentStatus
                );
                break;

            case 'terminate':
                if (!data.reason) {
                    return NextResponse.json(
                        { error: 'Termination reason is required' },
                        { status: 400 }
                    );
                }
                result = await provider.terminate(params.id, data.reason);
                break;

            case 'renew':
                if (!data.newEndDate) {
                    return NextResponse.json(
                        { error: 'New end date is required' },
                        { status: 400 }
                    );
                }
                result = await provider.renew(params.id, new Date(data.newEndDate));
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing contract action:', error);
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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
        const { action, days } = querySchema.parse(searchParams);

        let result;
        switch (action) {
            case 'expiring':
                result = await provider.findExpiring(days);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        const response = NextResponse.json(result);
        return CacheControl.withCache(response, result, {
            maxAge: 10,
            staleWhileRevalidate: 59,
        });
    } catch (error) {
        console.error('Error processing contract query:', error);
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