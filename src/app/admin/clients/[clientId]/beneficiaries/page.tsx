import React from 'react';
import ClientDetailShell from '../ClientDetailShell';

export default async function BeneficiariesPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="beneficiaries"
        />
    );
} 