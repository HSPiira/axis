console.log('IMPORT: roles/route.ts');
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, Role } from "@prisma/client";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

// Type for role with permissions
type RoleWithPermissions = Role & {
    usersCount: number;
    permissions: {
        id: string;
        name: string;
        description: string | null;
    }[];
};

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 1000;

// GET /api/roles
export const GET = withPermission(PERMISSIONS.ROLE_READ)(async (request: NextRequest) => {
    console.log('ROLES LIST HANDLER CALLED');
    try {
        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const search = searchParams.get('search') || '';

        // Handle invalid numbers
        if (isNaN(page)) page = 1;
        if (isNaN(limit)) limit = 10;

        // Validate search length
        if (search.length > 255) {
            return NextResponse.json(
                { error: "Search query too long" },
                { status: 400 }
            );
        }

        const where: Prisma.RoleWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
        } : {};

        try {
            const [roles, total] = await Promise.all([
                prisma.role.findMany({
                    where,
                    take: limit,
                    skip: (page - 1) * limit,
                    orderBy: { name: 'asc' },
                    include: {
                        permissions: {
                            include: { permission: true }
                        },
                        users: true
                    }
                }),
                prisma.role.count({ where })
            ]);

            // Format roles to include user count and permission list
            const formatted: RoleWithPermissions[] = roles.map(role => ({
                ...role,
                usersCount: (role.users ?? []).length,
                permissions: (role.permissions ?? []).map(rp => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    description: rp.permission.description
                }))
            }));

            // Log the successful request
            await auditLog('ROLE_LIST', {
                page,
                limit,
                search,
                total
            });

            return NextResponse.json({
                data: formatted,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            });
        } catch (error) {
            console.error("Error fetching roles:", error);
            await auditLog('ROLE_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return NextResponse.json(
                { error: "Failed to fetch roles" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in GET /roles:", error);
        await auditLog('ROLE_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch roles" },
            { status: 500 }
        );
    }
});

// POST /api/roles
export const POST = withPermission(PERMISSIONS.ROLE_CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_ROLES');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate required fields and length constraints
        const name = body.name?.trim();
        const description = body.description?.trim();
        const permissionIds = body.permissionIds;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        if (name.length > MAX_NAME_LENGTH) {
            return NextResponse.json(
                { error: "Name exceeds maximum length" },
                { status: 400 }
            );
        }

        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                { error: "Description exceeds maximum length" },
                { status: 400 }
            );
        }

        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return NextResponse.json(
                { error: "At least one permission is required" },
                { status: 400 }
            );
        }

        // Check for existing role with same name
        const existing = await prisma.role.findFirst({
            where: { name }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Role with this name already exists" },
                { status: 409 }
            );
        }

        // Validate that all permission IDs exist
        const existingPermissions = await prisma.permission.findMany({
            where: {
                id: {
                    in: permissionIds
                }
            }
        });

        if (existingPermissions.length !== permissionIds.length) {
            return NextResponse.json(
                { error: "One or more permission IDs are invalid" },
                { status: 400 }
            );
        }

        try {
            // Create the role with permissions
            const role = await prisma.role.create({
                data: {
                    name,
                    description,
                    permissions: {
                        create: permissionIds.map((permissionId) => ({
                            permission: { connect: { id: permissionId } }
                        }))
                    }
                },
                include: {
                    permissions: { include: { permission: true } },
                    users: true
                }
            });

            // Format response
            const formatted: RoleWithPermissions = {
                ...role,
                usersCount: (role.users ?? []).length,
                permissions: (role.permissions ?? []).map(rp => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    description: rp.permission.description
                }))
            };

            // Log the successful creation
            await auditLog('ROLE_CREATE', {
                roleId: role.id,
                name: role.name,
                permissionCount: permissionIds.length
            });

            return NextResponse.json(formatted, { status: 201 });
        } catch (error) {
            console.error("Error creating role:", error);
            await auditLog('ROLE_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error',
                name,
                permissionCount: permissionIds.length
            });
            return NextResponse.json(
                { error: "Failed to create role" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in POST /roles:", error);
        await auditLog('ROLE_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create role" },
            { status: 500 }
        );
    }
}); 