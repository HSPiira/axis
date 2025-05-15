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

        const industries = await industryProvider.findByParent(params.id);
        return NextResponse.json(industries);
    } catch (error) {
        console.error("Error fetching child industries:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 