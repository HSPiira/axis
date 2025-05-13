import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { ServiceProvider } from "@/lib/providers/service-provider";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const serviceProvider = new ServiceProvider();
        const service = await serviceProvider.get(params.id);

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json(
            { error: "Failed to fetch service" },
            { status: 500 }
        );
    }
}

export const PATCH = withPermission(PERMISSIONS.SERVICE_UPDATE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const data = await request.json();
        const serviceProvider = new ServiceProvider();

        // Validate required fields if updating name or category
        if (data.name === '' || data.categoryId === '') {
            return NextResponse.json(
                { error: "Name and category cannot be empty" },
                { status: 400 }
            );
        }

        const service = await serviceProvider.update(params.id, data);
        return NextResponse.json(service);
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json(
            { error: "Failed to update service" },
            { status: 500 }
        );
    }
});

export const DELETE = withPermission(PERMISSIONS.SERVICE_DELETE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const serviceProvider = new ServiceProvider();
        await serviceProvider.delete(params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json(
            { error: "Failed to delete service" },
            { status: 500 }
        );
    }
});
