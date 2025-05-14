import React from 'react';
import { FloatingActionButton } from '@/components/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Henry Ssekibo',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
            <AppSidebar user={user} />
            <main className="flex-1 overflow-y-auto flex justify-center">
                <div className="max-w-2xl w-full px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 py-2">
                    {children}
                </div>
            </main>
            <FloatingActionButton />
        </div>
    );
} 