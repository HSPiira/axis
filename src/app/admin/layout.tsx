import React from 'react';
import { FloatingActionButton } from '@/components/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import Header from '@/components/sidebar/Header';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Temitope Olaiya',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
            <Header user={user} />
            <AppSidebar user={user} />
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                <div className="px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 py-2">
                    {children}
                </div>
            </main>
            <FloatingActionButton />
        </div>
    );
} 