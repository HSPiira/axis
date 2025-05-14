'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { label: 'Upcoming', href: '/admin/sessions/upcoming' },
    { label: 'Unconfirmed', href: '/admin/sessions/unconfirmed' },
    { label: 'Recurring', href: '/admin/sessions/recurring' },
    { label: 'Past', href: '/admin/sessions/past' },
    { label: 'Canceled', href: '/admin/sessions/canceled' },
];

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Bookings</h1>
            <p className="text-gray-700 mb-6">See upcoming and past events booked through your event type links.</p>
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {tabs.map((tab) => (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors duration-150 ${pathname === tab.href
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-black'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
            {children}
        </div>
    );
} 