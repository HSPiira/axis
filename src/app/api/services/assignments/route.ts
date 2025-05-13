import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { ServiceAssignmentProvider } from "@/lib/providers/service-assignment-provider";
import { getValidatedPaginationParams } from "@/lib/constants/pagination";
import { validateCreateServiceAssignment, validateServiceAssignmentQueryParams } from "@/lib/middleware/validate-service-assignment";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Validate query parameters
        const validation = validateServiceAssignmentQueryParams(searchParams);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: "Invalid query parameters", details: validation.errors },
                { status: 400 }
            );
        }

        const { page, limit } = getValidatedPaginationParams(
            searchParams.get('page'),
            searchParams.get('limit')
        );
        const search = searchParams.get('search') || '';
        const serviceId = searchParams.get('serviceId');
        const contractId = searchParams.get('contractId');
        const status = searchParams.get('status');
        const isActive = searchParams.get('isActive');

        const filters: Record<string, any> = {};
        if (serviceId) filters.serviceId = serviceId;
        if (contractId) filters.contractId = contractId;
        if (status) filters.status = status;
        if (isActive !== null) filters.isActive = isActive === 'true';

        const assignmentProvider = new ServiceAssignmentProvider();
        const result = await assignmentProvider.list({
            page,
            limit,
            search,
            filters,
            sort: {
                field: 'createdAt',
                direction: 'desc'
            }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching service assignments:", error);
        return NextResponse.json(
            { error: "Failed to fetch service assignments" },
            { status: 500 }
        );
    }
}

export const POST = withPermission(PERMISSIONS.SERVICE_ASSIGNMENT_CREATE)(async (request: Request) => {
    try {
        // Validate request body
        const validation = await validateCreateServiceAssignment(request as NextRequest);
        if (!('success' in validation) || !validation.success) {
            return validation;
        }

        const assignmentProvider = new ServiceAssignmentProvider();
        const assignment = await assignmentProvider.create(validation.data);
        return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
        console.error("Error creating service assignment:", error);
        return NextResponse.json(
            { error: "Failed to create service assignment" },
            { status: 500 }
        );
    }
});
