'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { BaseStatus } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = React.useState(searchParams.get('search') || '');
    const [status, setStatus] = React.useState<BaseStatus | undefined>(
        (searchParams.get('status') as BaseStatus) || undefined
    );
    const [isVerified, setIsVerified] = React.useState<boolean | undefined>(
        searchParams.get('isVerified') ? searchParams.get('isVerified') === 'true' : undefined
    );

    const activeFiltersCount = [
        search,
        status,
        isVerified !== undefined ? '1' : ''
    ].filter(Boolean).length;

    const updateFilters = React.useCallback(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (isVerified !== undefined) params.set('isVerified', isVerified.toString());
        router.push(`/admin/clients/list?${params.toString()}`);
    }, [search, status, isVerified, router]);

    React.useEffect(() => {
        const timeoutId = setTimeout(updateFilters, 300);
        return () => clearTimeout(timeoutId);
    }, [updateFilters]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-sm"
                        placeholder="Search clients..."
                    />
                </div>
                <select
                    value={status || ''}
                    onChange={(e) => setStatus(e.target.value as BaseStatus || undefined)}
                    className="rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-5 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 dark:focus-visible:ring-blue-600 transition-all duration-150 min-w-[140px] appearance-none shadow-none focus:shadow-md relative pr-10"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25em',
                    }}
                >
                    <option value="">Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                </select>
                <select
                    value={isVerified === undefined ? '' : isVerified.toString()}
                    onChange={(e) => setIsVerified(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-5 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 dark:focus-visible:ring-blue-600 transition-all duration-150 min-w-[140px] appearance-none shadow-none focus:shadow-md relative pr-10"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25em',
                    }}
                >
                    <option value="">Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Not Verified</option>
                </select>
                <div className="flex items-center gap-2 ml-auto">
                    <Filter className="w-5 h-5 text-gray-400" />
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {activeFiltersCount} active
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
} 