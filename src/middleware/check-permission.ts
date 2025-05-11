import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants/roles";
import type { PermissionType } from "@/lib/constants/roles";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function checkPermission(request: NextRequest, permission: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { error: 'Unauthorized: Invalid or expired token' },
                    { status: 401 }
                );
            }
            return NextResponse.json(
                { error: 'Unauthorized: No token provided' },
                { status: 401 }
            );
        }

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
        const hasPermission = userRoles.some(userRole =>
            userRole.role.permissions.some(rp => rp.permission.name === permission)
        );

        return hasPermission;
    } catch (error) {
        console.error("Error checking permissions:", error);
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid or expired token' },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: 'Unauthorized: No token provided' },
            { status: 401 }
        );
    }
}

type APIHandler<T = any> = (request: NextRequest, context: T) => Promise<any>;

export function withPermission<T = any>(permission: PermissionType) {
    return function (handler: APIHandler<T>): APIHandler<T> {
        return async function (request, context) {
            try {
                const result = await checkPermission(request, permission);
                if (result instanceof NextResponse) {
                    return result;
                }
                if (!result) {
                    return NextResponse.json(
                        { error: 'Unauthorized: Insufficient permissions' },
                        { status: 403 }
                    );
                }
                return handler(request, context);
            } catch (error) {
                console.error("Error in permission middleware:", error);
                return NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
                );
            }
        };
    };
} 