import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const body = await request.json();
        const { name, roleId } = body;

        // First verify the user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        if (name !== undefined) {
            updateData.name = name;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        // If roleId is provided, update the user's role
        if (roleId !== undefined) {
            // First remove existing role
            await prisma.userRole.deleteMany({
                where: { userId }
            });

            // Then add new role
            await prisma.userRole.create({
                data: {
                    userId,
                    roleId
                }
            });

            // Fetch updated user with new role
            const userWithNewRole = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userRoles: {
                        include: {
                            role: true
                        }
                    }
                }
            });

            return NextResponse.json(userWithNewRole);
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);

        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes("Record to update does not exist")) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }
        }

        // Handle unknown errors
        return NextResponse.json(
            { error: "An unexpected error occurred while updating user" },
            { status: 500 }
        );
    }
} 