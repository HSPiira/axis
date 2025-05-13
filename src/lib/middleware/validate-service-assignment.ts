import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { CreateServiceAssignmentInput, UpdateServiceAssignmentInput } from "@/lib/types/service-assignment";

// Response types
type ApiResponse<T> = {
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasMore?: boolean;
        filters?: Record<string, any>;
        sort?: {
            field: string;
            direction: 'asc' | 'desc';
        };
    };
};

type ApiErrorResponse = {
    error: string;
    code?: string;
    details?: any;
};

// Pagination types
type PaginationParams = {
    page: number;
    limit: number;
    total: number;
};

type SortParams = {
    field: string;
    direction: 'asc' | 'desc';
};

type FilterParams = Record<string, any>;

// Cache types
type CacheOptions = {
    ttl?: number; // Time to live in seconds
    tags?: string[];
    staleWhileRevalidate?: boolean;
};

// Response transformation utilities
const createSuccessResponse = <T>(
    data: T,
    meta?: ApiResponse<T>['meta'],
    status: number = 200
): NextResponse => {
    const response: ApiResponse<T> = { data };
    if (meta) {
        response.meta = meta;
    }
    return NextResponse.json(response, { status });
};

const createErrorResponse = (error: Error, status: number = 400): NextResponse => {
    const response: ApiErrorResponse = { error: error.message };

    if (error instanceof ValidationError) {
        response.details = error.details;
    } else if (error instanceof ServiceAssignmentError) {
        response.code = error.code;
        response.details = error.details;
    }

    return NextResponse.json(response, { status });
};

// Pagination utilities
const createPaginationMeta = ({
    page,
    limit,
    total
}: PaginationParams): NonNullable<ApiResponse<any>['meta']> => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
    };
};

// Data transformation utilities
const transformDateFields = <T extends Record<string, any>>(data: T): T => {
    const transformed = { ...data };
    for (const [key, value] of Object.entries(data)) {
        if (value instanceof Date) {
            (transformed as Record<string, any>)[key] = value.toISOString();
        } else if (value && typeof value === 'object') {
            (transformed as Record<string, any>)[key] = transformDateFields(value);
        }
    }
    return transformed;
};

const transformServiceAssignment = (assignment: any) => {
    return {
        ...transformDateFields(assignment),
        status: assignment.status?.toUpperCase(),
        frequency: assignment.frequency?.toUpperCase()
    };
};

// Cache utilities
const createCacheHeaders = (options: CacheOptions = {}) => {
    const headers: Record<string, string> = {};

    if (options.ttl) {
        headers['Cache-Control'] = `max-age=${options.ttl}`;
    }

    if (options.staleWhileRevalidate) {
        headers['Cache-Control'] += ', stale-while-revalidate';
    }

    if (options.tags?.length) {
        headers['Cache-Tag'] = options.tags.join(',');
    }

    return headers;
};

