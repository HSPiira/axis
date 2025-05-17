"use client";

interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

interface ClientActivityProps {
    activities: Activity[];
}

export function ClientActivity({ activities }: ClientActivityProps) {
    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
} 