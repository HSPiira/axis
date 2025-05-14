import React from 'react';
import { FloatingActionButton, ClientNav } from '@/components/sidebar';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Henry Ssekibo',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-row bg-gray-50">
            <ClientNav user={user} />
            <main className="flex-1 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 py-2">
                {children}
            </main>
            <FloatingActionButton />
        </div>
    );
} 