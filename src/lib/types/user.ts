import { User } from '@/generated/prisma';

export enum Language {
    ENGLISH = 'ENGLISH',
    SPANISH = 'SPANISH',
    FRENCH = 'FRENCH',
    GERMAN = 'GERMAN',
    OTHER = 'OTHER'
}

// User role enum
export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    CUSTOMER = 'CUSTOMER'
}

// Use Prisma's User type directly
export type UserModel = User;

// Input types using Prisma's generated types
export type CreateUserInput = Pick<User, 'email'> & {
    password: string;
    preferredLanguage?: Language;
    timezone?: string;
    isActive?: boolean;
    isTwoFactorEnabled?: boolean;
    metadata?: Record<string, any>;
    profile?: {
        create: {
            fullName: string;
            preferredName?: string;
            phone?: string;
            image?: string;
        };
    };
};

export type UpdateUserInput = Partial<Pick<User, 'email'>> & {
    password?: string;
    preferredLanguage?: Language;
    timezone?: string;
    isActive?: boolean;
    isTwoFactorEnabled?: boolean;
    metadata?: Record<string, any>;
    profile?: {
        upsert: {
            create: {
                fullName: string;
                preferredName?: string;
                phone?: string;
                image?: string;
            };
            update: {
                fullName: string;
                preferredName?: string;
                phone?: string;
                image?: string;
            };
        };
    };
};

// Filter types
export interface UserFilters {
    isActive?: boolean;
    isTwoFactorEnabled?: boolean;
    preferredLanguage?: Language;
    search?: string;
}

// Response types using Prisma's types
export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type ApiError = {
    message: string;
    code: string;
};

export type ApiErrorResponse = {
    success: boolean;
    error: ApiError;
}; 