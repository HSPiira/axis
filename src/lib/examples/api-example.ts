import { XataClient } from '@/xata';
import { OrganizationProvider } from './xata-types-example';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { auditLog } from '@/lib/audit-log';

type AuditAction =
    | 'ORGANIZATION_GET'
    | 'ORGANIZATION_LIST'
    | 'ORGANIZATION_CREATE'
    | 'ORGANIZATION_UPDATE'
    | 'ORGANIZATION_DELETE'
    | 'ORGANIZATION_GET_ERROR'
    | 'ORGANIZATION_LIST_ERROR'
    | 'ORGANIZATION_CREATE_ERROR'
    | 'ORGANIZATION_UPDATE_ERROR'
    | 'ORGANIZATION_DELETE_ERROR';

// Initialize providers
const client = new XataClient();
const orgProvider = new OrganizationProvider(client);

// Utility to extract error code from error objects
function getErrorCode(error: unknown): string | undefined {
    if (!error) return undefined;
    if (typeof error === 'object' && error !== null) {
        const errorObj = error as { code?: string; error?: { code?: string } };
        if ('code' in errorObj) return errorObj.code;
        if ('error' in errorObj && typeof errorObj.error === 'object' && errorObj.error !== null && 'code' in errorObj.error) {
            return errorObj.error.code;
        }
    }
    return undefined;
}

// GET /api/organizations
export async function GET(request: NextRequest) {
    try {
        // Check rate limit
        const limiter = rateLimit();
        const result = await limiter.check(50, 'GET_ORGANIZATION');
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Validate pagination parameters
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const id = searchParams.get('id');

        if (id) {
            // Get single organization
            const org = await orgProvider.get(id);
            if (!org) {
                return NextResponse.json(
                    { error: 'Organization not found' },
                    { status: 404 }
                );
            }

            // Log the successful request
            await auditLog('ORGANIZATION_LIST', {
                organizationId: id
            });

            return NextResponse.json(org);
        }

        try {
            let orgs;
            if (status) {
                // Get organizations by status
                orgs = await orgProvider.getByStatus(status);
            } else {
                // Get all organizations
                orgs = await orgProvider.list();
            }

            // Log the successful request
            await auditLog('ORGANIZATION_LIST', {
                page,
                limit,
                status,
                total: orgs.length
            });

            return NextResponse.json({
                organizations: orgs,
                pagination: {
                    total: orgs.length,
                    pages: Math.ceil(orgs.length / limit),
                    page,
                    limit,
                },
            });
        } catch (error) {
            await auditLog('ORGANIZATION_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            const errorCode = getErrorCode(error);
            switch (errorCode) {
                case 'P1001':
                    return NextResponse.json(
                        { error: 'Service temporarily unavailable' },
                        { status: 503 }
                    );
            }

            return NextResponse.json(
                { error: 'Failed to fetch organizations' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in GET /organizations:', error);
        await auditLog('ORGANIZATION_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}

// POST /api/organizations
export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_ORGANIZATION');
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Check content type
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 400 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.name || !body.status) {
            return NextResponse.json(
                { error: 'Name and status are required' },
                { status: 400 }
            );
        }

        // Validate input length
        if (body.name.length > 255) {
            return NextResponse.json(
                { error: 'Name must be less than 255 characters' },
                { status: 400 }
            );
        }

        // Check for SQL injection and XSS attempts
        if (body.name.includes(';') || body.name.includes('--') ||
            body.name.includes('/*') || body.name.includes('*/') ||
            body.name.includes('<script>') || body.name.includes('javascript:')) {
            return NextResponse.json(
                { error: 'Invalid input: potential security threat detected' },
                { status: 400 }
            );
        }

        // Sanitize input
        const sanitizedData = {
            name: sanitizeInput(body.name),
            status: sanitizeInput(body.status),
            industryId: body.industryId ? sanitizeInput(body.industryId) : undefined
        };

        try {
            // Create organization
            const org = await orgProvider.create(sanitizedData);

            // Log the successful creation
            await auditLog('ORGANIZATION_CREATE', {
                organizationId: org.id,
                name: org.name,
                status: org.status
            });

            return NextResponse.json(org, { status: 201 });
        } catch (error) {
            await auditLog('ORGANIZATION_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            const errorCode = getErrorCode(error);
            switch (errorCode) {
                case 'P2002':
                    return NextResponse.json(
                        { error: 'Organization with this name already exists' },
                        { status: 409 }
                    );
                case 'P2003':
                    return NextResponse.json(
                        { error: 'Invalid industry ID' },
                        { status: 400 }
                    );
            }

            return NextResponse.json(
                { error: 'Failed to create organization' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in POST /organizations:', error);
        await auditLog('ORGANIZATION_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: 'Failed to create organization' },
            { status: 500 }
        );
    }
}

// PUT /api/organizations/:id
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'PUT_ORGANIZATION');
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const id = params.id;
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        // Check if organization exists
        const existing = await orgProvider.get(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Validate input length
        if (body.name && body.name.length > 255) {
            return NextResponse.json(
                { error: 'Name must be less than 255 characters' },
                { status: 400 }
            );
        }

        // Sanitize input
        const sanitizedData = {
            name: body.name ? sanitizeInput(body.name) : undefined,
            status: body.status ? sanitizeInput(body.status) : undefined,
            industryId: body.industryId ? sanitizeInput(body.industryId) : undefined
        };

        try {
            // Update organization
            const updated = await orgProvider.update(id, sanitizedData);

            // Log the successful update
            await auditLog('ORGANIZATION_CREATE', {
                organizationId: id,
                updates: sanitizedData
            });

            return NextResponse.json(updated);
        } catch (error) {
            await auditLog('ORGANIZATION_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            const errorCode = getErrorCode(error);
            switch (errorCode) {
                case 'P2002':
                    return NextResponse.json(
                        { error: 'Organization with this name already exists' },
                        { status: 409 }
                    );
                case 'P2003':
                    return NextResponse.json(
                        { error: 'Invalid industry ID' },
                        { status: 400 }
                    );
            }

            return NextResponse.json(
                { error: 'Failed to update organization' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in PUT /organizations:', error);
        await auditLog('ORGANIZATION_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: 'Failed to update organization' },
            { status: 500 }
        );
    }
}

// DELETE /api/organizations/:id
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'DELETE_ORGANIZATION');
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const id = params.id;

        // Check if organization exists
        const existing = await orgProvider.get(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        try {
            // Delete organization
            await orgProvider.delete(id);

            // Log the successful deletion
            await auditLog('ORGANIZATION_CREATE', {
                organizationId: id
            });

            return new NextResponse(null, { status: 204 });
        } catch (error) {
            await auditLog('ORGANIZATION_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            return NextResponse.json(
                { error: 'Failed to delete organization' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in DELETE /organizations:', error);
        await auditLog('ORGANIZATION_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: 'Failed to delete organization' },
            { status: 500 }
        );
    }
}

// Example of a more complex API endpoint
// GET /api/organizations/:id/with-industry
export async function GET_WITH_INDUSTRY(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const org = await orgProvider.get(id);

        if (!org) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // The organization already includes industry data
        // because we overrode the get method in OrganizationProvider
        return NextResponse.json(org);
    } catch (error) {
        console.error('Error fetching organization with industry:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}