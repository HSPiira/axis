import React from 'react';
import { ClientProvider } from '@/lib/providers/client-provider';
import ClientsDashboard from './components/ClientsDashboard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

async function getClientData() {
    const provider = new ClientProvider();

    // Get recent clients
    const { data: clients } = await provider.list({
        page: 1,
        limit: 5,
        sort: { field: 'updatedAt', direction: 'desc' }
    });

    // Get total clients
    const { pagination: { total } } = await provider.list({ limit: 1 });

    // Get active clients
    const { pagination: { total: activeTotal } } = await provider.list({
        filters: { status: 'ACTIVE' },
        limit: 1
    });

    // Get new clients this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { pagination: { total: newThisMonth } } = await provider.list({
        filters: {
            createdAt: {
                gte: firstDayOfMonth.toISOString()
            }
        },
        limit: 1
    });

    return {
        clients,
        stats: {
            total,
            active: activeTotal,
            newThisMonth
        }
    };
}

export default async function ClientsPage() {
    const { clients, stats } = await getClientData();

    return (
        <>
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' }
                ]}
            />
            <ClientsDashboard clients={clients} stats={stats} />
        </>
    );
} 