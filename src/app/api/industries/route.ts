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

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId');
        const externalId = searchParams.get('externalId');

        const filters = {
            parentId: parentId || undefined,
            externalId: externalId || undefined,
        };

        const result = await provider.list({
            page,
            limit,
            search,
            filters,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching industries:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = await provider.create(body);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Industry ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const result = await provider.update(id, body);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Industry ID is required' },
                { status: 400 }
            );
        }

        await provider.delete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 