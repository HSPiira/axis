import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await params;

    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // TODO: Implement actual activity fetching
        // For now, we'll just show a placeholder
        const activities = [
            {
                id: '1',
                type: 'contract',
                description: 'New contract created',
                timestamp: new Date().toISOString()
            },
            {
                id: '2',
                type: 'document',
                description: 'Document uploaded',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ];

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Error fetching client activities:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 