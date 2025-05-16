import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Contract, ContractStatus, PaymentStatus } from "@prisma/client";

// Types for contract management
export interface ContractModel {
    id: string;
    clientId: string;
    startDate: string;
    endDate: string;
    renewalDate?: string | null;
    billingRate: number;
    isRenewable: boolean;
    isAutoRenew: boolean;
    paymentStatus: PaymentStatus;
    paymentFrequency?: string | null;
    paymentTerms?: string | null;
    currency?: string | null;
    lastBillingDate?: string | null;
    nextBillingDate?: string | null;
    documentUrl?: string | null;
    status: ContractStatus;
    signedBy?: string | null;
    signedAt?: string | null;
    terminationReason?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    client?: {
        id: string;
        name: string;
    };
}

export interface CreateContractInput {
    clientId: string;
    startDate: Date;
    endDate: Date;
    renewalDate?: Date;
    billingRate: number;
    isRenewable?: boolean;
    isAutoRenew?: boolean;
    paymentStatus?: PaymentStatus;
    paymentFrequency?: string;
    paymentTerms?: string;
    currency?: string;
    documentUrl?: string;
    status?: ContractStatus;
    notes?: string;
    metadata?: Record<string, any>;
}

export interface UpdateContractInput extends Partial<CreateContractInput> {
    signedBy?: string;
    signedAt?: Date;
    terminationReason?: string;
}

export interface ContractFilters {
    status?: ContractStatus;
    paymentStatus?: PaymentStatus;
    isRenewable?: boolean;
    startDate?: Date;
    endDate?: Date;
}

interface ListOptions {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
        clientId?: string;
        status?: ContractStatus;
        paymentStatus?: PaymentStatus;
        isRenewable?: boolean;
        endDateBefore?: Date;
        endDateAfter?: Date;
    };
    sort?: { field: string; direction: 'asc' | 'desc' };
}

export class ContractProvider extends BaseProvider<ContractModel, CreateContractInput, UpdateContractInput> {
    protected client = new PrismaClient(prisma.contract);
    protected searchFields = ['notes', 'terminationReason'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        client: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
    };

    protected transform(data: Contract & { metadata?: Record<string, any> | null }): ContractModel {
        return {
            id: data.id,
            clientId: data.clientId,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            renewalDate: data.renewalDate?.toISOString() || null,
            billingRate: data.billingRate,
            paymentStatus: data.paymentStatus,
            paymentFrequency: data.paymentFrequency,
            paymentTerms: data.paymentTerms,
            currency: data.currency,
            status: data.status,
            isRenewable: data.isRenewable,
            isAutoRenew: data.isAutoRenew,
            lastBillingDate: data.lastBillingDate?.toISOString() || null,
            nextBillingDate: data.nextBillingDate?.toISOString() || null,
            documentUrl: data.documentUrl,
            signedBy: data.signedBy,
            signedAt: data.signedAt?.toISOString() || null,
            terminationReason: data.terminationReason,
            notes: data.notes,
            metadata: data.metadata,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            client: data.client ? {
                id: data.client.id,
                name: data.client.name,
            } : undefined,
        };
    }

    protected buildWhereClause(filters: ContractFilters, search: string): any {
        const where: any = {};

        // Apply filters
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.paymentStatus) {
            where.paymentStatus = filters.paymentStatus;
        }
        if (filters.isRenewable !== undefined) {
            where.isRenewable = filters.isRenewable;
        }
        if (filters.startDate) {
            where.startDate = { gte: filters.startDate };
        }
        if (filters.endDate) {
            where.endDate = { lte: filters.endDate };
        }

