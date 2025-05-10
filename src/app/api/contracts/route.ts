import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';
import { Prisma, ContractStatus } from "@/generated/prisma";

const MAX_PAYMENT_TERMS_LENGTH = 255;
const MAX_PAYMENT_FREQUENCY_LENGTH = 100;
const MAX_CURRENCY_LENGTH = 10;

// GET /api/contracts
export const GET = withPermission(PERMISSIONS.CONTRACT_READ)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'GET_CONTRACTS');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const organizationId = searchParams.get('organizationId');
        const status = searchParams.get('status') as ContractStatus | null;

        // Handle invalid numbers
        if (isNaN(page)) page = 1;
        if (isNaN(limit)) limit = 10;

        // Build where clause
        const where: Prisma.ContractWhereInput = {
            AND: [
                organizationId ? { organizationId } : {},
                status ? { status } : {},
            ]
        };

        const [contracts, total] = await Promise.all([
            prisma.contract.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    Document: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.contract.count({ where }),
        ]);

        // Log the successful request
        await auditLog('CONTRACT_LIST', {
            page,
            limit,
            organizationId,
            status,
            total
        });

        return NextResponse.json({
            contracts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching contracts:", error);
        await auditLog('CONTRACT_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch contracts" },
            { status: 500 }
        );
    }
});

// POST /api/contracts
export const POST = withPermission(PERMISSIONS.CONTRACT_CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_CONTRACT');
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
        const organizationId = body.organizationId;
        const startDate = body.startDate;
        const endDate = body.endDate;
        const billingRate = body.billingRate;
        const isRenewable = body.isRenewable ?? true;
        const paymentFrequency = body.paymentFrequency?.trim();
        const paymentTerms = body.paymentTerms?.trim();
        const currency = body.currency?.trim() || 'USD';
        const status = body.status as ContractStatus ?? ContractStatus.ACTIVE;
        const documentUrl = body.documentUrl?.trim();
        const renewalDate = body.renewalDate;
        const lastBillingDate = body.lastBillingDate;
        const nextBillingDate = body.nextBillingDate;

        if (!organizationId) {
            return NextResponse.json(
                { error: "Organization ID is required" },
                { status: 400 }
            );
        }
        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Start and end dates are required" },
                { status: 400 }
            );
        }
        if (paymentTerms && paymentTerms.length > MAX_PAYMENT_TERMS_LENGTH) {
            return NextResponse.json(
                { error: "Payment terms too long" },
                { status: 400 }
            );
        }
        if (paymentFrequency && paymentFrequency.length > MAX_PAYMENT_FREQUENCY_LENGTH) {
            return NextResponse.json(
                { error: "Payment frequency too long" },
                { status: 400 }
            );
        }
        if (currency && currency.length > MAX_CURRENCY_LENGTH) {
            return NextResponse.json(
                { error: "Currency code too long" },
                { status: 400 }
            );
        }

        const contract = await prisma.contract.create({
            data: {
                organizationId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                billingRate,
                isRenewable,
                paymentFrequency,
                paymentTerms,
                currency,
                status,
                documentUrl,
                renewalDate: renewalDate ? new Date(renewalDate) : undefined,
                lastBillingDate: lastBillingDate ? new Date(lastBillingDate) : undefined,
                nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : undefined,
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                Document: true,
            },
        });

        // Log the successful creation
        await auditLog('CONTRACT_CREATE', {
            contractId: contract.id,
            organizationId: contract.organizationId,
            status: contract.status
        });

        return NextResponse.json(contract, { status: 201 });
    } catch (error) {
        console.error("Error creating contract:", error);
        await auditLog('CONTRACT_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create contract" },
            { status: 500 }
        );
    }
}); 