import React from 'react';
import ClientDetailShell from '../ClientDetailShell';
import { ClientProvider } from "@/lib/providers/client-provider";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const getClientData = unstable_cache(
    async (clientId: string) => {
        const clientProvider = new ClientProvider();
        const client = await clientProvider.get(clientId);
        return client;
    },
    ["client-data"],
    {
        revalidate: 60,
        tags: ["client"],
    }
);

export default async function DocumentsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const { clientId } = await params;
    const client = await getClientData(clientId);

    if (!client) {
        return null; // Layout will handle the not found case
    }

    return (
        <ClientDetailShell
            clientId={clientId}
            activeTab="documents"
            client={client}
        />
    );
} 