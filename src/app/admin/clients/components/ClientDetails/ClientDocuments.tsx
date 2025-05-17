import React from 'react';
import { FileText, UploadCloud, Download, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { DocumentProvider } from '@/lib/providers/document-provider';

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
    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents', clientId],
        queryFn: async () => {
            const provider = new DocumentProvider();
            const response = await provider.list({ clientId });
            return response.data;
        }
    });

    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

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
                    <button
                        onClick={() => {/* Add document upload logic */ }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <UploadCloud size={18} />
                        Upload
                    </button>
                </div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                    {documents && documents.length > 0 ? (
                        documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                variants={item}
                                className="group p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-gray-400" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {doc.title}
                                        </p>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>{doc.type}</span>
                                            <span>•</span>
                                            <span>Version {doc.version}</span>
                                            {doc.isConfidential && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><Lock size={14} />Confidential</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => {/* Add download logic */ }}
                                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                    >
                                        <Download size={16} /> Download
                                    </button>
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
                                Upload a new document to get started
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
} 