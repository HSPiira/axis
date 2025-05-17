"use client";

interface ClientStatsProps {
    stats: {
        activeStaff: number;
        activeBeneficiaries: number;
        activeContracts: number;
        totalDocuments: number;
    };
}

export function ClientStats({ stats }: ClientStatsProps) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Staff</p>
                <p className="text-2xl font-semibold">{stats.activeStaff}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Beneficiaries</p>
                <p className="text-2xl font-semibold">{stats.activeBeneficiaries}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Contracts</p>
                <p className="text-2xl font-semibold">{stats.activeContracts}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-semibold">{stats.totalDocuments}</p>
            </div>
        </div>
    );
} 