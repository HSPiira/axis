import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-log';
import { Prisma, DocumentType } from "@/generated/prisma";

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

// GET /api/documents
export const GET = withPermission(PERMISSIONS.DOCUMENT_READ)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'GET_DOCUMENTS');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const { searchParams } = new URL(request.url);
        let page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        let limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10')));
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') as DocumentType | null;
        const organizationId = searchParams.get('organizationId');
        const contractId = searchParams.get('contractId');

        // Handle invalid numbers
        if (isNaN(page)) page = 1;
        if (isNaN(limit)) limit = 10;

        // Build where clause
        const where: Prisma.DocumentWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
                    ]
                } : {},
                type ? { type } : {},
                organizationId ? { organizationId } : {},
                contractId ? { contractId } : {},
            ]
        };

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    uploadedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    contract: {
                        select: {
                            id: true,
                            organizationId: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.document.count({ where }),
        ]);

        // Log the successful request
        await auditLog('DOCUMENT_LIST', {
            page,
            limit,
            search,
            type,
            total
        });

        return NextResponse.json({
            documents,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        await auditLog('DOCUMENT_LIST_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
});

// POST /api/documents
export const POST = withPermission(PERMISSIONS.DOCUMENT_CREATE)(async (request: NextRequest) => {
    try {
        // Apply rate limiting
        const limiter = rateLimit();
        const result = await limiter.check(50, 'POST_DOCUMENT');
        if (!result.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate required fields and length constraints
        const title = body.title?.trim();
        const description = body.description?.trim();
        const type = body.type as DocumentType;
        const url = body.url?.trim();
        const fileSize = body.fileSize;
        const fileType = body.fileType?.trim();
        const organizationId = body.organizationId;
        const contractId = body.contractId;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        if (title.length > MAX_TITLE_LENGTH) {
            return NextResponse.json(
                { error: "Title exceeds maximum length" },
                { status: 400 }
            );
        }

        if (description && description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json(
                { error: "Description exceeds maximum length" },
                { status: 400 }
            );
        }

        if (!type || !Object.values(DocumentType).includes(type)) {
            return NextResponse.json(
                { error: "Valid document type is required" },
                { status: 400 }
            );
        }

        if (!url) {
            return NextResponse.json(
                { error: "Document URL is required" },
                { status: 400 }
            );
        }

        const document = await prisma.document.create({
            data: {
                title,
                description,
                type,
                url,
                fileSize,
                fileType,
                organizationId,
                contractId,
                version: 1,
                isLatest: true,
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                contract: {
                    select: {
                        id: true,
                        organizationId: true,
                    },
                },
            },
        });

        // Log the successful creation
        await auditLog('DOCUMENT_CREATE', {
            documentId: document.id,
            title: document.title,
            type: document.type
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error("Error creating document:", error);
        await auditLog('DOCUMENT_CREATE_ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(
            { error: "Failed to create document" },
            { status: 500 }
        );
    }
});
