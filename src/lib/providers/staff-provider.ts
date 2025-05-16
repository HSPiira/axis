import { prisma } from "@/lib/prisma";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { Staff, WorkStatus, StaffRole, Prisma } from "@prisma/client"

// Input types for staff operations
export interface CreateStaffInput {
    profileId: string;
    clientId: string;
    role: StaffRole;
    startDate: string;
    endDate?: string | null;
    status?: WorkStatus;
    qualifications?: string[];
    specializations?: string[];
    preferredWorkingHours?: Record<string, any> | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactEmail?: string | null;
    metadata?: Prisma.JsonValue | null;
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> { }

export interface StaffModel {
    id: string;
    profileId: string;
    clientId: string;
    role: StaffRole;
    startDate: string;
    endDate?: string | null;
    status: WorkStatus;
    qualifications: string[];
    specializations: string[];
    preferredWorkingHours?: Record<string, any> | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactEmail?: string | null;
    metadata?: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        email: string | null;
        status: string;
    };
    profile?: {
        id: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        image: string | null;
    };
    client?: {
        id: string;
        name: string;
        status: string;
    };
    beneficiaries?: Array<{
        id: string;
        relation: string;
        status: string;
        profile: {
            fullName: string;
            email: string | null;
        };
    }>;
    serviceSessions?: Array<{
        id: string;
        scheduledAt: string;
        status: string;
        service: {
            name: string;
            category: {
                name: string;
            };
        };
    }>;
}

export class StaffProvider extends BaseProvider<StaffModel, CreateStaffInput, UpdateStaffInput> {
    protected client = new PrismaClient(prisma.staff);
    protected searchFields = ['profile.fullName', 'profile.email', 'profile.phone'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        user: {
            select: {
                id: true,
                email: true,
                status: true
            }
        },
        profile: {
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                image: true
            }
        },
        client: {
            select: {
                id: true,
                name: true,
                status: true
            }
        },
        beneficiaries: {
            select: {
                id: true,
                relation: true,
                status: true,
                profile: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            }
        },
        ServiceSession: {
            select: {
                id: true,
                scheduledAt: true,
                status: true,
                service: {
                    select: {
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

    protected transform(data: Staff & { profile?: any; user?: any; client?: any; beneficiaries?: any[]; ServiceSession?: any[] }): StaffModel {
        return {
            id: data.id,
            profileId: data.profileId,
            clientId: data.clientId,
            role: data.role,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate?.toISOString() || null,
            status: data.status,
            qualifications: data.qualifications,
            specializations: data.specializations,
            preferredWorkingHours: data.preferredWorkingHours as Record<string, any> | null,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            emergencyContactEmail: data.emergencyContactEmail,
            metadata: data.metadata,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            user: data.user,
            profile: data.profile,
            client: data.client,
            beneficiaries: data.beneficiaries,
            serviceSessions: data.ServiceSession
        };
    }

    async getById(id: string): Promise<StaffModel | null> {
        const data = await this.client.findUnique({
            where: { id },
            include: this.includes,
        });
        return data ? this.transform(data as any) : null;
    }

    protected buildWhereClause(filters: Record<string, any>, search: string): Prisma.StaffWhereInput {
        const where: Prisma.StaffWhereInput = {};

        // Apply filters
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.clientId) {
            where.clientId = filters.clientId;
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
