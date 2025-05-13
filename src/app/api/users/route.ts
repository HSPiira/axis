import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Utility to robustly extract error code from error objects, even if nested
function getErrorCode(error: any): string | undefined {
    if (!error) return undefined;

    // Handle plain objects with code property
    if (typeof error === 'object') {
        if ('code' in error) return error.code;
        if ('error' in error && typeof error.error === 'object' && 'code' in error.error) {
            return error.error.code;
        }
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
        return error.code;
    }

    return undefined;
}

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export const POST = withPermission(PERMISSIONS.USER_CREATE)(async (request: Request) => {
    try {
        const data = await request.json();
        console.log('DEBUG: parsed data', data);

        // Validate required fields
        if (!data.email || !data.name) {
            return NextResponse.json(
                { error: "Email and name are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
            },
        });

        // Ensure the response is JSON serializable
        const responseData = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        };

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("Error creating user:", error);

        // Use getErrorCode utility
        const errorCode = getErrorCode(error);
        switch (errorCode) {
            case 'P2002':
                return NextResponse.json(
                    { error: "User with this email already exists" },
                    { status: 409 }
                );
            case 'P1001':
                return NextResponse.json(
                    { error: "Service temporarily unavailable" },
                    { status: 503 }
                );
            default:
                return NextResponse.json(
                    { error: "Failed to create user" },
                    { status: 500 }
                );
        }
    }
}); 