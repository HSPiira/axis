import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Client, Industry, BaseStatus, ContactMethod, Prisma } from "@prisma/client"

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
    metadata?: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
    staff?: Array<{
        id: string;
        profile: {
            fullName: string;
        };
    }>;
    contracts?: Array<{
        id: string;
        status: string;
        startDate: string;
        endDate: string;
    }>;
    documents?: Array<{
        id: string;
        title: string;
        type: string;
        status: string;
    }>;
    kpis?: Array<{
        id: string;
        name: string;
        status: string;
    }>;
    kpiAssignments?: Array<{
        id: string;
        status: string;
        startDate: string;
        endDate: string;
    }>;
    serviceAssignments?: Array<{
        id: string;
        status: string;
        startDate: string;
        endDate: string;
    }>;
}

export interface CreateClientInput {
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
    industryId?: string;
    preferredContactMethod?: ContactMethod | null;
    timezone?: string | null;
    notes?: string | null;
    metadata?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    status: BaseStatus;
    isVerified: boolean;
}

export interface UpdateClientInput extends Partial<CreateClientInput> { }

export interface ClientFilters {
    status?: BaseStatus;
    isVerified?: boolean;
    industryId?: string;
    preferredContactMethod?: ContactMethod;
    createdAt?: {
        gte?: string;
        lte?: string;
    };
}

interface ListOptions {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
        status?: BaseStatus;
        industryId?: string;
        isVerified?: boolean;
        createdAt?: {
            gte?: string;
            lte?: string;
        };
    };
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
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
        },
        staff: {
            select: {
                id: true,
                profile: {
                    select: {
                        fullName: true
                    }
                }
            }
        },
        contracts: {
            select: {
                id: true,
                status: true,
                startDate: true,
                endDate: true
            }
        },
        documents: {
            select: {
                id: true,
                title: true,
                type: true,
                status: true
            }
        },
        kpis: {
            select: {
                id: true,
                name: true,
                description: true,
                typeId: true,
                unit: true,
                unitType: true,
                targetValue: true,
                isPublic: true,
                calculationMethod: true,
                frequency: true,
                metadata: true,
                createdAt: true,
                updatedAt: true
            }
        },
        kpiAssignments: {
            select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true
            }
        },
        serviceAssignments: {
            select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        }
    };

    protected transform(data: Client & {
        industry?: Pick<Industry, 'id' | 'name' | 'code'> | null;
        staff?: Array<{ id: string; profile: { fullName: string } }>;
        contracts?: Array<{ id: string; status: string; startDate: string; endDate: string }>;
        documents?: Array<{ id: string; title: string; type: string; status: string }>;
        kpis?: Array<{ id: string; name: string; status: string }>;
        kpiAssignments?: Array<{ id: string; status: string; startDate: string; endDate: string }>;
        serviceAssignments?: Array<{ id: string; status: string; startDate: string; endDate: string }>;
    }): ClientModel {
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
            metadata: data.metadata,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            staff: data.staff,
            contracts: data.contracts,
            documents: data.documents,
            kpis: data.kpis,
            kpiAssignments: data.kpiAssignments,
            serviceAssignments: data.serviceAssignments
        };
    }

    protected buildWhereClause(filters: ClientFilters, search: string): Prisma.ClientWhereInput {
        const where: Prisma.ClientWhereInput = {};

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
        if (filters.createdAt) {
            where.createdAt = {
                ...(filters.createdAt.gte ? { gte: new Date(filters.createdAt.gte) } : {}),
                ...(filters.createdAt.lte ? { lte: new Date(filters.createdAt.lte) } : {})
            };
        }

        // Apply search
        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' as Prisma.QueryMode }
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
        return clients.map(client => this.transform(client));
    }

    async findByStatus(status: BaseStatus): Promise<ClientModel[]> {
        const clients = await this.client.findMany({
            where: { status, deletedAt: null },
            include: this.includes
        });
        return clients.map(client => this.transform(client));
    }

    async verifyClient(id: string): Promise<ClientModel> {
        const client = await this.client.update({
            where: { id },
            data: { isVerified: true },
            include: this.includes
        });
        return this.transform(client);
    }

    async updateStatus(id: string, status: BaseStatus): Promise<ClientModel> {
        const client = await this.client.update({
            where: { id },
            data: { status },
            include: this.includes
        });
        return this.transform(client);
    }

    async list(options: ListOptions = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = this.defaultSort,
        } = options;

        const where = this.buildWhereClause(filters, search);

        const [data, total] = await Promise.all([
            this.client.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { [sort.field]: sort.direction },
                include: this.includes
            }),
            this.client.count({ where })
        ]);

        return {
            data: data.map(client => this.transform(client)),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    }

    async create(data: CreateClientInput): Promise<ClientModel> {
        const { industryId, ...rest } = data;
        const createData: Prisma.ClientCreateInput = {
            ...rest,
            industry: industryId ? { connect: { id: industryId } } : undefined
        };
        const client = await this.client.create({
            data: createData,
            include: this.includes
        });
        return this.transform(client);
    }

    async update(id: string, data: UpdateClientInput): Promise<ClientModel> {
        const updateData: Prisma.ClientUpdateInput = {
            ...data,
            industry: data.industryId ? { connect: { id: data.industryId } } : undefined
        };
        const client = await this.client.update({
            where: { id },
            data: updateData,
            include: this.includes
        });
        return this.transform(client);
    }

    async delete(id: string): Promise<ClientModel> {
        const client = await this.client.delete({
            where: { id }
        });
        return this.transform(client);
    }

    async getById(id: string): Promise<ClientModel | null> {
        const client = await this.client.findUnique({
            where: { id },
            include: this.includes
        });
        return client ? this.transform(client) : null;
    }
} 