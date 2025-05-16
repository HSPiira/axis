import { DatabaseClient } from './providers/base-provider';
import { Prisma } from '@prisma/client';

export class PrismaWrapper implements DatabaseClient {
    constructor(private model: any) { }

    async findMany(params: any): Promise<any[]> {
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

    async aggregate(params: { where?: any; _sum?: any; _avg?: any; _count?: any }): Promise<any> {
        return this.model.aggregate(params);
    }

    async groupBy(params: { by: string[]; where?: any; _count?: boolean }): Promise<any[]> {
        return this.model.groupBy(params);
    }
} 