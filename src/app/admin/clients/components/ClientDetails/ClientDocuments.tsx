"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Plus, Download, Lock, FileIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url: string;
    isPrivate?: boolean;
}

interface ClientDocumentsProps {
    clientId: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function ClientDocuments({ clientId }: ClientDocumentsProps) {
    const router = useRouter();
    const { data: documents, isLoading } = useQuery<Document[]>({
        queryKey: ["client-documents", clientId],
        queryFn: async () => {
            const response = await fetch(`/api/clients/${clientId}/documents`);
            if (!response.ok) {
                throw new Error("Failed to fetch documents");
            }
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={24} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Documents
                        </h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/admin/clients/${clientId}/documents/upload`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        Upload Document
                    </motion.button>
                </div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {documents && documents.length > 0 ? (
                        documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                variants={item}
                                className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                            <FileIcon className="text-gray-600 dark:text-gray-300" size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {doc.name}
                                                </p>
                                                {doc.isPrivate && (
                                                    <Lock className="text-gray-400" size={16} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {doc.type} • {formatFileSize(doc.size)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.open(doc.url, '_blank')}
                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Download size={20} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            variants={item}
                            className="text-center py-12"
                        >
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No documents found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Upload a document to get started
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
} 