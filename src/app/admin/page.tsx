import React from 'react';

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-700 mb-2">Welcome to your dashboard! Use the sidebar or bottom navigation to explore different sections.</p>
            <div className="mt-6 p-4 bg-white rounded shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                <ul className="list-disc pl-5 text-gray-600">
                    <li>Upcoming meetings: 2</li>
                    <li>Team members: 5</li>
                    <li>Account status: Active</li>
                </ul>
            </div>
        </div>
    );
} 