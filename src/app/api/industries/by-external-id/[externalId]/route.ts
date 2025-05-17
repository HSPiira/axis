import { NextRequest, NextResponse } from 'next/server';
import { IndustryProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';

const provider = new IndustryProvider();

export async function GET(request: NextRequest, { params }: { params: Promise<{ externalId: string }> }) {
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
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { externalId } = await params;
        const industry = await provider.findByExternalId(externalId);

        if (!industry) {
            return NextResponse.json(
                { error: 'Industry not found' },
                { status: 404 }
            );
        }

        const response = NextResponse.json(industry);
        return CacheControl.withCache(response, industry, {
            maxAge: 30,
            staleWhileRevalidate: 300,
            isPrivate: false,
        });
    } catch (error) {
        console.error('Error fetching industry by external ID:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 