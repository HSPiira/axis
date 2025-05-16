'use client';

import { Button } from '@/components/ui/button';

interface QuickActionsProps {
    clientId: string;
}

export function QuickActions({ clientId }: QuickActionsProps) {
    return (
        <div className="flex space-x-2">
            <Button
                variant="outline"
                onClick={() => window.location.href = `/admin/clients/${clientId}/edit`}
            >
                Edit Client
            </Button>
            <Button
                variant="outline"
                onClick={() => window.location.href = `/admin/clients/${clientId}/contracts/new`}
            >
                New Contract
            </Button>
            <Button
                variant="outline"
                onClick={() => window.location.href = `/admin/clients/${clientId}/documents/upload`}
            >
                Upload Document
            </Button>
        </div>
    );
} 