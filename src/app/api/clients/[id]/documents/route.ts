import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const documents = await prisma.document.findMany({
            where: {
                clientId: id,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                type: true,
                fileSize: true,
                fileType: true,
                url: true,
                createdAt: true,
                isConfidential: true,
            },
        });

        // Map the fields to match the frontend interface
        const mappedDocuments = documents.map(doc => ({
            id: doc.id,
            name: doc.title,
            type: doc.fileType || doc.type,
            size: doc.fileSize || 0,
            uploadedAt: doc.createdAt.toISOString(),
            url: doc.url,
            isPrivate: doc.isConfidential,
        }));

        return NextResponse.json(mappedDocuments);
    } catch (error) {
        console.error('Error fetching client documents:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 