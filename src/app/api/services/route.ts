import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { ServiceProvider } from "@/lib/providers/service-provider";
import { getValidatedPaginationParams } from "@/lib/constants/pagination";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const { page, limit } = getValidatedPaginationParams(
            searchParams.get('page'),
            searchParams.get('limit')
        );
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId');
        const status = searchParams.get('status');
        const isPublic = searchParams.get('isPublic');

        const filters: Record<string, any> = {};
        if (categoryId) filters.categoryId = categoryId;
        if (status) filters.status = status;
        if (isPublic !== null) filters.isPublic = isPublic === 'true';

        const serviceProvider = new ServiceProvider();
        const result = await serviceProvider.list({
            page,
            limit,
            search,
            filters,
            sort: {
                field: 'createdAt',
                direction: 'desc'
            }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}

export const POST = withPermission(PERMISSIONS.SERVICE_CREATE)(async (request: Request) => {
    try {
        const data = await request.json();
        const serviceProvider = new ServiceProvider();

        // Validate required fields
        if (!data.name || !data.categoryId) {
            return NextResponse.json(
                { error: "Name and category are required" },
                { status: 400 }
            );
        }

        const service = await serviceProvider.create(data);
        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json(
            { error: "Failed to create service" },
            { status: 500 }
        );
    }
});
