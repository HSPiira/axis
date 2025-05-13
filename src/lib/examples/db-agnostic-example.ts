// Database-agnostic interfaces
interface DatabaseClient {
    findMany(params: QueryParams): Promise<any[]>;
    findUnique(params: { where: any; include?: any }): Promise<any | null>;
    create(params: { data: any; include?: any }): Promise<any>;
    update(params: { where: any; data: any; include?: any }): Promise<any>;
    delete(params: { where: any }): Promise<void>;
    count(params: { where: any }): Promise<number>;
}

interface QueryParams {
    where?: any;
    take?: number;
    skip?: number;
    orderBy?: any;
    include?: any;
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

// Role-specific types
interface RoleWithPermissions {
    id: string;
    name: string;
    description?: string | null;
    usersCount: number;
    permissions: {
        id: string;
        name: string;
        description: string | null;
    }[];
}

interface CreateRoleInput {
    name: string;
    description?: string;
    permissionIds: string[];
}

interface UpdateRoleInput extends Partial<CreateRoleInput> { }

// Abstract base provider
abstract class BaseDatabaseProvider<T, C, U> {
    protected abstract client: DatabaseClient;
    protected abstract searchFields: string[];
    protected abstract defaultSort: { field: string; direction: 'asc' | 'desc' };
    protected abstract includes: Record<string, any>;
    protected abstract transform(data: any): T;

    async list(params: ListParams): Promise<PaginatedResponse<T>> {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = this.defaultSort
        } = params;

        // Build where clause
        const where = this.buildWhereClause(filters, search);

        // Execute query
        const [items, total] = await Promise.all([
            this.client.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { [sort.field]: sort.direction },
                include: this.includes
            }),
            this.client.count({ where })
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
        const item = await this.client.findUnique({
            where: { id },
            include: this.includes
        });
        return item ? this.transform(item) : null;
    }

    async create(data: C): Promise<T> {
        const item = await this.client.create({
            data,
            include: this.includes
        });
        return this.transform(item);
    }

    async update(id: string, data: U): Promise<T> {
        const item = await this.client.update({
            where: { id },
            data,
            include: this.includes
        });
        return this.transform(item);
    }

    async delete(id: string): Promise<void> {
        await this.client.delete({ where: { id } });
    }

    protected abstract buildWhereClause(filters: Record<string, any>, search: string): any;
}

// Prisma implementation
class PrismaClient implements DatabaseClient {
    constructor(private model: any) { }

    async findMany(params: QueryParams): Promise<any[]> {
        return this.model.findMany(params);
    }

    async findUnique(params: { where: any; include?: any }): Promise<any | null> {
        return this.model.findUnique(params);
    }

    async create(params: { data: any; include?: any }): Promise<any> {
        return this.model.create(params);
    }

    async update(params: { where: any; data: any; include?: any }): Promise<any> {
        return this.model.update(params);
    }

    async delete(params: { where: any }): Promise<void> {
        await this.model.delete(params);
    }

    async count(params: { where: any }): Promise<number> {
        return this.model.count(params);
    }
}

// MongoDB implementation
class MongoClient implements DatabaseClient {
    constructor(private collection: any) { }

    async findMany(params: QueryParams): Promise<any[]> {
        const { where, take, skip, orderBy, include } = params;
        return this.collection
            .find(where)
            .limit(take)
            .skip(skip)
            .sort(orderBy)
            .toArray();
    }

    async findUnique(params: { where: any; include?: any }): Promise<any | null> {
        return this.collection.findOne(params.where);
    }

    async create(params: { data: any; include?: any }): Promise<any> {
        const result = await this.collection.insertOne(params.data);
        return this.findUnique({ where: { _id: result.insertedId } });
    }

    async update(params: { where: any; data: any; include?: any }): Promise<any> {
        await this.collection.updateOne(params.where, { $set: params.data });
        return this.findUnique({ where: params.where });
    }

    async delete(params: { where: any }): Promise<void> {
        await this.collection.deleteOne(params.where);
    }

    async count(params: { where: any }): Promise<number> {
        return this.collection.countDocuments(params.where);
    }
}

// Example usage with Prisma
class PrismaRoleProvider extends BaseDatabaseProvider<RoleWithPermissions, CreateRoleInput, UpdateRoleInput> {
    protected client: DatabaseClient;
    protected searchFields = ['name', 'description'];
    protected defaultSort = { field: 'name', direction: 'asc' as const };
    protected includes = {
        permissions: { include: { permission: true } },
        users: true
    };

    constructor(model: any) {
        super();
        this.client = new PrismaClient(model);
    }

    protected transform(role: any): RoleWithPermissions {
        return {
            ...role,
            usersCount: (role.users ?? []).length,
            permissions: (role.permissions ?? []).map((rp: any) => ({
                id: rp.permission.id,
                name: rp.permission.name,
                description: rp.permission.description
            }))
        };
    }

    protected buildWhereClause(filters: Record<string, any>, search: string): any {
        const where: any = { ...filters };
        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }
        return where;
    }
}

// Example usage with MongoDB
class MongoRoleProvider extends BaseDatabaseProvider<RoleWithPermissions, CreateRoleInput, UpdateRoleInput> {
    protected client: DatabaseClient;
    protected searchFields = ['name', 'description'];
    protected defaultSort = { field: 'name', direction: 'asc' as const };
    protected includes = {};

    constructor(collection: any) {
        super();
        this.client = new MongoClient(collection);
    }

    protected transform(role: any): RoleWithPermissions {
        return {
            ...role,
            usersCount: (role.users ?? []).length,
            permissions: (role.permissions ?? []).map((rp: any) => ({
                id: rp.permission.id,
                name: rp.permission.name,
                description: rp.permission.description
            }))
        };
    }

    protected buildWhereClause(filters: Record<string, any>, search: string): any {
        const where: any = { ...filters };
        if (search) {
            where.$or = this.searchFields.map(field => ({
                [field]: { $regex: search, $options: 'i' }
            }));
        }
        return where;
    }
}
