import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, KPI } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TYPE_LENGTH = 50;
const MAX_UNIT_LENGTH = 20;

// GET /api/kpi
export const GET = withPermission(PERMISSIONS.KPI_READ)(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        const isActive = searchParams.get('isActive') === 'true';

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

        const where: Prisma.KPIWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
                    ]
                } : {},
                type ? { type } : {},
                { isActive }
            ]
        };

        try {
            const [kpis, total] = await Promise.all([
                prisma.kPI.findMany({
                    where,
                    take: limit,
                    skip: (page - 1) * limit,
                    orderBy: { name: 'asc' },
                    include: {
                        assignments: true,
                        Organization: true,
                        Contract: true
                    }
                }),
                prisma.kPI.count({ where })
            ]);

            // Log the successful request
            await auditLog('KPI_LIST', {
                page,
                limit,
                search,
                type,
                isActive,
                total
            });

            return NextResponse.json({
                data: kpis,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            });
        } catch (error) {
            console.error("Error fetching KPIs:", error);
            await auditLog('KPI_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return NextResponse.json(
                { error: "Failed to fetch KPIs" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in GET /kpi:", error);
        await auditLog('KPI_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch KPIs" },
            { status: 500 }
        );
    }
});

// POST /api/kpi
export const POST = withPermission(PERMISSIONS.KPI_CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_KPI');
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
        const description = body.description?.trim();
        const type = body.type?.trim();
        const unit = body.unit?.trim();
        const isActive = body.isActive ?? true;
        const organizationId = body.organizationId;
        const contractId = body.contractId;

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

        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                { error: "Description exceeds maximum length" },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { error: "Type is required" },
                { status: 400 }
            );
        }

        if (type.length > MAX_TYPE_LENGTH) {
            return NextResponse.json(
                { error: "Type exceeds maximum length" },
                { status: 400 }
            );
        }

        if (!unit) {
            return NextResponse.json(
                { error: "Unit is required" },
                { status: 400 }
            );
        }

        if (unit.length > MAX_UNIT_LENGTH) {
            return NextResponse.json(
                { error: "Unit exceeds maximum length" },
                { status: 400 }
            );
        }

        // Check for existing KPI with same name
        const existing = await prisma.kPI.findFirst({
            where: { name }
        });

        if (existing) {
            return NextResponse.json(
                { error: "KPI with this name already exists" },
                { status: 409 }
            );
        }

        try {
            // Create the KPI
            const kpi = await prisma.kPI.create({
                data: {
                    name,
                    description,
                    type,
                    unit,
                    isActive,
                    organizationId,
                    contractId
                },
                include: {
                    assignments: true,
                    Organization: true,
                    Contract: true
                }
            });

            // Log the successful creation
            await auditLog('KPI_CREATE', {
                kpiId: kpi.id,
                name: kpi.name,
                type: kpi.type
            });

            return NextResponse.json(kpi, { status: 201 });
        } catch (error) {
            console.error("Error creating KPI:", error);
            await auditLog('KPI_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error',
                name,
                type
            });
            return NextResponse.json(
                { error: "Failed to create KPI" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in POST /kpi:", error);
        await auditLog('KPI_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create KPI" },
            { status: 500 }
        );
    }
}); 