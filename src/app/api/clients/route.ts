import { NextRequest, NextResponse } from "next/server";
import { ClientProvider } from "@/lib/providers/client-provider";
import { auth } from "@/lib/auth";

const clientProvider = new ClientProvider();

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
        const status = searchParams.get("status");
        const isVerified = searchParams.get("isVerified");
        const industryId = searchParams.get("industryId");
        const preferredContactMethod = searchParams.get("preferredContactMethod");

        const filters = {
            ...(status && { status }),
            ...(isVerified !== null && { isVerified: isVerified === "true" }),
            ...(industryId && { industryId }),
            ...(preferredContactMethod && { preferredContactMethod })
        };

        const result = await clientProvider.list({
            page,
            limit,
            search,
            filters
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching clients:", error);
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
        const client = await clientProvider.create(data);

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 