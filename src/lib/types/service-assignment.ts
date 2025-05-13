import type { AssignmentStatus } from "@/generated/prisma";

// Base types from Prisma
export type ServiceAssignmentModel = {
    id: string;
    serviceId: string;
    contractId: string;
    status: AssignmentStatus;
    startDate: Date;
    endDate: Date | null;
    frequency: string;
    isActive: boolean;
    organizationId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    metadata: Record<string, any> | null;
};

// API Response types
export type ServiceAssignmentResponse = {
    id: string;
    serviceId: string;
    contractId: string;
    status: AssignmentStatus;
    startDate: string;
    endDate: string | null;
    frequency: string;
    isActive: boolean;
    organizationId: string | null;
    createdAt: string;
    updatedAt: string;
    service: {
        id: string;
        name: string;
        description: string | null;
    };
    contract: {
        id: string;
        startDate: string;
        endDate: string;
        status: string;
        organization: {
            id: string;
            name: string;
        };
    };
};

// Input types
export type CreateServiceAssignmentInput = Pick<ServiceAssignmentModel,
    'serviceId' |
    'contractId' |
    'startDate' |
    'frequency'
> & {
    endDate?: Date;
    organizationId?: string;
};

export type UpdateServiceAssignmentInput = Partial<CreateServiceAssignmentInput> & {
    status?: AssignmentStatus;
    isActive?: boolean;
};

// List response type
export type ServiceAssignmentListResponse = {
    data: ServiceAssignmentResponse[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
};

// Filter types
export type ServiceAssignmentFilters = {
    serviceId?: string;
    contractId?: string;
    status?: AssignmentStatus;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    organizationId?: string;
}; 