        // Apply search
        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }

        // Exclude soft-deleted records
        where.deletedAt = null;

        return where;
    }

    // Additional contract-specific methods
    async findByClient(clientId: string): Promise<ContractModel[]> {
        const contracts = await this.client.findMany({
            where: { clientId, deletedAt: null },
            include: this.includes
        });
        return contracts.map(this.transform);
    }

    async findActive(): Promise<ContractModel[]> {
        const contracts = await this.client.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null,
                endDate: { gte: new Date() }
            },
            include: this.includes
        });
        return contracts.map(this.transform);
    }

    async findExpiringSoon(days: number = 30): Promise<ContractModel[]> {
        const date = new Date();
        date.setDate(date.getDate() + days);

        const contracts = await this.client.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null,
                endDate: {
                    gte: new Date(),
                    lte: date
                }
            },
            include: this.includes
        });
        return contracts.map(this.transform);
    }

    async renew(contractId: string, newEndDate: Date): Promise<ContractModel> {
        const contract = await this.client.update({
            where: { id: contractId },
            data: {
                endDate: newEndDate,
                status: 'RENEWED',
                renewalDate: new Date()
            },
            include: this.includes
        });
        return this.transform(contract);
    }

    async terminate(contractId: string, reason: string): Promise<ContractModel> {
        const contract = await this.client.update({
            where: { id: contractId },
            data: {
                status: 'TERMINATED',
                terminationReason: reason,
                endDate: new Date()
            },
            include: this.includes
        });
        return this.transform(contract);
    }

    async getClientSummary(clientId: string) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Single query to get all necessary counts and sums
        const [summaryData] = await this.client.aggregateRaw({
            pipeline: [
                { $match: { clientId, deletedAt: null } },
                {
                    $facet: {
                        statusCounts: [
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        paymentStatusCounts: [
                            {
                                $group: {
                                    _id: '$paymentStatus',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        activeValue: [
                            {
                                $match: { status: 'ACTIVE' }
                            },
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: '$billingRate' },
                                    avg: { $avg: '$billingRate' }
                                }
                            }
                        ],
                        expiringSoon: [
                            {
                                $match: {
                                    status: 'ACTIVE',
                                    endDate: {
                                        $gt: now,
                                        $lte: thirtyDaysFromNow
                                    }
                                }
                            },
                            {
                                $count: 'total'
                            }
                        ],
                        upcomingRenewals: [
                            {
                                $match: {
                                    status: 'ACTIVE',
                                    isRenewable: true,
                                    endDate: { $gt: now }
                                }
                            },
                            {
                                $project: {
                                    id: 1,
                                    endDate: 1,
                                    billingRate: 1,
                                    isAutoRenew: 1
                                }
                            },
                            {
                                $sort: { endDate: 1 }
                            }
                        ]
                    }
                }
            ]
        });

        // Transform the aggregation results
        const byStatus = summaryData.statusCounts.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {} as Record<string, number>);

        const byPaymentStatus = summaryData.paymentStatusCounts.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: Object.values(byStatus).reduce((a, b) => a + b, 0),
            active: byStatus['ACTIVE'] || 0,
            expiringSoon: summaryData.expiringSoon[0]?.total || 0,
            byStatus,
            byPaymentStatus,
            totalValue: summaryData.activeValue[0]?.total || 0,
            averageValue: summaryData.activeValue[0]?.avg || 0,
            upcomingRenewals: summaryData.upcomingRenewals || []
        };
    }

    async list(options: ListOptions = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = { field: 'createdAt', direction: 'desc' }
        } = options;

        // Build the where clause
        const where = {
            deletedAt: null,
            ...(search
                ? {
                      OR: [
                          { notes: { contains: search, mode: 'insensitive' } },
                          { client: { name: { contains: search, mode: 'insensitive' } } },
                      ],
                  }
                : {}),
            ...(filters.clientId ? { clientId: filters.clientId } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
            ...(filters.isRenewable !== undefined ? { isRenewable: filters.isRenewable } : {}),
            ...(filters.endDateBefore || filters.endDateAfter
                ? {
                      endDate: {
                          ...(filters.endDateBefore ? { lte: filters.endDateBefore } : {}),
                          ...(filters.endDateAfter ? { gte: filters.endDateAfter } : {}),
                      },
                  }
                : {}),
        };

        // Use Promise.all for parallel execution
        const [data, total] = await Promise.all([
            this.client.findMany({
                where,
                include: this.includes,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sort.field]: sort.direction },
            }),
            this.client.count({ where }),
        ]);

        return {
            data: data.map(this.transform),
            total,
            page,
            limit,
        };
    }

    async create(data: Omit<ContractModel, 'id' | 'createdAt' | 'updatedAt'>) {
        const contract = await this.client.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
                lastBillingDate: data.lastBillingDate
                    ? new Date(data.lastBillingDate)
                    : null,
                nextBillingDate: data.nextBillingDate
                    ? new Date(data.nextBillingDate)
                    : null,
                signedAt: data.signedAt ? new Date(data.signedAt) : null,
            },
            include: this.includes,
        });

        return {
            ...contract,
            startDate: contract.startDate.toISOString(),
            endDate: contract.endDate.toISOString(),
            renewalDate: contract.renewalDate?.toISOString() || null,
            lastBillingDate: contract.lastBillingDate?.toISOString() || null,
            nextBillingDate: contract.nextBillingDate?.toISOString() || null,
            signedAt: contract.signedAt?.toISOString() || null,
            createdAt: contract.createdAt.toISOString(),
            updatedAt: contract.updatedAt.toISOString(),
        };
    }

    async update(
        id: string,
        data: Partial<Omit<ContractModel, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
        const contract = await this.client.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
                lastBillingDate: data.lastBillingDate
                    ? new Date(data.lastBillingDate)
                    : undefined,
                nextBillingDate: data.nextBillingDate
                    ? new Date(data.nextBillingDate)
                    : undefined,
                signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
            },
            include: this.includes,
        });

        return {
            ...contract,
            startDate: contract.startDate.toISOString(),
            endDate: contract.endDate.toISOString(),
            renewalDate: contract.renewalDate?.toISOString() || null,
            lastBillingDate: contract.lastBillingDate?.toISOString() || null,
            nextBillingDate: contract.nextBillingDate?.toISOString() || null,
            signedAt: contract.signedAt?.toISOString() || null,
            createdAt: contract.createdAt.toISOString(),
            updatedAt: contract.updatedAt.toISOString(),
        };
    }

    async delete(id: string) {
        const now = new Date();
        return this.client.update({
            where: { id },
            data: { deletedAt: now },
        });
    }

    async updateStatus(id: string, status: ContractStatus) {
        return this.update(id, { status });
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
        return this.update(id, { paymentStatus });
    }

    async findExpiring(daysThreshold: number) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        const contracts = await this.client.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                endDate: {
                    lte: thresholdDate,
                    gt: new Date(),
                },
            },
            include: this.includes,
            orderBy: { endDate: 'asc' },
        });

        return contracts.map((contract) => ({
            ...contract,
            startDate: contract.startDate.toISOString(),
            endDate: contract.endDate.toISOString(),
            renewalDate: contract.renewalDate?.toISOString() || null,
            lastBillingDate: contract.lastBillingDate?.toISOString() || null,
            nextBillingDate: contract.nextBillingDate?.toISOString() || null,
            signedAt: contract.signedAt?.toISOString() || null,
            createdAt: contract.createdAt.toISOString(),
            updatedAt: contract.updatedAt.toISOString(),
        }));
    }
} 