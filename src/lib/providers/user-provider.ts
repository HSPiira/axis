import { prisma } from "@/lib/db";
import { BaseProvider, PrismaClient } from "./base-provider";
import { hash } from 'bcryptjs';
import { UserModel, CreateUserInput, UpdateUserInput, UserFilters } from '@/lib/types/user';
import type { User } from '@/generated/prisma';

export class UserProvider extends BaseProvider<UserModel, CreateUserInput, UpdateUserInput> {
    protected client = new PrismaClient(prisma.user);
    protected searchFields = ['email'];
    protected defaultSort = { field: 'createdAt', direction: 'desc' as const };
    protected includes = {
        profile: true
    };

    protected transform(data: User): UserModel {
        return data;
    }

    protected buildWhereClause(filters: Record<string, any>, search: string): any {
        const where: any = {};
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.isTwoFactorEnabled !== undefined) {
            where.isTwoFactorEnabled = filters.isTwoFactorEnabled;
        }
        if (filters.preferredLanguage) {
            where.preferredLanguage = filters.preferredLanguage;
        }
        if (search) {
            where.OR = [
                ...this.searchFields.map(field => ({
                    [field]: { contains: search, mode: 'insensitive' }
                })),
                {
                    profile: {
                        fullName: { contains: search, mode: 'insensitive' }
                    }
                }
            ];
        }
        return where;
    }

    async create(input: CreateUserInput): Promise<UserModel> {
        const { profile, ...userData } = input;
        const hashedPassword = await hash(userData.password, 10);

        const data = {
            ...userData,
            password: hashedPassword,
            profile: profile
        };

        return super.create(data);
    }

    async update(id: string, input: UpdateUserInput): Promise<UserModel> {
        const { profile, ...userData } = input;
        const data: any = { ...userData };

        if (userData.password) {
            data.password = await hash(userData.password, 10);
        }

        if (profile) {
            data.profile = profile;
        }

        return super.update(id, data);
    }

    async delete(id: string): Promise<UserModel> {
        const deleted = await this.client.delete({
            where: { id }
        });
        return this.transform(deleted);
    }

    async findById(id: string): Promise<UserModel | null> {
        const user = await this.client.findUnique({
            where: { id },
            include: this.includes
        });
        return user ? this.transform(user) : null;
    }

    async findByEmail(email: string): Promise<UserModel | null> {
        const user = await this.client.findUnique({
            where: { email },
            include: this.includes
        });
        return user ? this.transform(user) : null;
    }

    async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
        const user = await this.client.findUnique({
            where: {
                email,
                ...(excludeId ? { id: { not: excludeId } } : {})
            }
        });
        return !user;
    }
} 