import { prisma } from './db';

export type AuditLogAction =
    | 'INDUSTRY_LIST'
    | 'INDUSTRY_LIST_ERROR'
    | 'INDUSTRY_CREATE'
    | 'INDUSTRY_CREATE_ERROR'
    | 'INDUSTRY_VALIDATION_ERROR';

interface AuditLogData {
    [key: string]: any;
}

export async function auditLog(action: AuditLogAction, data: AuditLogData) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                data: JSON.stringify(data),
                timestamp: new Date(),
            }
        });
    } catch (error) {
        // Don't throw errors from audit logging
        console.error('Failed to create audit log:', error);
    }
} 