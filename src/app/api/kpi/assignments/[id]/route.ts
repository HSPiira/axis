import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, KPIAssignment, Frequency, KPIStatus } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

const MAX_TARGET_VALUE_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;

// GET /api/kpi/assignments/[id]
export const GET = withPermission(PERMISSIONS.KPI_READ)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const assignment = await prisma.kPIAssignment.findUnique({
            where: { id: params.id },
            include: {
                kpi: true,
                contract: true,
                Organization: true
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { error: "KPI assignment not found" },
                { status: 404 }
            );
        }

        await auditLog('KPI_LIST', { assignmentId: params.id });
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Error fetching KPI assignment:", error);
        await auditLog('KPI_LIST_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', assignmentId: params.id });
        return NextResponse.json(
            { error: "Failed to fetch KPI assignment" },
            { status: 500 }
        );
    }
});

// PATCH /api/kpi/assignments/[id]
export const PATCH = withPermission(PERMISSIONS.KPI_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PATCH_KPI_ASSIGNMENT');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const { id } = params;
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate length constraints
        const targetValue = body.targetValue?.trim();
        const notes = body.notes?.trim();
        const frequency = body.frequency as Frequency;
        const status = body.status as KPIStatus;
        const startDate = body.startDate;
        const endDate = body.endDate;

        if (targetValue && targetValue.length > MAX_TARGET_VALUE_LENGTH) {
            return NextResponse.json(
                { error: "Target value exceeds maximum length" },
                { status: 400 }
            );
        }

        if (notes && notes.length > MAX_NOTES_LENGTH) {
            return NextResponse.json(
                { error: "Notes exceed maximum length" },
                { status: 400 }
            );
        }

        if (frequency && !Object.values(Frequency).includes(frequency)) {
            return NextResponse.json(
                { error: "Invalid frequency value" },
                { status: 400 }
            );
        }

        if (status && !Object.values(KPIStatus).includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        // Check if assignment exists
        const existing = await prisma.kPIAssignment.findUnique({
            where: { id },
            include: {
                kpi: true,
                contract: true
            }
        });

        if (!existing) {
            return NextResponse.json(
                { error: "KPI assignment not found" },
                { status: 404 }
            );
        }

        try {
            // Update the KPI assignment
            const assignment = await prisma.kPIAssignment.update({
                where: { id },
                data: {
                    targetValue,
                    frequency,
                    status,
                    notes,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined
                },
                include: {
                    kpi: true,
                    contract: true,
                    Organization: true
                }
            });

            // Log the successful update
            await auditLog('KPI_UPDATE', {
                assignmentId: assignment.id,
                kpiId: assignment.kpiId,
                contractId: assignment.contractId,
                status: assignment.status
            });

            return NextResponse.json(assignment);
        } catch (error) {
            console.error("Error updating KPI assignment:", error);
            await auditLog('KPI_UPDATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error',
                assignmentId: id
            });
            return NextResponse.json(
                { error: "Failed to update KPI assignment" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in PATCH /kpi/assignments/[id]:", error);
        await auditLog('KPI_UPDATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to update KPI assignment" },
            { status: 500 }
        );
    }
});

// PUT /api/kpi/assignments/[id]
export const PUT = withPermission(PERMISSIONS.KPI_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PUT_KPI_ASSIGNMENT');
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
        const kpiId = body.kpiId;
        const contractId = body.contractId;
        const targetValue = body.targetValue?.trim();
        const frequency = body.frequency as Frequency;
        const status = body.status as KPIStatus;
        const startDate = body.startDate;
        const organizationId = body.organizationId;

        if (!kpiId || !contractId || !frequency || !status || !startDate) {
            return NextResponse.json(
                { error: "KPI ID, contract ID, frequency, status, and start date are required" },
                { status: 400 }
            );
        }

        if (!Object.values(Frequency).includes(frequency)) {
            return NextResponse.json(
                { error: "Invalid frequency value" },
                { status: 400 }
            );
        }

        if (!Object.values(KPIStatus).includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        if (targetValue && targetValue.length > MAX_TARGET_VALUE_LENGTH) {
            return NextResponse.json(
                { error: "Target value exceeds maximum length" },
                { status: 400 }
            );
        }

        if (body.notes && body.notes.length > MAX_NOTES_LENGTH) {
            return NextResponse.json(
                { error: "Notes exceed maximum length" },
                { status: 400 }
            );
        }

        // Check if KPI exists
        const kpi = await prisma.kPI.findUnique({
            where: { id: kpiId }
        });

        if (!kpi) {
            return NextResponse.json(
                { error: "KPI not found" },
                { status: 404 }
            );
        }

        // Check if contract exists
        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }

        const updateData: Prisma.KPIAssignmentUpdateInput = {
            kpi: { connect: { id: kpiId } },
            contract: { connect: { id: contractId } },
            targetValue,
            frequency,
            status,
            notes: body.notes?.trim(),
            startDate: new Date(startDate),
            endDate: body.endDate ? new Date(body.endDate) : null,
            Organization: organizationId
                ? { connect: { id: organizationId } }
                : { disconnect: true }
        };

        const assignment = await prisma.kPIAssignment.update({
            where: { id: params.id },
            data: updateData,
            include: {
                kpi: true,
                contract: true,
                Organization: true
            }
        });

        await auditLog('KPI_UPDATE', { assignmentId: params.id, put: true });
        return NextResponse.json(assignment);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "KPI assignment not found" }, { status: 404 });
        }
        console.error("Error replacing KPI assignment:", error);
        await auditLog('KPI_UPDATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', assignmentId: params.id });
        return NextResponse.json(
            { error: "Failed to replace KPI assignment" },
            { status: 500 }
        );
    }
});

// DELETE /api/kpi/assignments/[id]
export const DELETE = withPermission(PERMISSIONS.KPI_DELETE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'DELETE_KPI_ASSIGNMENT');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const { id } = params;

        // Check if assignment exists
        const existing = await prisma.kPIAssignment.findUnique({
            where: { id },
            include: {
                kpi: true,
                contract: true
            }
        });

        if (!existing) {
            return NextResponse.json(
                { error: "KPI assignment not found" },
                { status: 404 }
            );
        }

        try {
            // Delete the KPI assignment
            await prisma.kPIAssignment.delete({
                where: { id }
            });

            // Log the successful deletion
            await auditLog('KPI_DELETE', {
                assignmentId: id,
                kpiId: existing.kpiId,
                contractId: existing.contractId
            });

            return new NextResponse(null, { status: 204 });
        } catch (error) {
            console.error("Error deleting KPI assignment:", error);
            await auditLog('KPI_DELETE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error',
                assignmentId: id
            });
            return NextResponse.json(
                { error: "Failed to delete KPI assignment" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in DELETE /kpi/assignments/[id]:", error);
        await auditLog('KPI_DELETE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to delete KPI assignment" },
            { status: 500 }
        );
    }
});

// OPTIONS /api/kpi/assignments/[id]
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: 'GET,PUT,PATCH,DELETE,OPTIONS',
        },
    });
}
