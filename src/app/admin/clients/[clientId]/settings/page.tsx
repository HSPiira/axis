import React from 'react';
import ClientDetailShell from '../ClientDetailShell';
import { getClientData } from '../layout';
import { ClientModel } from '@/lib/providers/client-provider';

export default async function SettingsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    const client = await getClientData(clientId); // Fetch the client data
    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="settings"
            client={client as ClientModel}
        />
    );
} 