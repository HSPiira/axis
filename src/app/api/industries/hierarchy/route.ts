import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";

// GET /api/industries/hierarchy
export async function GET(request: NextRequest) {
    try {
        // Get all root industries (those without a parent)
        const rootIndustries = await prisma.industry.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: {
                            include: {
                                _count: {
                                    select: {
                                        children: true,
                                        organizations: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                children: true,
                                organizations: true,
                            },
                        },
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
        });

        return NextResponse.json(rootIndustries);
    } catch (error) {
        console.error("Error fetching industry hierarchy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/industries/hierarchy
export const POST = withPermission(PERMISSIONS.INDUSTRY_HIERARCHY)(async (
    request: NextRequest
) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.industryId || !body.parentId) {
            return NextResponse.json(
                { error: "Industry ID and parent ID are required" },
                { status: 400 }
            );
        }

        // Check if both industry and parent exist
        const [industry, parent] = await Promise.all([
            prisma.industry.findUnique({
                where: { id: body.industryId },
                include: {
                    parent: true,
                    children: true,
                },
            }),
            prisma.industry.findUnique({
                where: { id: body.parentId },
                include: {
                    parent: true,
                },
            }),
        ]);

        if (!industry || !parent) {
            return NextResponse.json(
                { error: "Industry or parent not found" },
                { status: 404 }
            );
        }

        // Check for circular references
        if (
            industry.id === parent.id ||
            parent.parentId === industry.id ||
            (parent.parent && parent.parent.id === industry.id)
        ) {
            return NextResponse.json(
                { error: "Circular reference detected" },
                { status: 400 }
            );
        }

        // Update industry's parent
        const updatedIndustry = await prisma.industry.update({
            where: { id: industry.id },
            data: { parentId: parent.id },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedIndustry);
    } catch (error) {
        console.error("Error updating industry hierarchy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 