import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';
import { AuditAction } from '@/lib/audit-log';

// GET /api/permissions
export const GET = withPermission(PERMISSIONS.PERMISSION_READ)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'GET_PERMISSIONS');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const permissions = await prisma.permission.findMany({
            orderBy: { name: 'asc' }
        });

        // Log the successful request
        await auditLog('PERMISSION_LIST' as AuditAction, {
            count: permissions.length
        });

        return NextResponse.json(permissions);
    } catch (error) {
        console.error("Error fetching permissions:", error);
        await auditLog('PERMISSION_LIST_ERROR' as AuditAction, {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch permissions" },
            { status: 500 }
        );
    }
}); 