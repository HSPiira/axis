"use client";

import { Suspense, useState, useEffect } from 'react';
import { ClientInfo } from '../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../components/ClientDetails/ClientDocuments';
import { ClientStaff } from '../components/ClientDetails/ClientStaff';
import { ClientBeneficiaries } from '../components/ClientDetails/ClientBeneficiaries';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ClientModel } from '@/lib/providers/client-provider';
import type { ContractModel } from '@/lib/providers/contract-provider';
import type { Document } from '@prisma/client';
import type { StaffModel } from '@/lib/providers/staff-provider';
import type { BeneficiaryModel } from '@/lib/providers/beneficiary-provider';
import { UserPen, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useRouter, usePathname } from 'next/navigation';
import { EditClientDialog } from '../components/ClientDetails/EditClientDialog';
import Link from 'next/link';

export interface ClientDetailShellProps {
    clientId: string;
    activeTab: string;
}

export default function ClientDetailShell({
    clientId,
    activeTab
}: ClientDetailShellProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [clientData, setClientData] = useState<{
        client: ClientModel;
        contracts: ContractModel[];
        documents: Document[];
        staff: StaffModel[];
        beneficiaries: BeneficiaryModel[];
    } | null>(null);

    useEffect(() => {
        const contextElement = document.querySelector('.client-data-context');
        if (contextElement) {
            const data = JSON.parse(contextElement.getAttribute('data-client') || '{}');
            setClientData(data);
        }
    }, []);

    useEffect(() => {
        const handleRouteChangeStart = () => setIsLoading(true);
        const handleRouteChangeComplete = () => setIsLoading(false);

        router.events?.on('routeChangeStart', handleRouteChangeStart);
        router.events?.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events?.off('routeChangeStart', handleRouteChangeStart);
            router.events?.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router]);

    if (!clientData) {
        return <LoadingSpinner />;
    }

    const { client, contracts, documents, staff, beneficiaries } = clientData;

    const tabs = [
        { id: 'overview', label: 'Overview', href: `/admin/clients/${clientId}` },
        { id: 'staff', label: 'Staff', href: `/admin/clients/${clientId}/staff` },
        { id: 'beneficiaries', label: 'Beneficiaries', href: `/admin/clients/${clientId}/beneficiaries` },
        { id: 'contracts', label: 'Contracts', href: `/admin/clients/${clientId}/contracts` },
        { id: 'documents', label: 'Documents', href: `/admin/clients/${clientId}/documents` },
        { id: 'settings', label: 'Settings', href: `/admin/clients/${clientId}/settings` }
    ];

    return (
        <>
            <div className="mb-4">
                <Breadcrumbs
                    items={[
                        { label: 'Clients', href: '/admin/clients' },
                        { label: 'Client List', href: '/admin/clients/list' },
                        { label: 'Client Details' }
                    ]}
                />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {client.name}
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            client.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : client.status === 'INACTIVE'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`} title={client.status}>
                            {client.status === 'ACTIVE' ? (
                                <CheckCircle2 size={16} />
                            ) : client.status === 'INACTIVE' ? (
                                <XCircle size={16} />
                            ) : (
                                <Clock size={16} />
                            )}
                        </span>
                    </h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{client.industry?.name || 'No industry'}</span>
                </div>
            </div>
            <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-6">
                    <nav className="flex space-x-1">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="p-6 hover:shadow-md transition-shadow relative">
                                    <div className="flex items-center justify-between mb-6 gap-2">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Client Information</h3>
                                        <button
                                            onClick={() => setEditDialogOpen(true)}
                                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 shadow transition flex items-center justify-center"
                                            aria-label="Edit client info"
                                        >
                                            <UserPen size={18} />
                                        </button>
                                    </div>
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <ClientInfo clientId={clientId} client={client} hideTitle={true} />
                                    </Suspense>
                                </Card>
                            </div>
                            <div className="space-y-6">
                                <Card className="p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Staff</p>
                                            <p className="text-2xl font-semibold">{staff.filter(s => s.status === 'ACTIVE').length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Beneficiaries</p>
                                            <p className="text-2xl font-semibold">{beneficiaries.filter(b => b.status === 'ACTIVE').length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Contracts</p>
                                            <p className="text-2xl font-semibold">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                                            <p className="text-2xl font-semibold">{documents.length}</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                    {/* Add recent activity here */}
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientStaff clientId={clientId} staff={staff} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'beneficiaries' && (
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientBeneficiaries clientId={clientId} beneficiaries={beneficiaries} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'contracts' && (
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientContracts clientId={clientId} contracts={contracts} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'documents' && (
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientDocuments documents={documents} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'settings' && (
                        <Card className="p-6">
                            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Client Settings</h3>
                            </div>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={client.name}
                                        onChange={(e) => {
                                            // Handle name change
                                        }}
                                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={client.email || ''}
                                        onChange={(e) => {
                                            // Handle email change
                                        }}
                                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={client.status}
                                        onChange={(e) => {
                                            // Handle status change
                                        }}
                                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
            <EditClientDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                client={client}
            />
        </>
    );
} 