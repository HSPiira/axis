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

// GET /api/kpi/[id]
export const GET = withPermission(PERMISSIONS.KPI_READ)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const kpi = await prisma.kPI.findUnique({
            where: { id: params.id },
            include: {
                assignments: true,
                Organization: true,
                Contract: true
            }
        });

        if (!kpi) {
            return NextResponse.json(
                { error: "KPI not found" },
                { status: 404 }
            );
        }

        await auditLog('KPI_LIST', { kpiId: params.id });
        return NextResponse.json(kpi);
    } catch (error) {
        console.error("Error fetching KPI:", error);
        await auditLog('KPI_LIST_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', kpiId: params.id });
        return NextResponse.json(
            { error: "Failed to fetch KPI" },
            { status: 500 }
        );
    }
});

// PATCH /api/kpi/[id]
export const PATCH = withPermission(PERMISSIONS.KPI_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PATCH_KPI');
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

        // Validate fields
        const updateData: Prisma.KPIUpdateInput = {};
        if (body.name !== undefined) {
            const name = body.name.trim();
            if (!name) {
                return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
            }
            if (name.length > MAX_NAME_LENGTH) {
                return NextResponse.json({ error: "Name exceeds maximum length" }, { status: 400 });
            }
            updateData.name = name;
        }
        if (body.description !== undefined) {
            if (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) {
                return NextResponse.json({ error: "Description exceeds maximum length" }, { status: 400 });
            }
            updateData.description = body.description?.trim();
        }
        if (body.type !== undefined) {
            const type = body.type.trim();
            if (!type) {
                return NextResponse.json({ error: "Type cannot be empty" }, { status: 400 });
            }
            if (type.length > MAX_TYPE_LENGTH) {
                return NextResponse.json({ error: "Type exceeds maximum length" }, { status: 400 });
            }
            updateData.type = type;
        }
        if (body.unit !== undefined) {
            const unit = body.unit.trim();
            if (!unit) {
                return NextResponse.json({ error: "Unit cannot be empty" }, { status: 400 });
            }
            if (unit.length > MAX_UNIT_LENGTH) {
                return NextResponse.json({ error: "Unit exceeds maximum length" }, { status: 400 });
            }
            updateData.unit = unit;
        }
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.organizationId !== undefined) {
            updateData.Organization = body.organizationId
                ? { connect: { id: body.organizationId } }
                : { disconnect: true };
        }
        if (body.contractId !== undefined) {
            updateData.Contract = body.contractId
                ? { connect: { id: body.contractId } }
                : { disconnect: true };
        }

        const kpi = await prisma.kPI.update({
            where: { id: params.id },
            data: updateData,
            include: {
                assignments: true,
                Organization: true,
                Contract: true
            }
        });

        await auditLog('KPI_UPDATE', { kpiId: params.id, update: true });
        return NextResponse.json(kpi);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "KPI not found" }, { status: 404 });
        }
        console.error("Error updating KPI:", error);
        await auditLog('KPI_UPDATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', kpiId: params.id });
        return NextResponse.json(
            { error: "Failed to update KPI" },
            { status: 500 }
        );
    }
});

// PUT /api/kpi/[id]
export const PUT = withPermission(PERMISSIONS.KPI_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PUT_KPI');
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

        // Validate required fields
        const name = body.name?.trim();
        const type = body.type?.trim();
        const unit = body.unit?.trim();
        const isActive = body.isActive ?? true;

        if (!name || !type || !unit) {
            return NextResponse.json({ error: "Name, type, and unit are required" }, { status: 400 });
        }

        if (name.length > MAX_NAME_LENGTH) {
            return NextResponse.json({ error: "Name exceeds maximum length" }, { status: 400 });
        }
        if (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json({ error: "Description exceeds maximum length" }, { status: 400 });
        }
        if (type.length > MAX_TYPE_LENGTH) {
            return NextResponse.json({ error: "Type exceeds maximum length" }, { status: 400 });
        }
        if (unit.length > MAX_UNIT_LENGTH) {
            return NextResponse.json({ error: "Unit exceeds maximum length" }, { status: 400 });
        }

        const updateData: Prisma.KPIUpdateInput = {
            name,
            description: body.description?.trim(),
            type,
            unit,
            isActive,
            Organization: body.organizationId
                ? { connect: { id: body.organizationId } }
                : { disconnect: true },
            Contract: body.contractId
                ? { connect: { id: body.contractId } }
                : { disconnect: true }
        };

        const kpi = await prisma.kPI.update({
            where: { id: params.id },
            data: updateData,
            include: {
                assignments: true,
                Organization: true,
                Contract: true
            }
        });

        await auditLog('KPI_UPDATE', { kpiId: params.id, put: true });
        return NextResponse.json(kpi);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "KPI not found" }, { status: 404 });
        }
        console.error("Error replacing KPI:", error);
        await auditLog('KPI_UPDATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', kpiId: params.id });
        return NextResponse.json(
            { error: "Failed to replace KPI" },
            { status: 500 }
        );
    }
});

// DELETE /api/kpi/[id]
export const DELETE = withPermission(PERMISSIONS.KPI_DELETE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'DELETE_KPI');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        // Check if KPI has any active assignments
        const kpi = await prisma.kPI.findUnique({
            where: { id: params.id },
            include: {
                assignments: {
                    where: {
                        status: {
                            not: 'CANCELLED'
                        }
                    }
                }
            }
        });

        if (!kpi) {
            return NextResponse.json(
                { error: "KPI not found" },
                { status: 404 }
            );
        }

        if (kpi.assignments.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete KPI with active assignments" },
                { status: 400 }
            );
        }

        await prisma.kPI.delete({
            where: { id: params.id }
        });

        await auditLog('KPI_DELETE', { kpiId: params.id });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "KPI not found" }, { status: 404 });
        }
        console.error("Error deleting KPI:", error);
        await auditLog('KPI_DELETE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', kpiId: params.id });
        return NextResponse.json(
            { error: "Failed to delete KPI" },
            { status: 500 }
        );
    }
});

// OPTIONS /api/kpi/[id]
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: 'GET,PUT,PATCH,DELETE,OPTIONS',
        },
    });
} 