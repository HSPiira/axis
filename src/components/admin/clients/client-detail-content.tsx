"use client";
import { Reorder, motion } from 'framer-motion';
import { useState } from 'react';

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    industry?: { id: string; name: string };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    notes?: string;
    // Add these for future data
    contracts?: any[];
    Document?: any[];
    KPI?: any[];
    KPIAssignment?: any[];
}

const sectionKeys = [
    "info",
    "notes",
    "activity",
    "contracts",
    "documents",
    "kpis",
    "kpiAssignments",
    "actions"
];

export default function ClientDetailContent({ client }: { client: Client }) {
    const [sections, setSections] = useState(sectionKeys);
    return (
        <div className="mx-auto py-8 px-4 ">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-1">{client.name}</h1>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{client.status || 'Unknown'}</span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Edit
                </motion.button>
            </motion.div>

            <Reorder.Group
                axis="y"
                values={sections}
                onReorder={setSections}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {sections.map((section) => (
                    <Reorder.Item
                        key={section}
                        value={section}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        whileDrag={{ scale: 1.03, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                        className="bg-white rounded-lg shadow border p-6"
                    >
                        {section === "info" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div><span className="font-semibold">Email:</span> {client.email || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Phone:</span> {client.phone || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Address:</span> {client.address || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Industry:</span> {client.industry?.name || <span className="text-gray-400">N/A</span>}</div>
                                </div>
                                <div className="space-y-2">
                                    <div><span className="font-semibold">Contact Person:</span> {client.contactPerson || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Contact Email:</span> {client.contactEmail || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Contact Phone:</span> {client.contactPhone || <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Created:</span> {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : <span className="text-gray-400">N/A</span>}</div>
                                    <div><span className="font-semibold">Updated:</span> {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : <span className="text-gray-400">N/A</span>}</div>
                                </div>
                            </div>
                        )}
                        {section === "notes" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                                <div className="bg-gray-50 border rounded p-4 min-h-[60px] text-gray-700">
                                    {client.notes || <span className="text-gray-400">No notes available.</span>}
                                </div>
                            </div>
                        )}
                        {section === "activity" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
                                <div className="space-y-2">
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
                        {section === "contracts" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Contracts</h2>
                                <div className="space-y-2">
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
                        {section === "documents" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Documents</h2>
                                <div className="space-y-2">
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
                        {section === "kpis" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">KPIs</h2>
                                <div className="space-y-2">
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
                        {section === "kpiAssignments" && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">KPI Assignments</h2>
                                <div className="space-y-2">
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
                        {section === "actions" && (
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition"
                                >
                                    Delete
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                                >
                                    More Actions
                                </motion.button>
                            </div>
                        )}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    );
} 