console.log('IMPORT: roles/[id]/route.ts');
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, Role } from "@prisma/client";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';
import { AuditAction } from '@/lib/audit-log';

type RoleWithPermissions = Role & {
    usersCount: number;
    permissions: {
        id: string;
        name: string;
        description: string | null;
    }[];
};

const MAX_NAME_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

// Helper function to format role response
function formatRoleResponse(role: Role & {
    users?: { id: string }[];
    permissions?: {
        permission?: {
            id: string;
            name: string;
            description: string | null;
        };
    }[];
}): RoleWithPermissions {
    if (!role) {
        throw new Error('Role not found');
    }
    return {
        ...role,
        usersCount: (role.users ?? []).length,
        permissions: (role.permissions ?? []).map((rp) => ({
            id: rp.permission?.id ?? '',
            name: rp.permission?.name ?? '',
            description: rp.permission?.description ?? null
        }))
    };
}

// GET /api/roles/[id]
export const GET = withPermission(PERMISSIONS.ROLE_READ)(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    console.log('ROLES BY ID HANDLER CALLED');
    try {
        const { id } = await context.params;

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } },
                users: true
            }
        });

        if (!role) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Log the successful request
        await auditLog('ROLE_LIST', {
            roleId: id
        });

        return NextResponse.json(formatRoleResponse(role));
    } catch (error) {
        console.error("Error fetching role:", error);
        const { id } = await context.params;
        await auditLog('ROLE_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error',
            roleId: id
        });
        if (error instanceof Error && error.message === 'Role not found') {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch role" },
            { status: 500 }
        );
    }
});

// PATCH /api/roles/[id]
export const PATCH = withPermission(PERMISSIONS.ROLE_UPDATE)(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PATCH_ROLE');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const { id } = await context.params;

        // Validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { name, description, permissionIds } = body;

        // First verify the role exists
        const existingRole = await prisma.role.findUnique({
            where: { id },
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

        // Validate input
        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return NextResponse.json(
                    { error: "Role name cannot be empty" },
                    { status: 400 }
                );
            }
            if (trimmedName.length > 50) {
                return NextResponse.json(
                    { error: "Role name cannot exceed 50 characters" },
                    { status: 400 }
                );
            }

            // Check for existing role with same name (excluding current role)
            const existingRoleWithName = await prisma.role.findFirst({
                where: {
                    name: trimmedName,
                    id: { not: id }
                }
            });

            if (existingRoleWithName) {
                return NextResponse.json(
                    { error: "A role with this name already exists" },
                    { status: 400 }
                );
            }
        }

        if (description !== undefined && description?.trim().length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                { error: "Description exceeds maximum length" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: Prisma.RoleUpdateInput = {};
        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description?.trim();
        }

        // Update permissions if provided
        if (permissionIds) {
            // First, remove all existing permissions
            await prisma.rolePermission.deleteMany({
                where: { roleId: id }
            });

            // Then add the new permissions
            if (permissionIds.length > 0) {
                await prisma.rolePermission.createMany({
                    data: permissionIds.map((permissionId: string) => ({
                        roleId: id,
                        permissionId
                    }))
                });
            }
        }

        try {
            // Update the role's basic info if needed
            const updatedRole = await prisma.role.update({
                where: { id },
                data: updateData,
                include: {
                    permissions: { include: { permission: true } },
                    users: true
                }
            });

            // Log the successful update
            await auditLog('ROLE_UPDATE' as AuditAction, {
                roleId: id,
                name: updatedRole.name,
                permissionCount: (updatedRole.permissions ?? []).length
            });

            // Return formatted response
            return NextResponse.json(formatRoleResponse(updatedRole));
        } catch (error) {
            console.error("Error updating role:", error);
            await auditLog('ROLE_UPDATE_ERROR' as AuditAction, {
                error: error instanceof Error ? error.message : 'Unknown error',
                roleId: id
            });
            return NextResponse.json(
                { error: "An unexpected error occurred while updating role" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error updating role:", error);
        const { id } = await context.params;
        await auditLog('ROLE_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error',
            roleId: id
        });
        return NextResponse.json(
            { error: "An unexpected error occurred while updating role" },
            { status: 500 }
        );
    }
});

// DELETE /api/roles/[id]
export const DELETE = withPermission(PERMISSIONS.ROLE_DELETE)(async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await context.params;

        // First verify the role exists and get its details
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                users: true
            }
        });

        if (!role) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Prevent deleting the admin role
        if (role.name === 'admin') {
            return NextResponse.json(
                { error: "Cannot delete admin role" },
                { status: 400 }
            );
        }

        // Prevent deleting roles with assigned users
        if ((role.users ?? []).length > 0) {
            return NextResponse.json(
                { error: "Cannot delete role with assigned users" },
                { status: 400 }
            );
        }

        // Delete the role
        await prisma.role.delete({
            where: { id }
        });

        // Log the successful deletion
        await auditLog('ROLE_DELETE', {
            roleId: id,
            name: role.name
        });

        return NextResponse.json({
            message: "Role deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting role:", error);
        const { id } = await context.params;
        await auditLog('ROLE_DELETE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error',
            roleId: id
        });
        return NextResponse.json(
            { error: "Failed to delete role" },
            { status: 500 }
        );
    }
}); 