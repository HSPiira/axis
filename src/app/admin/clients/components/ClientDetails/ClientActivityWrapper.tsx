import { unstable_cache } from 'next/cache';
import { ClientActivity } from './ClientActivity';

const getActivities = unstable_cache(
    async (_) => {
        // TODO: Implement actual activity fetching
        // For now, we'll just show a placeholder
        return [
            {
                id: '1',
                type: 'contract',
                description: 'New contract created',
                timestamp: new Date().toISOString()
            },
            {
                id: '2',
                type: 'document',
                description: 'Document uploaded',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    },
    ['client-activity'],
    {
        revalidate: 60,
        tags: ['client']
    }
);

export default async function ClientActivityWrapper({ clientId }: { clientId: string }) {
    const activities = await getActivities(clientId);

    if (activities.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No recent activity
            </div>
        );
    }

    return <ClientActivity activities={activities} />;
} 