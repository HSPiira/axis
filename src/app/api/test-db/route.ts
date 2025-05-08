import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Try to create a test user
        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
            },
        });

        // Delete the test user
        await prisma.user.delete({
            where: { id: user.id },
        });

        return NextResponse.json({ success: true, message: "Database connection working" });
    } catch (error) {
        console.error("Database test error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
