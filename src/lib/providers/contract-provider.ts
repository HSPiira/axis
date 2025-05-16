import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Contract, ContractStatus, PaymentStatus } from "@prisma/client";

// Types for contract management
export interface ContractModel {
    id: string;
    clientId: string;
    startDate: Date;
    endDate: Date;
    renewalDate?: Date | null;
    billingRate: number;
    paymentStatus: PaymentStatus;
    paymentFrequency?: string | null;
    paymentTerms?: string | null;
    currency?: string | null;
    status: ContractStatus;
    isRenewable: boolean;
    isAutoRenew: boolean;
    lastBillingDate?: Date | null;
    nextBillingDate?: Date | null;
    documentUrl?: string | null;
    signedBy?: string | null;
    signedAt?: Date | null;
    terminationReason?: string | null;
    notes?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
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
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
            billingRate: data.billingRate,
            paymentStatus: data.paymentStatus,
            paymentFrequency: data.paymentFrequency,
            paymentTerms: data.paymentTerms,
            currency: data.currency,
            status: data.status,
            isRenewable: data.isRenewable,
            isAutoRenew: data.isAutoRenew,
            lastBillingDate: data.lastBillingDate ? new Date(data.lastBillingDate) : null,
            nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
            documentUrl: data.documentUrl,
            signedBy: data.signedBy,
            signedAt: data.signedAt ? new Date(data.signedAt) : null,
            terminationReason: data.terminationReason,
            notes: data.notes,
            metadata: data.metadata,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
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
} 