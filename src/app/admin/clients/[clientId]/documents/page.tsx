import React from 'react';
import ClientDetailShell from '../ClientDetailShell';

export default async function DocumentsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="documents"
        />
    );
} 