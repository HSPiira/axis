import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { ServiceAssignmentProvider } from "@/lib/providers/service-assignment-provider";
import { validateUpdateServiceAssignment } from "@/lib/middleware/validate-service-assignment";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const assignmentProvider = new ServiceAssignmentProvider();
        const assignment = await assignmentProvider.get(params.id);

        if (!assignment) {
            return NextResponse.json(
                { error: "Service assignment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Error fetching service assignment:", error);
        return NextResponse.json(
            { error: "Failed to fetch service assignment" },
            { status: 500 }
        );
    }
}

export const PATCH = withPermission(PERMISSIONS.SERVICE_ASSIGNMENT_UPDATE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        // Validate request body
        const validation = await validateUpdateServiceAssignment(request as NextRequest);
        if (!('success' in validation) || !validation.success) {
            return validation;
        }

        const assignmentProvider = new ServiceAssignmentProvider();
        const assignment = await assignmentProvider.update(params.id, validation.data);
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Error updating service assignment:", error);
        return NextResponse.json(
            { error: "Failed to update service assignment" },
            { status: 500 }
        );
    }
});

export const DELETE = withPermission(PERMISSIONS.SERVICE_ASSIGNMENT_DELETE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const assignmentProvider = new ServiceAssignmentProvider();
        await assignmentProvider.delete(params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting service assignment:", error);
        return NextResponse.json(
            { error: "Failed to delete service assignment" },
            { status: 500 }
        );
    }
});
