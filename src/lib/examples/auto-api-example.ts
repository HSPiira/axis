import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { Prisma, Role } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';

// Base provider interface
interface BaseProvider<T, C, U> {
    list(params: ListParams): Promise<PaginatedResponse<T>>;
    get(id: string): Promise<T | null>;
    create(data: C): Promise<T>;
    update(id: string, data: U): Promise<T>;
    delete(id: string): Promise<void>;
}

// List parameters interface
interface ListParams {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
}

// Paginated response interface
interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

// Base provider implementation
class BasePrismaProvider<T, C, U> implements BaseProvider<T, C, U> {
    protected model: any;
    protected searchFields: string[];
    protected defaultSort: { field: string; direction: 'asc' | 'desc' };
    protected includes: Record<string, any>;
    protected transform: (data: any) => T;

    constructor(
        model: any,
        searchFields: string[],
        defaultSort: { field: string; direction: 'asc' | 'desc' },
        includes: Record<string, any>,
        transform: (data: any) => T
    ) {
        this.model = model;
        this.searchFields = searchFields;
        this.defaultSort = defaultSort;
        this.includes = includes;
        this.transform = transform;
    }

    async list(params: ListParams): Promise<PaginatedResponse<T>> {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = this.defaultSort
        } = params;

        // Build where clause
        const where: any = { ...filters };
        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: Prisma.QueryMode.insensitive }
            }));
        }

        // Execute query
        const [items, total] = await Promise.all([
            this.model.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { [sort.field]: sort.direction },
                include: this.includes
            }),
            this.model.count({ where })
        ]);

        // Transform and return
        return {
            data: items.map(this.transform),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    }

    async get(id: string): Promise<T | null> {
        const item = await this.model.findUnique({
            where: { id },
            include: this.includes
        });
        return item ? this.transform(item) : null;
    }

    async create(data: C): Promise<T> {
        const item = await this.model.create({
            data,
            include: this.includes
        });
        return this.transform(item);
    }

    async update(id: string, data: U): Promise<T> {
        const item = await this.model.update({
            where: { id },
            data,
            include: this.includes
        });
        return this.transform(item);
    }

    async delete(id: string): Promise<void> {
        await this.model.delete({ where: { id } });
    }
}

// Role-specific types
type RoleWithPermissions = Role & {
    usersCount: number;
    permissions: {
        id: string;
        name: string;
        description: string | null;
    }[];
};

type CreateRoleInput = {
    name: string;
    description?: string;
    permissionIds: string[];
};

type UpdateRoleInput = Partial<CreateRoleInput>;

// Role provider implementation
class RoleProvider extends BasePrismaProvider<RoleWithPermissions, CreateRoleInput, UpdateRoleInput> {
    constructor() {
        super(
            prisma.role,
            ['name', 'description'],
            { field: 'name', direction: 'asc' },
            {
                permissions: { include: { permission: true } },
                users: true
            },
            (role: any) => ({
                ...role,
                usersCount: (role.users ?? []).length,
                permissions: (role.permissions ?? []).map((rp: any) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    description: rp.permission.description
                }))
            })
        );
    }

    // Override create to handle permissions
    async create(data: CreateRoleInput): Promise<RoleWithPermissions> {
        const { permissionIds, ...roleData } = data;
        const role = await this.model.create({
            data: {
                ...roleData,
                permissions: {
                    create: permissionIds.map((permissionId) => ({
                        permission: { connect: { id: permissionId } }
                    }))
                }
            },
            include: this.includes
        });
        return this.transform(role);
    }

    // Override update to handle permissions
    async update(id: string, data: UpdateRoleInput): Promise<RoleWithPermissions> {
        const { permissionIds, ...roleData } = data;
        const role = await this.model.update({
            where: { id },
            data: {
                ...roleData,
                permissions: permissionIds ? {
                    deleteMany: {},
                    create: permissionIds.map((permissionId) => ({
                        permission: { connect: { id: permissionId } }
                    }))
                } : undefined
            },
            include: this.includes
        });
        return this.transform(role);
    }
}

// API route implementation
const roleProvider = new RoleProvider();

// GET /api/roles
export const GET = withPermission(PERMISSIONS.ROLE_READ)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'GET_ROLES');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // Get roles using provider
        const response = await roleProvider.list({
            page,
            limit,
            search,
            sort: { field: 'name', direction: 'asc' }
        });

        // Log the successful request
        await auditLog('ROLE_LIST', {
            page,
            limit,
            search,
            total: response.pagination.total
        });

        return NextResponse.json(response);
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

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Create role using provider
        const role = await roleProvider.create(body);

        // Log the successful creation
        await auditLog('ROLE_CREATE', {
            roleId: role.id,
            name: role.name,
            permissionCount: role.permissions.length
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        console.error("Error creating role:", error);
        await auditLog('ROLE_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create role" },
            { status: 500 }
        );
    }
}); 