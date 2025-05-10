import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, KPIAssignment, Frequency, KPIStatus } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

const MAX_TARGET_VALUE_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;

// GET /api/kpi/assignments
export const GET = withPermission(PERMISSIONS.KPI_READ)(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const kpiId = searchParams.get('kpiId') || '';
        const contractId = searchParams.get('contractId') || '';
        const status = searchParams.get('status') as KPIStatus | null;
        const frequency = searchParams.get('frequency') as Frequency | null;

        // Handle invalid numbers
        if (isNaN(page)) page = 1;
        if (isNaN(limit)) limit = 10;

        const where: Prisma.KPIAssignmentWhereInput = {
            AND: [
                kpiId ? { kpiId } : {},
                contractId ? { contractId } : {},
                status ? { status } : {},
                frequency ? { frequency } : {}
            ]
        };

        try {
            const [assignments, total] = await Promise.all([
                prisma.kPIAssignment.findMany({
                    where,
                    take: limit,
                    skip: (page - 1) * limit,
                    orderBy: { startDate: 'desc' },
                    include: {
                        kpi: true,
                        contract: true,
                        Organization: true
                    }
                }),
                prisma.kPIAssignment.count({ where })
            ]);

            // Log the successful request
            await auditLog('KPI_LIST', {
                page,
                limit,
                kpiId,
                contractId,
                status,
                frequency,
                total
            });

            return NextResponse.json({
                data: assignments,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            });
        } catch (error) {
            console.error("Error fetching KPI assignments:", error);
            await auditLog('KPI_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return NextResponse.json(
                { error: "Failed to fetch KPI assignments" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in GET /kpi/assignments:", error);
        await auditLog('KPI_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch KPI assignments" },
            { status: 500 }
        );
    }
});

// POST /api/kpi/assignments
export const POST = withPermission(PERMISSIONS.KPI_ASSIGN)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_KPI_ASSIGNMENT');
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
        const kpiId = body.kpiId;
        const contractId = body.contractId;
        const targetValue = body.targetValue?.trim();
        const frequency = body.frequency as Frequency;
        const status = body.status as KPIStatus;
        const notes = body.notes?.trim();
        const startDate = body.startDate;
        const endDate = body.endDate;
        const organizationId = body.organizationId;

        if (!kpiId) {
            return NextResponse.json(
                { error: "KPI ID is required" },
                { status: 400 }
            );
        }

        if (!contractId) {
            return NextResponse.json(
                { error: "Contract ID is required" },
                { status: 400 }
            );
        }

        if (!frequency) {
            return NextResponse.json(
                { error: "Frequency is required" },
                { status: 400 }
            );
        }

        if (!Object.values(Frequency).includes(frequency)) {
            return NextResponse.json(
                { error: "Invalid frequency value" },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        if (!Object.values(KPIStatus).includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        if (!startDate) {
            return NextResponse.json(
                { error: "Start date is required" },
                { status: 400 }
            );
        }

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

        // Check for existing assignment
        const existing = await prisma.kPIAssignment.findFirst({
            where: {
                kpiId,
                contractId,
                status: {
                    not: KPIStatus.CANCELLED
                }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Active KPI assignment already exists for this KPI and contract" },
                { status: 409 }
            );
        }

        try {
            // Create the KPI assignment
            const assignment = await prisma.kPIAssignment.create({
                data: {
                    kpiId,
                    contractId,
                    targetValue,
                    frequency,
                    status,
                    notes,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    organizationId
                },
                include: {
                    kpi: true,
                    contract: true,
                    Organization: true
                }
            });

            // Log the successful creation
            await auditLog('KPI_CREATE', {
                assignmentId: assignment.id,
                kpiId: assignment.kpiId,
                contractId: assignment.contractId,
                status: assignment.status
            });

            return NextResponse.json(assignment, { status: 201 });
        } catch (error) {
            console.error("Error creating KPI assignment:", error);
            await auditLog('KPI_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error',
                kpiId,
                contractId
            });
            return NextResponse.json(
                { error: "Failed to create KPI assignment" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in POST /kpi/assignments:", error);
        await auditLog('KPI_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create KPI assignment" },
            { status: 500 }
        );
    }
}); 