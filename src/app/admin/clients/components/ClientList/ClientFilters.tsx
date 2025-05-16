'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import type { BaseStatus } from '@prisma/client';

interface ClientFiltersProps {
    onFilterChange?: (filters: {
        status?: BaseStatus;
        industryId?: string;
        isVerified?: boolean;
        search?: string;
    }) => void;
}

const filterVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0 }
};

export default function ClientFilters({ onFilterChange }: ClientFiltersProps) {
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<BaseStatus>();
    const [industryId, setIndustryId] = React.useState<string>();
    const [isVerified, setIsVerified] = React.useState<boolean>();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleFilterChange = React.useCallback(() => {
        onFilterChange?.({
            search: search || undefined,
            status,
            industryId,
            isVerified,
        });
    }, [search, status, industryId, isVerified, onFilterChange]);

    React.useEffect(() => {
        handleFilterChange();
    }, [search, status, industryId, isVerified, handleFilterChange]);

    const activeFiltersCount = [
        search,
        status,
        industryId,
        isVerified !== undefined
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearch('');
        setStatus(undefined);
        setIndustryId(undefined);
        setIsVerified(undefined);
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={filterVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                                {activeFiltersCount} active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <Activity className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                        placeholder="Search clients..."
                    />
                </div>

                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={status || ''}
                                    onChange={(e) => setStatus(e.target.value as BaseStatus || undefined)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="PENDING">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Verification
                                </label>
                                <select
                                    value={isVerified === undefined ? '' : isVerified.toString()}
                                    onChange={(e) => setIsVerified(e.target.value === '' ? undefined : e.target.value === 'true')}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                >
                                    <option value="">All</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Not Verified</option>
                                </select>
                            </div>
                        </div>

                        {activeFiltersCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
                            >
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
} 