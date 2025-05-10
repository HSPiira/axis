import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { stringify } from "csv-stringify/sync";

// GET /api/industries/export
export const GET = withPermission(PERMISSIONS.INDUSTRY_EXPORT)(async (
    request: NextRequest
) => {
    try {
        // Get all industries with their relationships
        const industries = await prisma.industry.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                        organizations: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Transform data for CSV export
        const csvData = industries.map((industry) => ({
            id: industry.id,
            name: industry.name,
            code: industry.code,
            description: industry.description || "",
            parentId: industry.parentId || "",
            parentName: industry.parent?.name || "",
            parentCode: industry.parent?.code || "",
            childCount: industry._count.children,
            organizationCount: industry._count.organizations,
            createdAt: industry.createdAt.toISOString(),
            updatedAt: industry.updatedAt.toISOString(),
        }));

        // Convert to CSV
        const csv = stringify(csvData, {
            header: true,
            columns: [
                "id",
                "name",
                "code",
                "description",
                "parentId",
                "parentName",
                "parentCode",
                "childCount",
                "organizationCount",
                "createdAt",
                "updatedAt",
            ],
        });

        // Set response headers for file download
        const headers = new Headers();
        headers.set(
            "Content-Type",
            "text/csv; charset=utf-8"
        );
        headers.set(
            "Content-Disposition",
            `attachment; filename="industries-${new Date().toISOString().split("T")[0]}.csv"`
        );

        return new NextResponse(csv, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Error exporting industries:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}); 