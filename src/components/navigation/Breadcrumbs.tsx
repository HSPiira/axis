'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    showBackButton?: boolean;
}

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
};

export function Breadcrumbs({ items, showBackButton = true }: BreadcrumbsProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show breadcrumbs on the home page
    if (pathname === '/') return null;

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
                {showBackButton && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={16} />
                    </motion.button>
                )}
                <nav className="flex" aria-label="Breadcrumb">
                    <motion.ol
                        className="flex items-center space-x-1"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        <motion.li variants={itemVariants}>
                            <button
                                onClick={() => router.push('/admin')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                            >
                                <Home size={14} />
                            </button>
                        </motion.li>
                        {items.map((item, index) => (
                            <React.Fragment key={item.label}>
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center"
                                >
                                    <ChevronRight size={12} className="text-gray-400" />
                                </motion.li>
                                <motion.li variants={itemVariants}>
                                    {item.href ? (
                                        <button
                                            onClick={() => router.push(item.href!)}
                                            className={`px-1.5 py-0.5 text-xs rounded-md transition-all duration-200 ${index === items.length - 1
                                                ? 'text-blue-600 dark:text-blue-400 font-medium'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ) : (
                                        <span className="px-1.5 py-0.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </motion.li>
                            </React.Fragment>
                        ))}
                    </motion.ol>
                </nav>
            </div>
        </div>
    );
} 