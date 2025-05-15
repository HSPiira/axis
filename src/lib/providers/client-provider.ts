import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Client, Industry, BaseStatus, ContactMethod } from "@/generated/prisma";

// Types for client management
export interface ClientModel {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    billingAddress?: string | null;
    taxId?: string | null;
    contactPerson?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    industry?: {
        id: string;
        name: string;
        code?: string | null;
    } | null;
    status: BaseStatus;
    preferredContactMethod?: ContactMethod | null;
    timezone?: string | null;
    isVerified: boolean;
    notes?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientInput {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    billingAddress?: string;
    taxId?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    industryId?: string;
    preferredContactMethod?: ContactMethod;
    timezone?: string;
    notes?: string;
    metadata?: Record<string, any>;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
    status?: BaseStatus;
    isVerified?: boolean;
}

export interface ClientFilters {
    status?: BaseStatus;
    isVerified?: boolean;
    industryId?: string;
    preferredContactMethod?: ContactMethod;
}

export class ClientProvider extends BaseProvider<ClientModel, CreateClientInput, UpdateClientInput> {
    protected client = new PrismaClient(prisma.client);
    protected searchFields = ['name', 'email', 'phone', 'contactPerson', 'contactEmail', 'contactPhone'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        industry: {
            select: {
                id: true,
                name: true,
                code: true
            }
        }
    };

    protected transform(data: Client & { industry?: Industry | null }): ClientModel {
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            website: data.website,
            address: data.address,
            billingAddress: data.billingAddress,
            taxId: data.taxId,
            contactPerson: data.contactPerson,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            industry: data.industry ? {
                id: data.industry.id,
                name: data.industry.name,
                code: data.industry.code
            } : null,
            status: data.status,
            preferredContactMethod: data.preferredContactMethod,
            timezone: data.timezone,
            isVerified: data.isVerified,
            notes: data.notes,
            metadata: data.metadata as Record<string, any> | null,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
        };
    }

    protected buildWhereClause(filters: ClientFilters, search: string): any {
        const where: any = {};

        // Apply filters
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.isVerified !== undefined) {
            where.isVerified = filters.isVerified;
        }
        if (filters.industryId) {
            where.industryId = filters.industryId;
        }
        if (filters.preferredContactMethod) {
            where.preferredContactMethod = filters.preferredContactMethod;
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

    // Additional client-specific methods
    async findByIndustry(industryId: string): Promise<ClientModel[]> {
        const clients = await this.client.findMany({
            where: { industryId, deletedAt: null },
            include: this.includes
        });
        return clients.map(this.transform);
    }

    async findByStatus(status: BaseStatus): Promise<ClientModel[]> {
        const clients = await this.client.findMany({
            where: { status, deletedAt: null },
            include: this.includes
        });
        return clients.map(this.transform);
    }

    async verifyClient(id: string): Promise<ClientModel> {
        return this.update(id, { isVerified: true });
    }

    async updateStatus(id: string, status: BaseStatus): Promise<ClientModel> {
        return this.update(id, { status });
    }
} 