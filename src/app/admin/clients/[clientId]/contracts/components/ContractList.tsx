'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { ContractModel } from '@/lib/providers/contract-provider';

interface ContractListProps {
    clientId: string;
    contracts?: ContractModel[];
    isLoading?: boolean;
}

export function ContractList({ clientId, contracts = [], isLoading = false }: ContractListProps) {
    const router = useRouter();

    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Contract History
                    </h3>
                    <button
                        onClick={() => router.push(`/admin/clients/${clientId}/contracts/new`)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        New Contract
                    </button>
                </div>

                {contracts.length > 0 ? (
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contract Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {contracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {contract.currency} {contract.billingRate}/
                                                {contract.paymentFrequency?.toLowerCase() || 'month'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {contract.paymentTerms || 'Standard terms'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(contract.startDate).toLocaleDateString()} -
                                                {new Date(contract.endDate).toLocaleDateString()}
                                            </div>
                                            {contract.renewalDate && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Renews on {new Date(contract.renewalDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        contract.status === 'TERMINATED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                    {contract.status}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${contract.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        contract.paymentStatus === 'OVERDUE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                    {contract.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => router.push(`/admin/contracts/${contract.id}`)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No contracts found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 