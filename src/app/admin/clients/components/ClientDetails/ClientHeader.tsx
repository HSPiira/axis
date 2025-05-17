'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { ClientModel } from '@/lib/providers/client-provider';

interface ClientHeaderProps {
    clientId: string;
    client?: ClientModel;
    isLoading?: boolean;
}

export function ClientHeader({ clientId, client, isLoading = false }: ClientHeaderProps) {
    const router = useRouter();

    if (isLoading) {
        return <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {client?.name || 'Loading...'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {client?.industry?.name || 'No industry specified'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => router.push(`/admin/clients/${clientId}/edit`)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => {/* Add more actions logic */ }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            More Actions
                            <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${client?.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            client?.status === 'INACTIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {client?.status || 'PENDING'}
                    </span>
                    {client?.isVerified && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Verified
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
} 