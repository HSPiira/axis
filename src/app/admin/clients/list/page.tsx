import React from 'react';
import { ClientTable } from '../components/ClientList';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import ClientActions from '../components/ClientList/ClientActions';
import { ClientFilters } from '../components/ClientList';
import { ClientProvider } from '@/lib/providers/client-provider';

async function getClients(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
    const params = await searchParams;
    const provider = new ClientProvider();
    const { data } = await provider.list({
        page: 1,
        limit: 10,
        search: params.search as string,
        filters: {
            status: params.status as any,
            isVerified: params.isVerified ? params.isVerified === 'true' : undefined,
        },
        sort: { field: 'createdAt', direction: 'desc' }
    });
    return data;
}

export default async function ClientListPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const clients = await getClients(searchParams);

    return (
        <>
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' },
                    { label: 'Client List' }
                ]}
            />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Client List</h1>
                    <ClientActions />
                </div>

                <ClientFilters />

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <ClientTable clients={clients} />
                </div>
            </div>
        </>
    );
} 