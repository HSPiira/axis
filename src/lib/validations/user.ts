import { z } from 'zod';
import { Language } from '@/lib/types/user';

// Email validation regex
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Create user schema
export const createUserSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .regex(emailRegex, "Invalid email format")
        .min(1, "Email is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    preferredLanguage: z.nativeEnum(Language).optional(),
    timezone: z.string().optional(),
    isActive: z.boolean().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    metadata: z.record(z.any()).optional()
});

// Update user schema
export const updateUserSchema = createUserSchema.partial();

// User filters schema
export const userFiltersSchema = z.object({
    isActive: z.boolean().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    preferredLanguage: z.nativeEnum(Language).optional(),
    search: z.string().optional()
});

// Validation result type
export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; details?: z.ZodError };

// Validation functions
export function validateCreateUser(data: unknown): ValidationResult<z.infer<typeof createUserSchema>> {
    try {
        const validatedData = createUserSchema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation failed",
                details: error
            };
        }
        return {
            success: false,
            error: "Invalid input"
        };
    }
}

export function validateUpdateUser(data: unknown): ValidationResult<z.infer<typeof updateUserSchema>> {
    try {
        const validatedData = updateUserSchema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation failed",
                details: error
            };
        }
        return {
            success: false,
            error: "Invalid input"
        };
    }
}

export function validateUserFilters(data: unknown): ValidationResult<z.infer<typeof userFiltersSchema>> {
    try {
        const validatedData = userFiltersSchema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Invalid filters",
                details: error
            };
        }
        return {
            success: false,
            error: "Invalid input"
        };
    }
} 