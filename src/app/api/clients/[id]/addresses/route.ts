import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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
                address: true,
                billingAddress: true
            }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                primary: client.address,
                billing: client.billingAddress
            }
        });
    } catch (error) {
        console.error("Error fetching client addresses:", error);
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

        // Validate required fields
        if (!data.primary && !data.billing) {
            return NextResponse.json(
                { error: "At least one address field is required" },
                { status: 400 }
            );
        }

        const client = await prisma.client.update({
            where: { id: params.id },
            data: {
                address: data.primary,
                billingAddress: data.billing
            },
            select: {
                address: true,
                billingAddress: true
            }
        });

        return NextResponse.json({
            data: {
                primary: client.address,
                billing: client.billingAddress
            }
        });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
        console.error("Error updating client addresses:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 