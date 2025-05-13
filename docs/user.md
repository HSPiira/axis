# User Types and Validations

This document explains the user-related types, validations, and utilities in the API.

## Table of Contents
1. [Types](#types)
2. [Validation Schemas](#validation-schemas)
3. [Response Types](#response-types)
4. [Usage Examples](#usage-examples)

## Types

### User Model Types

```typescript
// Base user model from Prisma
type UserModel = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    metadata?: Record<string, any>;
};

// User role enum
enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    CUSTOMER = 'CUSTOMER'
}

// API response type
type UserResponse = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    isActive: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    fullName: string; // Computed field
};

// Input types
type CreateUserInput = {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    password: string;
    metadata?: Record<string, any>;
};

type UpdateUserInput = Partial<CreateUserInput> & {
    isActive?: boolean;
};

// Filter types
type UserFilters = {
    role?: UserRole;
    isActive?: boolean;
    organizationId?: string;
    search?: string;
};
```

## Validation Schemas

### User Validation Schemas

```typescript
import { z } from 'zod';

// Email validation regex
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Create user schema
const createUserSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .regex(emailRegex, "Invalid email format")
        .min(1, "Email is required"),
    firstName: z.string()
        .min(1, "First name is required")
        .max(50, "First name too long"),
    lastName: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name too long"),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'], {
        errorMap: () => ({ message: "Invalid role" })
    }),
    organizationId: z.string().min(1, "Organization ID is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    metadata: z.record(z.any()).optional()
});

// Update user schema
const updateUserSchema = createUserSchema.partial().extend({
    isActive: z.boolean().optional()
});

// User filters schema
const userFiltersSchema = z.object({
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']).optional(),
    isActive: z.boolean().optional(),
    organizationId: z.string().optional(),
    search: z.string().optional()
});
```

## Response Types

### User Response Types

```typescript
// Success response
type UserApiResponse<T> = {
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasMore?: boolean;
        filters?: UserFilters;
        sort?: {
            field: string;
            direction: 'asc' | 'desc';
        };
    };
};

// Error response
type UserApiErrorResponse = {
    error: string;
    code?: string;
    details?: any;
};
```

## Usage Examples

### 1. Create User

```typescript
export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const body = await request.json();
        const validatedData = createUserSchema.parse(body);

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user
        const user = await userProvider.create({
            ...validatedData,
            password: hashedPassword
        });

        // Transform response
        const response = transformUserResponse(user);
        return createSuccessResponse(response, undefined, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return createErrorResponse(new ValidationError("Invalid input", error.errors));
        }
        return createErrorResponse(error);
    }
}
```

### 2. Update User

```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Validate request body
        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        // Hash password if provided
        if (validatedData.password) {
            validatedData.password = await hashPassword(validatedData.password);
        }

        // Update user
        const user = await userProvider.update(params.id, validatedData);
        return createSuccessResponse(transformUserResponse(user));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return createErrorResponse(new ValidationError("Invalid input", error.errors));
        }
        return createErrorResponse(error);
    }
}
```

### 3. List Users

```typescript
export async function GET(request: NextRequest) {
    try {
        // Validate query parameters
        const searchParams = request.nextUrl.searchParams;
        const filters = userFiltersSchema.parse({
            role: searchParams.get('role'),
            isActive: searchParams.get('isActive') === 'true',
            organizationId: searchParams.get('organizationId'),
            search: searchParams.get('search')
        });

        // Get pagination params
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;

        // Fetch users
        const users = await userProvider.list({
            page,
            limit,
            filters,
            sort: { field: 'createdAt', direction: 'desc' }
        });

        // Transform and return response
        return createPaginatedResponse(
            users.data.map(transformUserResponse),
            {
                page: users.page,
                limit: users.limit,
                total: users.total
            },
            {
                filters,
                sort: { field: 'createdAt', direction: 'desc' },
                cache: { ttl: 300, tags: ['users'] }
            }
        );
    } catch (error) {
        return createErrorResponse(error);
    }
}
```

## Data Transformation

### User Response Transformation

```typescript
function transformUserResponse(user: UserModel): UserResponse {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        fullName: `${user.firstName} ${user.lastName}`
    };
}
```

## Best Practices

1. **Password Security**:
   - Always hash passwords before storing
   - Use strong password requirements
   - Never return password in responses

2. **Role Management**:
   - Validate role assignments
   - Check permissions before operations
   - Use role-based access control

3. **Data Validation**:
   - Validate all input data
   - Sanitize user input
   - Handle validation errors gracefully

4. **Response Format**:
   - Transform dates to ISO strings
   - Remove sensitive data
   - Include computed fields

5. **Error Handling**:
   - Use appropriate error types
   - Include detailed error messages
   - Handle validation errors separately

6. **Caching**:
   - Cache user lists
   - Invalidate cache on updates
   - Use appropriate cache tags 