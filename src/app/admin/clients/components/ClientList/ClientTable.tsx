'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MoreHorizontal, Building2, Mail, Phone, AlertCircle } from 'lucide-react';
import type { ClientModel } from '@/lib/providers/client-provider';

interface ClientTableProps {
    clients?: ClientModel[];
    isLoading?: boolean;
}

const tableVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
};

export default function ClientTable({ clients = [], isLoading = false }: ClientTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No clients</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new client.
                </p>
            </div>
        );
    }

    const getContactInfo = (client: ClientModel) => {
        if (client.email && client.phone) {
            return (
                <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{client.email}</span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{client.phone}</span>
                </div>
            );
        }
        if (client.email) {
            return (
                <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{client.email}</span>
                </div>
            );
        }
        if (client.phone) {
            return (
                <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{client.phone}</span>
                </div>
            );
        }
        return '-';
    };

    return (
        <div className="overflow-x-auto">
            <motion.table
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                variants={tableVariants}
                initial="hidden"
                animate="show"
            >
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-gray-200 dark:border-gray-600">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-gray-200 dark:border-gray-600">
                            Industry
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-gray-200 dark:border-gray-600">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-gray-200 dark:border-gray-600">
                            Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-gray-200 dark:border-gray-600">
                            Verified
                        </th>
                        <th scope="col" className="relative px-6 py-3 border-gray-200 dark:border-gray-600">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {clients.map((client) => (
                        <motion.tr
                            key={client.id}
                            variants={rowVariants}
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 border-gray-200 dark:border-gray-700"
                        >
                            <td className="px-6 py-1 whitespace-nowrap border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {client.name}
                                </div>
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {client.industry?.name || '-'}
                                </div>
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap border-gray-200 dark:border-gray-700">
                                <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full
                                    ${client.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                        : client.status === 'INACTIVE'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'ACTIVE'
                                        ? 'bg-green-500'
                                        : client.status === 'INACTIVE'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                        }`} />
                                    {client.status}
                                </span>
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                                {getContactInfo(client)}
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap border-gray-200 dark:border-gray-700">
                                {client.isVerified ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                )}
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap text-right text-sm font-medium border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add action menu logic here
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </motion.table>
        </div>
    );
} 