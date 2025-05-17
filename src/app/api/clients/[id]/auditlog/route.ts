import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const clientId = (await context.params).id;
    if (!clientId) {
        return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'Client',
                entityId: clientId,
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
            include: {
                User: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { fullName: true } },
                    },
                },
            },
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching audit log:', error);
        return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
    }
} 