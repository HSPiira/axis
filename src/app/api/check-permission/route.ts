import { NextResponse } from 'next/server';
import { checkPermission } from '@/middleware/check-permission';
import type { NextRequest } from 'next/server';
import type { PermissionType } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission') as PermissionType;

    if (!permission) {
        return NextResponse.json(
            { error: 'Permission parameter is required' },
            { status: 400 }
        );
    }

    const hasPermission = await checkPermission(request, permission);
    return NextResponse.json({ hasPermission });
} 