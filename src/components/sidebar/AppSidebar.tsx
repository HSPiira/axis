"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import ClientNav from './ClientNav';
import SettingsSidebarNav from './SettingsSidebarNav';

interface AppSidebarProps {
    user: { avatar: string; name: string };
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
    const pathname = usePathname();
    const isSettings = pathname.startsWith('/admin/settings');

    if (isSettings) {
        return <SettingsSidebarNav />;
    }
    return <ClientNav user={user} />;
};

export default AppSidebar; 