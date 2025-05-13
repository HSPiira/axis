import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';
import type { Prisma } from '@/generated/prisma';

// Utility to robustly extract error code from error objects, even if nested
function getErrorCode(
    error: Error | PrismaClientKnownRequestError | Record<string, any> | null | undefined
): string | undefined {
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

type UserWithProfile = Prisma.UserGetPayload<{
    include: {
        profile: true;
        userRoles: {
            include: {
                role: true;
            };
        };
    };
}>;

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                userRoles: {
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
                },
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        image: true,
                        phone: true,
                        email: true,
                        updatedAt: true
                    }
                },
                sessions: {
                    select: {
                        expires: true
                    },
                    orderBy: {
                        expires: 'desc'
                    },
                    take: 1
                },
                accounts: {
                    select: {
                        provider: true,
                        type: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform the data to include profile information at the top level
        const transformedUsers = users.map(user => ({
            id: user.id,
            profile: {
                fullName: user.profile?.fullName || 'Unnamed User',
                image: user.profile?.image,
                email: user.profile?.email || user.email,
                phone: user.profile?.phone
            },
            userRoles: user.userRoles.map(ur => ({
                role: {
                    id: ur.role.id,
                    name: ur.role.name,
                    description: ur.role.description,
                    permissions: ur.role.permissions.map(p => ({
                        permission: {
                            id: p.permission.id,
                            name: p.permission.name,
                            description: p.permission.description
                        }
                    }))
                }
            })),
            sessions: user.sessions,
            accounts: user.accounts,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            profileUpdatedAt: user.profile?.updatedAt?.toISOString()
        }));

        return NextResponse.json(transformedUsers);
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
                profile: {
                    create: {
                        fullName: data.name,
                        image: data.image,
                        phone: data.phone,
                        email: data.email
                    }
                }
            },
            include: {
                profile: true
            }
        });

        // Ensure the response is JSON serializable
        const responseData = {
            id: user.id,
            email: user.profile?.email || user.email,
            name: user.profile?.fullName,
            image: user.profile?.image,
            phone: user.profile?.phone,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            profileUpdatedAt: user.profile?.updatedAt?.toISOString()
        };

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("Error creating user:", error);

        // Use getErrorCode utility
        const errorCode = getErrorCode(error as Error | PrismaClientKnownRequestError | Record<string, any> | null | undefined);
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