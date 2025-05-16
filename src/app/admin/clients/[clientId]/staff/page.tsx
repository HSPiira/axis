import React from 'react';
import ClientDetailShell from '../ClientDetailShell';

export default async function StaffPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="staff"
        />
    );
} 