import { prisma } from "@/lib/db";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { ServiceStatus } from "@/generated/prisma";

// Service types
export interface Service {
    id: string;
    name: string;
    description?: string | null;
    category: {
        id: string;
        name: string;
        description?: string | null;
    };
    status: ServiceStatus;
    duration?: number | null;
    capacity?: number | null;
    prerequisites?: string | null;
    isPublic: boolean;
    price?: number | null;
    provider?: {
        id: string;
        name: string;
        type: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceInput {
    name: string;
    description?: string;
    categoryId: string;
    duration?: number;
    capacity?: number;
    prerequisites?: string;
    isPublic?: boolean;
    price?: number;
    serviceProviderId?: string;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
    status?: ServiceStatus;
}

export class ServiceProvider extends BaseProvider<Service, CreateServiceInput, UpdateServiceInput> {
    protected client: DatabaseClient;
    protected searchFields = ['name', 'description'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        category: true,
        ServiceProvider: {
            select: {
                id: true,
                name: true,
                type: true
            }
        }
    };

    constructor() {
        super();
        this.client = new PrismaClient(prisma.service);
    }

    protected transform(service: any): Service {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            category: {
                id: service.category.id,
                name: service.category.name,
                description: service.category.description
            },
            status: service.status,
            duration: service.duration,
            capacity: service.capacity,
            prerequisites: service.prerequisites,
            isPublic: service.isPublic,
            price: service.price,
            provider: service.ServiceProvider ? {
                id: service.ServiceProvider.id,
                name: service.ServiceProvider.name,
                type: service.ServiceProvider.type
            } : null,
            createdAt: service.createdAt.toISOString(),
            updatedAt: service.updatedAt.toISOString()
        };
    }

    protected buildWhereClause(filters: Record<string, any>, search: string): any {
        const where: any = { ...filters };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        return where;
    }
}
