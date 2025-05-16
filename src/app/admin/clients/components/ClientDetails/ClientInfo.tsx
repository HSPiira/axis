import React from 'react';
import type { ClientModel } from '@/lib/providers/client-provider';

interface ClientInfoProps {
    clientId: string;
    client?: ClientModel;
    isLoading?: boolean;
}

export function ClientInfo({ client, isLoading = false }: ClientInfoProps) {
    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Client Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Contact Details
                        </h4>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {client?.email || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {client?.phone || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {client?.website ? (
                                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                            {client.website}
                                        </a>
                                    ) : '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Business Details
                        </h4>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                                    {client?.address || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {client?.taxId || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {client?.contactPerson || '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {client?.notes && (
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Notes
                        </h4>
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                            {client.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 