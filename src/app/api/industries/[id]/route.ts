import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";

// GET /api/industries/[id]
export const GET = withPermission("industry:read")(
    async (
        request: NextRequest,
        { params }: { params: { id: string } }
    ) => {
        const { id } = await Promise.resolve(params);
        try {
            const industry = await prisma.industry.findUnique({
                where: { id },
                include: {
                    parent: true,
                    children: true,
                },
            });

            if (!industry) {
                return NextResponse.json(
                    { error: "Industry not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(industry);
        } catch (error) {
            console.error("Error fetching industry:", error);
            return NextResponse.json(
                { error: "Failed to fetch industry" },
                { status: 500 }
            );
        }
    }
);

// PATCH /api/industries/[id]
export const PATCH = withPermission("industry:update")(
    async (
        request: NextRequest,
        { params }: { params: { id: string } }
    ) => {
        const { id } = await Promise.resolve(params);
        try {
            const body = await request.json();
            const { name, description, parentId } = body;

            const industry = await prisma.industry.update({
                where: { id },
                data: {
                    name,
                    description,
                    parentId,
                },
                include: {
                    parent: true,
                    children: true,
                },
            });

            return NextResponse.json(industry);
        } catch (error) {
            console.error("Error updating industry:", error);
            return NextResponse.json(
                { error: "Failed to update industry" },
                { status: 500 }
            );
        }
    }
);

export const DELETE = withPermission("industry:delete")(
    async (
        request: NextRequest,
        { params }: { params: { id: string } }
    ) => {
        const { id } = await Promise.resolve(params);
        try {
            // First delete all child industries
            await prisma.industry.deleteMany({
                where: { parentId: id },
            });

            // Then delete the parent industry
            await prisma.industry.delete({
                where: { id },
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Error deleting industry:", error);
            return NextResponse.json(
                { error: "Failed to delete industry" },
                { status: 500 }
            );
        }
    }
); 