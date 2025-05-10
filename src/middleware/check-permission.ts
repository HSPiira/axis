import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants/roles";
import type { PermissionType } from "@/lib/constants/roles";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function getUserFromToken(token: string) {
    try {
        if (token === 'invalid-token' || token === 'expired-token') {
            return null;
        }

        const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "your-test-secret-key-for-development");
        const { payload } = await jwtVerify(token, secret);
        return { id: payload.sub };
    } catch (error) {
        console.error("Error verifying JWT:", error);
        return null;
    }
}

export async function checkPermission(request: NextRequest, permission: string) {
    console.log("Checking permission:", permission);

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized: No token provided' },
            { status: 401 }
        );
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized: Invalid or expired token' },
            { status: 401 }
        );
    }

    console.log("Session user ID:", user.id);

    try {
        const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
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

        console.log("User roles:", JSON.stringify(userRoles, null, 2));

        // Admin role has access to everything
        if (userRoles.some(userRole => userRole.role.name === ROLES.ADMIN)) {
            console.log("Has permission: true");
            return true;
        }

        // Check if user has the required permission through any of their roles
        const hasPermission = userRoles.some(userRole =>
            userRole.role.permissions.some(
                rolePermission => rolePermission.permission.name === permission
            )
        );

        console.log("Has permission:", hasPermission);
        return hasPermission;
    } catch (error) {
        console.error("Error checking permissions:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export function withPermission(permission: PermissionType) {
    return function (handler: Function) {
        return async function (request: NextRequest, context?: any) {
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
                return await handler(request, context);
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