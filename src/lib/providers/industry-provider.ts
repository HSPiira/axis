import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Industry } from "@prisma/client";

// Types for industry management
export interface IndustryModel {
    id: string;
    name: string;
    code?: string | null;
    description?: string | null;
    parentId?: string | null;
    parent?: {
        id: string;
        name: string;
        code?: string | null;
    } | null;
    externalId?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateIndustryInput {
    name: string;
    code?: string;
    description?: string;
    parentId?: string;
    externalId?: string;
    metadata?: Record<string, any>;
}

export interface UpdateIndustryInput extends Partial<CreateIndustryInput> { }

export interface IndustryFilters {
    parentId?: string | null;
    externalId?: string;
}

export class IndustryProvider extends BaseProvider<IndustryModel, CreateIndustryInput, UpdateIndustryInput> {
    protected client = new PrismaClient(prisma.industry);
    protected searchFields = ['name', 'code', 'description'];
    protected defaultSort = { field: 'name', direction: 'asc' as const };
    protected includes = {
        parent: {
            select: {
                id: true,
                name: true,
                code: true
            }
        }
    };

    protected transform(data: Industry & { parent?: Industry | null }): IndustryModel {
        return {
            id: data.id,
            name: data.name,
            code: data.code,
            description: data.description,
            parentId: data.parentId,
            parent: data.parent ? {
                id: data.parent.id,
                name: data.parent.name,
                code: data.parent.code
            } : null,
            externalId: data.externalId,
            metadata: data.metadata as Record<string, any> | null,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
        };
    }

    protected buildWhereClause(filters: IndustryFilters, search: string): any {
        const where: any = {};

        // Apply filters
        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        }
        if (filters.externalId) {
            where.externalId = filters.externalId;
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

    // Additional industry-specific methods
    async findByParent(parentId: string): Promise<IndustryModel[]> {
        const industries = await this.client.findMany({
            where: { parentId, deletedAt: null },
            include: this.includes,
        });
        return industries.map(industry => this.transform(industry));
    }

    async findRoot(): Promise<IndustryModel[]> {
        const industries = await this.client.findMany({
            where: { parentId: null, deletedAt: null },
            include: this.includes,
        });
        return industries.map(industry => this.transform(industry));
    }

    async findByExternalId(externalId: string): Promise<IndustryModel | null> {
        const industry = await this.client.findUnique({
            where: { externalId, deletedAt: null },
            include: this.includes
        });
        return industry ? this.transform(industry) : null;
    }
} 