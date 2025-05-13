// Database-agnostic interfaces
interface DatabaseClient {
    findMany(params: QueryParams): Promise<any[]>;
    findUnique(params: { where: any; include?: any }): Promise<any | null>;
    create(params: { data: any; include?: any }): Promise<any>;
    update(params: { where: any; data: any; include?: any }): Promise<any>;
    delete(params: { where: any }): Promise<any>;
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

// Abstract base provider
export abstract class BaseProvider<T, C, U> {
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

    async delete(id: string): Promise<T> {
        const item = await this.client.delete({ where: { id } });
        return this.transform(item);
    }

    protected abstract buildWhereClause(filters: Record<string, any>, search: string): any;
}

// Prisma implementation
export class PrismaClient implements DatabaseClient {
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

    async delete(params: { where: any }): Promise<any> {
        return this.model.delete(params);
    }

    async count(params: { where: any }): Promise<number> {
        return this.model.count(params);
    }
} 