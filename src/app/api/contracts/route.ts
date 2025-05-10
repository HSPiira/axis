import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';
import { Prisma, ContractStatus } from "@/generated/prisma";
import { z } from 'zod';

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

// Validation schema for contract creation
const createContractSchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    billingRate: z.number().positive('Billing rate must be positive'),
    isRenewable: z.boolean().optional().default(true),
    paymentFrequency: z.string().optional(),
    paymentTerms: z.string().optional(),
    currency: z.string().optional().default('USD'),
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

        const body = await request.json();

        // Validate input
        const validatedData = createContractSchema.parse(body);

        // Validate date range
        if (validatedData.endDate <= validatedData.startDate) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Create contract
        const contract = await prisma.contract.create({
            data: {
                ...validatedData,
                status: ContractStatus.ACTIVE,
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
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Contract creation error:', error);
        await auditLog('CONTRACT_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: 'Failed to create contract' },
            { status: 500 }
        );
    }
}); 