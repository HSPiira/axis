import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { INDUSTRY_PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, Industry } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

type IndustryWithParent = Industry & {
    parent: Industry | null;
};

const MAX_NAME_LENGTH = 255;
const MAX_CODE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_HIERARCHY_DEPTH = 5;

// GET /api/industries
export const GET = withPermission(INDUSTRY_PERMISSIONS.READ)(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const search = searchParams.get('search') || '';

        // Handle invalid numbers
        if (isNaN(page)) page = 1;
        if (isNaN(limit)) limit = 10;

        // Validate search length
        if (search.length > 255) {
            return NextResponse.json(
                { error: "Search query too long" },
                { status: 400 }
            );
        }

        const where: Prisma.IndustryWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { code: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
        } : {};

        try {
            const [industries, total] = await Promise.all([
                prisma.industry.findMany({
                    where,
                    take: limit,
                    skip: (page - 1) * limit,
                    orderBy: { name: 'asc' },
                    include: {
                        parent: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        }
                    }
                }),
                prisma.industry.count({ where })
            ]);

            // Log the successful request
            await auditLog('INDUSTRY_LIST', {
                page,
                limit,
                search,
                total
            });

            return NextResponse.json({
                data: industries,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            });
        } catch (error) {
            console.error("Error fetching industries:", error);
            await auditLog('INDUSTRY_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return NextResponse.json(
                { error: "Failed to fetch industries" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in GET /industries:", error);
        await auditLog('INDUSTRY_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch industries" },
            { status: 500 }
        );
    }
});

// POST /api/industries
export const POST = withPermission(INDUSTRY_PERMISSIONS.CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_INDUSTRIES');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate required fields and length constraints
        const name = body.name?.trim();
        const code = body.code?.trim();
        const description = body.description?.trim();

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        if (name.length > MAX_NAME_LENGTH) {
            return NextResponse.json(
                { error: "Name exceeds maximum length" },
                { status: 400 }
            );
        }

        // Validate code format if provided
        if (code) {
            if (code.length > MAX_CODE_LENGTH) {
                return NextResponse.json(
                    { error: "Code exceeds maximum length" },
                    { status: 400 }
                );
            }
            if (!/^[a-zA-Z0-9_]+$/.test(code)) {
                return NextResponse.json(
                    { error: "Code must contain only letters, numbers, and underscores" },
                    { status: 400 }
                );
            }
        }

        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                { error: "Description exceeds maximum length" },
                { status: 400 }
            );
        }

        // Validate parent industry if provided
        if (body.parentId) {
            try {
                const parentIndustry = await prisma.industry.findUnique({
                    where: { id: body.parentId },
                    include: {
                        parent: true
                    }
                });

                if (!parentIndustry) {
                    return NextResponse.json(
                        { error: "Parent industry not found" },
                        { status: 400 }
                    );
                }

                // Check for circular references
                let current = parentIndustry;
                let depth = 1;

                // First check if we're trying to set the industry as its own parent
                if (current.id === body.parentId) {
                    return NextResponse.json(
                        { error: "Invalid parent industry reference" },
                        { status: 400 }
                    );
                }

                while (current?.parent) {
                    if (current.parent.id === body.parentId) {
                        return NextResponse.json(
                            { error: "Invalid parent industry reference" },
                            { status: 400 }
                        );
                    }
                    current = current.parent;
                    depth++;

                    if (depth > MAX_HIERARCHY_DEPTH) {
                        return NextResponse.json(
                            { error: "Maximum hierarchy depth exceeded" },
                            { status: 400 }
                        );
                    }
                }
            } catch (error) {
                console.error("Error validating parent industry:", error);
                await auditLog('INDUSTRY_VALIDATION_ERROR', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    parentId: body.parentId
                });
                return NextResponse.json(
                    { error: "Failed to validate parent industry" },
                    { status: 500 }
                );
            }
        }

        // Check for existing industry with same name or code
        const existing = await prisma.industry.findFirst({
            where: {
                OR: [
                    { name },
                    ...(code ? [{ code }] : [])
                ]
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Industry with this name or code already exists" },
                { status: 409 }
            );
        }

        try {
            // Create the industry
            const industry = await prisma.industry.create({
                data: {
                    name,
                    code,
                    description,
                    parentId: body.parentId
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                }
            });

            // Log the successful creation
            await auditLog('INDUSTRY_CREATE', {
                industryId: industry.id,
                name: industry.name,
                code: industry.code
            });

            return NextResponse.json(industry, { status: 201 });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    return NextResponse.json(
                        { error: "Industry with this name or code already exists" },
                        { status: 409 }
                    );
                }
                if (error.code === 'P2003') {
                    return NextResponse.json(
                        { error: "Invalid parent industry reference" },
                        { status: 400 }
                    );
                }
            }

            console.error("Error creating industry:", error);
            await auditLog('INDUSTRY_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            return NextResponse.json(
                { error: "Failed to create industry" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in POST /industries:", error);
        await auditLog('INDUSTRY_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: "Failed to create industry" },
            { status: 500 }
        );
    }
}); 