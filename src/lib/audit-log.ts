import { prisma } from '@/lib/db';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';
import { auth } from '@/auth';

export type AuditAction =
    | 'INDUSTRY_LIST'
    | 'INDUSTRY_LIST_ERROR'
    | 'INDUSTRY_CREATE'
    | 'INDUSTRY_CREATE_ERROR'
    | 'ORGANIZATION_LIST'
    | 'ORGANIZATION_LIST_ERROR'
    | 'ORGANIZATION_CREATE'
    | 'ORGANIZATION_CREATE_ERROR'
    | 'ROLE_LIST'
    | 'ROLE_LIST_ERROR'
    | 'ROLE_CREATE'
    | 'ROLE_CREATE_ERROR'
    | 'ROLE_DELETE'
    | 'ROLE_DELETE_ERROR'
    | 'KPI_LIST'
    | 'KPI_LIST_ERROR'
    | 'KPI_CREATE'
    | 'KPI_CREATE_ERROR'
    | 'KPI_UPDATE'
    | 'KPI_UPDATE_ERROR'
    | 'KPI_DELETE'
    | 'KPI_DELETE_ERROR'
    | 'DOCUMENT_LIST'
    | 'DOCUMENT_LIST_ERROR'
    | 'DOCUMENT_CREATE'
    | 'DOCUMENT_CREATE_ERROR'
    | 'CONTRACT_LIST'
    | 'CONTRACT_LIST_ERROR'
    | 'CONTRACT_CREATE'
    | 'CONTRACT_CREATE_ERROR';

export async function auditLog(action: AuditAction, data?: Record<string, any>) {
    try {
        // Skip audit logging in test environment
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        // Get the current user from the session
        const session = await auth();
        const userId = session?.user?.id;

        try {
            await prisma.auditLog.create({
                data: {
                    action,
                    data: data || {},
                    timestamp: new Date(),
                    userId: userId || null,
                },
            });
        } catch (error) {
            // Silently handle missing table error
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2021') {
                return;
            }
            // Only log non-table-missing errors
            console.error('Failed to create audit log:', error instanceof Error ? error.message : 'Unknown error');
        }
    } catch (error) {
        // Don't throw errors from audit logging
        console.error('Failed to create audit log:', error instanceof Error ? error.message : 'Unknown error');
    }
} 