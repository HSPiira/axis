'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    FileSpreadsheet,
    FileUp,
    Tags,
    ChevronRight,
    Activity,
    UserCheck,
    UserPlus as UserPlusIcon,
    Clock
} from 'lucide-react';

interface Client {
    id: string;
    name: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    active: number;
    newThisMonth: number;
}

interface ClientsDashboardProps {
    clients: Client[];
    stats: Stats;
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

function useClientAuditLog(clientId: string) {
    const [activity, setActivity] = useState<string>('');
    useEffect(() => {
        async function fetchLog() {
            try {
                const res = await fetch(`/api/clients/${clientId}/auditlog`);
                const logs = await res.json();
                if (!Array.isArray(logs) || logs.length === 0) return;
                const latest = logs.find(log => ['deleted', 'updated', 'created'].includes(log.action));
                if (latest) {
                    let who = 'unknown';
                    if (latest.User) {
                        who = latest.User.profile?.fullName || latest.User.email || latest.User.id || 'unknown';
                    } else if (latest.userId) {
                        who = latest.userId;
                    }
                    const when = formatDistanceToNow(new Date(latest.timestamp));
                    setActivity(`${capitalize(latest.action)} by ${who} ${when} ago`);
                }
            } catch { }
        }
        fetchLog();
    }, [clientId]);
    return activity;
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ClientsDashboard({ clients, stats }: ClientsDashboardProps) {
    const router = useRouter();

    const statCards = [
        { title: 'Total Clients', value: stats.total, icon: Users, color: 'bg-blue-500' },
        { title: 'Active Clients', value: stats.active, icon: UserCheck, color: 'bg-green-500' },
        { title: 'New This Month', value: stats.newThisMonth, icon: UserPlusIcon, color: 'bg-purple-500' },
        {
            title: 'Active Ratio',
            value: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`,
            icon: Activity,
            color: 'bg-orange-500'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Clients Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage and monitor your client relationships
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/admin/clients/list')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                    View All Clients
                    <ChevronRight size={16} />
                </motion.button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={item}
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 ${stat.color} rounded-lg text-white`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    variants={item}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-500" size={24} />
                            <h2 className="text-lg font-semibold">Recent Clients</h2>
                        </div>
                    </div>
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                        {clients.map((client) => (
                            <motion.div
                                variants={item}
                                key={client.id}
                                className="group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                                onClick={() => router.push(`/admin/clients/${client.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {client.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {useClientAuditLog(client.id) || `Updated ${formatDistanceToNow(new Date(client.updatedAt))} ago`}
                                        </p>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
                                </div>
                            </motion.div>
                        ))}
                        {clients.length === 0 && (
                            <motion.div variants={item} className="text-center py-8">
                                <Users size={40} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No clients found</p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={item}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { title: 'Add Client', icon: UserPlus, path: '/admin/clients/new', color: 'from-green-500 to-emerald-700' },
                            { title: 'Import Clients', icon: FileSpreadsheet, path: '/admin/clients/import', color: 'from-blue-500 to-blue-700' },
                            { title: 'Export Data', icon: FileUp, path: '/admin/clients/export', color: 'from-purple-500 to-purple-700' },
                            { title: 'Manage Tags', icon: Tags, path: '/admin/clients/tags', color: 'from-orange-500 to-orange-700' },
                        ].map((action) => (
                            <motion.button
                                key={action.title}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(action.path)}
                                className={`p-4 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition-all duration-200`}
                            >
                                <action.icon size={24} className="mb-2" />
                                <p className="font-medium">{action.title}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
} 