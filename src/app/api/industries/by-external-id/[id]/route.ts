import { NextRequest, NextResponse } from 'next/server';
import { IndustryProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';

const provider = new IndustryProvider();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await provider.findByExternalId(params.id);
        if (!result) {
            return NextResponse.json(
                { error: 'Industry not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching industry by external ID:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 