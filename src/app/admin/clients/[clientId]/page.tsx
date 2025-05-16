import { Metadata } from 'next';
import { Suspense } from 'react';
import { ClientHeader } from '../components/ClientDetails/ClientHeader';
import { ClientInfo } from '../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../components/ClientDetails/ClientDocuments';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import ClientActions from '../components/ClientList/ClientActions';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ClientProvider } from '@/lib/providers/client-provider';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { DocumentProvider } from '@/lib/providers/document-provider';
import type { Document } from '@prisma/client';
import ClientDetailShell from './ClientDetailShell';

type ClientDetailPageProps = {
    params: Promise<{ clientId: string }>;
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: ClientDetailPageProps): Promise<Metadata> {
    const { clientId } = await params;
    return {
        title: `Client Details - ${clientId}`,
        description: `View and manage client details, contracts, and documents for client ${clientId}`,
    };
}

async function getClientData(clientId: string) {
    const clientProvider = new ClientProvider();
    const contractProvider = new ContractProvider();
    const documentProvider = new DocumentProvider();

    const [client, contracts, documents] = await Promise.all([
        clientProvider.get(clientId),
        contractProvider.list({ filters: { clientId } }),
        documentProvider.list({ clientId })
    ]);

    console.log('Fetched client:', client);

    return {
        client,
        contracts: contracts.data,
        documents: documents.data
    };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
    const { clientId } = await params;
    const { client, contracts, documents } = await getClientData(clientId);

    if (!client) {
        return (
            <div className="max-w-2xl mx-auto mt-16 p-8 bg-white dark:bg-gray-900 rounded-xl shadow text-center">
                <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">The client you are looking for does not exist or has been deleted.</p>
                <a href="/admin/clients/list" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Back to Client List</a>
            </div>
        );
    }

    return (
        <ClientDetailShell
            clientId={clientId}
            client={client}
            contracts={contracts}
            documents={documents}
        />
    );
} 