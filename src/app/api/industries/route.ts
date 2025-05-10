import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";

// GET /api/industries
export const GET = withPermission(PERMISSIONS.INDUSTRY_READ)(async (request: NextRequest) => {
    try {
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const parentId = searchParams.get("parentId") || undefined;

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.IndustryWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ],
            }),
            ...(parentId && { parentId }),
        };

        // Get total count for pagination
        const total = await prisma.industry.count({ where });

        // Get industries with pagination
        const industries = await prisma.industry.findMany({
            where,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                        organizations: true,
                    },
                },
            },
            orderBy: { name: "asc" },
            skip,
            take: limit,
        });

        return NextResponse.json({
            data: industries,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching industries:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

// POST /api/industries
export const POST = withPermission(PERMISSIONS.INDUSTRY_CREATE)(async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Check if industry with same name or code already exists
        const existing = await prisma.industry.findFirst({
            where: {
                OR: [
                    { name: body.name },
                    ...(body.code ? [{ code: body.code }] : []),
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Industry with this name or code already exists" },
                { status: 409 }
            );
        }

        // Create new industry
        const industry = await prisma.industry.create({
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                parentId: body.parentId,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        return NextResponse.json(industry, { status: 201 });
    } catch (error) {
        console.error("Error creating industry:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 