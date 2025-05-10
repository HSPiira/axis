import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { ORGANIZATION_PERMISSIONS } from "@/lib/constants/roles";
import { Prisma } from "@/generated/prisma";
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { auditLog } from '@/lib/audit-log';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Utility to robustly extract error code from error objects, even if nested
function getErrorCode(error: unknown): string | undefined {
    if (!error) return undefined;

    // Handle plain objects with code property
    if (typeof error === 'object' && error !== null) {
        const errorObj = error as { code?: string; error?: { code?: string } };
        if ('code' in errorObj) return errorObj.code;
        if ('error' in errorObj && typeof errorObj.error === 'object' && errorObj.error !== null && 'code' in errorObj.error) {
            return errorObj.error.code;
        }
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
        return error.code;
    }

    return undefined;
}

// GET /api/organization
export const GET = withPermission(ORGANIZATION_PERMISSIONS.READ)(async (request: NextRequest) => {
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
        const status = searchParams.get('status') as Prisma.OrganizationWhereInput['status'];

        const where: Prisma.OrganizationWhereInput = {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
            ...(status ? { status } : {}),
        };

        try {
            const [organizations, total] = await Promise.all([
                prisma.organization.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    include: {
                        industry: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                    orderBy: { name: 'asc' },
                }),
                prisma.organization.count({ where }),
            ]);

            // Log the successful request
            await auditLog('ORGANIZATION_LIST', {
                page,
                limit,
                search,
                total
            });

            return NextResponse.json({
                organizations,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            });
        } catch (error) {
            // console.error("Error fetching organizations:", error); // silenced for test clarity
            await auditLog('ORGANIZATION_LIST_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            // Use getErrorCode utility
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
        console.error("Error in GET /organizations:", error);
        await auditLog('ORGANIZATION_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Use getErrorCode utility
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
});

// POST /api/organization
export const POST = withPermission(ORGANIZATION_PERMISSIONS.CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_ORGANIZATION');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        // Check content type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { error: "Content-Type header must be application/json" },
                { status: 400 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate required fields and length constraints
        const name = body.name?.trim();
        const email = body.email?.trim()?.toLowerCase();

        if (!name) {
            return NextResponse.json(
                { error: "Name cannot be empty" },
                { status: 400 }
            );
        }

        if (name.length > 255) {
            return NextResponse.json(
                { error: "Name must be less than 255 characters" },
                { status: 400 }
            );
        }

        if (email) {
            if (email.length > 255) {
                return NextResponse.json(
                    { error: "Email must be less than 255 characters" },
                    { status: 400 }
                );
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 }
                );
            }
        }

        // Check for SQL injection and XSS attempts
        if (name.includes(';') || name.includes('--') || name.includes('/*') || name.includes('*/')) {
            return NextResponse.json(
                { error: "Invalid input: SQL injection attempt detected" },
                { status: 400 }
            );
        }

        if (name.includes('<script>') || name.includes('javascript:')) {
            return NextResponse.json(
                { error: "Invalid input: XSS attempt detected" },
                { status: 400 }
            );
        }

        // Sanitize input
        const sanitizedData = {
            name: sanitizeInput(name),
            email: email ? sanitizeInput(email) : null,
            industryId: body.industryId,
        };

        try {
            const organization = await prisma.organization.create({
                data: {
                    name: sanitizedData.name,
                    email: sanitizedData.email,
                    industryId: sanitizedData.industryId,
                    status: 'ACTIVE'
                }
            });

            // Log the successful creation
            await auditLog('ORGANIZATION_CREATE', {
                organizationId: organization.id,
                name: organization.name,
                email: organization.email
            });

            return NextResponse.json(organization, { status: 201 });
        } catch (error) {
            // console.error("Error creating organization:", error); // silenced for test clarity
            console.log('Caught error:', error);
            console.log('Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.log('Error code:', getErrorCode(error));

            await auditLog('ORGANIZATION_CREATE_ERROR', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            // Use getErrorCode utility
            const errorCode = getErrorCode(error);
            switch (errorCode) {
                case 'P2002':
                    return NextResponse.json(
                        { error: 'Organization with this name or email already exists' },
                        { status: 409 }
                    );
                case 'P2003':
                    return NextResponse.json(
                        { error: 'Invalid industry ID' },
                        { status: 400 }
                    );
                case 'P1001':
                    return NextResponse.json(
                        { error: 'Service temporarily unavailable' },
                        { status: 503 }
                    );
                default:
                    return NextResponse.json(
                        { error: 'Failed to create organization' },
                        { status: 500 }
                    );
            }
        }
    } catch (error) {
        console.error("Error in POST /organizations:", error);
        await auditLog('ORGANIZATION_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json(
            { error: 'Failed to create organization' },
            { status: 500 }
        );
    }
}); 