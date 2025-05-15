import { NextRequest, NextResponse } from "next/server";
import { ClientIndustryProvider } from "@/lib/providers/client-industry-provider";
import { auth } from "@/lib/auth";

const industryProvider = new ClientIndustryProvider();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const industry = await industryProvider.findByClient(params.id);
        return NextResponse.json(industry);
    } catch (error) {
        console.error("Error fetching client industry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const industry = await industryProvider.create({
            ...data,
            clientId: params.id
        });

        return NextResponse.json(industry, { status: 201 });
    } catch (error) {
        console.error("Error creating client industry:", error);
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
        const industry = await industryProvider.update(params.id, data);

        return NextResponse.json(industry);
    } catch (error) {
        console.error("Error updating client industry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const industry = await industryProvider.delete(params.id);
        return NextResponse.json(industry);
    } catch (error) {
        console.error("Error deleting client industry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 