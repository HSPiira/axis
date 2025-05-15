import { NextRequest, NextResponse } from "next/server";
import { IndustryProvider } from "@/lib/providers/industry-provider";
import { auth } from "@/lib/auth";

const industryProvider = new IndustryProvider();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const industry = await industryProvider.get(params.id);
        if (!industry) {
            return NextResponse.json({ error: "Industry not found" }, { status: 404 });
        }

        return NextResponse.json(industry);
    } catch (error) {
        console.error("Error fetching industry:", error);
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
        console.error("Error updating industry:", error);
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

        await industryProvider.delete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting industry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 