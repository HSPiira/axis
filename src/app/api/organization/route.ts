import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { ORGANIZATION_PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";

// GET /api/organization
export const GET = withPermission(ORGANIZATION_PERMISSIONS.READ)(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') as Prisma.OrganizationWhereInput['status'];

        const where: Prisma.OrganizationWhereInput = {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
            ...(status ? { status } : {}),
        };

        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    industry: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            }),
            prisma.organization.count({ where }),
        ]);

        return NextResponse.json({
            organizations,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json(
            { error: "Failed to fetch organizations" },
            { status: 500 }
        );
    }
});

// POST /api/organization
export const POST = withPermission(ORGANIZATION_PERMISSIONS.CREATE)(async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (body.email && !emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check if organization with same name or email already exists
        const existing = await prisma.organization.findFirst({
            where: {
                OR: [
                    { name: body.name },
                    ...(body.email ? [{ email: body.email }] : []),
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Organization with this name or email already exists" },
                { status: 409 }
            );
        }

        // Create new organization
        const organization = await prisma.organization.create({
            data: {
                name: body.name,
                email: body.email,
                industryId: body.industryId,
            },
            include: {
                industry: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        return NextResponse.json(organization, { status: 201 });
    } catch (error) {
        console.error("Error creating organization:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 