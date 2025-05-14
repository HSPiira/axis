"use client";
import React from 'react';
import { SidebarNav, SidebarNavItem, SidebarFooter, BottomNav, BottomNavItem, UserProfile } from '@/components/sidebar';
import { usePathname } from 'next/navigation';

const navItems = [
    { icon: 'FiHome', label: 'Home', to: '/admin' },
    { icon: 'FiCalendar', label: 'Sessions', to: '/admin/sessions/upcoming' },
    { icon: 'FiUsers', label: 'Clients', to: '/admin/clients' },
    { icon: 'FiBarChart', label: 'Insights', to: '/admin/insights' },
];

export default function ClientNav({ user }: { user: any }) {
    const pathname = usePathname();
    return (
        <>
            {/* Sidebar for large screens - with fixed positioning */}
            <div className="hidden md:flex fixed left-0 top-0 flex-col w-16 lg:w-56 h-screen bg-[#f8f4fc] dark:bg-[#171717] shadow-sm z-10">
                <UserProfile user={user} />
                <SidebarNav>
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={
                                item.to === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(item.to)
                            }
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
                {navItems.map((item) => (
                    <BottomNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        active={
                            item.to === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.to)
                        }
                    />
                ))}
            </BottomNav>
        </>
    );
} 