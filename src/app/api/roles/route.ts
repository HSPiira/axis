import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                users: true
            }
        });
        // Format roles to include user count and permission list
        const formatted = roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            usersCount: role.users.length,
            permissions: role.permissions.map(rp => ({
                id: rp.permission.id,
                name: rp.permission.name,
                description: rp.permission.description
            }))
        }));
        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json(
            { error: "Failed to fetch roles" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { name, description, permissionIds } = await req.json();
        if (!name || !Array.isArray(permissionIds)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        // Create the role
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    create: permissionIds.map((permissionId) => ({ permission: { connect: { id: permissionId } } }))
                }
            },
            include: {
                permissions: { include: { permission: true } },
                users: true
            }
        });
        // Format response
        const formatted = {
            id: role.id,
            name: role.name,
            description: role.description,
            usersCount: role.users.length,
            permissions: role.permissions.map(rp => ({
                id: rp.permission.id,
                name: rp.permission.name,
                description: rp.permission.description
            }))
        };
        return NextResponse.json(formatted, { status: 201 });
    } catch (error) {
        console.error("Error creating role:", error);
        return NextResponse.json(
            { error: "Failed to create role" },
            { status: 500 }
        );
    }
} 