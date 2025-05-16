'use client';

import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center">
                        {index > 0 && (
                            <span className="mx-2 text-gray-400">/</span>
                        )}
                        <Link
                            href={item.href}
                            className={`text-sm ${index === items.length - 1
                                ? 'text-gray-500 font-medium'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
} 