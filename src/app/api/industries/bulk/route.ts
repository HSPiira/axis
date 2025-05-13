import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";

// POST /api/industries/bulk
export const POST = withPermission(PERMISSIONS.INDUSTRY_CREATE)(async (
    request: NextRequest
) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.industries || !Array.isArray(body.industries)) {
            return NextResponse.json(
                { error: "Industries array is required" },
                { status: 400 }
            );
        }

        // Validate each industry object
        for (const industry of body.industries) {
            if (!industry.name || !industry.code) {
                return NextResponse.json(
                    { error: "Each industry must have a name and code" },
                    { status: 400 }
                );
            }
        }

        // Create industries in a transaction
        const createdIndustries = await prisma.$transaction(
            body.industries.map((industry: any) =>
                prisma.industry.create({
                    data: {
                        name: industry.name,
                        code: industry.code,
                        description: industry.description,
                        parentId: industry.parentId,
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
                })
            )
        );

        return NextResponse.json({
            data: createdIndustries,
            meta: {
                total: createdIndustries.length,
            },
        });
    } catch (error) {
        console.error("Error creating industries in bulk:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

// DELETE /api/industries/bulk
export const DELETE = withPermission(PERMISSIONS.INDUSTRY_DELETE)(async (
    request: NextRequest
) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.industryIds || !Array.isArray(body.industryIds)) {
            return NextResponse.json(
                { error: "Industry IDs array is required" },
                { status: 400 }
            );
        }

        // Check if industries exist and have no child industries
        const industries = await prisma.industry.findMany({
            where: {
                id: {
                    in: body.industryIds,
                },
            },
            include: {
                _count: {
                    select: {
                        children: true,
                        organizations: true,
                    },
                },
            },
        });

        // Check if all industries were found
        if (industries.length !== body.industryIds.length) {
            return NextResponse.json(
                { error: "One or more industries not found" },
                { status: 404 }
            );
        }

        // Check for child industries and organizations
        const hasChildren = industries.some(
            (industry) => industry._count.children > 0 || industry._count.organizations > 0
        );

        if (hasChildren) {
            return NextResponse.json(
                {
                    error:
                        "Cannot delete industries that have child industries or associated organizations",
                },
                { status: 400 }
            );
        }

        // Delete industries in a transaction
        const deletedIndustries = await prisma.$transaction(
            body.industryIds.map((id: string) =>
                prisma.industry.delete({
                    where: { id },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                })
            )
        );

        return NextResponse.json({
            data: deletedIndustries,
            meta: {
                total: deletedIndustries.length,
            },
        });
    } catch (error) {
        console.error("Error deleting industries in bulk:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 