const createCachedResponse = <T>(
    data: T,
    options: CacheOptions = {},
    meta?: ApiResponse<T>['meta']
): NextResponse => {
    const response = createSuccessResponse(data, meta);
    const cacheHeaders = createCacheHeaders(options);

    Object.entries(cacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
};

// Combined response utilities
const createPaginatedResponse = <T>(
    data: T[],
    pagination: PaginationParams,
    options: {
        sort?: SortParams;
        filters?: FilterParams;
        cache?: CacheOptions;
    } = {}
): NextResponse => {
    const meta = createPaginationMeta(pagination);

    if (options.sort) {
        meta.sort = options.sort;
    }

    if (options.filters) {
        meta.filters = options.filters;
    }

    const transformedData = data.map(transformServiceAssignment);

    if (options.cache) {
        return createCachedResponse(transformedData, options.cache, meta);
    }

    return createSuccessResponse(transformedData, meta);
};

// Custom error classes
export class ValidationError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ServiceAssignmentError extends Error {
    constructor(message: string, public code: string, public details?: any) {
        super(message);
        this.name = 'ServiceAssignmentError';
    }
}

// Validation schemas
const frequencyEnum = z.enum(['ONCE', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']);

// Custom validation functions
const validateDateRange = (startDate: Date, endDate: Date | undefined) => {
    if (endDate && endDate <= startDate) {
        throw new ValidationError("End date must be after start date");
    }
};

const validateFrequencyDates = (frequency: string, startDate: Date, endDate: Date | undefined) => {
    const now = new Date();

    switch (frequency) {
        case 'ONCE':
            if (startDate < now) {
                throw new ValidationError("Start date for one-time service must be in the future");
            }
            break;
        case 'WEEKLY':
            if (endDate) {
                const weeksDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                if (weeksDiff < 1) {
                    throw new ValidationError("Weekly service must span at least one week");
                }
            }
            break;
        case 'MONTHLY':
            if (endDate) {
                const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
                if (monthsDiff < 1) {
                    throw new ValidationError("Monthly service must span at least one month");
                }
            }
            break;
        case 'QUARTERLY':
            if (endDate) {
                const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
                if (monthsDiff < 3) {
                    throw new ValidationError("Quarterly service must span at least three months");
                }
                // Validate quarter alignment
                const startQuarter = Math.floor(startDate.getMonth() / 3);
                const endQuarter = Math.floor(endDate.getMonth() / 3);
                if (startQuarter !== endQuarter) {
                    throw new ValidationError("Quarterly service must align with calendar quarters");
                }
            }
            break;
        case 'ANNUALLY':
            if (endDate) {
                const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
                if (yearsDiff < 1) {
                    throw new ValidationError("Annual service must span at least one year");
                }
                // Validate same month and day
                if (startDate.getMonth() !== endDate.getMonth() ||
                    startDate.getDate() !== endDate.getDate()) {
                    throw new ValidationError("Annual service must start and end on the same day of the year");
                }
            }
            break;
    }
};

const baseServiceAssignmentSchema = z.object({
    serviceId: z.string().min(1, "Service ID is required"),
    contractId: z.string().min(1, "Contract ID is required"),
    startDate: z.string()
        .datetime("Invalid start date")
        .transform(str => new Date(str))
        .refine(date => date instanceof Date && !isNaN(date.getTime()), {
            message: "Invalid start date"
        }),
    endDate: z.string()
        .datetime("Invalid end date")
        .transform(str => new Date(str))
        .optional()
        .refine(date => !date || (date instanceof Date && !isNaN(date.getTime())), {
            message: "Invalid end date"
        }),
    frequency: frequencyEnum,
    organizationId: z.string().optional()
});

const createServiceAssignmentSchema = baseServiceAssignmentSchema.refine(
    (data) => {
        try {
            validateDateRange(data.startDate, data.endDate);
            validateFrequencyDates(data.frequency, data.startDate, data.endDate);
            return true;
        } catch (error) {
            return false;
        }
    },
    {
        message: "Invalid date range or frequency configuration"
    }
);

const updateServiceAssignmentSchema = baseServiceAssignmentSchema
    .partial()
    .extend({
        status: z.enum(['PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
        isActive: z.boolean().optional()
    })
    .refine(
        (data: Partial<z.infer<typeof baseServiceAssignmentSchema>> & {
            status?: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
            isActive?: boolean;
        }) => {
            if (data.startDate && data.endDate) {
                try {
                    validateDateRange(data.startDate, data.endDate);
                    if (data.frequency) {
                        validateFrequencyDates(data.frequency, data.startDate, data.endDate);
                    }
                    return true;
                } catch (error) {
                    return false;
                }
            }
            return true;
        },
        {
            message: "Invalid date range or frequency configuration"
        }
    );

type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; details?: z.ZodError };

// Validation middleware
export async function validateCreateServiceAssignment(request: NextRequest): Promise<ValidationResult<CreateServiceAssignmentInput> | NextResponse> {
    try {
        const body = await request.json();
        const validatedData = createServiceAssignmentSchema.parse(body);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError(
                "Validation failed",
                error.errors.map(e => e.message).join(", ")
            );
        }
        throw error;
    }
}

export async function validateUpdateServiceAssignment(request: NextRequest): Promise<ValidationResult<UpdateServiceAssignmentInput> | NextResponse> {
    try {
        const body = await request.json();
        const validatedData = updateServiceAssignmentSchema.parse(body);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError(
                "Validation failed",
                error.errors.map(e => e.message).join(", ")
            );
        }
        throw error;
    }
}

// Query parameter validation
export function validateServiceAssignmentQueryParams(searchParams: URLSearchParams) {
    try {
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const serviceId = searchParams.get('serviceId');
        const contractId = searchParams.get('contractId');
        const status = searchParams.get('status');
        const isActive = searchParams.get('isActive');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const errors: string[] = [];

        if (page && isNaN(Number(page))) {
            errors.push("Page must be a number");
        }

        if (limit && isNaN(Number(limit))) {
            errors.push("Limit must be a number");
        }

        if (status && !['PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            errors.push("Invalid status");
        }

        if (isActive && !['true', 'false'].includes(isActive)) {
            errors.push("isActive must be true or false");
        }

        // Validate date range if both dates are provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime())) {
                errors.push("Invalid start date format");
            }
            if (isNaN(end.getTime())) {
                errors.push("Invalid end date format");
            }
            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
                errors.push("End date must be after start date");
            }
        }

        if (errors.length > 0) {
            throw new ValidationError("Invalid query parameters", errors);
        }

        return {
            isValid: true,
            errors: [],
            validatedParams: {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                serviceId,
                contractId,
                status,
                isActive: isActive ? isActive === 'true' : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            }
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            return {
                isValid: false,
                errors: error.details || [error.message],
                validatedParams: undefined
            };
        }
        throw error;
    }
}

// Export utilities
export {
    createSuccessResponse,
    createErrorResponse,
    createPaginatedResponse,
    createCachedResponse,
    transformServiceAssignment,
    type ApiResponse,
    type ApiErrorResponse,
    type PaginationParams,
    type SortParams,
    type FilterParams,
    type CacheOptions
}; 