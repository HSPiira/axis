import React from 'react';
import ClientDetailShell from '../ClientDetailShell';
import { getClientData } from '../layout';
import { ClientModel } from '@/lib/providers/client-provider';

export default async function StaffPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    const client = await getClientData(clientId); // Fetch the client data
    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="staff"
            client={client as ClientModel}
        />
    );
} 