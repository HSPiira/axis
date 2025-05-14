import React from 'react';

export default function ClientsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Clients</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Manage your client list and review client information.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white dark:bg-black rounded shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold mb-2">Recent Clients</h2>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        <li className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-medium">John Smith</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last session: 2 days ago</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">View</button>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-medium">Sarah Johnson</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last session: 1 week ago</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">View</button>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-medium">Michael Thompson</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last session: 2 weeks ago</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">View</button>
                        </li>
                    </ul>
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">View all clients</button>
                </div>

                <div className="p-4 bg-white dark:bg-black rounded shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold mb-2">Client Stats</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total clients:</span>
                            <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Active clients:</span>
                            <span className="font-medium">18</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">New clients this month:</span>
                            <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Average sessions per client:</span>
                            <span className="font-medium">4.5</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-black rounded shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Client Management</h2>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                        Add New Client
                    </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900">
                        <h3 className="font-medium">Import Clients</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Import client data from CSV or spreadsheet</p>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900">
                        <h3 className="font-medium">Export Client List</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Download client data as CSV or PDF</p>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900">
                        <h3 className="font-medium">Client Tags</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage categories and groups for clients</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 