import { ApiResponse, ApiErrorResponse } from '@/lib/types/user';
import type { User } from '@/generated/prisma';

// Success response with data
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message: message || 'Operation successful'
    };
}

// Error response
export function createErrorResponse(message: string, code?: string): ApiErrorResponse {
    return {
        success: false,
        error: {
            message,
            code: code || 'UNKNOWN_ERROR'
        }
    };
}

// Transform user data for API response
export function transformUserResponse(user: User): User {
    return user;
}

// Transform user list response
export function transformUserListResponse(users: User[], total: number, page: number, limit: number): ApiResponse<User[]> {
    return {
        success: true,
        data: users.map(transformUserResponse),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// Common error responses
export const userErrors = {
    notFound: () => createErrorResponse('User not found', 'USER_NOT_FOUND'),
    invalidInput: (message: string) => createErrorResponse(message, 'INVALID_INPUT'),
    unauthorized: () => createErrorResponse('Unauthorized access', 'UNAUTHORIZED'),
    forbidden: () => createErrorResponse('Forbidden access', 'FORBIDDEN'),
    serverError: () => createErrorResponse('Internal server error', 'SERVER_ERROR')
}; 