import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";

// POST /api/industries/assign
export const POST = withPermission(PERMISSIONS.INDUSTRY_ASSIGN)(async (
    request: NextRequest
) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.industryId || !body.organizationIds || !Array.isArray(body.organizationIds)) {
            return NextResponse.json(
                { error: "Industry ID and organization IDs array are required" },
                { status: 400 }
            );
        }

        // Check if industry exists
        const industry = await prisma.industry.findUnique({
            where: { id: body.industryId },
        });

        if (!industry) {
            return NextResponse.json(
                { error: "Industry not found" },
                { status: 404 }
            );
        }

        // Check if all organizations exist
        const organizations = await prisma.organization.findMany({
            where: {
                id: {
                    in: body.organizationIds,
                },
            },
        });

        if (organizations.length !== body.organizationIds.length) {
            return NextResponse.json(
                { error: "One or more organizations not found" },
                { status: 404 }
            );
        }

        // Update organizations with new industry
        const updatedOrganizations = await prisma.$transaction(
            body.organizationIds.map((orgId: string) =>
                prisma.organization.update({
                    where: { id: orgId },
                    data: { industryId: body.industryId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                        industry: {
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
            data: updatedOrganizations,
            meta: {
                total: updatedOrganizations.length,
            },
        });
    } catch (error) {
        console.error("Error assigning industry to organizations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

// DELETE /api/industries/assign
export const DELETE = withPermission(PERMISSIONS.INDUSTRY_ASSIGN)(async (
    request: NextRequest
) => {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.organizationIds || !Array.isArray(body.organizationIds)) {
            return NextResponse.json(
                { error: "Organization IDs array is required" },
                { status: 400 }
            );
        }

        // Check if all organizations exist
        const organizations = await prisma.organization.findMany({
            where: {
                id: {
                    in: body.organizationIds,
                },
            },
        });

        if (organizations.length !== body.organizationIds.length) {
            return NextResponse.json(
                { error: "One or more organizations not found" },
                { status: 404 }
            );
        }

        // Remove industry assignments
        const updatedOrganizations = await prisma.$transaction(
            body.organizationIds.map((orgId: string) =>
                prisma.organization.update({
                    where: { id: orgId },
                    data: { industryId: null },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                    },
                })
            )
        );

        return NextResponse.json({
            data: updatedOrganizations,
            meta: {
                total: updatedOrganizations.length,
            },
        });
    } catch (error) {
        console.error("Error removing industry assignments:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 