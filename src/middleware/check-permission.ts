import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants/roles";
import type { PermissionType } from "@/lib/constants/roles";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function checkPermission(
    request: NextRequest,
    requiredPermission: PermissionType
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return false;
        }

        // Get user's roles with their permissions
        const userRoles = await prisma.userRole.findMany({
            where: { userId: session.user.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        // Admin role has access to everything
        if (userRoles.some(userRole => userRole.role.name === ROLES.ADMIN)) {
            return true;
        }

        // Check if user has the required permission through any of their roles
        return userRoles.some(userRole =>
            userRole.role.permissions.some(
                rolePermission => rolePermission.permission.name === requiredPermission
            )
        );
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

// Higher-order function to protect API routes
export function withPermission(permission: PermissionType) {
    return async function (request: NextRequest) {
        const hasPermission = await checkPermission(request, permission);

        if (!hasPermission) {
            return NextResponse.json(
                { error: 'Unauthorized: Insufficient permissions' },
                { status: 403 }
            );
        }

        return NextResponse.next();
    };
} 