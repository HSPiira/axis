"use client";

import { ClientActivity } from './ClientActivity';
import { useEffect, useState } from 'react';

interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

export function ClientActivitySection({ clientId }: { clientId: string }) {
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const response = await fetch(`/api/clients/${clientId}/activities`);
                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }
                const data = await response.json();
                setActivities(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch activities');
            }
        }
        fetchActivities();
    }, [clientId]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!activities) {
        return <div className="animate-pulse">Loading activities...</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No recent activity
            </div>
        );
    }

    return <ClientActivity activities={activities} />;
} 