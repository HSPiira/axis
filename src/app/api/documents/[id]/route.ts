import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { auditLog } from '@/lib/audit-log';
import { Prisma, DocumentType } from "@/generated/prisma";

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

// GET /api/documents/[id]
export const GET = withPermission(PERMISSIONS.DOCUMENT_READ)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true
                            }
                        }
                    },
                },
                organization: {
                    select: { id: true, name: true },
                },
                contract: {
                    select: { id: true, organizationId: true },
                },
            },
        });
        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }
        await auditLog('DOCUMENT_LIST', { documentId: params.id });
        return NextResponse.json(document);
    } catch (error) {
        console.error("Error fetching document:", error);
        await auditLog('DOCUMENT_LIST_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', documentId: params.id });
        return NextResponse.json(
            { error: "Failed to fetch document" },
            { status: 500 }
        );
    }
});

// PATCH /api/documents/[id]
export const PATCH = withPermission(PERMISSIONS.DOCUMENT_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }
        // Validate fields
        const updateData: Prisma.DocumentUpdateInput = {};
        if (body.title !== undefined) {
            if (!body.title.trim()) {
                return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
            }
            if (body.title.length > MAX_TITLE_LENGTH) {
                return NextResponse.json({ error: "Title exceeds maximum length" }, { status: 400 });
            }
            updateData.title = body.title.trim();
        }
        if (body.description !== undefined) {
            if (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) {
                return NextResponse.json({ error: "Description exceeds maximum length" }, { status: 400 });
            }
            updateData.description = body.description?.trim();
        }
        if (body.type !== undefined) {
            if (!Object.values(DocumentType).includes(body.type)) {
                return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
            }
            updateData.type = body.type;
        }
        if (body.url !== undefined) {
            if (!body.url.trim()) {
                return NextResponse.json({ error: "URL cannot be empty" }, { status: 400 });
            }
            updateData.url = body.url.trim();
        }
        if (body.fileSize !== undefined) updateData.fileSize = body.fileSize;
        if (body.fileType !== undefined) updateData.fileType = body.fileType?.trim();
        if (body.organizationId !== undefined) {
            updateData.organization = body.organizationId
                ? { connect: { id: body.organizationId } }
                : { disconnect: true };
        }
        if (body.contractId !== undefined) {
            updateData.contract = body.contractId
                ? { connect: { id: body.contractId } }
                : { disconnect: true };
        }
        // version, isLatest, previousVersionId are not patchable here

        const document = await prisma.document.update({
            where: { id: params.id },
            data: updateData as any,
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                organization: { select: { id: true, name: true } },
                contract: { select: { id: true, organizationId: true } },
            },
        });
        await auditLog('DOCUMENT_CREATE', { documentId: params.id, update: true });
        return NextResponse.json(document);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        console.error("Error updating document:", error);
        await auditLog('DOCUMENT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', documentId: params.id });
        return NextResponse.json(
            { error: "Failed to update document" },
            { status: 500 }
        );
    }
});

// DELETE /api/documents/[id]
export const DELETE = withPermission(PERMISSIONS.DOCUMENT_DELETE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const document = await prisma.document.delete({
            where: { id: params.id },
        });
        await auditLog('DOCUMENT_CREATE', { documentId: params.id, deleted: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        console.error("Error deleting document:", error);
        await auditLog('DOCUMENT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', documentId: params.id });
        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
});

// PUT /api/documents/[id]
export const PUT = withPermission(PERMISSIONS.DOCUMENT_UPDATE)(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }
        // Validate required fields
        const title = body.title?.trim();
        const type = body.type;
        const url = body.url?.trim();
        if (!title || !type || !url) {
            return NextResponse.json({ error: "Title, type, and url are required" }, { status: 400 });
        }
        if (title.length > MAX_TITLE_LENGTH) {
            return NextResponse.json({ error: "Title exceeds maximum length" }, { status: 400 });
        }
        if (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) {
            return NextResponse.json({ error: "Description exceeds maximum length" }, { status: 400 });
        }
        if (!Object.values(DocumentType).includes(type)) {
            return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
        }
        // Build update data
        const updateData: Prisma.DocumentUpdateInput = {
            title,
            description: body.description?.trim(),
            type,
            url,
            fileSize: body.fileSize,
            fileType: body.fileType?.trim(),
        };
        if (body.organizationId !== undefined) {
            updateData.organization = body.organizationId
                ? { connect: { id: body.organizationId } }
                : { disconnect: true };
        }
        if (body.contractId !== undefined) {
            updateData.contract = body.contractId
                ? { connect: { id: body.contractId } }
                : { disconnect: true };
        }
        // version, isLatest, previousVersionId are not patchable here
        const document = await prisma.document.update({
            where: { id: params.id },
            data: updateData as any,
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                organization: { select: { id: true, name: true } },
                contract: { select: { id: true, organizationId: true } },
            },
        });
        await auditLog('DOCUMENT_CREATE', { documentId: params.id, put: true });
        return NextResponse.json(document);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        console.error("Error replacing document:", error);
        await auditLog('DOCUMENT_CREATE_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', documentId: params.id });
        return NextResponse.json(
            { error: "Failed to replace document" },
            { status: 500 }
        );
    }
});

// OPTIONS /api/documents/[id]
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: 'GET,PUT,PATCH,DELETE,OPTIONS',
        },
    });
} 