import { NextRequest, NextResponse } from 'next/server';
import { IndustryProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';

const provider = new IndustryProvider();

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await provider.findRootIndustries();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching root industries:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 