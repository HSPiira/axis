import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { ServiceSession, SessionStatus, Prisma } from "@prisma/client"

export interface ServiceSessionModel {
    id: string;
    serviceId: string;
    providerId: string;
    scheduledAt: string;
    completedAt?: string | null;
    status: SessionStatus;
    notes?: string | null;
    feedback?: string | null;
    duration?: number | null;
    location?: string | null;
    cancellationReason?: string | null;
    rescheduleCount: number;
    isGroupSession: boolean;
    staffId?: string | null;
    beneficiaryId?: string | null;
    metadata?: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
    service?: {
        id: string;
        name: string;
        category: {
            name: string;
        };
    };
    provider?: {
        id: string;
        name: string;
        type: string;
    };
    staff?: {
        id: string;
        profile: {
            fullName: string;
        };
    };
    beneficiary?: {
        id: string;
        profile: {
            fullName: string;
        };
    };
}

export interface CreateServiceSessionInput {
    serviceId: string;
    providerId: string;
    scheduledAt: string;
    completedAt?: string | null;
    status?: SessionStatus;
    notes?: string | null;
    feedback?: string | null;
    duration?: number | null;
    location?: string | null;
    cancellationReason?: string | null;
    rescheduleCount?: number;
    isGroupSession?: boolean;
    staffId?: string | null;
    beneficiaryId?: string | null;
    metadata?: Prisma.JsonValue | null;
}

export interface UpdateServiceSessionInput extends Partial<CreateServiceSessionInput> { }

export class ServiceSessionProvider extends BaseProvider<ServiceSessionModel, CreateServiceSessionInput, UpdateServiceSessionInput> {
    protected client = new PrismaClient(prisma.client);
    protected searchFields = ['notes', 'feedback', 'location', 'cancellationReason'];
    protected defaultSort = { field: 'scheduledAt', direction: 'desc' as const };
    protected includes = {
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
        },
        provider: {
            select: {
                id: true,
                name: true,
                type: true
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
        beneficiary: {
            select: {
                id: true,
                profile: {
                    select: {
                        fullName: true
                    }
                }
            }
        }
    };

    protected transform(data: ServiceSession & {
        service?: any;
        provider?: any;
        staff?: any;
        beneficiary?: any;
    }): ServiceSessionModel {
        return {
            id: data.id,
            serviceId: data.serviceId,
            providerId: data.providerId,
            scheduledAt: data.scheduledAt.toISOString(),
            completedAt: data.completedAt?.toISOString() || null,
            status: data.status,
            notes: data.notes,
            feedback: data.feedback,
            duration: data.duration,
            location: data.location,
            cancellationReason: data.cancellationReason,
            rescheduleCount: data.rescheduleCount,
            isGroupSession: data.isGroupSession,
            staffId: data.staffId,
            beneficiaryId: data.beneficiaryId,
            metadata: data.metadata,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            service: data.service,
            provider: data.provider,
            staff: data.staff,
            beneficiary: data.beneficiary
        };
    }

    protected buildWhereClause(filters?: {
        status?: SessionStatus;
        serviceId?: string;
        providerId?: string;
        staffId?: string;
        beneficiaryId?: string;
        isGroupSession?: boolean;
        scheduledAt?: {
            start: string;
            end: string;
        };
    }, search?: string): Prisma.ServiceSessionWhereInput {
        const where: Prisma.ServiceSessionWhereInput = {
            deletedAt: null
        };

        if (filters) {
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.serviceId) {
                where.serviceId = filters.serviceId;
            }
            if (filters.providerId) {
                where.providerId = filters.providerId;
            }
            if (filters.staffId) {
                where.staffId = filters.staffId;
            }
            if (filters.beneficiaryId) {
                where.beneficiaryId = filters.beneficiaryId;
            }
            if (typeof filters.isGroupSession === 'boolean') {
                where.isGroupSession = filters.isGroupSession;
            }
            if (filters.scheduledAt) {
                where.scheduledAt = {
                    gte: new Date(filters.scheduledAt.start),
                    lte: new Date(filters.scheduledAt.end)
                };
            }
        }

        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive'
                }
            }));
        }

        return where;
    }
} 