import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ContactMethod, Prisma } from "@/generated/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await prisma.client.findUnique({
            where: { id: params.id },
            select: {
                contactPerson: true,
                contactEmail: true,
                contactPhone: true,
                preferredContactMethod: true
            }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                contactPerson: client.contactPerson,
                contactEmail: client.contactEmail,
                contactPhone: client.contactPhone,
                preferredContactMethod: client.preferredContactMethod
            }
        });
    } catch (error) {
        console.error("Error fetching client contact:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Validate contact method if provided
        if (data.preferredContactMethod && !Object.values(ContactMethod).includes(data.preferredContactMethod)) {
            return NextResponse.json(
                { error: "Invalid contact method" },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const client = await prisma.client.update({
            where: { id: params.id },
            data: {
                contactPerson: data.contactPerson,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                preferredContactMethod: data.preferredContactMethod
            },
            select: {
                contactPerson: true,
                contactEmail: true,
                contactPhone: true,
                preferredContactMethod: true
            }
        });

        return NextResponse.json({
            data: {
                contactPerson: client.contactPerson,
                contactEmail: client.contactEmail,
                contactPhone: client.contactPhone,
                preferredContactMethod: client.preferredContactMethod
            }
        });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
        console.error("Error updating client contact:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 