import { NextRequest, NextResponse } from 'next/server';
import { IndustryProvider } from '@/lib/providers/industry-provider';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { CacheControl } from '@/lib/cache';
import { z } from 'zod';

const provider = new IndustryProvider();

// Validation schemas
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    parentId: z.string().optional(),
    externalId: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    status: z.enum(['Active', 'Inactive', 'Archived']).optional(),
});

const createIndustrySchema = z.object({
    name: z.string().min(1).max(255),
    parentId: z.string().optional(),
    externalId: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    status: z.enum(['Active', 'Inactive', 'Archived']).default('Active'),
});

const updateIndustrySchema = createIndustrySchema.partial();

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
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
            parentId,
            externalId,
            sortBy,
            sortOrder,
            status,
        } = listQuerySchema.parse(searchParams);

        const filters = {
            parentId: parentId || undefined,
            externalId: externalId || undefined,
            status: status || undefined,
        };

        const result = await provider.list({
            page,
            limit,
            search: search || '',
            filters,
            sort: {
                field: sortBy,
                direction: sortOrder,
            },
        });

        const response = NextResponse.json(result);
        return CacheControl.withCache(response, result, {
            maxAge: 30,
            staleWhileRevalidate: 300,
            isPrivate: false,
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
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
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createIndustrySchema.parse(body);

        // Additional validation for externalId uniqueness
        if (validatedData.externalId) {
            const existing = await provider.findByExternalId(validatedData.externalId);
            if (existing) {
                return NextResponse.json(
                    { error: 'Industry with this external ID already exists' },
                    { status: 400 }
                );
            }
        }

        const result = await provider.create(validatedData);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating industry:', error);
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
                { error: 'Rate limit exceeded' },
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
                { error: 'Industry ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateIndustrySchema.parse(body);

        // Additional validation for externalId uniqueness
        if (validatedData.externalId) {
            const existing = await provider.findByExternalId(validatedData.externalId);
            if (existing && existing.id !== id) {
                return NextResponse.json(
                    { error: 'Industry with this external ID already exists' },
                    { status: 400 }
                );
            }
        }

        const result = await provider.update(id, validatedData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating industry:', error);
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
                { error: 'Rate limit exceeded' },
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
                { error: 'Industry ID is required' },
                { status: 400 }
            );
        }

        // Check if industry has children
        const children = await provider.list({
            page: 1,
            limit: 1,
            filters: { parentId: id },
        });

        if (children && children.data && children.data.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete industry with child industries' },
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