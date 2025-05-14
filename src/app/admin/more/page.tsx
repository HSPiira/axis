import React from 'react';
import Link from 'next/link';
import * as Icons from 'react-icons/fi';

const extraNavItems = [
    { icon: 'FiSettings', label: 'Settings', to: '/admin/settings' },
    { icon: 'FiBarChart', label: 'Insights', to: '/admin/insights' },
];

export default function MorePage() {
    return (
        <div className="max-w-xl mx-auto p-4 pt-8">
            <div className="bg-white dark:bg-black rounded-xl shadow border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                {extraNavItems.map((item) => {
                    const Icon = (Icons as any)[item.icon] || Icons.FiCircle;
                    return (
                        <Link
                            key={item.label}
                            href={item.to}
                            className="flex items-center justify-between px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <Icon className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{item.label}</span>
                            </div>
                            <Icons.FiChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                    );
                })}
            </div>
            <p className="mt-8 text-gray-500 text-sm text-center">
                We view the mobile application as an extension of the web application. If you are performing any complicated actions, please refer back to the web application.
            </p>
        </div>
    );
} 