import React from 'react';
import { FloatingActionButton } from '@/components/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import Header from '@/components/sidebar/Header';
import ProtectedRoute from "@/components/auth/protected-route";

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Temitope Olaiya',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
                <Header user={user} />
                <AppSidebar user={user} />
                <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                    <div className="px-4 md:px-4 py-4">
                        {children}
                    </div>
                </main>
                <FloatingActionButton />
            </div>
        </ProtectedRoute>
    );
} 