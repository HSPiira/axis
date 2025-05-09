import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Helper function to format role response
function formatRoleResponse(role: any) {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
        usersCount: role.users.length,
        permissions: role.permissions.map((rp: any) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            description: rp.permission.description
        }))
    };
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await params;
        const roleId = resolvedParams.id;

        // Validate request body
        const body = await request.json();
        const { name, description, permissionIds } = body;

        // First verify the role exists
        const existingRole = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: { include: { permission: true } },
                users: true
            }
        });

        if (!existingRole) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        if (name !== undefined) {
            updateData.name = name;
        }
        if (description !== undefined) {
            updateData.description = description;
        }

        // If permissionIds is provided, update permissions
        if (Array.isArray(permissionIds)) {
            // Verify all permission IDs exist
            const existingPermissions = await prisma.permission.findMany({
                where: { id: { in: permissionIds } }
            });

            if (existingPermissions.length !== permissionIds.length) {
                return NextResponse.json(
                    { error: "One or more permissions do not exist" },
                    { status: 400 }
                );
            }

            // Update the role's permissions
            await prisma.rolePermission.deleteMany({
                where: { roleId }
            });

            await prisma.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({
                    roleId,
                    permissionId
                }))
            });
        }

        // Update the role's basic info if needed
        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: updateData,
            include: {
                permissions: { include: { permission: true } },
                users: true
            }
        });

        // Return formatted response
        return NextResponse.json(formatRoleResponse(updatedRole));
    } catch (error) {
        console.error("Error updating role:", error);

        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes("Record to update does not exist")) {
                return NextResponse.json(
                    { error: "Role not found" },
                    { status: 404 }
                );
            }
            if (error.message.includes("Unique constraint failed")) {
                return NextResponse.json(
                    { error: "A role with this name already exists" },
                    { status: 400 }
                );
            }
        }

        // Handle unknown errors
        return NextResponse.json(
            { error: "An unexpected error occurred while updating role" },
            { status: 500 }
        );
    }
} 