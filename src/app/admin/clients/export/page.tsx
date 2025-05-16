'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { FileDown } from 'lucide-react';

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

export default function ExportClientsPage() {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' },
                    { label: 'Client List', href: '/admin/clients/list' },
                    { label: 'Export Clients' }
                ]}
            />

            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <FileDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Clients</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Export your client data to various formats
                        </p>
                    </div>
                </div>

                {/* Export options will go here */}
            </motion.div>
        </motion.div>
    );
} 