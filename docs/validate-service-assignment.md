# Service Assignment Validation and Response Utilities

This document explains the validation and response utilities for service assignments in the API.

## Table of Contents
1. [Overview](#overview)
2. [Validation](#validation)
3. [Response Utilities](#response-utilities)
4. [Usage Examples](#usage-examples)

## Overview

The service assignment module provides:
- Input validation for service assignments
- Standardized API responses
- Data transformation
- Caching support
- Pagination handling

## Validation

### Validation Schemas

```typescript
// Create a new service assignment
const createServiceAssignmentSchema = z.object({
    serviceId: z.string().min(1),
    contractId: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    frequency: z.enum(['ONCE', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    organizationId: z.string().optional()
});

// Update an existing service assignment
const updateServiceAssignmentSchema = createServiceAssignmentSchema.partial();
```

### Validation Rules

1. **Date Range Validation**:
   - End date must be after start date
   - Start date must be in the future for one-time services

2. **Frequency-Specific Rules**:
   - `ONCE`: Must start in the future
   - `WEEKLY`: Must span at least one week
   - `MONTHLY`: Must span at least one month
   - `QUARTERLY`: Must span at least three months and align with calendar quarters
   - `ANNUALLY`: Must span at least one year and start/end on the same day

### Usage

```typescript
// Validate creation
const result = await validateCreateServiceAssignment(request);
if (!result.success) {
    return createErrorResponse(result.error);
}

// Validate update
const result = await validateUpdateServiceAssignment(request);
if (!result.success) {
    return createErrorResponse(result.error);
}
```

## Response Utilities

### Response Types

```typescript
// Success response
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

// Error response
type ApiErrorResponse = {
    error: string;
    code?: string;
    details?: any;
};
```

### Response Creation

1. **Basic Response**:
```typescript
// Success
return createSuccessResponse(data);

// Error
return createErrorResponse(new ValidationError("Invalid input"));
```

2. **Paginated Response**:
```typescript
return createPaginatedResponse(data, {
    page: 1,
    limit: 10,
    total: 100
}, {
    sort: { field: 'createdAt', direction: 'desc' },
    filters: { status: 'ACTIVE' }
});
```

3. **Cached Response**:
```typescript
return createCachedResponse(data, {
    ttl: 3600, // Cache for 1 hour
    tags: ['assignments'],
    staleWhileRevalidate: true
});
```

## Usage Examples

### 1. List Service Assignments

```typescript
export async function GET(request: NextRequest) {
    try {
        // Validate query parameters
        const validation = validateServiceAssignmentQueryParams(request.nextUrl.searchParams);
        if (!validation.isValid) {
            return createErrorResponse(new ValidationError("Invalid query parameters", validation.errors));
        }

        const { page, limit, ...filters } = validation.validatedParams;
        const assignments = await assignmentProvider.list({
            page: page || 1,
            limit: limit || 10,
            filters
        });

        return createPaginatedResponse(
            assignments.data,
            {
                page: assignments.page,
                limit: assignments.limit,
                total: assignments.total
            },
            {
                filters,
                sort: { field: 'createdAt', direction: 'desc' },
                cache: { ttl: 300, tags: ['assignments'] }
            }
        );
    } catch (error) {
        return createErrorResponse(error);
    }
}
```

### 2. Create Service Assignment

```typescript
export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateCreateServiceAssignment(request);
        if (!validation.success) {
            return createErrorResponse(validation.error);
        }

        const assignment = await assignmentProvider.create(validation.data);
        return createSuccessResponse(assignment, undefined, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
```

### 3. Update Service Assignment

```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Validate request body
        const validation = await validateUpdateServiceAssignment(request);
        if (!validation.success) {
            return createErrorResponse(validation.error);
        }

        const assignment = await assignmentProvider.update(params.id, validation.data);
        return createSuccessResponse(assignment);
    } catch (error) {
        return createErrorResponse(error);
    }
}
```

## Error Handling

The module provides two custom error classes:

1. **ValidationError**:
   - Used for input validation errors
   - Includes detailed error messages
   - Returns 400 status code

2. **ServiceAssignmentError**:
   - Used for business logic errors
   - Includes error code and details
   - Returns appropriate status code

## Best Practices

1. **Always validate input** before processing
2. **Use appropriate error types** for different scenarios
3. **Include pagination metadata** for list endpoints
4. **Cache responses** when appropriate
5. **Transform dates** to ISO strings
6. **Use consistent response format** across all endpoints 