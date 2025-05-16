import { NextRequest, NextResponse } from 'next/server';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';

const provider = new ContractProvider();

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ clientId: string }> }
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
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { clientId } = await context.params;
        const summary = await provider.getClientSummary(clientId);

        const response = NextResponse.json(summary);
        return CacheControl.withCache(response, summary, {
            maxAge: 30,
            staleWhileRevalidate: 300,
            isPrivate: false,
        });
    } catch (error) {
        console.error('Error fetching client contract summary:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 