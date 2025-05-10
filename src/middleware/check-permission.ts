import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants/roles";
import type { PermissionType } from "@/lib/constants/roles";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function getUserFromToken(token: string) {
    try {
        console.log("Verifying JWT token...");
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "your-test-secret-key-for-development");
        console.log("Using secret:", process.env.AUTH_SECRET || "your-test-secret-key-for-development");
        const { payload } = await jwtVerify(token, secret);
        console.log("JWT payload:", payload);
        return { id: payload.sub };
    } catch (error) {
        console.error("Error verifying JWT:", error);
        return null;
    }
}

export async function checkPermission(
    request: NextRequest,
    requiredPermission: PermissionType
) {
    try {
        console.log("Checking permission:", requiredPermission);
        // First try to get user from session
        const session = await auth();
        let userId = session?.user?.id;
        console.log("Session user ID:", userId);

        // If no session, try to get user from Bearer token
        if (!userId) {
            const authHeader = request.headers.get("authorization");
            console.log("Auth header:", authHeader);
            if (authHeader?.startsWith("Bearer ")) {
                const token = authHeader.substring(7);
                console.log("Found Bearer token");
                const user = await getUserFromToken(token);
                userId = user?.id;
                console.log("User ID from token:", userId);
            }
        }

        if (!userId) {
            console.log("No user ID found");
            return false;
        }

        // Get user's roles with their permissions
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
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
            console.log("User is admin");
            return true;
        }

        // Check if user has the required permission through any of their roles
        const hasPermission = userRoles.some(userRole =>
            userRole.role.permissions.some(
                rolePermission => rolePermission.permission.name === requiredPermission
            )
        );
        console.log("Has permission:", hasPermission);
        return hasPermission;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

// Higher-order function to protect API routes
export function withPermission(permission: PermissionType) {
    return function (handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
        return async function (request: NextRequest, ...args: any[]) {
            const hasPermission = await checkPermission(request, permission);

            if (!hasPermission) {
                return NextResponse.json(
                    { error: 'Unauthorized: Insufficient permissions' },
                    { status: 403 }
                );
            }

            return handler(request, ...args);
        };
    };
} 