"use client";

import { ClientStats } from './ClientStats';
import { useEffect, useState } from 'react';

interface Stats {
    activeStaff: number;
    activeBeneficiaries: number;
    activeContracts: number;
    totalDocuments: number;
}

export function ClientStatsSection({ clientId }: { clientId: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch(`/api/clients/${clientId}/stats`);
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            }
        }
        fetchStats();
    }, [clientId]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!stats) {
        return <div className="animate-pulse">Loading stats...</div>;
    }

    return <ClientStats stats={stats} />;
} 