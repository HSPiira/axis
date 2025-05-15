import { NextRequest, NextResponse } from "next/server";
import { IndustryProvider } from "@/lib/providers/industry-provider";
import { auth } from "@/lib/auth";

const industryProvider = new IndustryProvider();

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const parentId = searchParams.get("parentId");
        const externalId = searchParams.get("externalId");

        const filters = {
            ...(parentId && { parentId }),
            ...(externalId && { externalId })
        };

        const result = await industryProvider.list({
            page,
            limit,
            search,
            filters
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching industries:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const industry = await industryProvider.create(data);

        return NextResponse.json(industry, { status: 201 });
    } catch (error) {
        console.error("Error creating industry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 