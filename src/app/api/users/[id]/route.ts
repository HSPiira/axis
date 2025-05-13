import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import type { Prisma } from '@/generated/prisma';

type UserWithProfile = Prisma.UserGetPayload<{
    include: {
        profile: true;
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
            };
        };
    };
}>;

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: params.id
            },
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
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Transform the data to include profile information at the top level
        const transformedUser = {
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
        };

        return NextResponse.json(transformedUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

export const PATCH = withPermission(PERMISSIONS.USER_UPDATE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.email && !data.name) {
            return NextResponse.json(
                { error: "At least one field (email or name) is required" },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 }
                );
            }
        }

        const user = await prisma.user.update({
            where: {
                id: params.id
            },
            data: {
                email: data.email,
                profile: {
                    update: {
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

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}); 