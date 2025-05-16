import { prisma } from "@/lib/prisma";
import { BaseProvider, PaginatedResponse } from "./base-provider";
import type { Contract, ContractStatus, PaymentStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { PrismaWrapper } from "@/lib/prisma-wrapper";

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
    startDate: string;
    endDate: string;
    renewalDate?: string;
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
    signedAt?: string;
    terminationReason?: string;
}

export interface ContractFilters {
    clientId?: string;
    status?: ContractStatus;
    paymentStatus?: PaymentStatus;
    isRenewable?: boolean;
    startDate?: Date;
    endDate?: Date;
    endDateBefore?: Date;
    endDateAfter?: Date;
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
    protected client = new PrismaWrapper(prisma.contract);
    protected searchFields = ['notes', 'terminationReason'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        client: {
            select: {
                id: true,
                name: true,
            }
        }
    };

    protected transform(contract: Contract & { metadata?: Record<string, any> | null } & { client?: { id: string; name: string } }): ContractModel {
        return {
            id: contract.id,
            clientId: contract.clientId,
            startDate: contract.startDate.toISOString(),
            endDate: contract.endDate.toISOString(),
            renewalDate: contract.renewalDate?.toISOString() || null,
            billingRate: contract.billingRate,
            paymentStatus: contract.paymentStatus,
            paymentFrequency: contract.paymentFrequency,
            paymentTerms: contract.paymentTerms,
            currency: contract.currency,
            status: contract.status,
            isRenewable: contract.isRenewable,
            isAutoRenew: contract.isAutoRenew,
            lastBillingDate: contract.lastBillingDate?.toISOString() || null,
            nextBillingDate: contract.nextBillingDate?.toISOString() || null,
            documentUrl: contract.documentUrl,
            signedBy: contract.signedBy,
            signedAt: contract.signedAt?.toISOString() || null,
            terminationReason: contract.terminationReason,
            notes: contract.notes,
            createdAt: contract.createdAt.toISOString(),
            updatedAt: contract.updatedAt.toISOString(),
            client: contract.client ? {
                id: contract.client.id,
                name: contract.client.name,
            } : undefined,
        };
    }

    protected buildWhereClause(filters: ContractFilters, search: string): Prisma.ContractWhereInput {
        return {
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { notes: { contains: search, mode: 'insensitive' } },
                        { client: { is: { name: { contains: search, mode: 'insensitive' } } } },
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
    }

    // Additional contract-specific methods
    async findByClient(clientId: string): Promise<ContractModel[]> {
        const contracts = await this.client.findMany({
            where: { clientId, deletedAt: null },
            include: this.includes
        });
        return contracts.map((contract: Contract & { client?: { id: string; name: string } }) => this.transform(contract));
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
        return contracts.map((contract: Contract & { client?: { id: string; name: string } }) => this.transform(contract));
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
        return contracts.map((contract: Contract & { client?: { id: string; name: string } }) => this.transform(contract));
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

        // Get status counts
        const statusCounts = await this.client.findMany({
            where: { clientId, deletedAt: null },
            select: {
                status: true,
            },
            distinct: ['status'],
        });

        // Get payment status counts
        const paymentStatusCounts = await this.client.findMany({
            where: { clientId, deletedAt: null },
            select: {
                paymentStatus: true,
            },
            distinct: ['paymentStatus'],
        });

        // Get active contracts value
        const activeValue = await this.client.aggregate({
            where: {
                clientId,
                status: 'ACTIVE',
                deletedAt: null,
            },
            _sum: { billingRate: true },
            _avg: { billingRate: true },
        });

        // Get expiring soon count
        const expiringSoon = await this.client.count({
            where: {
                clientId,
                status: 'ACTIVE',
                deletedAt: null,
                endDate: {
                    gt: now,
                    lte: thirtyDaysFromNow,
                },
            },
        });

        // Get upcoming renewals
        const upcomingRenewals = await this.client.findMany({
            where: {
                clientId,
                status: 'ACTIVE',
                isRenewable: true,
                endDate: { gt: now },
                deletedAt: null,
            },
            select: {
                id: true,
                endDate: true,
                billingRate: true,
                isAutoRenew: true,
            },
            orderBy: { endDate: 'asc' },
        });

        // Count contracts by status
        const byStatus = await this.client.groupBy({
            by: ['status'],
            where: { clientId, deletedAt: null },
            _count: true,
        }).then((groups: Array<{ status: ContractStatus; _count: number }>) => groups.reduce((acc: Record<string, number>, { status, _count }) => {
            acc[status] = _count;
            return acc;
        }, {} as Record<string, number>));

        // Count contracts by payment status
        const byPaymentStatus = await this.client.groupBy({
            by: ['paymentStatus'],
            where: { clientId, deletedAt: null },
            _count: true,
        }).then((groups: Array<{ paymentStatus: PaymentStatus; _count: number }>) => groups.reduce((acc: Record<string, number>, { paymentStatus, _count }) => {
            acc[paymentStatus] = _count;
            return acc;
        }, {} as Record<string, number>));

        return {
            statusCounts: byStatus,
            paymentStatusCounts: byPaymentStatus,
            activeValue: {
                total: activeValue._sum.billingRate || 0,
                avg: activeValue._avg.billingRate || 0,
            },
            expiringSoon,
            upcomingRenewals: upcomingRenewals.map((r: { id: string; endDate: Date; billingRate: number; isAutoRenew: boolean }) => ({
                id: r.id,
                endDate: r.endDate.toISOString(),
                billingRate: r.billingRate,
                isAutoRenew: r.isAutoRenew,
            })),
        };
    }

    async list(options: ListOptions = {}): Promise<PaginatedResponse<ContractModel>> {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = { field: 'createdAt', direction: 'desc' }
        } = options;

        // Build the where clause using the shared method
        const where = this.buildWhereClause(filters, search);

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
            data: data.map(contract => this.transform(contract)),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        };
    }

    async create(data: CreateContractInput): Promise<ContractModel> {
        const contract = await this.client.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
            },
            include: this.includes,
        });

        return this.transform(contract);
    }

    async update(
        id: string,
        data: UpdateContractInput
    ): Promise<ContractModel> {
        const contract = await this.client.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
                signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
            },
            include: this.includes,
        });

        return this.transform(contract);
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

        return contracts.map((contract: Contract & { client?: { id: string; name: string } }) => ({
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