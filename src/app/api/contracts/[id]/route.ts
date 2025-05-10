import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { auditLog } from '@/lib/audit-log';
import { Prisma, ContractStatus } from "@/generated/prisma";

const MAX_PAYMENT_TERMS_LENGTH = 255;
const MAX_PAYMENT_FREQUENCY_LENGTH = 100;
const MAX_CURRENCY_LENGTH = 10;

// GET /api/contracts/[id]
export const GET = withPermission(PERMISSIONS.CONTRACT_READ)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const contract = await prisma.contract.findUnique({
            where: { id: params.id },
            include: {
                organization: { select: { id: true, name: true } },
                Document: true,
            },
        });
        if (!contract) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }
        await auditLog('CONTRACT_LIST', { contractId: params.id });
        return NextResponse.json(contract);
    } catch (error) {
        console.error("Error fetching contract:", error);
        await auditLog('CONTRACT_LIST_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', contractId: params.id });
        return NextResponse.json(
            { error: "Failed to fetch contract" },
            { status: 500 }
        );
    }
});

// PATCH /api/contracts/[id]
export const PATCH = withPermission(PERMISSIONS.CONTRACT_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
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
        const updateData: Prisma.ContractUpdateInput = {};
        if (body.organizationId !== undefined) {
            if (body.organizationId) {
                updateData.organization = { connect: { id: body.organizationId } };
            }
        }
        if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
        if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
        if (body.billingRate !== undefined) updateData.billingRate = body.billingRate;
        if (body.isRenewable !== undefined) updateData.isRenewable = body.isRenewable;
        if (body.paymentFrequency !== undefined) {
            if (body.paymentFrequency && body.paymentFrequency.length > MAX_PAYMENT_FREQUENCY_LENGTH) {
                return NextResponse.json({ error: "Payment frequency too long" }, { status: 400 });
            }
            updateData.paymentFrequency = body.paymentFrequency?.trim();
        }
        if (body.paymentTerms !== undefined) {
            if (body.paymentTerms && body.paymentTerms.length > MAX_PAYMENT_TERMS_LENGTH) {
                return NextResponse.json({ error: "Payment terms too long" }, { status: 400 });
            }
            updateData.paymentTerms = body.paymentTerms?.trim();
        }
        if (body.currency !== undefined) {
            if (body.currency && body.currency.length > MAX_CURRENCY_LENGTH) {
                return NextResponse.json({ error: "Currency code too long" }, { status: 400 });
            }
            updateData.currency = body.currency?.trim();
        }
        if (body.status !== undefined) {
            if (!Object.values(ContractStatus).includes(body.status)) {
                return NextResponse.json({ error: "Invalid contract status" }, { status: 400 });
            }
            updateData.status = body.status;
        }
        if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl?.trim();
        if (body.renewalDate !== undefined) updateData.renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;
        if (body.lastBillingDate !== undefined) updateData.lastBillingDate = body.lastBillingDate ? new Date(body.lastBillingDate) : null;
        if (body.nextBillingDate !== undefined) updateData.nextBillingDate = body.nextBillingDate ? new Date(body.nextBillingDate) : null;

        const contract = await prisma.contract.update({
            where: { id: params.id },
            data: updateData,
            include: {
                organization: { select: { id: true, name: true } },
                Document: true,
            },
        });
        await auditLog('CONTRACT_CREATE', { contractId: params.id, update: true });
        return NextResponse.json(contract);
    } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }
        console.error("Error updating contract:", error);
        await auditLog('CONTRACT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', contractId: params.id });
        return NextResponse.json(
            { error: "Failed to update contract" },
            { status: 500 }
        );
    }
});

// DELETE /api/contracts/[id]
export const DELETE = withPermission(PERMISSIONS.CONTRACT_DELETE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const contract = await prisma.contract.delete({
            where: { id: params.id },
        });
        await auditLog('CONTRACT_CREATE', { contractId: params.id, deleted: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }
        console.error("Error deleting contract:", error);
        await auditLog('CONTRACT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', contractId: params.id });
        return NextResponse.json(
            { error: "Failed to delete contract" },
            { status: 500 }
        );
    }
});

// PUT /api/contracts/[id]
export const PUT = withPermission(PERMISSIONS.CONTRACT_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
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
        const organizationId = body.organizationId;
        const startDate = body.startDate;
        const endDate = body.endDate;
        const billingRate = body.billingRate;
        if (!organizationId || !startDate || !endDate || billingRate === undefined) {
            return NextResponse.json({ error: "organizationId, startDate, endDate, and billingRate are required" }, { status: 400 });
        }
        if (body.paymentTerms && body.paymentTerms.length > MAX_PAYMENT_TERMS_LENGTH) {
            return NextResponse.json({ error: "Payment terms too long" }, { status: 400 });
        }
        if (body.paymentFrequency && body.paymentFrequency.length > MAX_PAYMENT_FREQUENCY_LENGTH) {
            return NextResponse.json({ error: "Payment frequency too long" }, { status: 400 });
        }
        if (body.currency && body.currency.length > MAX_CURRENCY_LENGTH) {
            return NextResponse.json({ error: "Currency code too long" }, { status: 400 });
        }
        if (body.status && !Object.values(ContractStatus).includes(body.status)) {
            return NextResponse.json({ error: "Invalid contract status" }, { status: 400 });
        }
        // Build update data
        const updateData: Prisma.ContractUpdateInput = {
            organization: { connect: { id: organizationId } },
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            billingRate,
            isRenewable: body.isRenewable ?? true,
            paymentFrequency: body.paymentFrequency?.trim(),
            paymentTerms: body.paymentTerms?.trim(),
            currency: body.currency?.trim() || 'USD',
            status: body.status ?? ContractStatus.ACTIVE,
            documentUrl: body.documentUrl?.trim(),
            renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
            lastBillingDate: body.lastBillingDate ? new Date(body.lastBillingDate) : undefined,
            nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
        };
        const contract = await prisma.contract.update({
            where: { id: params.id },
            data: updateData,
            include: {
                organization: { select: { id: true, name: true } },
                Document: true,
            },
        });
        await auditLog('CONTRACT_CREATE', { contractId: params.id, put: true });
        return NextResponse.json(contract);
    } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }
        console.error("Error replacing contract:", error);
        await auditLog('CONTRACT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', contractId: params.id });
        return NextResponse.json(
            { error: "Failed to replace contract" },
            { status: 500 }
        );
    }
});

// OPTIONS /api/contracts/[id]
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: 'GET,PUT,PATCH,DELETE,OPTIONS',
        },
    });
} 