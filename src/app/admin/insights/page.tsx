import React from 'react';
import Link from 'next/link';

export default function InsightsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Insights</h1>
                <Link href="/admin/insights/detailed" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm">
                    View Detailed Analytics
                </Link>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Track and analyze your client statistics and business performance.</p>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Total Clients" value="23" change="+4" period="from last month" />
                <StatCard title="Session Completion" value="92%" change="+2%" period="from last month" />
                <StatCard title="Revenue" value="$2,540" change="+12%" period="from last month" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <h2 className="text-lg font-semibold mb-4">Monthly Sessions</h2>
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded">
                        <p className="text-gray-500">Session chart placeholder</p>
                        {/* Chart would go here */}
                    </div>
                </div>

                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <h2 className="text-lg font-semibold mb-4">Client Growth</h2>
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded">
                        <p className="text-gray-500">Growth chart placeholder</p>
                        {/* Chart would go here */}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                <h2 className="text-lg font-semibold mb-4">Recent Client Activity</h2>
                <div className="space-y-3">
                    <ActivityItem
                        client="Jane Cooper"
                        action="Completed session"
                        time="2 hours ago"
                    />
                    <ActivityItem
                        client="Robert Fox"
                        action="Rescheduled appointment"
                        time="Yesterday"
                    />
                    <ActivityItem
                        client="Esther Howard"
                        action="New client onboarding"
                        time="2 days ago"
                    />
                </div>
            </div>
        </div>
    );
}

// Types for components
interface StatCardProps {
    title: string;
    value: string;
    change: string;
    period: string;
}

interface ActivityItemProps {
    client: string;
    action: string;
    time: string;
}

// Stats Card Component
function StatCard({ title, value, change, period }: StatCardProps) {
    const isPositive = change.startsWith('+');

    return (
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <div className="flex items-center mt-1">
                <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{period}</span>
            </div>
        </div>
    );
}

// Activity Item Component
function ActivityItem({ client, action, time }: ActivityItemProps) {
    return (
        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                {client.charAt(0)}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{client}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{action}</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
        </div>
    );
} 