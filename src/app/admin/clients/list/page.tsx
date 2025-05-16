import React from 'react';
import { ClientTable } from '../components/ClientList';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ClientActions } from '../components/ClientList/ClientActions';
import { ClientFilters } from '../components/ClientList';

export default function ClientListPage() {
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
                    <ClientTable />
                </div>
            </div>
        </>
    );
} 