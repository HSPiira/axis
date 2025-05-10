import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";

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
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
            },
        });
        return NextResponse.json(user);
    } catch (error) {
        const isPrismaKnownError = error && ((error as any).constructor?.name === 'PrismaClientKnownRequestError' || (error as any).name === 'PrismaClientKnownRequestError');
        const message = error && (error as any).message ? (error as any).message : '';
        if (
            (error instanceof Error && message.includes('Unique constraint failed')) ||
            (isPrismaKnownError && message.includes('Unique constraint failed'))
        ) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}); 