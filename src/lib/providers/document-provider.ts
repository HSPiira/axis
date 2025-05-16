import { prisma } from '@/lib/prisma';
import type { Document, Prisma, DocumentType } from '@prisma/client';

export type DocumentModel = Document;

export type ListOptions = {
    clientId?: string;
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
        type?: DocumentType;
        isConfidential?: boolean;
    };
    sort?: {
        field: keyof Document;
        direction: 'asc' | 'desc';
    };
};

export class DocumentProvider {
    private document = prisma.document;

    async list(options: ListOptions = {}) {
        const {
            page = 1,
            limit = 10,
            search,
            filters,
            sort = { field: 'createdAt', direction: 'desc' },
            clientId
        } = options;

        const where: Prisma.DocumentWhereInput = {
            ...(clientId && { clientId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(filters?.type && { type: filters.type }),
            ...(filters?.isConfidential !== undefined && { isConfidential: filters.isConfidential }),
        };

        const [data, total] = await Promise.all([
            this.document.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sort.field]: sort.direction },
            }),
            this.document.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async get(id: string) {
        return this.document.findUnique({
            where: { id },
        });
    }

    async create(data: Prisma.DocumentCreateInput) {
        return this.document.create({
            data,
        });
    }

    async update(id: string, data: Prisma.DocumentUpdateInput) {
        return this.document.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.document.delete({
            where: { id },
        });
    }
} 