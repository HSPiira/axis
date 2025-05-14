import React from 'react';
import Link from 'next/link';

export default function DetailedInsightsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Detailed Insights</h1>
                <Link href="/admin/insights" className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
                    ← Back to Overview
                </Link>
            </div>

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Date Range</h2>
                <div className="flex flex-wrap gap-2">
                    {['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year', 'Custom'].map((range) => (
                        <button
                            key={range}
                            className={`px-3 py-1 text-sm rounded-full ${range === 'Last 30 days'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {/* Client Demographics */}
                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <h2 className="text-lg font-semibold mb-4">Client Demographics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Age Distribution</h3>
                            <div className="space-y-2">
                                <MetricBar label="18-24" value={15} />
                                <MetricBar label="25-34" value={42} />
                                <MetricBar label="35-44" value={28} />
                                <MetricBar label="45-54" value={10} />
                                <MetricBar label="55+" value={5} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Client Type</h3>
                            <div className="space-y-2">
                                <MetricBar label="Individual" value={65} />
                                <MetricBar label="Couples" value={20} />
                                <MetricBar label="Family" value={15} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Analysis */}
                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <h2 className="text-lg font-semibold mb-4">Revenue Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                            <p className="text-2xl font-bold">$8,245</p>
                            <p className="text-sm text-green-500">+18% from previous period</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average per Client</h3>
                            <p className="text-2xl font-bold">$358</p>
                            <p className="text-sm text-green-500">+5% from previous period</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recurring Revenue</h3>
                            <p className="text-2xl font-bold">$6,120</p>
                            <p className="text-sm text-green-500">+22% from previous period</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded">
                        <p className="text-gray-500">Revenue chart placeholder</p>
                        {/* Chart would go here */}
                    </div>
                </div>

                {/* Session Analytics */}
                <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                    <h2 className="text-lg font-semibold mb-4">Session Analytics</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Type</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Duration</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">Initial Consultation</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">12</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">45 mins</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">94%</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">Regular Session</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">48</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">55 mins</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">96%</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">Emergency Session</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">3</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">32 mins</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">100%</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">Group Session</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">5</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">85 mins</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm">90%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricBarProps {
    label: string;
    value: number;
}

function MetricBar({ label, value }: MetricBarProps) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
} 