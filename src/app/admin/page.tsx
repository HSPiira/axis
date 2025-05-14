import React from 'react';

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Welcome to your dashboard! Use the sidebar or bottom navigation to explore different sections.</p>
            <div className="mt-6 p-4 bg-white dark:bg-black rounded shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                    <li>Upcoming sessions: 2</li>
                    <li>Clients: 5</li>
                    <li>Insights: Active</li>
                </ul>
            </div>
        </div>
    );
} 