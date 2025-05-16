import React from 'react';
import { ClientProvider } from '@/lib/providers/client-provider';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { DocumentProvider } from '@/lib/providers/document-provider';
import { StaffProvider } from '@/lib/providers/staff-provider';
import { BeneficiaryProvider } from '@/lib/providers/beneficiary-provider';
import { cache } from 'react';

const getClientData = cache(async (clientId: string) => {
    const clientProvider = new ClientProvider();
    const contractProvider = new ContractProvider();
    const staffProvider = new StaffProvider();
    const beneficiaryProvider = new BeneficiaryProvider();
    const documentProvider = new DocumentProvider();

    const [client, contracts, staff, beneficiaries, documents] = await Promise.all([
        clientProvider.get(clientId),
        contractProvider.list({ filters: { clientId } }),
        staffProvider.list({ filters: { clientId } }),
        beneficiaryProvider.list({ filters: { clientId } }),
        documentProvider.list({ clientId })
    ]);

    return {
        client,
        contracts: contracts.data,
        documents: documents.data,
        staff: staff.data,
        beneficiaries: beneficiaries.data
    };
});

export default async function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clientId: string }>;
}) {
    const { clientId } = await params;
    const { client, contracts, documents, staff, beneficiaries } = await getClientData(clientId);

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
        <div className="client-data-context" data-client={JSON.stringify({
            client,
            contracts,
            documents,
            staff,
            beneficiaries
        })}>
            {children}
        </div>
    );
} 