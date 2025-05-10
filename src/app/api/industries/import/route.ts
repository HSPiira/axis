import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { parse } from "csv-parse/sync";

// POST /api/industries/import
export const POST = withPermission(PERMISSIONS.INDUSTRY_IMPORT)(async (
    request: NextRequest
) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "CSV file is required" },
                { status: 400 }
            );
        }

        // Read and parse CSV file
        const csvContent = await file.text();
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        // Validate CSV structure
        for (const record of records) {
            if (!record.name || !record.code) {
                return NextResponse.json(
                    {
                        error: "CSV must contain 'name' and 'code' columns for each record",
                    },
                    { status: 400 }
                );
            }
        }

        // Process records in batches to avoid memory issues
        const batchSize = 100;
        const results = {
            created: 0,
            errors: [] as string[],
        };

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            try {
                // Create industries in a transaction
                const createdIndustries = await prisma.$transaction(
                    batch.map((record: any) =>
                        prisma.industry.create({
                            data: {
                                name: record.name,
                                code: record.code,
                                description: record.description,
                                parentId: record.parentId || null,
                            },
                        })
                    )
                );
                results.created += createdIndustries.length;
            } catch (error: any) {
                results.errors.push(
                    `Error processing batch ${i / batchSize + 1}: ${error.message}`
                );
            }
        }

        return NextResponse.json({
            data: results,
            meta: {
                total: records.length,
                processed: results.created,
                errors: results.errors.length,
            },
        });
    } catch (error: any) {
        console.error("Error importing industries:", error);
        return NextResponse.json(
            {
                error: "Error processing CSV file",
                details: error.message,
            },
            { status: 500 }
        );
    }
}); 