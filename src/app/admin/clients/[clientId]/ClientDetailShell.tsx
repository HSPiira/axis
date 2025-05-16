"use client";

import { Suspense, useState } from 'react';
import { ClientInfo } from '../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../components/ClientDetails/ClientDocuments';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ClientModel } from '@/lib/providers/client-provider';
import type { ContractModel } from '@/lib/providers/contract-provider';
import type { Document } from '@prisma/client';
import { UserPen, Save, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditClientDialog } from '../components/ClientDetails/EditClientDialog';

export interface ClientDetailShellProps {
    clientId: string;
    client: ClientModel;
    contracts: ContractModel[];
    documents: Document[];
}

export default function ClientDetailShell({ clientId, client, contracts, documents }: ClientDetailShellProps) {
    const router = useRouter();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

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
                        {/* Status icon */}
                        {client.status === 'ACTIVE' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                        {client.status === 'INACTIVE' && <AlertCircle className="w-6 h-6 text-red-500" />}
                        {client.status === 'PENDING' && <Clock className="w-6 h-6 text-yellow-500" />}
                    </h1>
                    <span className="text-base text-gray-500 dark:text-gray-400 font-medium ml-2">{client.industry?.name || 'No industry'}</span>
                </div>
            </div>
            <div className="mt-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="contracts">Contracts</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-6">
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Contracts</p>
                                            <p className="text-2xl font-semibold">{contracts.filter((c: ContractModel) => c.status === 'ACTIVE').length}</p>
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
                    </TabsContent>
                    <TabsContent value="contracts">
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientContracts clientId={clientId} contracts={contracts} />
                            </Suspense>
                        </Card>
                    </TabsContent>
                    <TabsContent value="documents">
                        <Card className="p-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClientDocuments clientId={clientId} documents={documents} />
                            </Suspense>
                        </Card>
                    </TabsContent>
                    <TabsContent value="settings">
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
                    </TabsContent>
                </Tabs>
            </div>
            <EditClientDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                client={client}
                onSuccess={() => router.refresh()}
            />
        </>
    );
} 