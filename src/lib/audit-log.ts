import { prisma } from '@/lib/db';

export type AuditAction =
    | 'INDUSTRY_LIST'
    | 'INDUSTRY_LIST_ERROR'
    | 'INDUSTRY_CREATE'
    | 'INDUSTRY_CREATE_ERROR'
    | 'ORGANIZATION_LIST'
    | 'ORGANIZATION_LIST_ERROR'
    | 'ORGANIZATION_CREATE'
    | 'ORGANIZATION_CREATE_ERROR';

export async function auditLog(action: AuditAction, data?: Record<string, any>) {
    try {
        // Skip audit logging in test environment
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        await prisma.auditLog.create({
            data: {
                action,
                data: data || {},
                timestamp: new Date(),
            },
        });
    } catch (error) {
        // Don't throw errors from audit logging
        console.error('Failed to create audit log:', error);
    }
} 