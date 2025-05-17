"use client";

import { Suspense } from 'react';
import { ClientInfo } from '../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../components/ClientDetails/ClientDocuments';
import { ClientStaff } from '../components/ClientDetails/ClientStaff';
import { ClientBeneficiaries } from '../components/ClientDetails/ClientBeneficiaries';
import { Card } from '@/components/ui/card';
import type { ClientModel } from '@/lib/providers/client-provider';
import { UserPen, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useRouter } from 'next/navigation';
import { EditClientDialog } from '../components/ClientDetails/EditClientDialog';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ClientActivityWrapper from '../components/ClientDetails/ClientActivityWrapper';
import { ClientStatsWrapper } from '../components/ClientDetails/ClientStatsWrapper';

function SkeletonCard() {
    return (
        <Card className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </Card>
    );
}

function SkeletonHeader() {
    return (
        <div className="flex items-center gap-4 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
    );
}

export interface ClientDetailShellProps {
    clientId: string;
    activeTab: string;
    client: ClientModel;
}

export default function ClientDetailShell({
    clientId,
    activeTab,
    client
}: ClientDetailShellProps) {
    const router = useRouter();
    const { status } = useSession();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    if (status === 'loading') {
        return (
            <div className="space-y-8">
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Clients', href: '/admin/clients' },
                            { label: 'Client List', href: '/admin/clients/list' },
                            { label: 'Client Details' }
                        ]}
                    />
                </div>
                <SkeletonHeader />
                <div className="mt-8">
                    <div className="mb-6">
                        <nav className="flex space-x-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                            ))}
                        </nav>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <SkeletonCard />
                        </div>
                        <div className="space-y-6">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

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
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${client.status === 'ACTIVE'
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
                <div className="mb-6">
                    <nav className="flex space-x-6">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="p-6 relative">
                                    <div className="flex items-center justify-between mb-6 gap-2">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Client Information</h3>
                                        <button
                                            onClick={() => setEditDialogOpen(true)}
                                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition flex items-center justify-center"
                                            aria-label="Edit client info"
                                        >
                                            <UserPen size={18} />
                                        </button>
                                    </div>
                                    <Suspense fallback={<SkeletonCard />}>
                                        <ClientInfo clientId={clientId} client={client} hideTitle={true} />
                                    </Suspense>
                                </Card>
                            </div>
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                                    <Suspense fallback={<SkeletonCard />}>
                                        <ClientStatsWrapper clientId={clientId} />
                                    </Suspense>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                    <Suspense fallback={<SkeletonCard />}>
                                        <ClientActivityWrapper clientId={clientId} />
                                    </Suspense>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <Card className="p-6">
                            <Suspense fallback={<SkeletonCard />}>
                                <ClientStaff clientId={clientId} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'beneficiaries' && (
                        <Card className="p-6">
                            <Suspense fallback={<SkeletonCard />}>
                                <ClientBeneficiaries clientId={clientId} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'contracts' && (
                        <Card className="p-6">
                            <Suspense fallback={<SkeletonCard />}>
                                <ClientContracts clientId={clientId} />
                            </Suspense>
                        </Card>
                    )}

                    {activeTab === 'documents' && (
                        <Card className="p-6">
                            <Suspense fallback={<SkeletonCard />}>
                                <ClientDocuments clientId={clientId} />
                            </Suspense>
                        </Card>
                    )}
                </div>
            </div>

            <EditClientDialog
                client={client}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </>
    );
} 