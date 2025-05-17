import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Beneficiary, BaseStatus, RelationType, Language, Prisma } from "@prisma/client"

export interface BeneficiaryModel {
    id: string;
    profileId: string;
    relation: RelationType;
    isStaffLink: boolean;
    staffId: string;
    guardianId?: string | null;
    userLinkId?: string | null;
    status: BaseStatus;
    lastServiceDate?: string | null;
    preferredLanguage?: Language | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    profile?: {
        id: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        image: string | null;
    };
    staff?: {
        id: string;
        profile: {
            fullName: string;
        };
    };
    guardian?: {
        id: string;
        email: string | null;
    };
    userLink?: {
        id: string;
        email: string | null;
    };
    serviceSessions?: Array<{
        id: string;
        scheduledAt: string;
        status: string;
        service: {
            name: string;
        };
    }>;
}

// Input types for beneficiary operations
export interface CreateBeneficiaryInput {
    profileId: string;
    relation: RelationType;
    isStaffLink: boolean;
    staffId: string;
    guardianId?: string | null;
    userLinkId?: string | null;
    status?: BaseStatus;
    preferredLanguage?: Language | null;
    notes?: string | null;
}

export interface UpdateBeneficiaryInput extends Partial<CreateBeneficiaryInput> { }

export interface BeneficiaryFilters {
    status?: BaseStatus;
    relation?: RelationType;
    staffId?: string | string[];
    guardianId?: string;
}

export class BeneficiaryProvider extends BaseProvider<BeneficiaryModel, CreateBeneficiaryInput, UpdateBeneficiaryInput> {
    protected client = new PrismaClient(prisma.beneficiary);
    protected searchFields = ['profile.fullName', 'profile.email', 'profile.phone'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        profile: {
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                image: true
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
        guardian: {
            select: {
                id: true,
                email: true
            }
        },
        userLink: {
            select: {
                id: true,
                email: true
            }
        },
        ServiceSession: {
            select: {
                id: true,
                scheduledAt: true,
                status: true,
                service: {
                    select: {
                        name: true
                    }
                }
            }
        }
    };

    protected transform(data: Beneficiary & { profile?: any; staff?: any; guardian?: any; userLink?: any; ServiceSession?: any[] }): BeneficiaryModel {
        return {
            id: data.id,
            profileId: data.profileId,
            relation: data.relation,
            isStaffLink: data.isStaffLink,
            staffId: data.staffId,
            guardianId: data.guardianId,
            userLinkId: data.userLinkId,
            status: data.status,
            lastServiceDate: data.lastServiceDate?.toISOString() || null,
            preferredLanguage: data.preferredLanguage,
            notes: data.notes,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            profile: data.profile,
            staff: data.staff,
            guardian: data.guardian,
            userLink: data.userLink,
            serviceSessions: data.ServiceSession
        };
    }

    async getById(id: string): Promise<BeneficiaryModel | null> {
        const data = await this.client.findUnique({
            where: { id },
            include: this.includes,
        });
        return data ? this.transform(data as any) : null;
    }

    protected buildWhereClause(filters: BeneficiaryFilters, search: string): Prisma.BeneficiaryWhereInput {
        const where: Prisma.BeneficiaryWhereInput = {};

        // Apply filters
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.relation) {
            where.relation = filters.relation;
        }
        if (filters.staffId) {
            if (Array.isArray(filters.staffId)) {
                where.staffId = { in: filters.staffId };
            } else {
                where.staffId = filters.staffId;
            }
        }
        if (filters.guardianId) {
            where.guardianId = filters.guardianId;
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
}
