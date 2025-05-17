"use client";
import React from 'react';
import { SidebarNav, SidebarNavItem, SidebarFooter, BottomNav, BottomNavItem, UserProfile } from '@/components/sidebar';
import { usePathname } from 'next/navigation';
import { FiMoreHorizontal } from 'react-icons/fi';

const navItems = [
    { icon: 'FiHome', label: 'Home', to: '/admin/dashboard' },
    { icon: 'FiCalendar', label: 'Sessions', to: '/admin/sessions' },
    { icon: 'FiUsers', label: 'Clients', to: '/admin/clients' },
    { icon: 'FiBarChart', label: 'Insights', to: '/admin/insights' },
];

export default function ClientNav({ user }: { user: any }) {
    const pathname = usePathname();
    // Settings nav item
    const settingsNav = { icon: 'FiSettings', label: 'Settings', to: '/admin/settings' };
    // Combine navItems and settings for bottom nav
    const allNavItems = [...navItems, settingsNav];
    const maxVisible = 4;
    const visibleNavItems = allNavItems.slice(0, maxVisible - 1);
    const extraNavItems = allNavItems.slice(maxVisible - 1);
    const isMoreActive = pathname === '/admin/more' || extraNavItems.some(item => pathname.startsWith(item.to));

    const isItemActive = (itemPath: string) => {
        // Special case for sessions to handle sub-routes
        if (itemPath === '/admin/sessions') {
            return pathname.startsWith('/admin/sessions/');
        }
        // For other items, use exact match for root paths and startsWith for sub-paths
        return itemPath === '/admin/dashboard'
            ? pathname === itemPath
            : pathname.startsWith(itemPath);
    };

    return (
        <>
            {/* Sidebar for large screens - with fixed positioning */}
            <div className="hidden md:flex fixed left-0 top-0 flex-col w-16 lg:w-56 h-screen bg-[#f8f4fc] dark:bg-[#171717] shadow-sm z-10">
                <UserProfile user={user.user} />
                <SidebarNav>
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            to={item.to === '/admin/sessions' ? '/admin/sessions/upcoming' : item.to}
                            active={isItemActive(item.to)}
                        />
                    ))}
                </SidebarNav>
                <SidebarFooter>
                    <SidebarNavItem icon="FiSettings" label="Settings" to="/admin/settings" active={pathname.startsWith('/admin/settings')} />
                </SidebarFooter>
            </div>
            {/* Spacer div to prevent content from sliding under the fixed sidebar */}
            <div className="hidden md:block w-16 lg:w-56 flex-shrink-0"></div>
            {/* Bottom navigation for small screens */}
            <BottomNav>
                {visibleNavItems.map((item) => (
                    <BottomNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to === '/admin/sessions' ? '/admin/sessions/upcoming' : item.to}
                        active={isItemActive(item.to)}
                    />
                ))}
                {extraNavItems.length > 0 && (
                    <BottomNavItem
                        icon="FiMoreHorizontal"
                        label="More"
                        to="/admin/more"
                        active={isMoreActive}
                    />
                )}
            </BottomNav>
        </>
    );
} 