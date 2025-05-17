import React from 'react';
import type { ContractModel } from '@/lib/providers/contract-provider';

interface ContractStatsProps {
    clientId: string;
    contracts?: ContractModel[];
    isLoading?: boolean;
}

export function ContractStats({ contracts = [], isLoading = false }: ContractStatsProps) {
    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
    const totalValue = activeContracts.reduce((sum, contract) => sum + contract.billingRate, 0);
    const overdueContracts = activeContracts.filter(c => c.paymentStatus === 'OVERDUE');
    const upcomingRenewals = activeContracts.filter(c => {
        if (!c.renewalDate) return false;
        const renewalDate = new Date(c.renewalDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return renewalDate <= thirtyDaysFromNow;
    });

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Contract Overview
                </h3>

                <dl className="grid grid-cols-1 gap-5">
                    <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Active Contracts
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {activeContracts.length}
                        </dd>
                    </div>

                    <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Total Monthly Value
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: activeContracts[0]?.currency || 'USD'
                            }).format(totalValue)}
                        </dd>
                    </div>

                    <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Overdue Payments
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {overdueContracts.length}
                        </dd>
                    </div>

                    <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Upcoming Renewals (30 days)
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {upcomingRenewals.length}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
} 