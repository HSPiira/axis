'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { ContractModel } from '@/lib/providers/contract-provider';

interface ClientContractsProps {
    clientId: string;
    contracts?: ContractModel[];
    isLoading?: boolean;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function ClientContracts({ clientId, contracts = [], isLoading = false }: ClientContractsProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
    const pastContracts = contracts.filter(c => c.status !== 'ACTIVE');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
                return <CheckCircle2 className="text-green-500" size={16} />;
            case 'OVERDUE':
                return <AlertCircle className="text-red-500" size={16} />;
            default:
                return <Clock className="text-yellow-500" size={16} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={24} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Contracts
                        </h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/admin/clients/${clientId}/contracts/new`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        Add Contract
                    </motion.button>
                </div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                    {activeContracts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                Active Contracts
                            </h4>
                            <div className="space-y-4">
                                {activeContracts.map((contract) => (
                                    <motion.div
                                        key={contract.id}
                                        variants={item}
                                        onClick={() => router.push(`/admin/contracts/${contract.id}`)}
                                        className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl cursor-pointer transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {contract.currency} {contract.billingRate}
                                                    </p>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        per {contract.paymentFrequency?.toLowerCase() || 'month'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Valid until {new Date(contract.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(contract.paymentStatus)}
                                                <span className={`text-sm font-medium
                                                    ${contract.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' :
                                                        contract.paymentStatus === 'OVERDUE' ? 'text-red-600 dark:text-red-400' :
                                                            'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {contract.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pastContracts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                Past Contracts
                            </h4>
                            <div className="space-y-4">
                                {pastContracts.map((contract) => (
                                    <motion.div
                                        key={contract.id}
                                        variants={item}
                                        onClick={() => router.push(`/admin/contracts/${contract.id}`)}
                                        className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl cursor-pointer transition-all duration-200 opacity-75"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {contract.currency} {contract.billingRate}
                                                    </p>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        per {contract.paymentFrequency?.toLowerCase() || 'month'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Ended {new Date(contract.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                                                {contract.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {contracts.length === 0 && (
                        <motion.div
                            variants={item}
                            className="text-center py-12"
                        >
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No contracts found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Add a new contract to get started
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
} 