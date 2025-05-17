import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Plus, AlertCircle, CheckCircle2, Calendar, Ban, UserX } from 'lucide-react';
import type { StaffModel } from '@/lib/providers/staff-provider';
import { WorkStatus } from '@prisma/client';

interface ClientStaffProps {
    clientId: string;
    staff?: StaffModel[];
    isLoading?: boolean;
}

export function ClientStaff({ clientId, staff = [], isLoading = false }: ClientStaffProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No staff members</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by adding a new staff member.
                </p>
                <div className="mt-6">
                    <button
                        onClick={() => router.push(`/admin/clients/${clientId}/staff/new`)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Add Staff Member
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Staff Members</h3>
                <button
                    onClick={() => router.push(`/admin/clients/${clientId}/staff/new`)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Add Staff
                </button>
            </div>

            <div className="grid gap-4">
                {staff.map((member) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {member.profile?.fullName}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {member.status === WorkStatus.ACTIVE && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Active
                                    </span>
                                )}
                                {member.status === WorkStatus.INACTIVE && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Inactive
                                    </span>
                                )}
                                {member.status === WorkStatus.ON_LEAVE && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        On Leave
                                    </span>
                                )}
                                {member.status === WorkStatus.TERMINATED && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        <Ban className="mr-1 h-3 w-3" />
                                        Terminated
                                    </span>
                                )}
                                {member.status === WorkStatus.SUSPENDED && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Suspended
                                    </span>
                                )}
                                {member.status === WorkStatus.RESIGNED && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                        <UserX className="mr-1 h-3 w-3" />
                                        Resigned
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 