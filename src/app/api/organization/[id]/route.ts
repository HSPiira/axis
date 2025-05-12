import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { ContractStatus, type Prisma } from "@/generated/prisma";

// GET /api/organization/[id]
export const GET = withPermission(PERMISSIONS.ORGANIZATION_READ)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            include: {
                industry: true,
                contracts: {
                    where: { status: "ACTIVE" },
                    orderBy: { endDate: "desc" },
                },
                Document: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(organization);
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

// PUT /api/organization/[id]
export const PATCH = withPermission(PERMISSIONS.ORGANIZATION_UPDATE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const data: Prisma.OrganizationUpdateInput = {
            name: body.name,
            email: body.email ?? undefined,
            phone: body.phone ?? undefined,
            address: body.address ?? undefined,
            contactPerson: body.contactPerson ?? undefined,
            contactEmail: body.contactEmail ?? undefined,
            contactPhone: body.contactPhone ?? undefined,
            industry: body.industryId ? { connect: { id: body.industryId } } : undefined,
            status: body.status ?? undefined,
            notes: body.notes ?? undefined,
        };

        const organization = await prisma.organization.update({
            where: { id: params.id },
            data,
            include: {
                industry: true,
            },
        });

        return NextResponse.json(organization);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        console.error("Error updating organization:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

// DELETE /api/organization/[id]
export const DELETE = withPermission(PERMISSIONS.ORGANIZATION_DELETE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        // Check if organization has any active contracts
        const activeContracts = await prisma.contract.count({
            where: {
                organizationId: params.id,
                status: ContractStatus.ACTIVE,
            },
        });

        if (activeContracts > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete organization with active contracts",
                    activeContracts,
                },
                { status: 400 }
            );
        }

        await prisma.organization.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: "Organization deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        console.error("Error deleting organization:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 