import { prisma } from "@/lib/db";
import { BaseProvider, PrismaClient } from "./base-provider";
import type { AssignmentStatus } from "@/generated/prisma";
import type {
    ServiceAssignmentModel,
    ServiceAssignmentResponse,
    CreateServiceAssignmentInput,
    UpdateServiceAssignmentInput,
    ServiceAssignmentFilters
} from "@/lib/types/service-assignment";

// Extended model type that includes relations
type ServiceAssignmentWithRelations = ServiceAssignmentModel & {
    service: {
        id: string;
        name: string;
        description: string | null;
    };
    contract: {
        id: string;
        startDate: Date;
        endDate: Date;
        status: string;
        organization: {
            id: string;
            name: string;
        };
    };
};

export class ServiceAssignmentProvider extends BaseProvider<ServiceAssignmentResponse, CreateServiceAssignmentInput, UpdateServiceAssignmentInput> {
    protected client: DatabaseClient;
    protected searchFields = ['service.name', 'service.description'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        service: {
            select: {
                id: true,
                name: true,
                description: true
            }
        },
        contract: {
            select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }
    };

    constructor() {
        super();
        this.client = new PrismaClient(prisma.serviceAssignment);
    }

    protected transform(assignment: ServiceAssignmentWithRelations): ServiceAssignmentResponse {
        return {
            id: assignment.id,
            serviceId: assignment.serviceId,
            contractId: assignment.contractId,
            status: assignment.status,
            startDate: assignment.startDate.toISOString(),
            endDate: assignment.endDate?.toISOString() || null,
            frequency: assignment.frequency,
            isActive: assignment.isActive,
            organizationId: assignment.organizationId,
            createdAt: assignment.createdAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString(),
            service: {
                id: assignment.service.id,
                name: assignment.service.name,
                description: assignment.service.description
            },
            contract: {
                id: assignment.contract.id,
                startDate: assignment.contract.startDate.toISOString(),
                endDate: assignment.contract.endDate.toISOString(),
                status: assignment.contract.status,
                organization: {
                    id: assignment.contract.organization.id,
                    name: assignment.contract.organization.name
                }
            }
        };
    }

    protected buildWhereClause(filters: ServiceAssignmentFilters, search: string): any {
        const where: any = { ...filters };

        if (search) {
            where.OR = [
                { service: { name: { contains: search, mode: 'insensitive' } } },
                { service: { description: { contains: search, mode: 'insensitive' } } }
            ];
        }

        return where;
    }
} 