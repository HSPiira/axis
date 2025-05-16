import React from 'react';
import type { Document } from '@prisma/client';

interface ClientDocumentsProps {
    clientId: string;
    documents?: Document[];
    isLoading?: boolean;
}

export function ClientDocuments({ clientId, documents = [], isLoading = false }: ClientDocumentsProps) {
    if (isLoading) {
        return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Documents
                    </h3>
                    <button
                        onClick={() => {/* Add document upload logic */ }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Upload
                    </button>
                </div>

                {documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <span className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
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
                                                        <span className="text-red-600 dark:text-red-400">Confidential</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => {/* Add download logic */ }}
                                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No documents found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 